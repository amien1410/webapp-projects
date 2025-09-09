const jwt = require("jsonwebtoken");
const {
  Status,
  StatusMedia,
  AllContact,
  User,
  StatusView,
} = require("../../models");

const statusViewesList = async (req, res) => {
  const { user_id } = req.authData;
  const { status_id } = req.body;
  if (!status_id || status_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "status_id field is required" });
  }

  try {
    // Get Status Views List ===================================================================
    let viewsList = await StatusView.findAll({
      where: {
        status_id,
      },
      attributes: ["createdAt", "status_count"],
      include: [
        {
          model: User,
          attributes: [
            "profile_image",
            "user_id",
            "first_name",
            "last_name",
            "phone_number",
          ],
        },
      ],
    });

    // Map through viewsList and invoke the get() method on each associated User instance
    viewsList = viewsList.map((view) => {
      // Ensure we are dealing with the dataValues
      const viewData = view.get(); // Get the plain dataValues with getters applied

      const user = viewData.User ? viewData.User.get() : null;

      return {
        ...viewData, // Spread the view's dataValues including getters
        User: user, // Assign the transformed User data
      };
    });

    viewsList = await Promise.all(
      viewsList.map(async (item) => {
        let userDetails = await AllContact.findOne({
          where: {
            phone_number: item.User.phone_number,
            user_id,
          },
          attributes: ["full_name"],
        });

        // Create a new object to avoid circular references
        let newUser = {
          ...item.User,
          user_name:
            userDetails?.full_name ||
            `${item.User.first_name} ${item.User.last_name}`,
        };

        // Avoid adding the parent property to the new object
        return {
          ...item,
          User: newUser,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Status added successfully",
      statusViewsList: viewsList,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { statusViewesList };
