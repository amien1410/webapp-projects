const fs = require("fs");
const path = require("path");

// Path to your .env file
const envFilePath = path.resolve(__dirname, "../.env");

/**
 * Updates or adds environment variables in a .env file.
 *
 * This function reads the .env file, updates specified variables if they
 * already exist, or adds them if they don't. It then saves the modified
 * content back to the .env file.
 *
 * @param {Object} updates - An object containing the environment variables to update.
 * @param {string} updates.baseUrl - The base URL of the application.
 * @param {string} updates.TWILIO_ACCOUNT_SID - The Twilio Account SID.
 * @param {string} updates.TWILIO_AUTH_TOKEN - The Twilio Auth Token.
 * @param {string} updates.TWILIO_FROM_NUMBER - The Twilio phone number to send messages from.
 * @param {string} updates.JWT_SECRET_KEY - The secret key for JWT authentication.
 */

function updateEnvVariables(updates) {
  // Read the current .env file content
  let envContent = fs.readFileSync(envFilePath, "utf8");

  // Loop through each variable to update
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*`, "m"); // Regex to find existing variable
    const newEntry = `${key}="${value}"`;

    if (envContent.match(regex)) {
      // Replace existing variable value
      envContent = envContent.replace(regex, newEntry);
    } else {
      // Add new variable if it doesn't exist
      envContent += `\n${newEntry}`;
    }
  }

  // Write the updated content back to the .env file
  fs.writeFileSync(envFilePath, envContent, "utf8");
  console.log("Environment variables updated successfully");
}

// // Variables to update
// const updates = {
//   baseUrl: "https://your-new-base-url.com",
//   TWILIO_ACCOUNT_SID: "your_new_twilio_account_sid",
//   TWILIO_AUTH_TOKEN: "your_new_twilio_auth_token",
//   TWILIO_FROM_NUMBER: "+1234567890",
//   JWT_SECRET_KEY: "your_new_jwt_secret_key",
// };

// // Call the function with the updates
// updateEnvVariables(updates);


module.exports = updateEnvVariables