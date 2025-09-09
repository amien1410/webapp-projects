const { User, Conversation } = require("../../../models");
const { Op } = require("sequelize");

const getPublicGroup = async (req, res) => {
  const user_id = req.authData.user_id;
  let { page = 1, per_page_message = 100, group_name } = req.body;

  try {
    page = parseInt(page); // Default to page 1 if not provided
    const limit = parseInt(per_page_message);
    const offset = (page - 1) * limit; // Calculate offset for pagination

    let updatedFields = {
      public_group: true,
    };

    // Add user_name condition outside the App_FlowData condition
    if (group_name && group_name !== "") {
      updatedFields.group_name = { [Op.like]: `%${group_name}%` };
    }
    const allPublicGroupCount = await Conversation.count();

    const allPublicGroup = await Conversation.findAll({
      where: updatedFields,
      //   attributes: {
      //     exclude: [""],
      //   },
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Public group list",
      allPublicGroup: allPublicGroup,
      pagination: {
        count: allPublicGroupCount, // Total count
        currentPage: page,
        totalPages: Math.ceil(allPublicGroupCount / limit),
      },
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getPublicGroup;
