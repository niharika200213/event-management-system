const bcrypt = require('bcryptjs');
const mail=require('../middleware/mail');
const { validationResult } = require('express-validator');
const otpgenerator=require('otp-generator'); 

const User = require('../models/user');
const OTP = require('../models/otp');

exports.resetpass = async (req, res, next) => {
  if(!validationResult(req).isEmpty())
      return res.status(422).json('please enter a valid email');
  
  try
  {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user===null)
      return res.status(401).send('User not found');

    const otp=otpgenerator.generate(6, {digits:true, alphabets:false,
        upperCase:false, specialChars:false});
    
    const result = await OTP.findOne({email: email});
    if(result===null){
      const newOtp= new OTP({email: email, otp: otp});
      await newOtp.save();
    }
    else
      await OTP.updateOne({email: email}, {$set: {otp: otp}});
    
    mail(email, 'Verify', `<h1>OTP IS HERE: ${otp}</h1>`);
    
    return res.status(200).send('otp sent successfully');
  }catch(err){
    if(!err.statusCode)
      err.statusCode=500;
    next(err);
  }
};

exports.verify = async (req, res) => {
  if(!validationResult(req).isEmpty())
      return res.status(422).json('please enter a valid email');
  
  try
  {
    const email = req.body.email;
    const otp = req.body.otp;
    const optInDb = await OTP.findOne({ email: email });
    if (optInDb === null)
      return res.status(401).send('otp expired');

    let isEqual=false;
    if(otp==optInDb.otp)
      isEqual=true;
    if (!isEqual)
      return res.status(402).json('wrong otp');

    else {
      await User.updateOne({email:email},{$set:{isVerified:true}});
      return res.status(200).json('correct otp');
    }
  }catch(err){
    if(!err.statusCode)
      err.statusCode=500;
    next(err);
  }
};

exports.newpassword = async (req,res,next) => {
  if(!validationResult(req).isEmpty())
      return res.status(422).json('password must be atleast 8 characters long');
  
  try
  {
    const newpass = req.body.newpass;
    const email = req.body.email;
    const otp = await OTP.findOne({email:email});
    if(otp===null){
      await User.updateOne({email:email}, {$set:{isVerified:false}});
      return res.status(403).send('session expired');
    }

    const user = await User.findOne({email:email});
    if(user===null)
      return res.status(401).send('User not found');

    if(user.isVerified)
    {
      const hashedPw = await bcrypt.hash(newpass, 12);
      await User.updateOne({ email: email }, { $set: {password:hashedPw,isVerified:false} });
      return res.status(200).json('password updated');
    }

    return res.status(402).send('user not verified please enter otp');
  }catch(err){
    if(!err.statusCode)
      err.statusCode=500;
    next(err);
  }
};