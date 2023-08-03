
const jwt = require('jsonwebtoken');
const Admin = require('../Models/adminModel');


function UserVerificationToken (req, res, next) {
    const token = req.headers['authorization'].split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, msg: `JWT Token Not Found`});
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedData) => {

        if(err){
            return res.status(500).json({mag : `Invalid JWT Token: ${err.message}`});
        }
         req.user  = decodedData.user;
    next();
    });
}


function AdminVerificationToken(req, res, next) {
    
    const adminId = req.admin.id && req.admin;

    Admin.findById(adminId).then(admin =>{
        if(!admin) {
            return res.status(404).json({msg : `Only Admin Can do This !!!!`});
        }
        next();
    }).catch(err =>{
        res.status(500).json({msg :`Backend Error: ${err.message}`});
    })

}



module.exports = {
    UserVerificationToken, AdminVerificationToken
}
