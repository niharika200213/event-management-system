const Post = require('../models/events');
const User = require('../models/user');
const nodemailer=require('nodemailer');
const sendgridTransport=require('nodemailer-sendgrid-transport');
const { isEmpty } = require('lodash');
const transporter=nodemailer.createTransport(sendgridTransport({
    auth:{api_key: process.env.API_KEY}
  }));

require('dotenv/config');

exports.getCreated = async (req,res,next) => {
    try{
        const userid = req.userId;
        const postArray=[];
        const user = await User.findById(userid);
        for(let i=0;i<user.event.length;++i){
            var postId = user.event[i];
            var post = await Post.findById(postId);
            postArray.push(post);
        }
        if(!isEmpty(postArray))
            return res.status(200).json(postArray);
        else
            return res.status(401).send('you have not created any events');
        
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.getAll = async (req,res,next) => {
    try{
        const posts = await Post.find().populate('creator');
        let allPosts = [];
        for(let i=0;i<posts.length;++i){
            if(posts[i].creator.isCreator)
                allPosts.push(posts[i]);
        }
        return res.status(200).send(allPosts);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

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

exports.getBookmark = async (req,res,next) => {
    try{
        const userId = req.userId;
        const user = await User.findById(userId).populate('bookmarked');
        if(isEmpty(user.bookmarked))
            return res.status(401).send('no events bookmarked');
        return res.status(200).send(user.bookmarked);
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

exports.unFav = async (req,res,next) => {
    try{
        const userId = req.userId;
        const postId = req.params.postId;
        await User.findByIdAndUpdate(userId, {$pull:{bookmarked:postId}});
        return res.status(200).send('removed from favourites');
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
            subject: 'confirm booking', html: `<h1>your booking is confirmed for<br>${post.title}</h1>`
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
        const rating = req.body.rating;
        const post = await Post.findById(postId);
        if(!post)
            return res.status(401).send('the event does not exists');
        const creator = await User.findById(post.creator);
        if(!creator.isCreator)
            return res.status(402).send('cannot rate unverified event');

        const user = await User.findById(userId);
        for(let i=0;i<user.registeredEvents.length;++i){
            let regEve = String(user.registeredEvents[i]);
            if(regEve===postId){
                const no = post.noOfRatings+1;
                const sum = post.sumOfRatings+rating;
                const finalRating = sum/no;
                const newPost = await Post.findByIdAndUpdate(postId,{$set:{
                    noOfRatings:no,sumOfRatings:sum,ratings:finalRating}},{new:true});
                await newPost.save();
                return res.status(200).send(newPost);
            }
        }
        return res.status(403).send('you cannot rate an event without booking it');

        
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};