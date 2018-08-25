const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const User = require('../models/user');

const authRoutes = express.Router();

authRoutes.post('/signup', (req, res, next) => {
  const {
    username,
    password,
    firstName,
    lastName,
    email,
  } = req.body;

  //ensuring required fields are not empty
  if (!username || !password || !firstName || !lastName || !email) {
    res.status(400).json({
      message: 'Fields cannot be empty'
    });
    return;
  }

  //checking if username already exists 
  User.findOne({
    username
  }, '_id', (err, foundUser) => {
    if (foundUser) {
      res.status(400).json({
        message: 'That username is taken.'
      });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    //new user is being saved
    const theUser = new User({
      username,
      password: hashPass,
      firstName,
      lastName,
      email
    });

    theUser.save((err) => {
      if (err) {
        res.status(400).json({
          message: 'Error!'
        });
        return;
      }

      req.login(theUser, (err) => {
        if (err) {
          res.status(500).json({
            message: 'Error!'
          });
          return;
        }

        res.status(200).json(req.user);
      });
    });
  });
});

authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
    if (err) {
      res.status(500).json({
        message: 'Server Error'
      });
      return;
    }

    if (!theUser) {
      res.status(401).json(failureDetails);
      return;
    }

    req.login(theUser, (err) => {
      if (err) {
        res.status(500).json({
          message: 'Something went wrong'
        });
        return;
      }
      res.status(200).json(req.user);
    });
  })(req, res, next);
});

authRoutes.post('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({
    message: 'Success'
  });
});

authRoutes.get('/loggedin', (req, res, next) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
    return;
  }

  res.status(403).json({
    message: 'Unauthorized'
  });
});
//route for testing if the user is currently logged in
authRoutes.get('/private', (req, res, next) => {
  if (req.isAuthenticated()) {
    res.json({
      message: 'This is a private message'
    });
    return;
  }

  res.status(403).json({
    message: 'Unauthorized'
  });
});

module.exports = authRoutes;