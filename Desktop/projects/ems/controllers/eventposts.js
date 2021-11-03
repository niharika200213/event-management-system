const { validationResult } = require('express-validator');
const fileUpload = require('express-fileupload');

const Post = require('../models/events');
const User = require('../models/user');

exports.createPosts = (req,res,next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(401).send('No files were uploaded.');
    }
    let sampleFile = req.files.sampleFile;
    let uploadPath = '../images/' + sampleFile.name;
    sampleFile.mv(uploadPath);

    const id=req.body.id;
    User.findOne({_id:id}).then(user=>{
        const newPost=new Post({
            title:req.body.title,
            imageUrl:uploadPath,
            content:req.body.content,
            category:req.body.category,
            creator:user
        });
        return newPost.save();
    });
    return res.status(200).json('created post');
};