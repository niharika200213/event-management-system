const Post = require('../models/events');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');
const transporter=nodemailer.createTransport(sendgridTransport({
    auth:{api_key: process.env.API_KEY}
  }));

require('dotenv/config');

const clearImg = imgArray => {
    try{
        for(let i=0; i<imgArray.length; ++i){
            var filepath = path.join(__dirname, '../images', imgArray[i]);
            fs.unlink(filepath, err => console.log(err));
        }
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

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
        const user = await User.findByIdAndUpdate(userId,{$set:{isCreator:true,apply:false}},{new:true});
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
        const user = await User.findByIdAndUpdate(userId,{$set:{apply:false,isCreator:false}},
            {new:true});
        await user.save();
        transporter.sendMail({
            to: user.email, from: 'eventooze@gmail.com',
            subject: 'rejected', html: '<h1>Your verification request was rejected.</h1>'
          });
        return res.status(200).send('rejected, apply again');
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.delAnyPost = async (req,res,next) => {
    try{
        if(req.userId!==process.env.ADMIN_ID)
            return res.status(422).send('you are not an admin'); 
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if(post===null)
            return res.status(423).send('this post does not exists');
        clearImg(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        await User.updateMany({bookmarked:postId},{$pull:{bookmarked:postId}});
        await User.updateMany({registeredEvents:postId},{$pull:{registeredEvents:postId}});
        await User.updateMany({ratedEvents:{$regex:`^${postId}`, $options:'i'}},
            {$pull:{ratedEvents:{$regex:`^${postId}`, $options:'i'}}});
        await User.findByIdAndUpdate(post.creator,{$pull:{event:postId}});
        return res.status(200).send('deleted event');
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.getAllEvents = async (req,res,next) => {
    try{
        if(req.userId!==process.env.ADMIN_ID)
            return res.status(422).send('you are not an admin'); 
        const posts = await Post.find().populate('creator');
        return res.status(200).send(posts);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.getAllUsers = async (req,res,next) => {
    try{
        if(req.userId!==process.env.ADMIN_ID)
            return res.status(422).send('you are not an admin'); 
        const users = await User.find().populate('event');
        return res.status(200).send(users);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.delAnyUser = async (req,res,next) => {
    try{
        if(req.userId!==process.env.ADMIN_ID)
            return res.status(422).send('you are not an admin'); 
        const userId = req.params.userId;
        const user = await User.findById(userId).populate('event');
        if(user===null)
            return res.status(423).send('this user does not exists');
        for(let i=0;i<user.event.length;++i){
            clearImg(user.event[i].imageUrl);
            await Post.findByIdAndRemove(user.event[i]._id);
        }
        await User.findByIdAndRemove(userId);
        return res.status(200).send('user deleted');
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};