const {  Archive } = require("../../../models");

const addToArchive = async (req, res) => {
  let { conversation_id } = req.body;
  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }

  try {
    const user_id = req.authData.user_id;

    const isArchiveed = await Archive.findOne({
      where: {
        user_id,
        conversation_id,
      },
    });

    if (isArchiveed) {
      // Delete the archive row
      await Archive.destroy({
        where: {
          user_id,
          conversation_id,
        },
      });

      return res.status(200).json({
        success: true,
        message: "User Unarchiveed successfully",

      });
    }

    // Archive the user
    await Archive.create({
      user_id,
      conversation_id,
    });

    // const archiveData = await Archive.findOne({
    //   where: {
    //     [Op.or]: [
    //       { userId: authData.user_id, archiveedUserId: archiveedUserId },
    //       { userId: archiveedUserId, archiveedUserId: authData.user_id },
    //     ],
    //   },
    // });

    res.status(200).json({
      success: true,
      message: "User archiveed successfully",
      // isArchiveed: archiveData,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addToArchive };
