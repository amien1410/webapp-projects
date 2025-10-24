// yelp_crawler_windscribe.js (CommonJS)
// npm install puppeteer-extra puppeteer-extra-plugin-stealth csv-writer chalk windscribe-proxy-sdk

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { createObjectCsvWriter } = require('csv-writer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { WindscribeSDK } = require('windscribe-proxy-sdk');

puppeteer.use(StealthPlugin());

// =========================
// CONFIG
// =========================
const USERNAME = process.env.WINDSCRIBE_USER;  // or hardcode for testing
const PASSWORD = process.env.WINDSCRIBE_PASS;
const COUNTRY = 'US'; // for best server rotation
const PAGES = 5;
const LOCATION = 'us';
const KEYWORDS = ['restaurants'];
const MAX_RETRIES = 3;
const CSV_DIR = './output';

if (!fs.existsSync(CSV_DIR)) fs.mkdirSync(CSV_DIR);

const PIPELINE_QUEUE_LIMIT = 50;

// =========================
// WINDCRIBE SDK SETUP
// =========================
const sdk = new WindscribeSDK({
  autoReconnect: true,
  enableLogging: false,
  healthCheckInterval: 30000,
  maxRetries: 3,
  timeout: 10000,
});

async function connectWindscribe() {
  console.log(chalk.cyan('🔑 Logging in to Windscribe...'));
  await sdk.session(USERNAME, PASSWORD);
  console.log(chalk.green('✅ Logged in successfully.'));
}

async function getBestServer() {
  const bestServers = await sdk.findBestServers({
    country: COUNTRY,
    maxLatency: 400,
    testCount: 5,
  });
  if (!bestServers.length) throw new Error('No Windscribe servers available.');
  const selected = bestServers[Math.floor(Math.random() * bestServers.length)];
  console.log(chalk.green(`🌎 Selected proxy: ${selected.hostname}`));
  return selected.hostname;
}

// =========================
// DATA PIPELINE
// =========================
class DataPipeline {
  constructor(csvFilename) {
    this.csvFilename = path.join(CSV_DIR, csvFilename);
    this.namesSeen = new Set();
    this.queue = [];
    this.csvWriter = createObjectCsvWriter({
      path: this.csvFilename,
      header: [
        { id: 'name', title: 'name' },
        { id: 'sponsored', title: 'sponsored' },
        { id: 'stars', title: 'stars' },
        { id: 'rank', title: 'rank' },
        { id: 'review_count', title: 'review_count' },
        { id: 'url', title: 'url' },
      ],
      append: fs.existsSync(this.csvFilename),
    });
  }

  async addData(data) {
    if (this.namesSeen.has(data.name)) return;
    this.namesSeen.add(data.name);
    this.queue.push(data);
    if (this.queue.length >= PIPELINE_QUEUE_LIMIT) await this.flush();
  }

  async flush() {
    if (this.queue.length === 0) return;
    await this.csvWriter.writeRecords(this.queue);
    this.queue = [];
  }

  async close() {
    await this.flush();
    console.log(chalk.green(`💾 Saved to ${this.csvFilename}`));
  }
}

// =========================
// SCRAPER LOGIC
// =========================
async function scrapeSearchResults(browser, keyword, locationParam, pageNumber, pipeline, retries = 3) {
  const formattedKeyword = keyword.replace(/\s+/g, '+');
  const url = `https://www.yelp.com/search?find_desc=${formattedKeyword}&find_loc=${locationParam}&start=${pageNumber * 10}`;

  let attempt = 0;
  let success = false;

  while (attempt < retries && !success) {
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);

      const results = await page.$$eval("div[data-testid='serp-ia-card']", (cards) =>
        cards.map((div) => {
          const text = div.innerText || '';
          const img = div.querySelector('img');
          const title = img ? (img.alt || 'No title') : 'No title';
          const sponsored = !(text[0] && /\d/.test(text[0]));

          let rank = null;
          if (!sponsored) {
            const rankStr = text.replace(title, '').split('.')[0];
            const parsed = parseInt(rankStr);
            rank = Number.isNaN(parsed) ? null : parsed;
          }

          const ratingEl = div.querySelector("div span[data-font-weight='semibold']");
          const stars = ratingEl && /^\d/.test(ratingEl.textContent.trim())
            ? parseFloat(ratingEl.textContent.trim())
            : 0.0;

          let review_count = '0';
          const reviewMatch = text.match(/\((\d+)[^)]*review/);
          if (reviewMatch) review_count = reviewMatch[1];

          const linkEl = div.querySelector('a');
          const url = linkEl ? 'https://www.yelp.com' + linkEl.getAttribute('href') : '';

          return {
            name: title.trim(),
            sponsored,
            stars,
            rank,
            review_count,
            url,
          };
        })
      );

      for (const item of results) await pipeline.addData(item);

      console.log(chalk.green(`✅ Parsed ${results.length} results from ${url}`));
      await page.close();
      success = true;
    } catch (err) {
      attempt++;
      console.error(chalk.red(`Error scraping ${url}: ${err.message}`));
      if (attempt < retries) {
        console.log(chalk.yellow(`Retrying (${attempt}/${retries})...`));
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
}

// =========================
// MAIN SCRAPER
// =========================
async function startScrape() {
  console.log(chalk.blue('🚀 Starting Yelp crawler with Windscribe proxy...'));
  await connectWindscribe();

  for (const keyword of KEYWORDS) {
    const filename = `${keyword.replace(/\s+/g, '-')}.csv`;
    const pipeline = new DataPipeline(filename);

    for (let page = 0; page < PAGES; page++) {
      // Rotate Windscribe server per 2 pages (for efficiency)
      if (page % 2 === 0) {
        const hostname = await getBestServer();
        const proxyArg = `--proxy-server=${hostname}:443`;
        console.log(chalk.magenta(`🔁 Rotating proxy: ${hostname}`));

        // Close old browser & start new one with proxy
        if (global.browser) await global.browser.close();
        global.browser = await puppeteer.launch({
          headless: true,
          args: [proxyArg],
        });
      }

      const browser = global.browser;
      await scrapeSearchResults(browser, keyword, LOCATION, page, pipeline, MAX_RETRIES);
      await new Promise((r) => setTimeout(r, 1500));
    }

    await pipeline.close();
    if (global.browser) await global.browser.close();
  }

  console.log(chalk.green('✅ Crawl complete.'));
}

// Run
startScrape().catch((err) => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
