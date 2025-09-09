const jwt = require("jsonwebtoken");
const { Chat, User } = require("../../../models");
const { updateFieldIfDefined } = require("../../../reusable/updatedFields");
const { Op } = require("sequelize");

const searchMessage = async (req, res) => {
  try {
    let { conversation_id, search_text } = req.body;
    const user_id = req.authData.user_id;
    let updateFields = {};

    let searchResults = await Chat.findAll({
      where: {
        conversation_id: conversation_id,
        message: {
          [Op.like]: `%${search_text}%`,
        },
      },
      include: [
        {
          model: User,
          attributes: [
            "user_id",
            "phone_number",
            "profile_image",
            "user_name",
            "first_name",
            "last_name",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      //   include: [{ model: User}],
      //   attributes: ["id", "conversation_id", "message", "user_id", "created_at"],
    });

    return res.status(200).json({
      success: true,
      message: "Star message list",
      searchResults: searchResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { searchMessage };
