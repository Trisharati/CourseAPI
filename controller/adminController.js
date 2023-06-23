const adminModel = require('../models/adminModel')
const studentModel = require('../models/studentModel')
const courseModel = require('../models/courseModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')


function createToken(data){
    return jwt.sign(data,"good")
}
const getTokenData = async (token) => {
    let adminData = await adminModel.findOne({ token: token }).exec();
    return adminData;
  };


const adminReg = async(req,res)=>{
    let isAdminExist = await adminModel.findOne({email:req.body.email})
    if(isAdminExist){
        res.status(400).json({message:'Email already exists'})
    }
    else{
        const adminObj={
            ...req.body,
            password:bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10)),
            token:createToken(req.body),
            createdOn: new Date()
        }
        const info=await new adminModel(adminObj).save().then((data)=>{
            res.status(200).json({message:'Admin registered successfully',data:data})
        }).catch((err)=>{
            res.status(400).json({message:'Registration failed'})
            console.log('Error : ',err)
        })
    }
}

const adminlogin = async(req,res)=>{
    let isAdminExist = await adminModel.findOne({email:req.body.email})
    console.log(isAdminExist)
    if(isAdminExist){
        if(bcrypt.compareSync(req.body.password,isAdminExist.password)){
            res.status(200).json({message:'Admin logged in successfully'})
        }
        else{
            res.stataus(400).json({message:'Wrong password'})
        }
    }
    else{
        res.status(400).json({message:'Admin does not exist'})
    }
}

const addCourseByAdmin = async(req,res)=>{
    const courseObj={
        ...req.body,
        createdOn:new Date()
    }
    
    let isAdminExist = await adminModel.findOne({_id:new mongoose.Types.ObjectId(req.body.adminId)})
    console.log(isAdminExist)
    if(isAdminExist){
await courseModel(courseObj).save()
.then((data)=>{
    res.status(200).json({message:'Course added',data:data})
}).catch((err)=>{
    res.status(400).json({message:'Failed to add course',Error:err})
    console.log('Error : ',err)
})
    }
    else{
        res.status(400).json({message:'Only teachers and admins can add courses'})
    }
}


const viewStudents = async(req,res)=>{
    let isAdminExist = await adminModel.findOne({_id:new mongoose.Types.ObjectId(req.body.adminId)})
    console.log(isAdminExist)
    if(isAdminExist){
    await studentModel.aggregate([
        {
            $project:{
                __v:0,
                createdOn:0,
                updatedOn:0,
            }
        }
    ]).then((data)=>{
        res.status(200).json({message:'Following students have been registered',data:data})
    }).catch((err)=>{
        res.status(400).json({message:'Unable to show students details',Error:err})
    })
}
else{
    res.status(400).json({message:'Only admins can see students details'})
}
}





module.exports = {adminReg,getTokenData,adminlogin,addCourseByAdmin,viewStudents}