// ==============================
// Import dependencies
// ==============================
const cheerio = require("cheerio");
const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
// const chromium = require("@sparticuz/chromium");

// ==============================
// Main Function
// ==============================
async function searchGoogleMaps() {
  try {
    const start = Date.now();

    puppeteerExtra.use(stealthPlugin());

    const browser = await puppeteerExtra.launch({
      headless: false,
      executablePath: "", // <-- optional custom path
      // You can also use this for AWS Lambda/Chromium:
      // args: chromium.args,
      // defaultViewport: chromium.defaultViewport,
      // executablePath: await chromium.executablePath(),
      // headless: "new",
      // ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const query = "Cafe Banjarmasin";

    try {
      await page.goto(
        `https://www.google.com/maps/search/${query.split(" ").join("+")}`
      );
    } catch (error) {
      console.log("❌ Error going to page:", error.message);
    }

    // ==============================
    // Auto Scroll Helper
    // ==============================
    async function autoScroll(page) {
      await page.evaluate(async () => {
        const wrapper = document.querySelector('div[role="feed"]');
        if (!wrapper) return;

        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 1000;
          const scrollDelay = 3000;

          const timer = setInterval(async () => {
            const scrollHeightBefore = wrapper.scrollHeight;
            wrapper.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeightBefore) {
              totalHeight = 0;
              await new Promise((r) => setTimeout(r, scrollDelay));
              const scrollHeightAfter = wrapper.scrollHeight;

              if (scrollHeightAfter <= scrollHeightBefore) {
                clearInterval(timer);
                resolve();
              }
            }
          }, 200);
        });
      });
    }

    await autoScroll(page);

    const html = await page.content();

    const pages = await browser.pages();
    await Promise.all(pages.map((p) => p.close()));
    await browser.close();
    console.log("✅ Browser closed");

    // ==============================
    // Parse with Cheerio
    // ==============================
    const $ = cheerio.load(html);
    const aTags = $("a");
    const parents = [];

    aTags.each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.includes("/maps/place/")) {
        parents.push($(el).parent());
      }
    });

    console.log("🧭 Businesses found:", parents.length);

    const businesses = [];

    parents.forEach((parent) => {
      const url = parent.find("a").attr("href");
      const website = parent.find('a[data-value="Website"]').attr("href");
      const storeName = parent.find("div.fontHeadlineSmall").text();
      const ratingText = parent
        .find("span.fontBodyMedium > span")
        .attr("aria-label");

      const bodyDiv = parent.find("div.fontBodyMedium").first();
      const children = bodyDiv.children();
      const lastChild = children.last();
      const firstOfLast = lastChild.children().first();
      const lastOfLast = lastChild.children().last();

      businesses.push({
        placeId: `ChI${url?.split("?")?.[0]?.split("ChI")?.[1]}`,
        address: firstOfLast?.text()?.split("·")?.[1]?.trim(),
        category: firstOfLast?.text()?.split("·")?.[0]?.trim(),
        phone: lastOfLast?.text()?.split("·")?.[1]?.trim(),
        googleUrl: url,
        bizWebsite: website,
        storeName,
        ratingText,
        stars: ratingText?.split("stars")?.[0]?.trim()
          ? Number(ratingText.split("stars")[0].trim())
          : null,
        numberOfReviews: ratingText
          ?.split("stars")?.[1]
          ?.replace("Reviews", "")
          ?.trim()
          ? Number(
              ratingText.split("stars")[1].replace("Reviews", "").trim()
            )
          : null,
      });
    });

    const end = Date.now();
    console.log(`⏱ Time elapsed: ${Math.floor((end - start) / 1000)} seconds`);

    return businesses;
  } catch (error) {
    console.log("❌ Error at googleMaps:", error.message);
  }
}

// ==============================
// Export or run directly
// ==============================
module.exports = { searchGoogleMaps };

// Run directly if this file is executed
if (require.main === module) {
  searchGoogleMaps().then((data) => {
    console.log("✅ Scraped businesses:", data?.length || 0);
    console.log(data);
  });
}
