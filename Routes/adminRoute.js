

require('dotenv').config();
const router = require('express').Router();
const Admin = require('../Models/adminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//register only for first time
router.post('/registerAdmin', async (req, res) => {

    const { email, password , role } = req.body;

    try {

        //check email exist?
        const emailExist = await Admin.findOne({email : email});

        if(emailExist){
            res.status(409).json({ success : false , msg : `Email Exists... try new Email.....`});
        }

        if (password.length < 8) {
            res.status(409).json({ success: false, msg: `Password less than 8` });
        }

        //create password secure with bcrypt
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        //admin register and directly save in DB
        const adminRegister = await Admin.create({
            email, password : hashedPassword, role
        });

        //after saving give jwt token 
        const token = jwt.sign({ id : adminRegister._id , role : adminRegister.role}, process.env.JWT_SECRET_KEY,{expiresIn : '120d'} )

        //responses to get in termianl and postman
        // success.REGISTER
        res.status(200).json({success : true, msg : `Register Successfully ......` , data : adminRegister , token : token})

    }catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`});
      }

});



//Login
router.post('/login', async(req,res)=>{

    const {email,password} = req.body ;

    try{

            const adminLoggedIn = await Admin.findOne({email : email});

            if(!adminLoggedIn){
                return res.status(401).json({success : false, msg: ` Invalid Eamil or User not found...   :(`})
            }
            
            const paaswordCompared = await bcrypt.compare(password , adminLoggedIn.password)

            if(!paaswordCompared) {
                return res.status(401).json({ success: false, msg: `Wrong Password..   :( `})
            }

            const token = jwt.sign({ id : adminLoggedIn._id , role : adminLoggedIn.role}, process.env.JWT_SECRET_KEY,{expiresIn : '120d'} )

            res.status(200).json({ success: true, msg: `Login Successfully ......`, data : adminLoggedIn, token : token, })
    } catch(error){
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success: false, msg: `Backend Server Error:  ${error}` });
    }

});



//Logout
router.post('/logoutAdmin', async(req,res)=>{

    try{

        res.clearCookie('token');
        res.status(200).json({ success: true, msg: `Logout Successfully ......` })

    } catch(error){
        console.log(` ERROR : ${error}`)
        res.status(500).json({ success : false , msg : `Backend Server Error:  ${error}`})
    }

});


module.exports = router;