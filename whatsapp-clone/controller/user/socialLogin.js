const { User, Visiter } = require("../../models");
const fs = require("fs"); // Require the Node.js 'fs' module for file system operations
const baseUrl = process.env.baseUrl;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const socialLogin = async (req, res) => {
  let { apple_id, facebook_id, email_id, login_type } = req.body;
  //
  if (
    (apple_id == "" || !apple_id) &&
    (facebook_id == "" || !facebook_id) &&
    (email_id == "" || !email_id)
  ) {
    return res.status(400).json({
      message: "apple_id or facebook_id or email_id field is required!",
      success: false,
    });
  }

  if (login_type == "" || !login_type) {
    return res
      .status(400)
      .json({ message: "login_type field is required!", success: false });
  }
  const updateFields = {};

  updateFields.login_type = login_type;
  if (apple_id !== undefined && apple_id !== "") {
    updateFields.apple_id = apple_id;
  }
  if (facebook_id !== undefined && facebook_id !== "") {
    updateFields.facebook_id = facebook_id;
  }
  if (email_id !== undefined && email_id !== "") {
    updateFields.email_id = email_id;
  }

  try {
    let apple = undefined;
    let facebook = undefined;
    let google = undefined;

    if (apple_id !== undefined && apple_id !== "") {
      apple = await User.findOne({
        where: { apple_id, login_type },
      });
    }

    if (facebook_id !== undefined && facebook_id !== "") {
      facebook = await User.findOne({
        where: { facebook_id, login_type },
      });
    }

    if (email_id !== undefined && email_id !== "") {
      google = await User.findOne({
        where: { email_id, login_type },
      });
    }

    if (!google && !facebook && !apple) {
      // check if user is allready exist or not this condition evaluate true if user not exist
      let resData = await User.create(updateFields);

      updateFields.visiter_id= resData.user_id,
      await Visiter.create(updateFields);
      const token = jwt.sign(resData.dataValues, jwtSecretKey);
      // console.log(resData);

      return res.status(200).json({
        message: "User Registered successfully!",
        success: true,
        token,
      });

      // return res.status(400).json({ message: error, success: false });
    } else {
      return res
        .status(400)
        .json({ message: "User allready registered!", success: false });
    }
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.log(error.message);
    res.status(500).json({ error: error });
  }
};

module.exports = { socialLogin };
