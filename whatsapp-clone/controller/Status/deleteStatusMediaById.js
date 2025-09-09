const { Status, StatusMedia ,Chat} = require("../../models");
const path = require("node:path");
const fs = require("node:fs");

const deleteStatusMediaById = async (req, res) => {
  const { status_media_id } = req.body;
  console.log(
    "\x1b[32m",
    "Here _________________________________________",
    "\x1b[0m"
  );

  if (!status_media_id || status_media_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "status_media_id field is required" });
  }

  try {
    // Find the status media by ID
    const statusMedia = await StatusMedia.findOne({
      where: { status_media_id: status_media_id },
      include: [
        {
          model: Status,
          include: [StatusMedia], // Include all media for this status to check count
        },
      ],
    });

    if (!statusMedia) {
      return res.status(404).json({
        success: false,
        message: "Status media not found",
      });
    }
    console.log("\x1b[32m", "status_media_id", status_media_id, "\x1b[0m");
    const resData = await Chat.destroy({
      where: {
        status_id: status_media_id,
      },
    });
    console.log("\x1b[31m", "resData ", resData, "\x1b[0m");
    const status = statusMedia.Status;

    // Remove the media file
    if (statusMedia.url) {
      const relativePath = statusMedia.url.replace(process.env.baseUrl, "");
      const absolutePath = path.join(__dirname, "..", "..", relativePath);

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath); // Delete the file
      }
    }

    // Delete the status media
    await statusMedia.destroy();

    // If the status has no more associated media, delete the status as well
    if (status.StatusMedia.length === 1) {
      await status.destroy();
    }

    return res.json({
      success: true,
      message: "Status media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting status media:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete status media",
    });
  }
};

module.exports = { deleteStatusMediaById };
