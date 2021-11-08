const multer = require('multer');

const Post = require('../models/events');

const imageFilter = function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(res.status(401).send('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
      },
    filename: function (req, file, cb) {
        cb(null, file.originalname.replace(' ','-'));
    }
});

module.exports = async (req,res,next) =>{
    try{
        const post = await Post.findById(req.params.postId);
        let imagesArray=[];
        let index=post.imageUrl.length;
        let upload=multer({ storage: storage, fileFilter: imageFilter }).array('multiple_images', 10-index);
        upload(req, res, async function(err) {
            if (req.fileValidationError)
                return res.status(401).send('limit exceeded or format not supported');
            else if (!req.files)
                return res.status(402).send('Please select an image to upload');
            else if (err||err instanceof multer.MulterError)
                return res.status(403).send(err);
            const files = req.files;
            for (let i = 0, len = files.length; i < len; ++i) {
                imagesArray.push(files[i].filename);
            }
            req.imagesArray=imagesArray;
            next();
        });
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }    
};