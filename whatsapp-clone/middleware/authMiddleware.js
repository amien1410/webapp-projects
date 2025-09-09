const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No credentials sent!" });
  } else {
    if (req.headers.authorization.split(" ")[0] !== "Bearer") {
      return res.status(403).json({ error: "Invalid token!" });
    }

    try {
      let jwtSecretKey = process.env.JWT_SECRET_KEY;
      // check if the token is valid or not
      req.authData = jwt.verify(
        req.headers.authorization.split(" ")[1], // auth token
        jwtSecretKey
      );
      // console.log(req.authData);
    } catch (error) {
      console.error(error);
      return res
        .status(403)
        .json({ message: "Invalid token!", success: false });
    }
  }
  next();
}

module.exports = authMiddleware;
