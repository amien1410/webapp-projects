const { User, Avatar } = require("../../models");

const fs = require("fs");
const baseUrl = process.env.baseUrl;
const jwt = require("jsonwebtoken");
const path = require("path");
const checkRequiredFields = require("../../reusable/checkRequiredFields");
const { updateFieldIfDefined } = require("../../reusable/updatedFields");
const addOrUpdateContactInAllcontacts = require("../../reusable/addOrUpdateContactInAllcontacts");

let jwtSecretKey = process.env.JWT_SECRET_KEY;

function clientTypeDetector(req) {
  const clientType = req.headers["x-client-type"];
  const userAgent = req.headers["user-agent"] || "";

  if (clientType) {
    req.clientType = clientType.toLowerCase(); // 'app' or 'web'
  } else if (userAgent.includes("okhttp") || userAgent.includes("Dart")) {
    req.clientType = "app";
  } else if (userAgent.includes("Mozilla")) {
    req.clientType = "web";
  } else {
    req.clientType = "unknown";
  }
}

const userDetails = async (req, res) => {
  let {
    user_name,
    bio,
    device_token,
    country,
    country_full_name,
    dob,
    gender,
    first_name,
    last_name,
    one_signal_player_id,
    avatar_id,
  } = req.body;

  let profile_image = req.files;
  //   console.log(profile_image[0].path);
  let authData = req.authData;
  // try {
  //   authData = jwt.verify(req.authToken, jwtSecretKey);
  // } catch (error) {
  //   console.error(error);
  //   return res.status(403).json({ message: "Invalid token!", success: false });
  // }

  const updateFields = {};

  // check which field is missing
  // const fieldsToCheck = [{ name: "user_name", value: user_name }];

  // const missingFieldError = checkRequiredFields(fieldsToCheck, res);

  // if (missingFieldError) {
  //   return missingFieldError;
  // }

  // if (user_name != "" && user_name != undefined) {
  //   updateFields.user_name = user_name;
  // }

  // if (bio != "" && bio != undefined) {
  //   updateFields.bio = bio;
  // }
  // if (device_token != "" && device_token != undefined) {
  //   updateFields.device_token = device_token;
  // }

  updateFieldIfDefined(updateFields, "user_name", user_name);
  updateFieldIfDefined(updateFields, "first_name", first_name);
  updateFieldIfDefined(updateFields, "last_name", last_name);
  updateFieldIfDefined(updateFields, "bio", bio);
  updateFieldIfDefined(updateFields, "gender", gender);
  updateFieldIfDefined(updateFields, "dob", dob);
  // updateFieldIfDefined(updateFields, "country", country);
  // updateFieldIfDefined(updateFields, "country_full_name", country_full_name);
  updateFieldIfDefined(updateFields, "device_token", device_token);
  updateFieldIfDefined(updateFields, "avatar_id", avatar_id);
  updateFieldIfDefined(
    updateFields,
    "one_signal_player_id",
    one_signal_player_id
  );
  const customHeader = req.headers["x-custom-header"];
  console.log(customHeader);
  if (customHeader == "Web") {
    updateFields.is_web = true;
  } else {
    updateFields.is_mobile = true;
  }
  // updateFields.address = address;
  // updateFields.City = City;
  // updateFields.Country = Country;

  if (req.files && profile_image.length != 0) {
    // to remove the existing image from upload folder
    const user = await User.findByPk(authData.user_id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Get the profile image path
    const profileImagePath = user.profile_image;

    if (profileImagePath !== "") {
      // Replace `${process.env.baseUrl}` with an empty string to remove it
      const relativePath = profileImagePath.replace(process.env.baseUrl, "");

      if (
        relativePath != "uploads/not-found-images/profile-image.png" &&
        !relativePath.includes("uploads/avtars/")
      ) {
        // Construct the absolute path by joining __dirname with the relative path
        const absolutePath = path.join(__dirname, "..", "..", relativePath);

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath); // Delete the file
        }
      }
    }

    updateFields.profile_image = profile_image[0].path;
    updateFields.avatar_id = 0;
  }

  if (avatar_id != "" && avatar_id != undefined) {
    // to remove the existing image from upload folder
    const user = await User.findByPk(authData.user_id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Get the profile image path
    const profileImagePath = user.profile_image;

    if (profileImagePath != "") {
      // Replace `${process.env.baseUrl}` with an empty string to remove it
      const relativePath = profileImagePath.replace(process.env.baseUrl, "");

      if (
        relativePath != "uploads/not-found-images/profile-image.png" &&
        !relativePath.includes("uploads/avtars/")
      ) {
        // Construct the absolute path by joining __dirname with the relative path
        const absolutePath = path.join(__dirname, "..", "..", relativePath);

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath); // Delete the file
        }
      }
    }

    const avtar = await Avatar.findOne({
      where: { avatar_id },
    });

    const avtar_image = avtar.avtar_Media.replace(process.env.baseUrl, "");

    updateFields.profile_image = avtar_image;
  }

  if (
    updateFields.first_name != "" &&
    updateFields.first_name &&
    updateFields.last_name != "" &&
    updateFields.last_name
  ) {
    await addOrUpdateContactInAllcontacts({
      first_name: updateFields.first_name,
      last_name: updateFields.last_name,
      user_id: authData.user_id,
    });
  }

  // updateFields.profile_image = profile_image;

  // if (Object.keys(updateFields).length == 0) {
  //   // No fields to update

  //   return res
  //     .status(400)
  //     .json({ message: "No fields to update.", success: false });
  // }

  try {
    const resData = await User.update(updateFields, {
      where: { user_id: authData.user_id },
    });

    const userData = await User.findByPk(authData.user_id, {
      attributes: {
        exclude: ["createdAt", "updatedAt", "otp"],
      },
    });

    res.status(200).json({
      message: "User Updated Successfully",
      success: true,
      resData: userData,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    res.status(500).json({ error: error.message });
  }
};

const checkUserName = async (req, res) => {
  let { user_name } = req.body;
  // const authData = jwt.verify(req.authToken, jwtSecretKey);

  if (user_name == "" || !user_name) {
    return res
      .status(400)
      .json({ message: "user_name field is required!", success: false });
  }

  try {
    const resData = await User.findOne({
      where: {
        user_name: user_name,
      },
    });

    if (resData == null) {
      return res.status(200).json({
        message: `${user_name} is available!`,
        success: true,
      });
    } else {
      return res
        .status(200)
        .json({ message: `${user_name} is not available!`, success: false });
    }
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    res.status(500).json({ error: error.message });
  }
};

module.exports = { userDetails, checkUserName };
