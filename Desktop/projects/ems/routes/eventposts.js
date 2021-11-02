const express=require('express');
const { body } = require('express-validator');
const router=express.Router();

const User = require('../models/user');
const uploadImg = require('../middleware/imgUpload');
const isAuth = require('../middleware/is-auth');

const eventController = require('../controllers/eventposts');

router.post('/create', uploadImg, eventController.createPosts);

module.exports=router;