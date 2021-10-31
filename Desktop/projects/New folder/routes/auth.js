const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const isAuth = require('../middleware/is-auth');
const authController = require('../controllers/auth');
const passcontroller = require('../controllers/password');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        }); 
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password should have atleast 8 characters.'),
    body('name')
      .trim()
      .not()
      .isEmpty()
      .isAlphanumeric() 
  ],
  authController.generate_otp
);

router.put('/signup/verify', authController.verifyOtp);

router.put('/login', authController.login);
router.put('/resetpass', isAuth, passcontroller.resetpass);
router.put('/resetpass/verify', isAuth, passcontroller.verify);

module.exports = router;