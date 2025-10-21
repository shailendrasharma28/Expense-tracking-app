const nodemailer = require("nodemailer");
const MAIL_ID = process.env.MAIL_ID;
const MAIL_USER_PASS = process.env.MAIL_USER_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: MAIL_ID, 
      pass: MAIL_USER_PASS 
  }});

const sendNewMail = async (email, token) => {
  const info = await transporter.sendMail({
    from: '"Expense Tracker" <no-reply>',
    to: email,
    subject: "Reset Password Link!",
    text: `
    Forget Password! Don't worry click on the link and reset your password.
    <a href="http://localhost:4000/password/resetpassword/${token}"/>
    `, // plain‑text body
  });

  console.log("Message sent:", info.messageId);
};

module.exports = {sendNewMail};