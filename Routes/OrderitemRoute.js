

const router = require('express').Router();
const Payment = require("../Models/orderItemModel");
const User = require("../Models/userModel");
const Paytm = require('paytm-pg-node-sdk');
const checksum = require('../Middelware/paytmChecksum');



//add payment = cash on delivery
router.post('/payOnline', async (req, res) => {

    const { userId, productId } = req.body;

    try {

        const findUser = await User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).json({ success: false, msg: 'User Not Found' });
        }

        const findItem = await Payment.findOne(items.productId, productId);

        if (!findItem) {
            return res.status(404).json({ success: false, msg: 'Product Not Found' });
        }

        //check if the user already has a payment 
        const checkUser = await Payment.findOne({ userId: userId });

        if (!checkUser) {
            //if not user payment then create a new payment
            const createPayment = await Payment.create({
                userId: userId,
                items : items,
                paymentStatus : 'cash on delevery',
                status : 'processing',
                delevired : new Date().toISOString().split('T')[0]
            });

            return res.status(200).json({  success: true, msg: 'cash on Delivery of Order Items Added Successfully ......',data: createPayment, });
        } 

        res.status(200).json({ success: true, msg: 'Banner Added Successfully ......', });

    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: `Backend Server Error ${e}` });
    }
});



//add payment with paytm
router.post('/payOnline', async (req, res) => {

    const { userId, productId } = req.body;

    try {

        const findUser = await User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).json({ success: false, msg: 'User Not Found' });
        }

        const findItem = await Payment.findOne(items.productId, productId);

        if (!findItem) {
            return res.status(404).json({ success: false, msg: 'Product Not Found' });
        }

        //check if the user already has a payment 
        const checkUser = await Payment.findOne({ userId: userId });

        if (!checkUser) {
            //if not user payment then create a new payment
            //GOOGLE PAY
            //PAYTM 
            const paymentDetails = {
                amt: req.body.amt,
                customerId: req.body.name.replace(/\s/g, ''),
                customerEmail: req.body.customerEmail,
                customerPhone: req.body.customerPhone
            }

            if (!paymentDetails.amt || !paymentDetails.customerEmail || !paymentDetails.customerPhone || !paymentDetails.customerId) {
                return res.status(400).json({ success: false, msg: 'Payment Falied , Please fill all details' });
            } else {
                let params = {}
                params [MID = process.env.MID];
                params [WEBSITE = 'DEFAULT']; //
                params [CHANNEL_ID = 'WEB'];
                params [INDUSTRY_TYPE_ID = 'Retail'];
                params [ORDER_ID = 'TEST_' + new Date().getTime];
                params [CUSTOMER_ID = paymentDetails.customerId];
                // params [PAYTM_STAG_URL = 'https://pguat.paytm.com'];
                params [TAX_AMOUNT = paymentDetails.amt];
                params [EMAIL = paymentDetails.customerEmail];
                params [PHONE_NUMBER = paymentDetails.customerPhone];
                params [TAX_AMOUNT = paymentDetails.amt];
                params [PAYTM_MERCHANT_KEY = process.env.KEY];



                checksum.genchecksum(
                    params,
                    process.env.KEY,
                    (err, result) => {
                      if (err) {
                        return reject('Error while generating checksum');
                      } else {
                        params.CHECKSUMHASH = result;
                        return resolve(paymentObj);
                      }
                    }
                  );
            }


        } else {
            //if the user already has a payment
        }

        res.status(200).json({ success: true, msg: 'Banner Added Successfully ......', });

    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: `Backend Server Error ${e}` });
    }
});




//get orderitem by userId
router.get('/orderItem/:userId', async(req,res)=>{

    const { userId  } = req.params ;

    try{

        const userCheck = await Payment.findOne({ userId: userId});

        if(!userCheck){
            return res.status(404).json({ success: false, msg: 'User Not Found' });
        }


      res.status(200).json({  success: true, msg: 'All orderItem Details of User get Successfully ......',data: userCheck, });

    } catch(e){
        console.log(e);
        res.status(500).json({success:false , message : `Backend Server Error ${e}`});
        }
});




// delete orderitems
router.delete('/orderItem/:orderItemId/:userId', async(req,res)=>{

    const { userId, orderItemId   } = req.params ;

    try{

        const userCheck = await Payment.findOne({ userId: userId});

        if(!userCheck){
            return res.status(404).json({ success: false, msg: 'User Not Found' });
        }

        const orederItemCheck = await Payment.findOneAndDelete({_id : orderItemId});

        if(!orederItemCheck){
            return res.status(404).json({ success: false, msg: 'orederItem Not Found' });
        }


      res.status(200).json({  success: true, msg: 'OrderItem Details of User has deleted Successfully ......', data:  orederItemCheck, });

    } catch(e){
        console.log(e);
        res.status(500).json({success:false , message : `Backend Server Error ${e}`});
        }
});




module.exports = router;
