const mongoose = require('mongoose')
const teacherSchema = mongoose.Schema({

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
    token:{
        type:String
    },
    isReqReceived:{
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

module.exports = new mongoose.model('Teacher',teacherSchema)