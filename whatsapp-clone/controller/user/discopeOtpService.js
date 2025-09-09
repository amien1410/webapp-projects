const axios = require("axios");

async function sendOtpSignupSms(phoneNumber, login = false) {
  const token = process.env.SIGNIN_KEYS; // Your API Token
  const projectId = process.env.DESCOPE_PROJECT_ID; // Your Project ID
  const url = `https://api.descope.com/v1/auth/otp/signup/sms`; // Correct endpoint for OTP via SMS

  const data = {
    phone: phoneNumber, // The phone number to receive OTP
    projectId: projectId, // Your project ID
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${projectId}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error.response?.data || error.message);
    throw error;
  }
}

async function verifyOtpSms(loginId, code) {
  const projectId = process.env.DESCOPE_PROJECT_ID; // Your Project ID
  const url = "https://api.descope.com/v1/auth/otp/verify/sms"; // Correct endpoint

  const data = {
    loginId: loginId, // The phone number or email to verify OTP
    code: code, // The OTP entered by the user
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${projectId}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error verifying OTP:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { sendOtpSignupSms, verifyOtpSms };
