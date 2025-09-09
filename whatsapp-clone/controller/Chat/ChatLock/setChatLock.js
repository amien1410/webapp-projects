const jwt = require("jsonwebtoken");
const { User, Chatlock } = require("../../../models");
const { Op } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;
const bcrypt = require("bcrypt");
const saltRounds = 10;

const setChatLock = async (req, res) => {
  try {
    let { otheruser_id, password, chatLockOn } = req.body;
    const authData = jwt.verify(req.authToken, jwtSecretKey);

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

    if (chatLockOn == "false") {
      const chatLockData = await Chatlock.findOne({
        where: {
          user_id: authData.user_id,
          otheruser_id: otheruser_id,
        },  
      });

      const comparePassword = async () => {
        try {
          if (chatLockData) {
            const isMatch = await bcrypt.compare(
              password,
              chatLockData.dataValues.password
            );

            if (isMatch) {
              let deletedData = await Chatlock.destroy({
                where: {
                  user_id: authData.user_id,
                  otheruser_id: otheruser_id,
                },
              });

              return res
                .status(200)
                .json({ message: "Successfully removed chat lock!", success: true });
            } else {
              return res
                .status(200)
                .json({ message: "Password does not match!", success: false });
            }
          } else {
            return res
              .status(200)
              .json({ message: "Does not have chat lock!", success: false });
          }
        } catch (error) {
          console.error("Error:", error);
          return res
            .status(500)
            .json({ message: "Internal Server Error", success: false });
        }
      };

      // Call the function and wait for it to finish
      await comparePassword();
    } else {
      const user_id = authData.user_id;

      if (user_id == otheruser_id) {
        return res.status(400).json({
          success: false,
          message: "user_id and otheruser_id are the same",
        });
      }

      const isChatLock = await Chatlock.findOne({
        where: {
          user_id: user_id,
          otheruser_id: otheruser_id,
        },
      });

      const hashPassword = async () => {
        try {
          const hash = await bcrypt.hash(password, 10);
          if (isChatLock) {
            const updatedRow = await Chatlock.update(
              {
                password: hash,
              },
              {
                where: {
                  user_id: user_id,
                  otheruser_id: otheruser_id,
                },
              }
            );
          } else {
            const updatedRow = await Chatlock.create({
              password: hash,
              user_id: user_id,
              otheruser_id: otheruser_id,
            });
          }
          return res
            .status(200)
            .json({ message: "Chat lock updated successfully!", success: true });
        } catch (error) {
          console.error("Error:", error);
          return res
            .status(500)
            .json({ message: "Internal Server Error", success: false });
        }
      };

      // Call the function
      await hashPassword();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = { setChatLock };
