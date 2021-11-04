const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');
const otpgenerator=require('otp-generator'); 

const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{api_key: process.env.API_KEY}
}));

require('dotenv/config');

const User = require('../models/user');
const OTP = require('../models/OTP');

exports.generate_otp = (req, res, next) => {
    if(!validationResult(req).isEmpty())
      return res.status(422).json(validationResult(req).errors[0].msg);

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const otp=otpgenerator.generate(6, {digits:true, alphabets:false,
    upperCase:false, specialChars:false});

      bcrypt.hash(otp, 12).then(async hashed_otp => {
        const result = await OTP.findOne({ email: email });
        if (result === null) {
          const newOtp = new OTP({ email: email, otp: hashed_otp });
          const newotp = await newOtp.save(); return newotp;
        }
        else
          return OTP.updateOne({ email: email }, { $set: { otp: hashed_otp } });
    });
  
    transporter.sendMail({
      to: email, from: 'eventooze@gmail.com',
      subject: 'Verify', html: `<h1>OTP IS HERE: ${otp}</h1>`
    });
  return res.status(200).send('otp sent successfully');
};

exports.verifyOtp = async (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const otp = req.body.otp;
  await User.findOne({ email: email })
  .then(user => {
    if (user) {
      return res.status(401).send('Already verified.');
    }
    else{
      return OTP.findOne({ email: email }).then(otpHolder =>{
        if(otpHolder===null)
          return res.status(402).send('otp expired');
        else 
          return bcrypt.compare(otp, otpHolder.otp).then(validUser => {
          if(otpHolder.email===email && validUser){
    
            return bcrypt.hash(password, 12).then(hashedPw => {
              const user = new User({
                email: email,
                password: hashedPw,
                name: name
              });
              user.save().then(async result=>{
                const token = jwt.sign({
                email:result.email, userId:result._id.toString()
                }, process.env.JWT_KEY, {expiresIn: '3h'});

                const response = await OTP.deleteMany({ email: email });
                return res.status(201).json({ token: token, userId: result._id.toString() });
              });
            });
          }
          else
            return res.status(403).send('wrong otp');
        });
      })
    }
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};


exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email }).then(user => {
      if (!user) {
        return res.status(401).send('A user with this email could not be found.');
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password).then(isEqual => {
      if (!isEqual) {
        return res.status(402).send('wrong password');
      }
      else{
        const token = jwt.sign({
          email:loadedUser.email, userId:loadedUser._id.toString()
        }, process.env.JWT_KEY, {expiresIn: '3h'});
        return res.status(200).json({token: token, userId: loadedUser._id.toString()});
      }
    });
  }).catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.adminLogin = (req,res,next) => {
  const email = req.body.email;
  const password = req.body.password;

  if(email==='eventooze@gmail.com'){
        if (password===process.env.ADMIN_PASS.toString()) {
          const token = jwt.sign({
            email:email, userId:process.env.ADMIN_ID
          }, process.env.JWT_KEY, {expiresIn: '3h'});
          return res.status(200).json({token: token, userId: process.env.ADMIN_ID});
        }
        else
          return res.status(401).send('wrong password');
  }
  else
    return res.status(402).send('this email does not belong to the admin');
};