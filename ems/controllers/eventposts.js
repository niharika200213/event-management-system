const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helpers = require('../middleware/helpers');

const Post = require('../models/events');
const User = require('../models/user');

const clearImg = imgArray => {
    for(let i=0;i<imgArray.length;++i){
        var filepath = path.join(__dirname,'..',imgArray[i]);
        fs.unlink(filepath,err=>console.log(err));
    }
};

exports.createPosts = async (req,res,next) => {
    const title=req.body.title;
    const content=req.body.content;
    const category=req.body.category;
    const venueORlink=req.body.venueORlink;
    const isOnline=req.body.isOnline;
    const time=req.body.time;
    const date=req.body.date;
    const rate=req.body.rate;
    const imageUrl=req.imagesArray;
    const userId=req.userId;
    try
    {
        const newPost=new Post({
            title:title,
            content:content,
            category:category,
            creator:userId,
            venueORlink:venueORlink,
            isOnline:isOnline,
            time:time,
            imageUrl:imageUrl,
            date:date,
            rate:rate
        });

        await newPost.save();
        const user = await User.findById(userId);
        user.event.push(newPost);
        await user.save();
        return res.status(200).json(newPost._id);
    }catch(err){
        if(!err.statusCode)
          err.statusCode=500;
        next(err);
    }
};

exports.deletePost = async (req,res,next) => {
    const userId = req.userId;
    const postId = req.params.postId;
    try
    {
        const post = await Post.findById(postId);
        if(post===null)
            return res.status(423).send('this post does not exists');

        if(post.creator.toString()!==userId.toString())
            return res.status(422).send('you are not allowed to make changes in this post');
        
        clearImg(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        await User.findByIdAndUpdate(userId,{$pull:{event:postId}});
        return res.status(200).send('deleted event');
        
    }catch(err){
        if(!err.statusCode)
          err.statusCode=500;
        next(err);
    }
};

exports.updatePost = async (req,res,next) => {
    const userId = req.userId;
    const postId = req.params.postId;
    try
    {
        const post = await Post.findById(postId);
        if(post===null)
            return res.status(423).send('this post does not exists');

        if(post.creator.toString()!==userId.toString())
            return res.status(422).send('you are not allowed to make changes in this post');
            
        post.title=req.body.title;
        post.content=req.body.content;
        post.category=req.body.category;
        post.venueORlink=req.body.venueORlink;
        post.isOnline=req.body.isOnline;
        post.time=req.body.time;
        post.date=req.body.date;
        post.rate=req.body.rate;
        const addImg=req.body.addImg;

        if(addImg){
            let index=post.imageUrl.length;
            let upload=multer({ storage: storage, fileFilter: helpers.imageFilter }).array('multiple_images', 10-index);
            upload(req, res, async function(err) {
                if (req.fileValidationError)
                    return res.status(401).send(req.fileValidationError);
                else if (!req.files)
                    return res.status(402).send('Please select an image to upload');
                else if (err||err instanceof multer.MulterError)
                    return res.status(403).send(err);
                const files = req.files;
                for (let i = index-1, len = files.length; i < len+index; ++i) {
                    post.imageUrl.push(files[i].path);
                }
            });
        }

    }catch(err){
        if(!err.statusCode)
          err.statusCode=500;
        next(err);
    }
};