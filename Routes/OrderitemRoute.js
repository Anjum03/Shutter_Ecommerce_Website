

const router = require('express').Router();
const Payment = require("../Models/orderItemModel");
const User = require("../Models/userModel");


//add payment with paytm
router.post('/', async(req,res)=>{

    const {  userId } = req.body ;

    try{

        const findUser = await User.findOne({_id : userId});

        if(!findUser){
            return res.status(404).json({ success: false, msg: 'User Not Found' });
        }


      res.status(200).json({  success: true, msg: 'Banner Added Successfully ......', });

    } catch(e){
        console.log(e);
        res.status(500).json({success:false , message : `Backend Server Error ${e}`});
        }
});

module.exports = router ;
