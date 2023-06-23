var user = {};

var adminController = require("../controller/adminController");
var teacherController = require('../controller/teacherController')
var studentController = require('../controller/studentController')


//Middleware
const permission = [
  {
    url: "/admin/register",
  },
  {
    url: "/admin/login",
  },
  {
    url: "/subAdmin/login",
  },
  {
    url: "/user/login",
  },
  {
    url: "/user/register",
  },
];

user.middleware = async (req, res, next) => {
  if (permission.filter((it) => it.url == req.url).length > 0) {
    next();
  } else {
    if (!req.headers.authorization) {
      return res.status(200).json({
        error: "No credentials sent!",
        status: false,
        credentials: false,
      });
    } else {
      let authorization = req.headers.authorization;
      let userData = null;
      let userType =
        typeof req.headers.usertype != "undefined"
          ? req.headers.usertype
          : "User";
      //console.log('userType', userType, req.headers);
      if (userType == "admin"){
        userData = await adminController.getTokenData(authorization);
      }
      if (userType == "teacher"){
        userData = await teacherController.getTokenData(authorization);
      }
      if (userType == "student"){
        userData = await studentController.getTokenData(authorization);
      }
      if (userData && userData != null) {
        userData.password = null;
        //  console.log(userData)
        req.user = userData;
        req.userType = userType;
        // console.log(userType)
        (req.token = req.headers.authorization),
          // console.log( req.token)
          next();
      } else {
        res.status(401).json({
          error: "credentials not match",
          status: false,
          credentials: false,
        });
      }
    }
  }
};

module.exports = user;