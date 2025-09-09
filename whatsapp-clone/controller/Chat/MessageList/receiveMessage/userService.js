const { User } = require("../../../../models");

const getUserById = async (user_id) => {
  return await User.findOne({
    where: { user_id },
    attributes: [
      "user_id",
      "user_name",
      "profile_image",
      "first_name",
      "last_name",
      "phone_number",
    ],
  });
};

module.exports = { getUserById };
