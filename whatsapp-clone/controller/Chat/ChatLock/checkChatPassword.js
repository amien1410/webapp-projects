const jwt = require("jsonwebtoken");
const { User, Chatlock } = require("../../../models");
const { Op } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;
const bcrypt = require("bcrypt");
const saltRounds = 10;

const checkChatPassword = async (req, res) => {
  let { otheruser_id, password } = req.body;

  if (!otheruser_id || otheruser_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "otheruser_id field is required" });
  }

  if (!password || password == "") {
    return res
      .status(400)
      .json({ success: false, message: "password field is required" });
  }

  try {
    // authtoken is required
    const authData = jwt.verify(req.authToken, jwtSecretKey);
    const user_id = authData.user_id;

    // Check if the user is trying to block themselves
    if (user_id == otheruser_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and otheruser_id are the same",
      });
    }

    const chatLockData = await Chatlock.findOne({
      where: {
        user_id: user_id,
        otheruser_id: otheruser_id,
      },
    });

    const comparePassword = async () => {
      try {
        if (chatLockData) {
          const isMatch = await bcrypt.compare(password, chatLockData.dataValues.password);

          if (isMatch) {
            return res.status(200).json({ message: "Successfull!", success: true });
          } else {
            return res.status(200).json({ message: "Password does not match!", success: false });
          }
        } else {
          return res
            .status(200)
            .json({ message: "Does not have chat lock!", success: false });
        }
      } catch (error) {
        // Handle errors, such as bcrypt errors or database errors.
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
      }
    };

    // Call the function and wait for it to finish
    await comparePassword();
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = { checkChatPassword };
