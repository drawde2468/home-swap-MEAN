const express = require('express');
const mongoose = require("mongoose");
const Match = require("../models/match");

const router = express.Router();

//route for getting all the user's matches
router.get("/match/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = req.params.id;

    Match.find({ userRequest1: user, userRequest2: user })
      .then((matches, err) => {
        if (err) {
          res.json(err);
          return;
        }
        res.json(matches);
      })
      .catch(error => next(error));

    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

//route for creating a match
router.post("/match/:id1/:id2", (req, res, next) => {
  if (req.isAuthenticated()) {
    const userRequest1 = req.params.id1;
    const userRequest2 = req.params.id2;
    const confirmed1='';
    const confirmed2='';
    const active='true';

    const match = new Match({
      userRequest1,
      userRequest2,
      confirmed1,
      confirmed2,
      active
    });

    match
      .save()
      .then(match => {
        res.json({
          message: "New Match Added!"
        });
      })
      .catch(error => next(error));

    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});


//route for user to accept a match
router.put("/match/accept/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const matchId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Match.findOne({ _id: matchId})
    .then(match => {
      if (match.confirmed1==='') {
        match.set({confirmed1: 'true'});
        match.save(updatedMatch => {
          return res.json({
            message: "You have confirmed the match successfully"
          });
        });
      }
      else {
        match.set({confirmed2: 'true', active: 'true'});
        match.save(updatedMatch => {
          return res.json({
            message: "You and your match have both confirmed successfully"
          });
        });
      }
    })
    .catch(error => next(error));
    
    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

//route for user to decline a match
router.put("/match/decline/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const matchId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Match.findOne({ _id: matchId})
    .then(match => {
      if (match.confirmed1==='') {
        match.set({confirmed1: 'false', active: 'false'});
        match.save(updatedMatch => {
          return res.json({
            message: "You have declined the match"
          });
        });
      }
      else {
        match.set({confirmed2: 'false', active: 'false'});
        match.save(updatedMatch => {
          return res.json({
            message: "You have declined the match"
          });
        });
      }
    })
    .catch(error => next(error));
    
    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

module.exports = router;