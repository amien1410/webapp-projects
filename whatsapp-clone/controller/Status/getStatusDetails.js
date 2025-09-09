const jwt = require("jsonwebtoken");
const { Status, StatusMedia } = require("../../models");

const getStatusDetails = async (req, res) => {
  const { user_id } = req.authData;
  let { status_id } = req.body;

  if (status_id == "" || !status_id) {
    return res
      .status(400)
      .json({ status: false, message: "status_id field is required" });
  }

  try {
    let existingStatus = await Status.findOne({
      attributes: ["status_id", "updatedAt", "createdAt"],
      include: [
        {
          model: StatusMedia,
          where: {
            status_media_id: status_id,
          },
          attributes: ["status_media_id", "url", "status_text", "updatedAt"],
        },
      ],
    });
    if (!existingStatus) {
      return res
        .status(400)
        .json({ status: false, message: "Status Not Found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Status added successfully",
      statusDetails: existingStatus,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getStatusDetails };
