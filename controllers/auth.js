const crypto = require('crypto');

const bcrypt = require('bcryptjs');

const User = require('../models/user');
const user = require('../models/user');
const { request } = require('http');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }

      bcrypt
        .compare(password, user.password)
        .then((result) => {
          if (result) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/login');
          }
        })
        .catch((err) => {
          console.log(err);
          req.flash('error', 'Invalid email or password');
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash(
          'error',
          'User already exists, please sign up with different user!'
        );
        return res.redirect('/signup');
      }

      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            'cart.items': [],
          });
          return user.save();
        })
        .then((result) => {
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(userDoc => {
        if(!userDoc) {
          req.flash('error', 'Email not found in database!');
          return res.redirect('/reset'); 
        }

        userDoc.resetToken = token;
        userDoc.resetTokenExpiration = Date.now() + 3600000; //1h
        console.log(token);
        return userDoc.save();
      })
      .then(result => {
        //mail with reset link
        res.redirect('/'); 
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {

const token = req.params.token;

User.findOne({ resetToken: token,  resetTokenExpiration: {$gt: Date.now()}})
      .then(userDoc => { 
        if(!userDoc) {
          return res.redirect('/reset'); 
        }
        let message = req.flash('error');
        if (message.length > 0) {
          message = message[0];
        } else {
          message = null;
        }
      
        res.render('auth/new-password', {
          path: '/new-password',
          pageTitle: 'New Password',
          errorMessage: message,
          userId: userDoc._id.toString(),
          passwordToken: token
        });
      })
      .catch((err) => console.log(err));


};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const password = req.body.password;
  const passwordToken = req.body.passwordToken;

  User.findOne({ resetToken: passwordToken,  resetTokenExpiration: {$gt: Date.now()}, _id: userId})
      .then(userDoc => {
        if(!userDoc) {
          req.flash('error', 'Wrong data to reset password!');
          return res.redirect('/'); 
        }

        return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {

          userDoc.resetToken = undefined;
          userDoc.resetTokenExpiration = undefined
          userDoc.password = hashedPassword
          return userDoc.save();

        })
        .then((result) => {
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
  };