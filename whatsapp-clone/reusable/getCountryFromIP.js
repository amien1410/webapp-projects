const axios = require("axios");

async function getCountryFromIP(req) {
  try {
    return {
      countryCode: "IN",
      country: "India",
    };
    const ip =
      req.headers["x-forwarded-for"]?.split(",").shift() || // for proxies/load balancers
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress;

    const response = await axios.get(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode`
    );
    console.log("\x1b[32m", "Api Response", response.data, "\x1b[0m");

    if (response.data.status === "success") {
      return {
        countryCode: response.data.countryCode,
        country: response.data.country,
      };
    } else {
      throw new Error("IP lookup failed");
    }
  } catch (error) {
    console.error("Error fetching country from IP:", error.message);
    return null;
  }
}

module.exports = { getCountryFromIP };
