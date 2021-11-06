const Post = require('../models/events');

exports.getPost = async (req,res,next) => {
    const postId = req.params.postId;
    try{
        const post = await Post.findById(postId);
        if(!post)
            return res.status(401).send('the event does not exists');
        if(!post.isVerified)
            return res.status(402).send('this event is not verified');

        return res.status(200).send(post);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};