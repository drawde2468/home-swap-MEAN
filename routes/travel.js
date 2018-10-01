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
            // console.log(travels)
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

router.get("/travel/:id", (req, res, next) => {
    if (req.isAuthenticated()) {
        const travelId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(travelId)) {
            res.status(400).json({
                message: "Specified id is not valid"
            });
            return;
        }

        Travel.findById(
                travelId).populate('userHome')
            .then(travel => {
                // console.log(travel)
                return res.json(travel);
            })
            .catch(error => next(error));
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
        // console.log(updatedTravel);
        Travel.findOneAndUpdate({
                _id: travelId
            }, updatedTravel, {
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

        const otherTravelId = ObjectId(req.params.id);
        const userTravelId = ObjectId(req.body.id);

        if (!mongoose.Types.ObjectId.isValid(otherTravelId)) {
            res.status(400).json({
                message: "Specified id is not valid"
            });
            return;
        }

        Travel.findOneAndUpdate({
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
        return;
    }

    res.status(403).json({
        message: "Unauthorized"
    });
});

router.put("/travel/dislike/:id", (req, res, next) => {

    if (req.isAuthenticated()) {

        const otherTravelId = ObjectId(req.params.id);
        const userTravelId = ObjectId(req.body.id);

        if (!mongoose.Types.ObjectId.isValid(otherTravelId)) {
            res.status(400).json({
                message: "Specified id is not valid"
            });
            return;
        }

        Travel.findOneAndUpdate({
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
        return;
    }

    res.status(403).json({
        message: "Unauthorized"
    });
});



//gets passed the id of the users travel request. returns all of the matches of their travel request with home populated
router.get("/travel/results/:id", (req, res, next) => {

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
                landscape,
                homesLiked, //testing
                homesDisliked, //testing
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
                    $and: [{
                        _id: {
                            $ne: ObjectId(travelId)
                        }
                    }, {
                        _id: {
                            $nin: homesLiked
                        }
                    }, {
                        _id: {
                            $nin: homesDisliked
                        }
                    }],
                    //  { _id : $ne: ObjectId(travelId),
                    userHome: {
                        $in: homeIdArr
                    }
                }).populate('userHome').then((results) => {
                    console.log(results);
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

router.get("/travel/:travelid/matchcheck/:likedid", (req, res, next) => {

    const travelId = req.params.travelid;
    const likedId = req.params.likedid;
    let match = false;

    Travel.findById({
        _id: ObjectId(likedId)
    }).then((results) => {
        if (results) {

            for (i = 0; i < results.homesLiked.length; i++) {
                if (results.homesLiked[i] == travelId) {
                    // console.log(results.homesLiked[i]);
                    match = true
                    return res.json(match);
                }
            }
        } else {
            return res.json({
                message: `Not results found.`
            });
        }
    }).catch(error => next(error));;
});

module.exports = router;