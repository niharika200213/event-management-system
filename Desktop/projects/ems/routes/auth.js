const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const passcontroller = require('../controllers/password');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { res }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject();
          }
        }); 
      })
      .withMessage('E-Mail address already exists!')
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage({message: 'Password should have atleast 8 characters.'}),
    body('name')
      .trim()
      .not()
      .isEmpty()
      .isAlphanumeric()
      .withMessage({message: 'please enter a valid name'}) 
  ],
  authController.generate_otp
);

router.put('/signup/verify', authController.verifyOtp);

router.put('/login', authController.login);

router.put('/adminLogin', authController.adminLogin);

router.put('/resetpass', [
  body('newpass')
  .trim()
  .isLength({ min: 8 })
  .withMessage({message: 'Password should have atleast 8 characters.'})
], passcontroller.resetpass);

router.put('/resetpass/verify', passcontroller.verify);

module.exports = router;