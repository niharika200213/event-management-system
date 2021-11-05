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

exports.generate_otp = async (req, res, next) => {
    if(!validationResult(req).isEmpty())
      return res.status(422).json(validationResult(req).errors[0].msg);

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try
  {
    const otp=otpgenerator.generate(6, {digits:true, alphabets:false,
    upperCase:false, specialChars:false});
  
    const hashed_otp = await bcrypt.hash(otp, 12);
    const result = await OTP.findOne({ email: email });
    if (result === null) {
      const newOtp = new OTP({ email: email, otp: hashed_otp });
      await newOtp.save();
    }
    else
      await OTP.updateOne({ email: email }, { $set: { otp: hashed_otp } });  

    transporter.sendMail({
      to: email, from: 'eventooze@gmail.com',
      subject: 'Verify', html: `<h1>OTP IS HERE: ${otp}</h1>`
    });
    return res.status(200).send('otp sent successfully');
  }catch(err){
    if(!err.statusCode)
      err.statusCode=500;
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  if(!validationResult(req).isEmpty())
    return res.status(422).json(validationResult(req).errors[0].msg);
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const otp = req.body.otp;
  try
  {
    const user = await User.findOne({ email: email })
    if (user)
        return res.status(401).send('Already verified.');

    const otpHolder = await OTP.findOne({ email: email });
    if(otpHolder===null)
      return res.status(402).send('otp expired');

    const validUser = await bcrypt.compare(otp, otpHolder.otp);
    if(otpHolder.email===email && validUser){
      const hashedPw = await bcrypt.hash(password, 12);
      const user = new User({
            email: email,
            password: hashedPw,
            name: name
      });
      const result = await user.save();
      const token = jwt.sign({
        email:result.email, userId:result._id.toString()
        }, process.env.JWT_KEY, {expiresIn: '3h'});

      const response = await OTP.deleteMany({ email: email });
      return res.status(201).json({ token: token, userId: result._id.toString() });
    }
      return res.status(403).send('wrong otp');
  }catch(err){
    if(!err.statusCode)
      err.statusCode=500;
    next(err);
  }
};


exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try
  {
    const user = await User.findOne({ email: email });
    if (!user) 
      return res.status(401).send('A user with this email could not be found.');
    
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) 
      return res.status(402).send('wrong password');

    const token = jwt.sign({
      email: loadedUser.email, userId: loadedUser._id.toString()
    }, process.env.JWT_KEY, { expiresIn: '3h' });
    return res.status(200).json({token: token, userId: loadedUser._id.toString()});
  }catch(err){
    if(!err.statusCode)
      err.statusCode=500;
    next(err);
  }
};

exports.adminLogin = (req,res,next) => {
  const email = req.body.email;
  const password = req.body.password;
  try
  {  
    if(email==='eventooze@gmail.com'){
      if (password===process.env.ADMIN_PASS.toString()) {
        const token = jwt.sign({
          email:email, userId:process.env.ADMIN_ID
        }, process.env.JWT_KEY, {expiresIn: '3h'});
        return res.status(200).json({token: token, userId: process.env.ADMIN_ID});
      }
      return res.status(401).send('wrong password');
    }
    return res.status(402).send('this email does not belong to the admin');
  }catch(err){
    if(!err.statusCode)
      err.statusCode=500;
    next(err);
  }
};