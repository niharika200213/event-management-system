const Post = require('../models/events');
const User = require('../models/user');
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');
const transporter=nodemailer.createTransport(sendgridTransport({
    auth:{api_key: process.env.API_KEY}
  }));

require('dotenv/config');

exports.getApplied = async (req,res,next) => {
    try{
        if(req.userId!==process.env.ADMIN_ID)
            return res.status(422).send('you are not an admin'); 
        const users = await User.find({apply:true});
        if(users===null)
            return res.status(401).send('no users to verify'); 
        return res.status(200).send(users);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.Verify = async (req,res,next) => {
    try{
        if(req.userId!==process.env.ADMIN_ID)
            return res.status(422).send('you are not an admin'); 
        const userId = req.params.userId;
        const user = await User.findById(userId);
        user.isCreator = true;
        user.apply = false;
        await user.save();
        transporter.sendMail({
            to: user.email, from: 'eventooze@gmail.com',
            subject: 'verified', html: '<h1>You are now a verified creator.</h1>'
          });
        return res.status(200).send(user);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.reject = async (req,res,next) => {
    try{
        if(req.userId!==process.env.ADMIN_ID)
            return res.status(422).send('you are not an admin'); 
        const userId = req.params.userId;
        const user = await User.findById(userId);
        user.apply = false;
        await user.save();
        transporter.sendMail({
            to: user.email, from: 'eventooze@gmail.com',
            subject: 'rejected', html: '<h1>Your verification request was rejected.</h1>'
          });
        return res.status(200).send('rejected');
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};        