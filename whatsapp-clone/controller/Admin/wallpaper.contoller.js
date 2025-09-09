const { Admin, Wallpaper } = require("../../models");

async function addWallpaper(req, res) {
    try {
        const { admin_id } = req.authData;
        const wallpaper_image = req.files;
        const { wallpaper_title, wallpaper_status } = req.body;

        if (await Admin.findOne({ where: { admin_id } })) {
            const isWallpaper = await Wallpaper.create({
                wallpaper_image: wallpaper_image[0].path,
                wallpaper_title,
                wallpaper_status
            })
            if (isWallpaper) {
                res.status(200).json({ success: true, message: "Wallpaper Added Successfully" })
            }
            else {
                res.status(404).json({ success: false, message: "Wallpaper Not added" })
            }
        }
        else {
            res.status(404).json({ success: false, Message: "Invald Admin" })
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in Add Wallpaper" });
    }
}
async function editWallpaper(req, res) {
    try {
        const { admin_id } = req.authData;
        console.log(req.body);

        const wallpaper_image = req.files && req.files.length > 0 ? req.files[0].path : null;
        const { wallpaper_title, wallpaper_status, wallpaper_id } = req.body;

        if (!wallpaper_id) {
            return res.status(400).json({ success: false, message: "Wallpaper ID is required" });
        }

        const admin = await Admin.findOne({ where: { admin_id } });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Invalid Admin" });
        }

        const isWallpaper = await Wallpaper.findOne({ where: { wallpaper_id } });
        if (!isWallpaper) {
            return res.status(404).json({ success: false, message: "Wallpaper Not Found" });
        }

        const updatePayload = {};
        if (wallpaper_image) {
            updatePayload.wallpaper_image = wallpaper_image;
        }
        if (wallpaper_title) {
            updatePayload.wallpaper_title = wallpaper_title;
        }
        if (wallpaper_status) {
            updatePayload.wallpaper_status = wallpaper_status;
        }

        if (Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        const updateWallpaper = await Wallpaper.update(updatePayload, { where: { wallpaper_id } });
        if (updateWallpaper[0] === 1) {
            res.status(200).json({ success: true, message: "Wallpaper Updated Successfully" });
        } else {
            res.status(400).json({ success: false, message: "Wallpaper not Updated" });
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in editing Wallpaper" });
    }
}


async function deleteWallpaper(req, res) {
    try {
        const { admin_id } = req.authData;
        const { wallpaper_id } = req.body;

        if (await Admin.findOne({ where: { admin_id } })) {

            if (await Wallpaper.findOne({ where: { wallpaper_id } })) {
                const isdeleted = await Wallpaper.destroy(
                    {
                        where: { wallpaper_id }
                    }
                )
                if (isdeleted) {
                    res.status(200).json({ success: true, message: "Wallpaper Deleted Successfully" })
                }
                else {
                    res.status(400).json({ success: false, message: "Wallpaper not deleted " })

                }
            }
            else {
                res.status(404).json({ success: false, message: "Wallpaper Not Found" })
            }
        }
        else {
            res.status(404).json({ success: false, Message: "Invald Admin" })
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in delete Wallpaper" });
    }
}
async function updateWallpaperStatus(req, res) {
    try {
        const { admin_id } = req.authData;
        const { wallpaper_id, wallpaper_status } = req.body;

        if (await Admin.findOne({ where: { admin_id } })) {
            const isWallpaper = await Wallpaper.findOne({ where: { wallpaper_id } })
            if (isWallpaper) {
                const [isUpdate] = await Wallpaper.update(
                    { wallpaper_status: !isWallpaper.wallpaper_status },
                    {
                        where: { wallpaper_id }
                    }
                );

                if (isUpdate > 0) {
                    res.status(200).json({ success: true, message: "Wallpaper status updated successfully" });
                } else {
                    res.status(400).json({ success: false, message: "Wallpaper status not updated" });
                }
            }
            else {
                res.status(404).json({ success: false, message: "Wallpaper Not Found" })
            }
        }
        else {
            res.status(404).json({ success: false, Message: "Invald Admin" })
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in Update Wallpaper status" });
    }
}
async function listAllWallpaper(req, res) {
    try {
        const { admin_id } = req.authData;
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
        const offset = (page - 1) * limit; // Calculate offset for pagination

        // Check if admin exists
        if (await Admin.findOne({ where: { admin_id } })) {
            const wallpapers = await Wallpaper.findAndCountAll({
                limit: limit,
                offset: offset,
            });

            if (wallpapers) {
                res.status(200).json({
                    success: true,
                    message: "Wallpapers",
                    wallpapers: wallpapers.rows, // Actual data
                    pagination: {
                        count: wallpapers.count, // Total count
                        currentPage: page,
                        totalPages: Math.ceil(wallpapers.count / limit),
                    }
                });
            } else {
                res.status(200).json({ success: false, message: "No wallpapers found" });
            }
        } else {
            res.status(404).json({ success: false, message: "Invalid Admin" });
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in retrieving wallpapers" });
    }
}

async function WallpaperFromId(req, res) {
    try {
        const { admin_id } = req.authData;
        const { wallpaper_id } = req.body


        // Check if admin exists
        if (await Admin.findOne({ where: { admin_id } })) {
            const wallpaper = await Wallpaper.findOne({
                where: { wallpaper_id }
            });

            if (wallpaper) {
                res.status(200).json({
                    success: true,
                    message: "Wallpapers",
                    wallpaper: wallpaper, // Actual data

                });
            } else {
                res.status(200).json({ success: false, message: "No wallpaper found" });
            }
        } else {
            res.status(404).json({ success: false, message: "Invalid Admin" });
        }
    } catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in retrieving wallpaper from id" });
    }
}
module.exports = {
    addWallpaper,
    editWallpaper,
    deleteWallpaper,
    updateWallpaperStatus,
    listAllWallpaper,
    WallpaperFromId
};
