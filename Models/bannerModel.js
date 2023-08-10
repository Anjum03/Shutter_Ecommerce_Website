
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({

    name : String,
    image : { type: [String],},
    description : String,
    published : Boolean, type: String, 
    product : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]

} , {  timestamps : true });

module.exports = mongoose.model('Banner', bannerSchema);
