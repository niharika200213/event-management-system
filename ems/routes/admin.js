const express = require('express');
const adminController = require('../controllers/admin');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/view', isAuth, adminController.getApplied);
router.put('/reject:userId', isAuth, adminController.reject);
router.put('/verify:userId', isAuth, adminController.Verify);

module.exports=router;
