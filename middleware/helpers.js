const multer = require('multer');

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
        cb(null, String(Date.now()+file.originalname.replace(' ','-')));
    }
});

module.exports = (req,res,next) => {
    try
    {
        let imagesArray=[];
        let upload=multer({ storage: storage, fileFilter: imageFilter }).array('files', 10);
        upload(req, res, async function(err) {
            if (req.fileValidationError)
                return res.status(401).send('format not supported or limit exceeded');
            else if (!req.files)
                return res.status(402).send('Please select an image to upload');
            else if (err||err instanceof multer.MulterError)
                return res.status(403).send(err);
            const files = req.files;
            let index, len;
            for (index = 0, len = files.length; index < len; ++index) {
                imagesArray.push(files[index].filename);
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