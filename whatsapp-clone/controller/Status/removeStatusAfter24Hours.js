const { Op } = require("sequelize");
const { Status, StatusMedia, Chat } = require("../../models");
const path = require("node:path");
const fs = require("node:fs");

const removeStatusAfter24Hours = async () => {
  try {
    // Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let existingStatus = await Status.findAll({
      where: {
        createdAt: {
          [Op.lt]: twentyFourHoursAgo,
        },
        is_deleted: false, // Only consider statuses that haven't already been deleted
      },
      include: [
        {
          model: StatusMedia,
        },
      ],
    });

    // Process each status to determine whether to mark as deleted or permanently delete
    for (const status of existingStatus) {
      let hasStatusReplyInChat = false;

      for (const statusMedaData of status.StatusMedia) {
        const hasStatusReply = await Chat.findOne({
          where: {
            status_id: statusMedaData.dataValues.status_media_id,
          },
        });
        if (hasStatusReply) {
          hasStatusReplyInChat = true;
        }
      }

      if (hasStatusReplyInChat) {
        // If there is an entry in the Chat table, mark the status as deleted
        await status.update({ is_deleted: true });
      } else {
        // No entry in Chat table, so remove associated files and delete the status
        status.StatusMedia.forEach((media) => {
          if (media.dataValues.url != "") {
            // Construct the absolute path by joining __dirname with the relative path
            const absolutePath = path.join(
              __dirname,
              "..",
              "..",
              media.dataValues.url
            );

            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath); // Delete the file
            }
          }
        });

        // Permanently delete the status
        await status.destroy();
      }
    }

    console.log("Statuses older than 24 hours have been processed");
  } catch (error) {
    // Handle the Sequelize error and log it
    console.error("Error processing old statuses:", error);
  }
};

module.exports = { removeStatusAfter24Hours };
