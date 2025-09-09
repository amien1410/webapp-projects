const { Op } = require("sequelize");
const { PinMessage } = require("../../../models");

async function removePinMessage() {
  try {
    const now = new Date();
    await PinMessage.destroy({
      where: {
        expires_at: { [Op.lte]: now }, // Delete if expired
      },
    });
    console.log("Expired pinned messages deleted");
  } catch (error) {
    console.error("Error deleting expired pinned messages:", error);
  }
}

module.exports = removePinMessage;
