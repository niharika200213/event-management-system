const Post = require('../models/events');
const User = require('../models/user');
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');
const transporter=nodemailer.createTransport(sendgridTransport({
    auth:{api_key: process.env.API_KEY}
  }));

require('dotenv/config');

exports.getPost = async (req,res,next) => {
    const postId = req.params.postId;
    try{
        const post = await Post.findById(postId);
        if(!post)
            return res.status(401).send('the event does not exists');
        const user = await User.findById(post.creator);
        if(!user.isCreator)
            return res.status(402).send('not a verified creator');

        return res.status(200).send(post);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.bookmark = async (req,res,next) => {
    const postId = req.params.postId;
    const userId = req.userId;
    try{
        const post = await Post.findById(postId);
        if(!post)
            return res.status(401).send('the event does not exists');
        const creator = await User.findById(post.creator);
        if(!creator.isCreator)
            return res.status(402).send('cannot bookmark unverified event');

        const user = await User.findById(userId);
        await user.bookmarked.push(postId);
        await user.save();
        return res.status(200).send('added to favourites');
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.register = async (req,res,next) => {
    try
    {
        const postId = req.params.postId;
        const userId = req.userId;
        const email = req.userEmail;
        const post = await Post.findById(postId);
        if(!post)
            return res.status(401).send('the event does not exists');
        const creator = await User.findById(post.creator);
        if(!creator.isCreator)
            return res.status(402).send('cannot book unverified event');

        const user = await User.findById(userId);
        await user.registeredEvents.push(postId);
        await user.save();
        transporter.sendMail({
            to: email, from: 'eventooze@gmail.com',
            subject: 'Verify', html: `<h1>your booking is confirmed for<br>${post.title}</h1>`
          });
        return res.status(200).send('booked event');
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.ratings = async (req,res,next) => {
    try{
        const postId = req.params.postId;
        const userId = req.userId;
        const post = await Post.findById(postId);
        if(!post)
            return res.status(401).send('the event does not exists');
        const creator = await User.findById(post.creator);
        if(!creator.isCreator)
            return res.status(402).send('cannot rate unverified event');

    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};