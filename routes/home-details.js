const express = require("express");
const mongoose = require("mongoose");
const Home = require("../models/home");

const router = express.Router();

// route for user to get the details of another user's home
router.get("/home-details/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const homeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(homeId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Home.findById(homeId, '-address.street -_id -createdAt -updatedAt -__v')
      .populate({path:'owner', select:'firstName avatarUrl createdAt -_id' })
      .populate({path:'reviews', select:'-_id -createdAt -__v -home',
        populate:{path:'user', select:'firstName avatarUrl createdAt -_id'}
      })
      .then((home, err) => {
        if (err) {
          res.json(err);
          return;
        }
        res.json(home);
      })
      .catch(error => next(error));
    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

module.exports = router;