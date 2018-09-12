const express = require("express");
const mongoose = require("mongoose");
const Travel = require("../models/travel");
const Home = require("../models/home");
const {
    ObjectId
} = require('mongodb');

const router = express.Router();

router.get("/travel", (req, res, next) => {
    if (req.isAuthenticated()) {
        const user = req.user._id;

        Travel.find({
            user: ObjectId(user)
        }).then((travels) => {
            console.log(travels)
            return res.json(travels);
        }).catch(error => next(error));
    } else {
        res.status(403).json({
            message: "Unauthorized"
        });
    }
});

// route for creating a new travel event
router.post("/travel", (req, res, next) => {
    if (req.isAuthenticated()) {
        const user = req.user._id;
        let userHome;

        const {
            beginDate,
            endDate,
            home,
            setting,
            landscape
        } = req.body;

        //query homeDb for the home belonging to user
        Home.find({
                owner: ObjectId(user)
            }, {
                _id: 1
            }).exec()
            .then((result) => {
                userHome = result[0]._id;
                //saves new travel request with variables defined above
                const travelRequest = new Travel({
                    user,
                    userHome,
                    beginDate,
                    endDate,
                    home,
                    setting,
                    landscape
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
            beginDate: req.body.beginDate,
            endDate: req.body.endDate,
            home: req.body.home,
            setting: req.body.setting,
            landscape: req.body.landscape
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

router.put("/travel/like/:id", (req, res, next) => {

    if (req.isAuthenticated()) {
        //parameter coming in is of the other user's travel request
        const otherTravelId = ObjectId(req.params.id);
        let userTravelId;

        if (!mongoose.Types.ObjectId.isValid(otherTravelId)) {
            res.status(400).json({
                message: "Specified id is not valid"
            });
            return;
        }

        //query for the active travel _id of the logged in user
        Travel.find({
                $and: [{
                    user: ObjectId(req.user._id)
                }, {
                    active: true
                }]
            }, {
                _id: 1
            }).exec()
            .then((result) => {
                userTravelId = result[0]._id;
                //pushes parameter travel request _id into the logged in user's homesLiked arr
                Travel.updateOne({
                    _id: userTravelId
                }, {
                    $push: {
                        homesLiked: otherTravelId
                    }
                }).then(() => {
                    return res.json({
                        message: "Your like was successful"
                    });
                }).catch(error => next(error));
            })
            .catch((err) => {
                console.log(err);
            })
        return;
    }

    res.status(403).json({
        message: "Unauthorized"
    });
});

//identical to above route but instead dealing with disliked 
router.put("/travel/dislike/:id", (req, res, next) => {

    if (req.isAuthenticated()) {
        const otherTravelId = ObjectId(req.params.id);
        let userTravelId;

        if (!mongoose.Types.ObjectId.isValid(otherTravelId)) {
            res.status(400).json({
                message: "Specified id is not valid"
            });
            return;
        }

        Travel.find({
                $and: [{
                    user: ObjectId(req.user._id)
                }, {
                    active: true
                }]
            }, {
                _id: 1
            }).exec()
            .then((result) => {

                userTravelId = result[0]._id;

                Travel.updateOne({
                    _id: userTravelId
                }, {
                    $push: {
                        homesDisliked: otherTravelId
                    }
                }).then(() => {
                    return res.json({
                        message: "Your dislike was successful"
                    });
                }).catch(error => next(error));
            })
            .catch((err) => {
                console.log(err);
            })
        return;
    }

    res.status(403).json({
        message: "Unauthorized"
    });
});

//gets passed the id of the users travel request. returns all of the matches of their travel request with home populated
router.get("/travel/:id/results", (req, res, next) => {

    const travelId = req.params.id
    // console.log(travelId);

    Travel.findOne({
        _id: ObjectId(travelId)
    }).then((parameters) => {
        // console.log(parameters)

        if (parameters) {

            const {
                beginDate,
                endDate,
                home,
                setting,
                landscape
            } = parameters;

            Home.find({
                home: home,
                setting: setting,
                landscape: landscape
            }, {
                _id: 1
            }).then((homeIdArr) => {

                // console.log(homeIdArr);
                Travel.find({
                    beginDate: beginDate,
                    endDate: endDate,
                    _id: {
                        $ne: ObjectId(travelId)
                    },
                    userHome: {
                        $in: homeIdArr
                    }
                }).populate('userHome').then((results) => {
                    // console.log(results);
                    return res.json(
                        results
                    );
                }).catch(error => next(error));
            }).catch(error => next(error));
        } else {
            return res.json({
                message: `Not results found.`
            });
        }
    }).catch(error => next(error));
    return;
});


module.exports = router;