const express=require('express');
const { body } = require('express-validator');
const router=express.Router();

const User = require('../models/user');
const isAuth = require('../middleware/is-auth');
const uploadImg = require('../middleware/helpers');

const eventController = require('../controllers/eventposts');

router.post('/create', isAuth, uploadImg, eventController.createPosts);
router.delete('/delete:postId', isAuth, eventController.deletePost);
router.put('/update:postId', isAuth, eventController.updatePost);

module.exports=router;