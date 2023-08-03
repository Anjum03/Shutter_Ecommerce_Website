
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({

    name : String,
    img : [String],
    price : Number, discount : Number, totalPrice : Number,
    published : Boolean,
}, {timestamps : true})

module.exports = mongoose.model('Product', productSchema);
