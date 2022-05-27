const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');

const transporter=nodemailer.createTransport(sendgridTransport({
    auth:{api_key: process.env.API_KEY}
}));

module.exports = (email, subject, html) => {
    transporter.sendMail({
        to: email, from: 'learnatstuista@gmail.com',
        subject: subject, html: html
      });
}