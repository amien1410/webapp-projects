const jwt = require("jsonwebtoken");
const { StatusView } = require("../../models");

// this is the controller to store who have viewed the status =============================================
const viewStatus = async (req, res) => {
  const { user_id } = req.authData;
  let { status_id, status_count } = req.body;
  console.log(status_id, "status_id");
  console.log(status_count, "status_count ===============================");
  if (!status_id || status_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "status_id field is required" });
  }

  if (!status_count || status_count == "") {
    return res
      .status(400)
      .json({ success: false, message: "status_count field is required" });
  }
  try {
    let isAllReadyViewed = await StatusView.findOne({
      where: {
        user_id: user_id,
        status_id: status_id,
      },
    });
    // console.log(isAllReadyViewed, "isAllReadyViewed");
    // console.log(!isAllReadyViewed, "!isAllReadyViewed");
    if (isAllReadyViewed) {
      // console.log(Number(status_count), "status_count");
      // console.log(
      //   isAllReadyViewed.dataValues.status_count,
      //   "isAllReadyViewed.dataValues.status_count"
      // );
      // console.log(
      //   isAllReadyViewed.dataValues.status_count < Number(status_count),
      //   "isAllReadyViewed.dataValues.status_count < Number(status_count)"
      // );
      // if allready added then add that this user viewed this status ======================================================
      if (isAllReadyViewed.dataValues.status_count < Number(status_count)) {
        await StatusView.update(
          {
            status_count: status_count,
          },
          {
            where: {
              status_id,
              user_id,
            },
          }
        );
      }
    } else {
      // console.log(status_count, "status_count");
      // if allready not added then add that this user viewed this status ======================================================
      await StatusView.create({ status_id, user_id, status_count });
    }

    return res.status(200).json({
      success: true,
      message: "Status viewed successfully",
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { viewStatus };
