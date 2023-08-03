

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({

    email : String , 
    password : {type : String,}, 
    role : {type : String, enum : ['admin', 'user'] , default : 'admin'} ,

} , { timestamps : true});

module.exports = mongoose.model('Admin', adminSchema)
