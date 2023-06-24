const mongoose = require('mongoose')
const requestSchema = mongoose.Schema({

    teacherId:{
        type:mongoose.Schema.Types.ObjectId
    },
    studentId:{
        type:mongoose.Schema.Types.ObjectId
    },
    courseId:{
        type:mongoose.Schema.Types.ObjectId
    },
    isAccepted:{
        type:Boolean,
        default:false
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
module.exports = new mongoose.model('request',requestSchema)