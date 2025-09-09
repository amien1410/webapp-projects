const { User } = require("../../models");

const deleteAccount = async (req, res) => {
  try {
    const user_id = req.authData.user_id;

    await User.update(
      { is_account_deleted: true, one_signal_player_id: "", device_token: "" },
      {
        where: { user_id: user_id }, // Use Sequelize's Op.in to target multiple user_ids
      }
    );

    return res.status(200).json({
      success: true,
      message: "Account deleted!",
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { deleteAccount };
