const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/review");

const router = express.Router();

// route for user to add a review of a home
router.post("/review", (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = req.user._id;

    const { home, rating, comment } = req.body;

    const homeReview = new Review({
      user,
      home,
      rating,
      comment
    });

    homeReview
      .save()
      .then(homeReview => {
        res.json({
          message: "New Review Added!"
        });
      })
      .catch(error => next(error));

    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

// route to get all the reviews for a home
router.get("/review/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const homeId = req.params.id;

    Review.find({ home: homeId })
      .then((homeReviews, err) => {
        if (err) {
          res.json(err);
          return;
        }
        res.json(homeReviews);
      })
      .catch(error => next(error));

    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

//route for user to edit their review
router.put("/review/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const reviewId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    const reviewUpdate = {
      rating: req.body.rating,
      comment: req.body.comment
    };
    Review.findOneAndUpdate(reviewId, reviewUpdate, { new: true })
    .then(review => {
      return res.json({
        message: "Your review was updated successfully"
      });
    })
    .catch(error => next(error));
    
    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

// route for user to delete their review of a home
router.delete("/review/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const reviewId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Review.deleteOne({ _id: reviewId })
      .then(message => {
        return res.json({
          message: "Review has been removed!"
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