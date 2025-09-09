const { Admin, Avatar } = require("../../models");

async function addAvatar(req, res) {
  try {
    const { admin_id } = req.authData;
    const Avatar_Media = req.files;
    const { avatar_name, avatar_gender, status } = req.body;

    if (await Admin.findOne({ where: { admin_id } })) {
      const isAvatar = await Avatar.create({
        avtar_Media: Avatar_Media[0].path, // Fixed typo in property name
        avatar_name,
        avatar_gender,
        // status,
      });
      if (isAvatar) {
        res
          .status(200)
          .json({ success: true, message: "Avatar Added Successfully" });
      } else {
        res.status(404).json({ success: false, message: "Avatar Not added" });
      }
    } else {
      res.status(404).json({ success: false, message: "Invalid Admin" });
    }
  } catch (err) {
    console.error(err);
    res.status(501).json({ error: "Error in Add Avatar" });
  }
}

async function editAvatar(req, res) {
  try {
    const { admin_id } = req.authData;
    const avatar_Media =
      req.files && req.files.length > 0 ? req.files[0].path : null;
    const { avatar_name, avatar_gender, status, avatar_id } = req.body;

    if (!avatar_id) {
      return res
        .status(400)
        .json({ success: false, message: "Avatar ID is required" });
    }

    const admin = await Admin.findOne({ where: { admin_id } });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Invalid Admin" });
    }

    const isAvatar = await Avatar.findOne({ where: { avatar_id } });
    if (!isAvatar) {
      return res
        .status(404)
        .json({ success: false, message: "Avatar Not Found" });
    }

    const updatePayload = {};
    if (avatar_Media) {
      updatePayload.avtar_Media = avatar_Media;
    }
    if (avatar_name) {
      updatePayload.avatar_name = avatar_name;
    }
    if (status) {
      updatePayload.status = status;
    }
    if (avatar_gender) {
      updatePayload.avatar_gender = avatar_gender;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    const updateAvatar = await Avatar.update(updatePayload, {
      where: { avatar_id },
    });
    if (updateAvatar[0] === 1) {
      res
        .status(200)
        .json({ success: true, message: "Avatar Updated Successfully" });
    } else {
      res.status(400).json({ success: false, message: "Avatar not Updated" });
    }
  } catch (err) {
    console.error(err);
    res.status(501).json({ error: "Error in editing Avatar" });
  }
}

async function deleteAvatar(req, res) {
  try {
    const { admin_id } = req.authData;
    const { avatar_id } = req.body;

    if (await Admin.findOne({ where: { admin_id } })) {
      const isAvatar = await Avatar.findOne({ where: { avatar_id } });
      if (isAvatar) {
        const isDeleted = await Avatar.destroy({ where: { avatar_id } });
        if (isDeleted) {
          res
            .status(200)
            .json({ success: true, message: "Avatar Deleted Successfully" });
        } else {
          res
            .status(400)
            .json({ success: false, message: "Avatar not deleted" });
        }
      } else {
        res.status(404).json({ success: false, message: "Avatar Not Found" });
      }
    } else {
      res.status(404).json({ success: false, message: "Invalid Admin" });
    }
  } catch (err) {
    console.error(err);
    res.status(501).json({ error: "Error in delete Avatar" });
  }
}

async function updateAvatarStatus(req, res) {
  try {
    const { admin_id } = req.authData;
    const { avatar_id } = req.body;

    if (await Admin.findOne({ where: { admin_id } })) {
      const isAvatar = await Avatar.findOne({ where: { avatar_id } });
      if (isAvatar) {
        const [isUpdate] = await Avatar.update(
          { status: !isAvatar.status },
          { where: { avatar_id } }
        );

        if (isUpdate > 0) {
          res.status(200).json({
            success: true,
            message: "Avatar status updated successfully",
          });
        } else {
          res
            .status(400)
            .json({ success: false, message: "Avatar status not updated" });
        }
      } else {
        res.status(404).json({ success: false, message: "Avatar Not Found" });
      }
    } else {
      res.status(404).json({ success: false, message: "Invalid Admin" });
    }
  } catch (err) {
    console.error(err);
    res.status(501).json({ error: "Error in Update Avatar status" });
  }
}

async function listAllAvatar(req, res) {
  try {
    const { admin_id } = req.authData;
    const page = parseInt(req.body.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.body.limit) || 10; // Default to 10 items per page if not provided
    const offset = (page - 1) * limit; // Calculate offset for pagination

    // Check if admin exists
    // if (await Admin.findOne({ where: { admin_id } })) {
    const Avatars = await Avatar.findAndCountAll({
      limit: limit,
      offset: offset,
    });

    if (Avatars.rows.length > 0) {
      res.status(200).json({
        success: true,
        message: "Avatars",
        avatars: Avatars.rows, // Corrected field name
        pagination: {
          count: Avatars.count, // Total count
          currentPage: page,
          totalPages: Math.ceil(Avatars.count / limit),
        },
      });
    } else {
      await Avatar.create({
        avtar_Media: "uploads/avtars/female-1.png",
        avatar_name: "female-1",
        avatar_gender: "female",
        default_avtar: true,
      });
      await Avatar.create({
        avtar_Media: "uploads/avtars/female-2.png",
        avatar_name: "female-2",
        avatar_gender: "female",
      });
      await Avatar.create({
        avtar_Media: "uploads/avtars/female-3.png",
        avatar_name: "female-3",
        avatar_gender: "female",
      });
      await Avatar.create({
        avtar_Media: "uploads/avtars/female-4.png",
        avatar_name: "female-4",
        avatar_gender: "female",
      });
      await Avatar.create({
        avtar_Media: "uploads/avtars/male-1.png",
        avatar_name: "male-1",
        avatar_gender: "male",
        default_avtar: true,
      });
      await Avatar.create({
        avtar_Media: "uploads/avtars/male-2.png",
        avatar_name: "male-2",
        avatar_gender: "male",
      });
      await Avatar.create({
        avtar_Media: "uploads/avtars/male-3.png",
        avatar_name: "male-3",
        avatar_gender: "male",
      });
      await Avatar.create({
        avtar_Media: "uploads/avtars/male-4.png",
        avatar_name: "male-4",
        avatar_gender: "male",
      });
      await Avatar.create({
        avtar_Media: "uploads/avtars/male-5.png",
        avatar_name: "male-5",
        avatar_gender: "male",
      });
      await Avatar.create({
        avtar_Media: "uploads/avtars/male-6.png",
        avatar_name: "male-6",
        avatar_gender: "male",
      });

      const newAvatars = await Avatar.findAndCountAll({
        limit: limit,
        offset: offset,
      });

      res.status(200).json({
        success: true,
        message: "Avatars",
        avatars: newAvatars.rows, // Corrected field name
        pagination: {
          count: newAvatars.count, // Total count
          currentPage: page,
          totalPages: Math.ceil(newAvatars.count / limit),
        },
      });

      // res.status(200).json({ success: false, message: "No Avatars found" });
    }
    // } else {
    //   res.status(404).json({ success: false, message: "Invalid Admin" });
    // }
  } catch (err) {
    console.error(err);
    res.status(501).json({ error: "Error in retrieving Avatars" });
  }
}

async function avatarFromId(req, res) {
  try {
    const { admin_id } = req.authData;
    const { avatar_id } = req.body;

    if (await Admin.findOne({ where: { admin_id } })) {
      const avatar = await Avatar.findOne({ where: { avatar_id } });

      if (avatar) {
        res.status(200).json({
          success: true,
          message: "Avatar retrieved successfully",
          avatar, // Corrected variable name
        });
      } else {
        res.status(404).json({ success: false, message: "No Avatar found" });
      }
    } else {
      res.status(404).json({ success: false, message: "Invalid Admin" });
    }
  } catch (err) {
    console.error(err);
    res.status(501).json({ error: "Error in retrieving Avatar by ID" });
  }
}

module.exports = {
  addAvatar,
  editAvatar,
  deleteAvatar,
  updateAvatarStatus,
  listAllAvatar,
  avatarFromId,
};
