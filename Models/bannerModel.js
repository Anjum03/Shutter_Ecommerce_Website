
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({

    name : String,
    image : { type: [String],},
    description : String,
    published : Boolean,

} , {  timestamps : true });

module.exports = mongoose.model('Banner', bannerSchema);
