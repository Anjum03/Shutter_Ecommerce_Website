
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    items:[{

        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
        productName: String,
        quantity: Number,
        price :Number, discount : Number,
        totalPrice: Number,

    }],
    allProductsPrice: Number,
    addingTime : Date,
}, { timestamps : true },)

module.exports = mongoose.model('Cart',cartSchema);
