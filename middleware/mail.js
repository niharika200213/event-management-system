const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');

const transporter=nodemailer.createTransport(sendgridTransport({
    auth:{api_key: process.env.API_KEY}
}));

module.exports = (email, subject, html) => {
    try{
        transporter.sendMail({
            to: email, from: 'learnatstuista@gmail.com',
            subject: subject, html: html
          });
    }
    catch(err){
        if(!err.statusCode)
          err.statusCode=500;
        next(err);
    }
}