const mongoose = require('mongoose')
const adminSchema = mongoose.Schema({

    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
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
    },
})

module.exports = new mongoose.model('Admin',adminSchema)