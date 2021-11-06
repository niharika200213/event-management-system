const express=require('express');
const { body } = require('express-validator');
const router=express.Router();

const isAuth = require('../middleware/is-auth');
const uploadImg = require('../middleware/helpers');
const addimages = require('../middleware/AddImages');

const eventController = require('../controllers/eventposts');

router.post('/create', isAuth, uploadImg, eventController.createPosts);
router.delete('/delete:postId', isAuth, eventController.deletePost);
router.put('/update:postId', isAuth, eventController.updatePost);
router.put('/AddImages:postId', isAuth, addimages, eventController.AddImages);
router.put('/deleteImage:postId', isAuth, eventController.delImages);

module.exports=router;