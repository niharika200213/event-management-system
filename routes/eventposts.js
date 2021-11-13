const express=require('express');
const { body } = require('express-validator');
const router=express.Router();

const isAuth = require('../middleware/is-auth');
const uploadImg = require('../middleware/helpers');
const addimages = require('../middleware/AddImages');

const eventController = require('../controllers/eventposts');
const filterController = require('../controllers/filter');
const getEventsController = require('../controllers/getPosts');

router.post('/create', isAuth, uploadImg, eventController.createPosts);
router.delete('/delete/:postId', isAuth, eventController.deletePost);
router.put('/update/:postId', isAuth, eventController.updatePost);
router.put('/AddImages/:postId', isAuth, addimages, eventController.AddImages);
router.put('/deleteImage/:postId', isAuth, eventController.delImages);

router.get('/events/:postId', getEventsController.getPost);
router.get('/getAll', getEventsController.getAll);
router.post('/bookmark/:postId', isAuth, getEventsController.bookmark);
router.put('/unFav/:postId', isAuth, getEventsController.unFav);
router.get('/bookmark', isAuth, getEventsController.getBookmark);
router.post('/book/:postId', isAuth, getEventsController.register);
router.get('/createdEvents', isAuth, getEventsController.getCreated);

router.get('/eventSearch', filterController.search);
router.get('/filtered', filterController.filter);

module.exports=router;