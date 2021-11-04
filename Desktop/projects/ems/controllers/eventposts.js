const { validationResult } = require('express-validator');
const multer = require('multer');
const helpers = require('../middleware/helpers');

const Post = require('../models/events');
const User = require('../models/user');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../images');
      },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

exports.uploadImages = (req,res,next) => {
    const userId = req.userId;
    let upload=multer({storage: storage, fileFilter: helpers.imageFilter}).single('image');
    upload(req, res, function(err) {
      if (req.fileValidationError)
          return res.status(401).send(req.fileValidationError);
      else if (!req.file)
          return res.status(402).send('Please select an image to upload');
      else if (err||err instanceof multer.MulterError)
          return res.status(403).send(err);
      const imgUrl = req.file.path;
        Post.updateOne({creator:userId},{$set:{imageUrl:imgUrl}});
      res.status(201).send('you have uploaded this image');
    });
};

exports.createPosts = (req,res,next) => {
    const newPost=new Post({
        title:req.body.title,
        content:req.body.content,
        category:req.body.category,
        creator:req.userId
    });
    newPost.save().then(result=>{
        return User.findById(req.userId);
    }).then(user=>{
        user.event.push(newPost);
        return user.save();
    }).then(result=>{
        res.status(200).json('created post');
    });
};