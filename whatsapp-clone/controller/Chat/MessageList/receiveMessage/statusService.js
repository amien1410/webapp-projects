const { Status, StatusMedia } = require("../../../../models");

const getStatusData = async (status_id) => {
  if (status_id) {
    const existingStatus = await Status.findOne({
      include: [
        {
          model: StatusMedia,
          where: { status_media_id: status_id },
          attributes: ["status_media_id", "url", "status_text", "updatedAt"],
        },
      ],
    });
    return existingStatus ? [existingStatus] : [];
  }
  return [];
};

module.exports = { getStatusData };
