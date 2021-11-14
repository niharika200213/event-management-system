const { isArray, isEmpty } = require('lodash');
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
        let post,ratings=0;
        let category = req.query.category;
        const isOnline = req.query.isOnline;
        let ratePost = await Post.find().sort({rate:-1}).limit(1);
        let rate = ratePost[0].rate;
        if(req.query.rate!==undefined)
            rate = req.query.rate;
        if(req.query.ratings!==undefined)
            ratings = req.query.ratings;
        if(category!==undefined&&isOnline!==undefined){
            if(!isArray(category))
                category = Array(category);
            post = await Post.find({$and:[{category:{$in:category}},{ratings:{$gte:ratings}},
                {rate:{$lte:rate}},{isOnline:isOnline}]});
        }
        else if(category===undefined&&isOnline!==undefined){
            post = await Post.find({$and:[{ratings:{$gte:ratings}},{rate:{$lte:rate}},
                {isOnline:isOnline}]});
        }
        else if(category!==undefined&&isOnline===undefined){
            if(!isArray(category))
                category = Array(category);
            post = await Post.find({$and:[{category:{$in:category}},{ratings:{$gte:ratings}},
                {rate:{$lte:rate}}]});
        }
        else if(category===undefined&&isOnline===undefined){
            post = await Post.find({$and:[{ratings:{$gte:ratings}},{rate:{$lte:rate}}]});
        }
        return res.status(200).send(post);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.getUserDetails = async (req,res,next) => {
    try{
        const userId = req.userId;
        const user = await User.findById(userId);
        if(!isEmpty(user.event))
            user.populate('event');
        if(!isEmpty(user.bookmarked))
            user.populate('bookmarked');
        if(!isEmpty(user.registeredEvents))
            user.populate('registeredEvents');
        return res.status(200).send(user);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};