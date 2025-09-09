const jwt = require("jsonwebtoken");
const { AllContact, User } = require("../../models");
const { Op, where } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const addContactName = async (req, res) => {
  let { phone_number, full_name } = req.body;

  if (!phone_number || phone_number == "") {
    return res
      .status(400)
      .json({ success: false, message: "phone_number field is required" });
  }
  if (!full_name || full_name == "") {
    return res
      .status(400)
      .json({ success: false, message: "full_name field is required" });
  }
  // console.log(phone_number, full_name,"phone_number, full_name");

  try {
    // authtoken is required

    const user_id = req.authData.user_id;
    let message;
    const isContactExist = await AllContact.findOne({
      where: {
        user_id: user_id,
        phone_number: phone_number,
      },
    });

    if (isContactExist) {
      const isContactExist = await AllContact.update(
        { full_name: full_name },
        {
          where: {
            user_id: user_id,
            phone_number: phone_number,
          },
        }
      );
      message = "Contact Updated Successfully";
    } else {
      let userDetails = await User.findOne({
        where: {
          user_id: user_id,
          phone_number: phone_number,
        },
      });
      if (!userDetails) {
        const AllContactRes = await AllContact.create({
          phone_number: phone_number,
          full_name: full_name,
          user_id: user_id,
        });
      }
      message = "Contact Added Successfully";
    }

    // Get user_id
    const userData = await User.findOne({
      attributes: ["user_id"],
      where: { phone_number },
    });
    console.log(userData, "userData");
    return res.status(200).json({
      message: message,
      success: true,
      user_id: userData.user_id,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addContactName };
