const { User, Website_Setting } = require("../../models");
const fs = require("fs"); // Require the Node.js 'fs' module for file system operations
const path = require("path"); // Require the Node.js 'fs' module for file system operations
const baseUrl = process.env.baseUrl;
const jwt = require("jsonwebtoken");
let jwtSecretKey = process.env.JWT_SECRET_KEY;
const nodemailer = require("nodemailer");
const { getCountryFromIP } = require("../../reusable/getCountryFromIP");

// const client = require("twilio")(accountSid, authToken);

const registerEmail = async (req, res) => {
  let { email_id } = req.body;
  if (email_id == "" || !email_id) {
    return res
      .status(400)
      .json({ message: "email_id field is required!", success: false });
  }

  if (!process.env.mail_password || !process.env.mail_user) {
    return res.status(400).json({
      message: "failed to send otp!",
      success: false,
    });
  }

  try {
    let settings = await Website_Setting.findAll();

    // const resData = await User.create({ email_id });
    const checkUser = await User.findOne({ where: { email_id } });
    let generatedOtp = Math.floor(100000 + Math.random() * 900000);

    const LoginLinkTemplate = fs.readFileSync(
      path.resolve(__dirname, "../../public/emailTemplate.html"),
      "utf-8"
    );
    let emailContent = LoginLinkTemplate.replaceAll(
      "{{app_name}}",
      `${settings[0].website_name}`
    );
    emailContent = emailContent.replaceAll(
      "{{banner_image}}",
      `${settings[0].banner_image}`
    );
    emailContent = emailContent.replaceAll(
      "{{website_link}}",
      `${settings[0].website_link}`
    );
    emailContent = emailContent.replaceAll(
      "{{apk_link}}",
      `${settings[0].android_link}`
    );
    emailContent = emailContent.replaceAll(
      "{{ios_link}}",
      `${settings[0].ios_link}`
    );
    emailContent = emailContent.replaceAll(
      "{{generatedOtp}}",
      `${generatedOtp}`
    );
    emailContent = emailContent.replaceAll(
      "{{baseUrl}}",
      `${process.env.baseUrl}`
    );
    emailContent = emailContent.replaceAll(
      "{{copy_right}}",
      `${settings[0].copy_right}`
    );

    // Fetch user country ==================================================================================
    let { countryCode, country } = await getCountryFromIP(req);

    if (!checkUser) {
      // for sending Mail
      console.log(
        "Sending mail to new user",
        process.env.email_service,
        process.env.smtp_host
      );

      const transporter = nodemailer.createTransport({
        service: process.env.email_service,
        host: process.env.smtp_host,
        port: 587,
        secure: false,
        auth: {
          user: process.env.mail_user,
          pass: process.env.mail_password,
        },
      });

      const info = transporter.sendMail({
        from: {
          name: `${settings[0].website_name}`,
          address: process.env.mail_user,
        },
        to: email_id, // list of receivers
        subject: `${settings[0].email_title}`, // Subject line
        html: emailContent,
      });

      User.create({
        email_id,
        otp: generatedOtp,
        country: countryCode,
        country_full_name: country,
      });
      return res
        .status(200)
        .json({ message: "Otp Sent on your email!", success: true });
    } else {
      // for sending Mail to allready registered user or not verified user
      const transporter = nodemailer.createTransport({
        service: process.env.email_service,
        host: process.env.smtp_host,
        port: 587,
        secure: false,
        auth: {
          user: process.env.mail_user,
          pass: process.env.mail_password,
        },
      });

      const info = transporter.sendMail({
        from: {
          name: `${settings[0].website_name}`,
          address: process.env.mail_user,
        },
        to: email_id, // list of receivers
        subject: `${settings[0].email_title}`, // Subject line
        // text: `Otp from Brazda is ${generatedOtp}.`, // plain text body
        html: emailContent,
      });
      console.log(countryCode, "countryCode");
      console.log(country, "country");

      // User.create({ email_id, otp: generatedOtp, login_type });
      await User.update(
        {
          otp: generatedOtp,
          country: countryCode,
          country_full_name: country,
        },
        {
          where: {
            email_id: email_id,
            // Add other conditions as needed to match the records you want to update
          },
        }
      );
      return res.status(200).json({
        message: "Otp Sent on your email!",
        success: true,
      });
      // return res
      //   .status(400)
      //   .json({ message: "User allready registered!", success: false });
    }
  } catch (error) {
    console.log(error);

    // Handle the Sequelize error and send it as a response to the client
    return res.status(500).json({ error: error });
  }
};

const verifyEmailOtp = async (req, res) => {
  let { email_id, otp, device_token } = req.body;
  if (email_id == "" || !email_id) {
    return res
      .status(400)
      .json({ message: "email_id field is required!", success: false });
  }

  if (otp == "" || !otp) {
    return res
      .status(400)
      .json({ message: "otp field is required!", success: false });
  }

  try {
    const resData = await User.findOne({ where: { email_id, otp } });
    // console.log("newResData", newResData);
    // console.log(resData);
    if (resData) {
      if (device_token != "" && device_token != undefined) {
        let device_tokenData = await User.update(
          { device_token },
          {
            where: {
              email_id: email_id,
            },
          }
        );
        // console.log(device_tokenData);
      }
      const token = jwt.sign(resData.dataValues, jwtSecretKey);
      // console.log(resData.dataValues);

      res.status(200).json({
        message: "Otp Verified",
        success: true,
        token: token,
        resData: resData,
      });
    } else {
      res.status(400).json({ message: "Invalid otp!", success: false });
    }
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerEmail, verifyEmailOtp };
