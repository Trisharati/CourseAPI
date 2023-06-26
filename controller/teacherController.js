const teacherModel = require("../models/teacherModel");
const courseModel = require("../models/courseModel");
const studentModel = require("../models/studentModel");
const requestModel = require("../models/requestModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

function createToken(data) {
  return jwt.sign(data, "good");
}
const getTokenData = async (token) => {
  let teacherData = await teacherModel.findOne({ token: token }).exec();
  return teacherData;
};

const teacherReg = async (req, res) => {
  let isTeacherExist = await teacherModel.findOne({ email: req.body.email });
  if (isTeacherExist) {
    res.status(400).json({ message: "Email already exists" });
  } else {
    const teacherObj = {
      ...req.body,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
      token: createToken(req.body),
      createdOn: new Date(),
    };
    const info = await new teacherModel(teacherObj)
      .save()
      .then((data) => {
        res
          .status(200)
          .json({ message: "Teacher registered successfully", data: data });
      })
      .catch((err) => {
        res.status(400).json({ message: "Registration failed" });
        console.log("Error : ", err);
      });
  }
};

const teacherlogin = async (req, res) => {
  let isTeacherExist = await teacherModel.findOne({ email: req.body.email });
  // console.log(isAdminExist)
  if (isTeacherExist) {
    if (bcrypt.compareSync(req.body.password, isTeacherExist.password)) {
      res.status(200).json({ message: "Teacher logged in successfully" });
    } else {
      res.stataus(400).json({ message: "Wrong password" });
    }
  } else {
    res.status(400).json({ message: "Teacher does not exist" });
  }
};
const addCourseByTeacher = async (req, res) => {
  const courseObj = {
    ...req.body,
    createdOn: new Date(),
  };

  let isTeacherExist = await teacherModel.findOne({
    _id: new mongoose.Types.ObjectId(req.body.teacherId),
  });
  console.log(isTeacherExist);
  if (isTeacherExist) {
    await courseModel(courseObj)
      .save()
      .then((data) => {
        res.status(200).json({ message: "Course added", data: data });
      })
      .catch((err) => {
        res.status(400).json({ message: "Failed to add course", Error: err });
        console.log("Error : ", err);
      });
  } else {
    res.status(400).json({ message: "Only teachers can add courses" });
  }
};

const viewReqByTeacher = async (req, res) => {
  let isTeacherExist = await teacherModel.findOne({
    _id: new mongoose.Types.ObjectId(req.user._id),
  });
  if (isTeacherExist) {
    await requestModel
      .aggregate([
        {
          $match: {
            teacherId: new mongoose.Types.ObjectId(req.user._id),
          },
        },
        {
          $lookup: {
            from: "students",
            localField: "studentId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  __v: 0,
                  createdOn: 0,
                  _id: 0,
                  token: 0,
                  isDeleted: 0,
                },
              },
            ],
            as: "RequestSentBy",
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  __v: 0,
                  createdOn: 0,
                  _id: 0,
                  teacherId: 0,
                  isDeleted: 0,
                },
              },
            ],
            as: "courseDetails",
          },
        },
        {
          $project: {
            __v: 0,
            _id: 0,
            createdOn: 0,
            teacherId: 0,
            studentId: 0,
            courseId: 0,
            isDeleted: 0,
          },
        },
      ])
      .then((data) => {
        res
          .status(200)
          .json({
            message: "You have received following requests",
            data: data,
          });
      })
      .catch((err) => {
        res
          .status(400)
          .json({ message: "Unable to show requests received", Error: err });
      });
  } else {
    res.status(400).json({ message: "Teacher does not exist" });
  }
};

const acceptReq = async (req, res) => {
  let isTeacherExist = await teacherModel.findOne({
    _id: new mongoose.Types.ObjectId(req.user._id),
  });

  if (isTeacherExist) {
    if (isTeacherExist.isReqReceived) {
      res.status(200).json({ message: "Enrollment request accepted" });
      await studentModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(req.body.studentId) },
        {
          $set: {
            isEnrolled: true,
            courseId: new mongoose.Types.ObjectId(req.body.courseId),
          },
        }
      );

      await requestModel.findOneAndUpdate(
        {
          studentId: new mongoose.Types.ObjectId(req.body.studentId),
          courseId: new mongoose.Types.ObjectId(req.body.courseId),
        },
        {
          $set: {
            isAccepted: true,
          },
        }
      );
    }
  }
};
const rejectReq = async (req, res) => {
  let isTeacherExist = await teacherModel.findOne({
    _id: new mongoose.Types.ObjectId(req.params.id),
  });
  if (isTeacherExist) {
    if (isTeacherExist.isReqReceived) {
      await studentModel
        .findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(req.body.studentId) },
          {
            $set: {
              isEnrolled: false,
            },
          }
        )
        .then((data) => {
          res.status(200).json({ message: "Enrollment request rejected" });
          console.log(data);
        })
        .catch((err) => {
          console.log("Error ", err);
        });
    }
  }
};

// const viewEnrolledStudByTeacher = async(req,res)=>{

//     await requestModel.aggregate([
//         {
//             $match:{
//                 teacherId:new mongoose.Types.ObjectId(req.user._id),
//                 isAccepted:true
//             }
//         },

//         {
//             $lookup:{

//                 from:'students',
//                 localField:'studentId',
//                 foreignField:'_id',
//                 pipeline:[
//                     {
//                         $match:{
//                             isEnrolled:true
//                         }
//                     },
//                     {
//                         $lookup:{
//                             from:'courses',
//                             localField:'courseId',
//                             foreignField:'_id',
//                             pipeline:[

//                                 {
//                                     $project:{
//                                         __v:0,
//                                         createdOn:0,
//                                         _id:0,
//                                         isDeleted:0,
//                                         teacherId:0
//                                     }
//                                 },
//                             ],
//                             as:'courseDetails'
//                         }
//                     },
//                     {
//                         $unwind:"$courseDetails"
//                     },
//                     {
//                         $project:{
//                             __v:0,
//                             createdOn:0,
//                             _id:0,
//                             isDeleted:0,
//                             token:0
//                         }
//                     }
//                 ],
//                 as:'studentDetails'
//             }
//         },
//         // {
//         //   $addFields:{
//         //     totalstudents:{
//         //         $sum:1
//         //     }
//         //   }
//         // },
//         {
//             $project:{
//                     // totalstudents:1,
//                     __v:0,
//                     createdOn:0,
//                     _id:0,
//                     isDeleted:0,
//                     teacherId:0,
//                     studentId:0,
//                     courseId:0,
//                     isAccepted:0

//             }
//         }
//     ]).then((data)=>{
//         res.status(200).json({message:'students details corresponding to couse enrolled',data:data})
//     }).catch((err)=>{
//         res.status(400).json({Error:err})
//         console.log('Error: ',err)
//     })
// }

const viewEnrolledStudByTeacher = async (req, res) => {
  await courseModel
    .aggregate([
      {
        $match: {
          teacherId: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
        from: "requests",
        localField: "teacherId",
        foreignField: "teacherId",
        as: "teacherData"   
        }
      },
      {
        $addFields: {
            studentCount: {
            $sum: { $size: ["$teacherData"] },
          },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "courseId",
          pipeline: [
            {
              $project: {
                __v: 0,
                createdOn: 0,
                _id: 0,
                isDeleted: 0,
                token: 0,
                courseId: 0,
                password: 0,
                role: 0,
                teacherData: 0
              },
            },
          ],
          as: "studentDetails",
        },
      },
      {
        $addFields: {
          total: {
            $sum: { $size: ["$studentDetails"] },
          },
        },
      },

      {
        $project: {
          __v: 0,
          createdOn: 0,
          isDeleted: 0,
          _id: 0,
          teacherId: 0,
        },
      },
    ])
    .then((data) => {
        // const totalstudents = data.reduce((acc,cur)=>{
        //     return acc+cur.total
        // },0)
        // console.log('Total students : ',totalstudents)
      res.status(200).json({
        message: "students details corresponding to couse enrolled",
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({ Error: err });
      console.log("Error: ", err);
    });
};
const view = async (req, res) => {
  await teacherModel
    .aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
        from: "requests",
        localField: "_id",
        foreignField: "teacherId",
        as: "reqData",
        pipeline: [
          {
            $match: {
              isAccepted: true,
            }
          }
        ],  
        }
      },
      {
        $addFields: {
            studentCount: {
            $sum: { $size: ["$reqData"] },
          },
        },
      },
      {
        $lookup: {
          from: "courses",
            localField: "_id",
            foreignField: "teacherId",
            as: "courseData",
            pipeline: [
              {
                $lookup: {
                  from: "students",
                  localField: "_id",
                  foreignField: "courseId",
                  pipeline: [
                    {
                      $project: {
                        __v: 0,
                        createdOn: 0,
                        _id: 0,
                        isDeleted: 0,
                        token: 0,
                        courseId: 0,
                        password: 0,
                        role: 0,
                        teacherData: 0
                      },
                    },
                  ],
                  as: "studentDetails",
                },
              },
              {
                $addFields: {
                  total: {
                    $sum: { $size: ["$studentDetails"] },
                  },
                },
              },
        
            ]
        }
      },
     
      {
        $project: {
          studentCount: 1,
          courseData: 1,
          studentDetails: 1,
          total: 1
        },
      },
    ])
    .then((data) => {
        // const totalstudents = data.reduce((acc,cur)=>{
        //     return acc+cur.total
        // },0)
        // console.log('Total students : ',totalstudents)
      res.status(200).json({
        message: "students details corresponding to couse enrolled",
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).json({ Error: err });
      console.log("Error: ", err);
    });
}

module.exports = {
  teacherReg,
  getTokenData,
  teacherlogin,
  addCourseByTeacher,
  acceptReq,
  rejectReq,
  viewReqByTeacher,
  viewEnrolledStudByTeacher,
  view
};
