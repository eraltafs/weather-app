const jwt = require("jsonwebtoken");

require("dotenv").config();



const authentication = async (req, res, next) => {
  try {
    const token =
      req.headers?.authorization?.split(" ")[1] || req.cookies?.accesstoken;
    console.log(token);
    if (token) {
     
      jwt.verify(token, process.env.seckey, function (err, decoded) {
        if (decoded) {
          req.user = decoded;
          next();
        } else {
          console.log(err);
          res.status(401).send({ msg: "Please login again", err: err.message });
        }
      });
    } else {
      res.status(401).send({ msg: "Please login again" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "An error occurred" });
  }
};

module.exports = { authentication };
