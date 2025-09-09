const jwt = require("jsonwebtoken");
const {
  Status,
  StatusMedia,
  AllContact,
  User,
  StatusView,
} = require("../../models");

const statusList = async (req, res) => {
  const { user_id } = req.authData;

  try {
    // Get User list which are saved in user's contacts
    let allSavedContacts = await AllContact.findAll({
      where: { user_id },
      attributes: ["full_name", "phone_number"],
      group: ["phone_number"], // Group by phone_number
    });

    const statusListData = await Promise.all(
      allSavedContacts.map(async (e) => {
        e = e.toJSON(); // Convert the contact instance to plain object

        let userData = await User.findOne({
          where: { phone_number: e.phone_number },
          attributes: ["profile_image", "user_id"],
          include: [
            {
              model: Status,
              attributes: ["status_id", "updatedAt", "createdAt"],
              where: {
                is_deleted: false,
              },
              include: [
                {
                  model: StatusMedia,
                  attributes: [
                    "status_media_id",
                    "url",
                    "status_text",
                    "updatedAt",
                  ],
                },
                {
                  model: StatusView,
                  attributes: ["status_count"],
                  where: { user_id }, // Filter by the current user
                  required: false, // Include statuses even if there are no views
                },
              ],
            },
          ],
        });

        if (userData) {
          userData = userData.toJSON(); // Convert the user instance to plain object
        }

        return {
          ...e,
          userData,
        };
      })
    );

    // Get user_id status
    let myStatusData = await User.findOne({
      where: { user_id },
      attributes: ["profile_image", "user_id"],
      include: [
        {
          model: Status,
          attributes: ["status_id", "updatedAt"],
          include: [
            {
              model: StatusMedia,
              attributes: [
                "status_media_id",
                "url",
                "status_text",
                "updatedAt",
              ],
            },
            {
              model: StatusView,
              attributes: ["status_count"],
              required: false,
            },
          ],
        },
      ],
    });

    if (myStatusData) {
      myStatusData = myStatusData.toJSON(); // Convert to plain object

      // Add `status_media_view_count` to each `StatusMedia`
      myStatusData.Statuses = myStatusData.Statuses.map((status) => {
        const statusCounts = status.StatusViews.flatMap((view) =>
          Array(view.status_count)
            .fill(1)
            .map((_, index) => index + 1)
        );

        // Count occurrences of each media index
        const mediaCounts = {};
        statusCounts.forEach((count) => {
          mediaCounts[count] = (mediaCounts[count] || 0) + 1;
        });

        // Assign view counts to each media
        status.StatusMedia = status.StatusMedia.map((media, index) => ({
          ...media,
          status_media_view_count: mediaCounts[index + 1] || 0,
        }));

        return status;
      });
    }

    // console.log(myStatusData);

    // Filter out entries where Statuses array is empty
    const filteredStatusListData = statusListData.filter(
      (item) => item.userData && item.userData.Statuses.length != 0
    );

    // Add status_count: 0 to empty StatusViews
    filteredStatusListData.forEach((status) => {
      status.userData.Statuses.forEach((statusItem) => {
        if (statusItem.StatusViews.length === 0) {
          statusItem.StatusViews.push({ status_count: 0 });
        }
      });
    });

    // Separate viewed and not viewed statuses
    const viewedStatusList = [];
    const notViewedStatusList = [];

    filteredStatusListData.forEach((status) => {
      status.userData.Statuses.forEach((statusItem) => {
        const totalMediaCount = statusItem.StatusMedia.length;
        const viewCount = statusItem.StatusViews[0].status_count;

        if (viewCount >= totalMediaCount) {
          viewedStatusList.push(status);
        } else {
          notViewedStatusList.push(status);
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: "Status added successfully",
      viewedStatusList,
      notViewedStatusList,
      myStatus: myStatusData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { statusList };
