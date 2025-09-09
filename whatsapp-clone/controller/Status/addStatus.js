const jwt = require("jsonwebtoken");
const { Status, StatusMedia } = require("../../models");

const addStatus = async (req, res) => {
  const { user_id } = req.authData;
  let { status_text } = req.body;
  let files = req.files;

  if (!files || files.length == 0 || files.length == undefined) {
    return res
      .status(400)
      .json({ status: false, message: "Status Image or Video is Required" });
  }

  try {
    let existingStatus = await Status.findOne({
      where: {
        user_id,
      },
    });

    if (existingStatus) {
      // console.log(existingStatus, "existingStatus=============");
      files.map(async (file) => {
        let statusMedia = await StatusMedia.create({
          url: file.path,
          status_id: existingStatus.status_id,
          status_text,
        });
      });
      return res.status(200).json({
        success: true,
        message: "Status Updated successfully",
      });
    }

    // Now Add user to conversation ======================================================
    let createStatusData = await Status.create({ user_id });
    createStatusData = createStatusData.toJSON();
    // if (files && files.length != 0) {
    // console.log(createStatusData, "createStatusData =============");
    files.map(async (file) => {
      let statusMedia = await StatusMedia.create({
        url: file.path,
        status_id: createStatusData.status_id,
        status_text,
      });
    });
    // }

    return res.status(200).json({
      success: true,
      message: "Status added successfully",
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addStatus };
