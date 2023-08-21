
require('dotenv').config();
const router = require('express').Router();
const User = require('../Models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AdminVerificationToken, UserVerificationToken } = require('../Middelware/Token');
const randomstring = require("randomstring");
const sendEmailFunction = require('../Middelware/Email');
// const nodemailer = require('nodemailer');

//register
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, phone, address, role} = req.body;

    try {
        // Check if the user already exists
        const userExist = await User.findOne({ email: email });

        if (userExist) {
            return res.status(409).json({ success: false, msg: 'Email Exists, try new Email.....' });
        }

        if (password.length < 8) {
            return res.status(409).json({ success: false, msg: 'Password less than 8' });
        }

        // //create password secure with bcrypt
        // const salt = await bcrypt.genSalt(10)
        // const hashedPassword = await bcrypt.hash(password, salt)

        //create user and save in DB
        const userSave = await User.create({
            firstName, lastName, email, password, phone, address , role
        })

        //after saving give jwt token 
        const token = jwt.sign({ id: userSave._id, role: userSave.role }, process.env.JWT_SECRET_KEY, { expiresIn: '120d' })

        res.status(200).json({ success: true, msg: 'Register Successfully ......', data: userSave, token: token })
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success: false, msg: `Backend Server Error:  ${error}` });
    }
});



//login
router.post('/loginUser', async (req, res) => {

    const { email , password} = req.body;

    try {

        const userExist = await User.findOne({email : email});

        if(!userExist){
            return res.status(401).json({ success: false, msg: `Invalid Eamil or User not found...   :(` })
        }

        const passwordCompared = await bcrypt.compare(password,userExist.password);

        if(!passwordCompared){
            return res.status(401).json({ success: false, msg: `Wrong Password..   :( `})
        }

        const token = jwt.sign({ id : userExist._id , role : userExist.role }, process.env.JWT_SECRET_KEY ,{  expiresIn : '120d' })

        res.status(200).json({success : true, msg : `Login Successfully ......` , data : userExist , token : token})

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});



//update password
router.put('/updateUser/:id',  UserVerificationToken, async (req, res) => {

    const { firstName, lastName, email, password, phone, address } = req.body;

    try {

        let hashedPassword 
        if(password){
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
        }

        const updateData = {
            firstName, lastName, email, phone, address
        }

        if(hashedPassword){
            updateData.password = hashedPassword
        }
       
            const updatedUser = await User.findOneAndUpdate({_id : req.params.id} , updateData, { new : true})
        
            if(!updatedUser){
                return res.status(404).json({ success: false, msg: `User Not Found`})
            }

            res.status(200).json({ success: true, msg: `Updated Successfully ......` , data : updatedUser})

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});



//delete User
router.delete('/deleteUser/:id', UserVerificationToken,  async (req, res) => {

    try {

        const userFind = await User.findOneAndDelete({_id : req.params.id});

        if(!userFind){
            return res.status(404).json({ success: false, msg: `User Not Found`})
        }
       
        res.status(200).json({ success: true, msg: `Deleted Successfully ......`, data : userFind })

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//get User
router.get('/user',AdminVerificationToken, async (req, res) => {

    try {

        const userFind = await User.find();

        if(!userFind){
            return res.status(404).json({ success: false, msg: `User Not Found`})
        }
       
        res.status(200).json({ success: true, msg: `All User List Successfully ......`, data: userFind})

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




// get one user
router.get('/user/:id',UserVerificationToken, AdminVerificationToken, async (req, res) => {

    try {

        const userFind = await User.findOne({_id : req.params.id});

        if(!userFind){
            return res.status(404).json({ success: false, msg: `User Not Found`})
        }
       
        res.status(200).json({ success: true, msg: `One User`, data : userFind })

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//logout
router.post('/userLogout',UserVerificationToken, async (req, res) => {

    try {

        res.clearCookie('token')
       
        res.status(200).json({success : true, msg : `LogOut Successfully ......` ,  })

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//forgot Password
router.post('/forgotPassword/:id', async (req, res) => {

    const {email } = req.body;
    // const {id} = req.params

    try {
       const emailExist = await User.findOne({_id :req.params.id, email: email});
       
       if(!emailExist) {
        return res.status(404).json({ success: false, msg: `User Not Found`});
       }

        const randomString = randomstring.generate(7);     
        
        const activationUrl = `http://99.79.64.2:3001/forgetPassword?token=${randomString}`;
        
        const updateTokeninDB = await User.findOneAndUpdate({email : email}, {$set :{token: randomString}},);

        //send email
        sendEmailFunction.sendEmail(email, updateTokeninDB);

        res.status(200).json({success : true, msg : `please check your email to reset the password` ,  })

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});



//reset the password
router.get('/resetPassword/:id', async (req, res) => {

    const { token } = req.query.token;

    try {

        const tokenCheck = await User.findOne({_id: req.params.id,  token : token }); 
        
        if(!tokenCheck){
            res.status(404).json({ success: false, msg: `This token is not available`});
        }
        const { password } = req.body ;
        const newPassword = await bcrypt.hash(password,10);

        const resetPassword = await User.findOneAndUpdate({_id : tokenCheck._id},
           { $set : { token: '', password: newPassword }}, { new : true });
       
        res.status(200).json({success : true, msg : `Password reset Successfully ......` , data : resetPassword  })

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});




//change the password
router.post('/changePassword/:id', async (req, res) => {

    const {email, oldPassword, newPassword } = req.body;

    try {

    const passwordExists = await User.findOne({_id : req.params.id , email: email});

        if(!passwordExists){
            res.status(404).json({ success: false, msg: `User Not Found`})
        }

        const oldPasswordCheck = await bcrypt.compare(oldPassword, passwordExists.password );

        if(!oldPasswordCheck){
            res.status(401).json({ success: false, msg: `Your Password Not Matching `})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        passwordExists.password = hashedPassword;
        
        passwordExists.save();
       
        res.status(200).json({success : true, msg : `Your password change Successfully ......` ,  })

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});


module.exports = router
