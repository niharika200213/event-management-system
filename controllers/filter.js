const Post = require('../models/events');
const User = require('../models/user');

exports.search = async (req,res,next) => {
    try{
        const exp = req.body.exp;
        const posts = await Post.find({$or:
            [{title:{$regex: `${exp}`, $options: 'i'}},
            {content:{$regex: `${exp}`, $options: 'i'}},
            {category:{$regex: `${exp}`, $options: 'i'}},
            {city:{$regex: `${exp}`, $options: 'i'}},
            {venueORlink:{$regex: `${exp}`, $options: 'i'}}]
            }).populate('creator');
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

exports.filter = async (req,res,next) => {
    try{
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};