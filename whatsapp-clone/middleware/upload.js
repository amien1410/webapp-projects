let multer = require("multer");
let mime = require("mime-types");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(req.body.message_type, "req.body");
    switch (req.body.message_type) {
      case "image":
        return cb(null, "./uploads/image");
      case "video":
        let filemimeType = mime.lookup(file.originalname);
        return filemimeType.includes("image")
          ? cb(null, "./uploads/thumbnail")
          : cb(null, "./uploads/video");
      case "document":
        return cb(null, "./uploads/document");
      case "audio":
        return cb(null, "./uploads/audio");
      case "gif":
        return cb(null, "./uploads/gif");
      case "wallpaper":
        return cb(null, "./uploads/wallpaper");
      default:
        if (req.url.includes("user-details")) {
          return cb(null, "./uploads/profile");
        } else if (req.url.includes("add-status")) {
          return cb(null, "./uploads/status");
        } else if (req.url.includes("avtar")) {
          return cb(null, "./uploads/avtars");
        } else {
          return cb(null, "./uploads/others");
        }
    }
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      `${Date.now()}-${file.originalname
        .replaceAll("#", "-")
        .replaceAll(",", "-")
        .replaceAll(":", "-")
        .replaceAll(" ", "-")}`
    );
  },
});

const upload = multer({ storage });

module.exports = upload;
