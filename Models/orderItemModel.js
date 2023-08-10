

const mongoose = require('mongoose');

const paymentOrderitemSchema = new mongoose.Schema({

    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    items : { type: mongoose.Schema.Types.ObjectId, ref: 'Cart'},
    paymentStatus : {String, enum: ['Gpay', 'UPI', 'Paytm', 'cash on delevery']  },
    status : {String, enum: ['success', 'processing', 'failed']},
    delevired : {String},

}, {timestamps: true});

module.exports = mongoose.model('paymentOrderitem', paymentOrderitemSchema);
