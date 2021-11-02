const { validationResult } = require('express-validator');

const Post = require('../models/events');
const User = require('../models/user');

exports.createPosts = (req,res,next) => {
    const newPost=new Post({
        title:req.body.title,
        imageUrl:req.file.path,
        content:req.body.content
    });
    newPost.save();
};