

require('dotenv').config();
const nodemailer = require("nodemailer");
const mailgen = require("mailgen");

//email generator function to send email
function sendEmail(email, token, next) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSWORD,
      },
    });
console.log(transporter.auth, "Transporter");

    const mailerGenerator = new mailgen({
      theme: "neopolitan",
      product: {
        //     // Custom product logo URL
        // logo: 'https://mailgen.js/img/logo.png',
        // // Custom logo height
        // logoHeight: '30px',

        
        name: "shutters",

        link :'https://mailgen.js/'
      },
    });

    const emailFormat = {
      body: {
        name: "Email", //user Name
        intro:
          "you have received this email because a password reset request for your account was received.",
        action: {
          instructions: "Click the button below to reset your password",
          button: {
            color: "black",
            text: "Reset your Password",
            link: "http://localhost:3000/resetPassword?token=" + token + "",
          },
        },
        outro:
          "If you did not request a password reset, no further action is required on your part.",
      },
    };
    const emailBody = mailerGenerator.generate(emailFormat);
    const emailtext = mailerGenerator.generatePlaintext(emailFormat);

    transporter.sendMail(
      {
        from: process.env.USEREMAIL,
        to: email,
        subject: "Reset Password Email",
        text: emailtext,
        html: emailBody,
      },
      (err, res) => {
        if (err) {
          return console.error(err);
        } else {
          return res
            .status(200)
            .json({ success: true, msg: `Email Sent .. :)` });
        }
      }
    );
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
  }
}

module.exports = {
  sendEmail,
};
