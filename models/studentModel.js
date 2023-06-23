const mongoose = require('mongoose')
const studentSchema = mongoose.Schema({

    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    role:{
        type:String
    },
    qualification:{
        type:String
    },
    university:{
        type:String
    },
    address:{
        type:String
    },
    phone:{
        type:Number
    },
    isEnrolled:{
        type:Boolean,
        default:false
    },
    token:{
        type:String
    },
    createdOn:{
        type:Date
    },
    updatedOn:{
        type:Date
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
})

module.exports = new mongoose.model('Student',studentSchema)