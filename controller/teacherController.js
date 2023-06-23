const teacherModel = require('../models/teacherModel')
const courseModel = require('../models/courseModel')
const studentModel = require('../models/studentModel')
const middleware = require('../service/middleware')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose= require('mongoose')

function createToken(data){
    return jwt.sign(data,"good")
}
const getTokenData = async (token) => {
    let teacherData = await teacherModel.findOne({ token: token }).exec();
    return teacherData;
  };


const teacherReg = async(req,res)=>{
    let isTeacherExist = await teacherModel.findOne({email:req.body.email})
    if(isTeacherExist){
        res.status(400).json({message:'Email already exists'})
    }
    else{
        const teacherObj={
            ...req.body,
            password:bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10)),
            token:createToken(req.body),
            createdOn: new Date()
        }
        const info=await new teacherModel(teacherObj).save().then((data)=>{
            res.status(200).json({message:'Teacher registered successfully',data:data})
        }).catch((err)=>{
            res.status(400).json({message:'Registration failed'})
            console.log('Error : ',err)
        })
    }
}

const teacherlogin = async(req,res)=>{
    let isTeacherExist = await teacherModel.findOne({email:req.body.email})
    // console.log(isAdminExist)
    if(isTeacherExist){
        if(bcrypt.compareSync(req.body.password,isTeacherExist.password)){
            res.status(200).json({message:'Teacher logged in successfully'})
        }
        else{
            res.stataus(400).json({message:'Wrong password'})
        }
    }
    else{
        res.status(400).json({message:'Teacher does not exist'})
    }

}
const addCourseByTeacher = async(req,res)=>{
    const courseObj={
        ...req.body,
        createdOn:new Date()
    }
    
    let isTeacherExist = await teacherModel.findOne({_id:new mongoose.Types.ObjectId(req.body.teacherId)})
    console.log(isTeacherExist)
    if(isTeacherExist){
await courseModel(courseObj).save()
.then((data)=>{
    res.status(200).json({message:'Course added',data:data})
}).catch((err)=>{
    res.status(400).json({message:'Failed to add course',Error:err})
    console.log('Error : ',err)
})
    }
    else{
        res.status(400).json({message:'Only teachers can add courses'})
    }
}



const acceptReq = async(req,res)=>{
    let isTeacherExist=await teacherModel.findOne({_id:new mongoose.Types.ObjectId(req.params.id)})
    if(isTeacherExist){
        if(isTeacherExist.isReqReceived){
            res.status(200).json({message:'Enrollment request accepted'})
            await studentModel.findOneAndUpdate({_id:new mongoose.Types.ObjectId(req.body.studentId)},
            {
                $set:{
                    isEnrolled:true
                }
            })
        }
    }

}
const rejectReq = async(req,res)=>{
    let isTeacherExist=await teacherModel.findOne({_id:new mongoose.Types.ObjectId(req.params.id)})
    if(isTeacherExist){
        if(isTeacherExist.isReqReceived){
            
            await studentModel.findOneAndUpdate({_id:new mongoose.Types.ObjectId(req.body.studentId)},
            {
                $set:{
                    isEnrolled:false
                }
            }).then((data)=>{
                res.status(200).json({message:'Enrollment request rejected'})
                console.log(data)
            }).catch((err)=>{
                console.log('Error ',err)
            })
        }
    }

}


module.exports = {teacherReg,getTokenData,teacherlogin,addCourseByTeacher,acceptReq,rejectReq}