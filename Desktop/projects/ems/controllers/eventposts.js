const { validationResult } = require('express-validator');
const path = require('path');
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

exports.createPosts = (req,res,next) => {

    let imgPath;
    let upload=multer({storage: storage, fileFilter: helpers.imageFilter}).single('image');
    upload(req, res, function(err) {
      imgPath=req.file.path;
      if (req.fileValidationError)
          return res.status(401).send(req.fileValidationError);
      else if (!req.file)
          return res.status(402).send('Please select an image to upload');
      else if (err||err instanceof multer.MulterError)
          return res.status(403).send(err);
      res.status(201).send('you have uploaded this image');
    });
    const id=req.body.id;
    User.findOne({_id:id}).then(user=>{
        const newPost=new Post({
            title:req.body.title,
            imageUrl:imgPath,
            content:req.body.content,
            category:req.body.category,
            creator:user
        });
        return newPost.save();
    });
    res.status(200).json('created post');
};