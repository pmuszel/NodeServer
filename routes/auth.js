const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', 
[
  body('email')
.isEmail()
.withMessage('Please enter valid email')
.normalizeEmail(),
body(
  'password',
  'Your password must be at least 5 characters and alphanumeric!'
)
  .isLength({ min: 5 })
  .isAlphanumeric()
  .trim()

], authController.postLogin);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter valid email')
      .custom((value, { req }) => {
          
        // if(value === 'test@test.com') {
        //     throw new Error('Email cannot be like test@test.com!')
        // }
        // return true;

        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              'User already exists, please sign up with different user!'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Your password must be at least 5 characters and alphanumeric!'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!');
      }
      return true;
    }).trim(),
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/new-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
