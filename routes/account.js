const express = require("express");
const mongoose = require("mongoose");
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.get("/myaccount", (req, res, next) => {
    if (req.isAuthenticated()) {

        User.findById({
                _id: req.user._id
            }, {
                password: 0,
                created_at: 0,
                updated_at: 0
            })
            .then((user, err) => {
                if (err) {
                    res.json(err);
                    return;
                }
                res.json(user);
            })
            .catch(error => next(error));

        return;
    }

    res.status(403).json({
        message: "Unauthorized"
    });
});


//************************************************** WIP *********************************************************
// router.put("/myaccount", (req, res, next) => {
//     if (req.isAuthenticated()) {


//         //*********************************** missing avatar url **************************************************
//         const {
//             username,
//             password,
//             firstName,
//             lastName,
//             email,
//         } = req.body;

//         //checking if username already exists 
//         User.findOne({
//             username
//         }, '_id', (err, foundUser) => {
//             if (foundUser) {
//                 res.status(400).json({
//                     message: 'That username is taken.'
//                 });
//                 return;
//             }

//             const salt = bcrypt.genSaltSync(10);
//             const hashPass = bcrypt.hashSync(password, salt);

//             //new user is being saved
//             const theUser = new User({
//                 username,
//                 password: hashPass,
//                 firstName,
//                 lastName,
//                 email
//             });

//             theUser.save((err) => {
//                 if (err) {
//                     res.status(400).json({
//                         message: 'Error!'
//                     });
//                     return;
//                 }

//                 req.login(theUser, (err) => {
//                     if (err) {
//                         res.status(500).json({
//                             message: 'Error!'
//                         });
//                         return;
//                     }

//                     res.status(200).json(req.user);
//                 });
//             });
//         });

//         return;
//     }

//     res.status(403).json({
//         message: "Unauthorized"
//     });
// });


module.exports = router;