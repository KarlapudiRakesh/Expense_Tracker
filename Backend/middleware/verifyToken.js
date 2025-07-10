const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.token;

  if (!token) return res.status(401).json("Access Denied: No Token Provided");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json("Invalid Token");

    req.user = user;
    next();
  });
};

module.exports = verifyToken;
