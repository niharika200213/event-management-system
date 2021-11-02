
const bcrypt = require('bcryptjs');
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');
const otpgenerator=require('otp-generator'); 
require('dotenv/config');

const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{api_key: process.env.API_KEY}
}));

const User = require('../models/user');
const OTP = require('../models/OTP');

let email;

exports.resetpass = (req, res, next) => {
    if(!validationResult(req).isEmpty())
      return res.status(422).json('password must be atleast 8 characters long');
  email = req.body.email;
  User.findOne({ email: email })
  .then(user => {
    if (user===null) {
      return res.status(400).send('User not found');
    }
    else{
      const otp=otpgenerator.generate(6, {digits:true, alphabets:false,
        upperCase:false, specialChars:false});
    
          bcrypt.hash(otp, 12).then(hashed_otp => {
            return OTP.findOne({email: email}).then(result => {
              if(result===null){
                const newOtp= new OTP({email: email, otp: hashed_otp});
                return newOtp.save();
              }
              else
                return OTP.updateOne({email: email}, {$set: {otp: hashed_otp}});
          });
        });
      
        transporter.sendMail({
          to: email, from: 'eventooze@gmail.com',
          subject: 'Verify', html: `<h1>OTP IS HERE: ${otp}</h1>`
        });
      res.status(200).send('otp sent successfully');
    }
  }).catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.verify = (req, res, next) => {
    const newpass=req.body.newpass;
    const otp = req.body.otp;
      return OTP.findOne({email: email}).then(optInDb => {
      if(optInDb===null)
        return res.status(401).send('otp expired');
      else{
          return bcrypt.compare(otp, optInDb.otp).then(isEqual => {
          if (!isEqual) {
            return res.status(402).json('wrong otp');
          }
          else{
            return bcrypt.hash(newpass, 12).then(hashedPw => {
              return User.updateOne({email:email}, {$set: { password : hashedPw}}).then(user=>{ 
                return res.status(200).json('password updated');
              });
            });
          }
        });
      }
    });
  };