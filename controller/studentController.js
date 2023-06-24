const studentModel = require('../models/studentModel')
const courseModel = require('../models/courseModel')
const teacherModel = require('../models/teacherModel')
const requestModel = require('../models/requestModel')


const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

function createToken(data){
    return jwt.sign(data,"good")
}
const getTokenData = async (token) => {
    let studentData = await studentModel.findOne({ token: token }).exec();
    return studentData;
  };


const studentReg = async(req,res)=>{
    let isStudentExist = await studentModel.findOne({email:req.body.email})
    if(isStudentExist){
        res.status(400).json({message:'Email already exists'})
    }
    else{
        const studentObj={
            ...req.body,
            password:bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10)),
            token:createToken(req.body),
            createdOn: new Date()
        }
        const info=await new studentModel(studentObj).save().then((data)=>{
            res.status(200).json({message:'Student registered successfully',data:data})
        }).catch((err)=>{
            res.status(400).json({message:'Registration failed'})
            console.log('Error : ',err)
        })
    }
}

const studentlogin = async(req,res)=>{
    let isStudentExist = await studentModel.findOne({email:req.body.email})
    // console.log(isAdminExist)
    if(isStudentExist){
        if(bcrypt.compareSync(req.body.password,isStudentExist.password)){
            res.status(200).json({message:'Student logged in successfully'})
        }
        else{
            res.stataus(400).json({message:'Wrong password'})
        }
    }
    else{
        res.status(400).json({message:'Student does not exist'})
    }

}

const viewCourse = async(req,res)=>{
    await courseModel.aggregate([
        {
            $project:{
                __v:0,
                createdOn:0,
                updatedOn:0,
                _id:0,
                isDeleted:0
            }
        }
    ]).then((data)=>{
        res.status(200).json({message:'Following courses are available',data:data})
    }).catch((err)=>{
        res.status(400).json({message:'Unable to show courses',Error:err})
    })
}

const enrollCourse = async(req,res)=>{
    let isStudentExist = await studentModel.findOne({_id: new mongoose.Types.ObjectId(req.user._id)})
    
    if(isStudentExist){
        const reqObj = {
            ...req.body,
            studentId:req.user._id,
            createdOn:new Date()
        }
        await requestModel(reqObj).save().then((data)=>{
            res.status(200).json({message:'request model updated',data:data})
        }).catch((err)=>{
            res.status(400).json({message:'Unable to update request model'})
        })
        await teacherModel.findOneAndUpdate({_id: new mongoose.Types.ObjectId(req.body.teacherId)},
        {
            $set:{
                isReqReceived:true
            }
        }
        ).then((data)=>{
            res.status(200).json({message:'Enrollment request sent successfully',data:data})
     
        }).catch((err)=>{
            res.status(400).json({message:'Unable to send request',Error:err})
        })
        
    }
    else{
        res.status(400).json({message:'Student does not exist'})
    }
}




module.exports = {studentReg,getTokenData,studentlogin,viewCourse,enrollCourse}