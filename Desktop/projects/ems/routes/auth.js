const express = require('express');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const passcontroller = require('../controllers/password');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('please enter a valid email')
      .custom(async (value, { res }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc)
          return res.status(422).json('user already exists');
      })
      .withMessage('user already exists')
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('password must be atleast 8 characters long'),
    body('name')
      .trim()
      .not()
      .isEmpty()
      .withMessage('please enter your name')
      .isAlphanumeric()
      .withMessage('please enter a valid name'),
      (req,res)=>{
        if(!validationResult(req).isEmpty())
          return res.status(422).json(validationResult(req).errors[0].msg);
      }
  ],
  authController.generate_otp
);

router.put('/signup/verify', authController.verifyOtp);

router.put('/login', authController.login);

router.put('/adminLogin', authController.adminLogin);

router.put('/resetpass', passcontroller.resetpass);

router.put('/resetpass/verify', [
  body('newpass')
  .trim()
  .isLength({ min: 8 }),
  (req,res)=>{
    if(!validationResult(req).isEmpty())
      return res.status(422).json('password must be atleast 8 characters long');
  }
], passcontroller.verify);

module.exports = router;