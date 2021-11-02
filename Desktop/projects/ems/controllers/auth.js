const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');
const otpgenerator=require('otp-generator'); 

const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{api_key: process.env.API_KEY}
}));

require('dotenv/config');

const User = require('../models/user');
const OTP = require('../models/OTP');

let email, password, name;

exports.generate_otp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
    return res.status(422).json({errors: extractedErrors});
  }

  email = req.body.email;
  name = req.body.name;
  password = req.body.password;
  console.log(email);
  console.log(password);
  console.log(name);
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
};

exports.verifyOtp = (req, res, next) => {
  const otp = req.body.otp;
  User.findOne({ email: email })
  .then(user => {
    if (user) {
      return res.status(400).send('Already verified.');
    }
    else{
      return OTP.findOne({ "email": email }).then(otpHolder =>{
        if(otpHolder===null)
          return res.status(401).send('otp expired');
        else 
          return bcrypt.compare(otp, otpHolder.otp).then(validUser => {
          if(otpHolder.email===email && validUser){
    
            return bcrypt.hash(password, 12).then(hashedPw => {
              const user = new User({
                email: email,
                password: hashedPw,
                name: name,
                isVarified: true
              });
              return user.save().then(result=>{
                const token = jwt.sign({
                email:result.email, userId:result._id.toString()
                }, process.env.JWT_KEY, {expiresIn: '3h'});

                OTP.deleteMany({email:email}).then(response=>{
                  res.status(200).json({token: token, userId: result._id.toString()}); 
                });
              });
            });
          }
          else
            return res.status(402).send('wrong otp');
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
        return res.status(400).send('A user with this email could not be found.');
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password).then(isEqual => {
      if (!isEqual) {
        return res.status(401).send('wrong password');
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
    return res.status(400).send('this email does not belong to the admin');
};