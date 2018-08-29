const express = require("express");
const mongoose = require("mongoose");
const Travel = require("../models/travel");
const Home = require("../models/home");
const { ObjectId } = require('mongodb');

const router = express.Router();

// route for creating a new travel event
router.post("/travel", (req, res, next) => {
    if (req.isAuthenticated()) {
        const user = req.user._id;
        let userHome;

        const {
            beginDate,
            endDate,
            homeType,
            locationType,
            settingType
        } = req.body;

        //query homeDb for the home belonging to user
        Home.find({
                owner: ObjectId(user)
            }, {
                owner: 1,
                _id: 0
            }).exec()
            .then((result) => {
                userHome = result[0].owner;
                //saves new travel request with variables defined above
                const travelRequest = new Travel({
                    user,
                    userHome,
                    beginDate,
                    endDate,
                    homeType,
                    locationType,
                    settingType
                });

                travelRequest
                    .save()
                    .then(travelRequest => {
                        res.json({
                            message: "New Travel Added!"
                        });
                    })
                    .catch(error => next(error));

            }).catch((err) => {
                console.log(err);
            });

        return;
    }

    res.status(403).json({
        message: "Unauthorized"
    });
});

router.put("/travel/:id", (req, res, next) => {
    if (req.isAuthenticated()) {
        const travelId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(travelId)) {
            res.status(400).json({
                message: "Specified id is not valid"
            });
            return;
        }

        const updatedTravel = {
            beginDate : req.body.beginDate,
            endDate : req.body.endDate,
            homeType : req.body.homeType,
            locationType : req.body.locationType,
            settingType : req.body.settingType
        };

        Travel.findOneAndUpdate(travelId, updatedTravel, {
                new: true
            })
            .then(travel => {
                return res.json({
                    message: "Your travel request was updated successfully"
                });
            })
            .catch(error => next(error));

        return;
    }

    res.status(403).json({
        message: "Unauthorized"
    });
});

router.delete("/travel/:id", (req, res, next) => {
    if (req.isAuthenticated()) {
        const travelId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(travelId)) {
            res.status(400).json({
                message: "Specified id is not valid"
            });
            return;
        }

        Travel.deleteOne({
                _id: travelId
            })
            .then(message => {
                return res.json({
                    message: "Travel request has been removed!"
                });
            })
            .catch(error => next(error));

        return;
    }

    res.status(403).json({
        message: "Unauthorized"
    });
});

module.exports = router;
