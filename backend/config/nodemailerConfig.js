const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'smomediatechtemple@gmail.com', // Replace with your email
      pass: 'yrsjiuwmxrmspgbf' // Replace with your email password or app password
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