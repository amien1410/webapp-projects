const { Status, StatusMedia } = require("../../models");
const path = require("node:path");
const fs = require("node:fs");

const deleteStatusById = async (req, res) => {
  const { status_id } = req.body;

  if (!status_id || status_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "status_id field is required" });
  }
  try {
    // Find the status by ID and include associated media
    const status = await Status.findOne({
      where: { status_id: status_id },
      include: [
        {
          model: StatusMedia,
        },
      ],
    });

    if (!status) {
      return res.status(404).json({
        success: false,
        message: "Status not found",
      });
    }
    // mark the status as deleted
    await status.update({ is_deleted: true });

    // Remove the associated media files
    // status.StatusMedia.forEach(async (media) => {

    //   // console.log(media.url, "media.url");
    //   if (media.url) {
    //     const relativePath = media.url.replace(process.env.baseUrl, "");

    //     const absolutePath = path.join(__dirname, "..", "..", relativePath);
    //     // console.log(absolutePath, "absolutePath");

    //     if (fs.existsSync(absolutePath)) {
    //       fs.unlinkSync(absolutePath); // Delete the file
    //     }
    //   }
    // });

    // Delete the status
    // await status.destroy();

    return res.json({
      success: true,
      message: "Status deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete status",
    });
  }
};

module.exports = { deleteStatusById };
