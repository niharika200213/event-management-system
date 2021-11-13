const express = require('express');
const adminController = require('../controllers/admin');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/view', isAuth, adminController.getApplied);
router.put('/reject/:userId', isAuth, adminController.reject);
router.put('/verify/:userId', isAuth, adminController.Verify);
router.delete('/delete/:postId', isAuth, adminController.delAnyPost);
router.get('/allEvents', isAuth, adminController.getAllEvents);
router.get('/allUsers', isAuth, adminController.getAllUsers);
router.delete('/deleteUser/:userId', isAuth, adminController.delAnyUser);

module.exports=router;
