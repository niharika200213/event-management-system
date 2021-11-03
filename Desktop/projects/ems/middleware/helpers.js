const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(res.status(401).send('Only image files are allowed!'), false);
    }
    cb(null, true);
};
exports.imageFilter = imageFilter;