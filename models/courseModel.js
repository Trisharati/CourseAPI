const mongoose = require('mongoose')
const courseSchema = mongoose.Schema({

    courseName:{
        type:String
    },
    duration:{
        type:String
    },
    price:{
        type:Number
    },
    mode:{
        type:String
    },
    teacherId:{
        type:mongoose.Schema.Types.ObjectId
    },
    adminId:{
        type:mongoose.Schema.Types.ObjectId
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

module.exports = new mongoose.model('course',courseSchema)