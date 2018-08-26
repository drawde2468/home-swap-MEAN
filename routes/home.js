const express = require("express");
const mongoose = require("mongoose");
const Home = require("../models/home");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "homes",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 500, height: 500, crop: "limit" }]
});

const parser = multer({ storage: storage }).array("homePhotos", 10);

const router = express.Router();

// route for getting the user's home(s) saved in their account
router.get("/myhome", (req, res, next) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id;

    Home.find({ owner: userId })
      .then((userHomes, err) => {
        if (err) {
          res.json(err);
          return;
        }
        res.json(userHomes);
      })
      .catch(error => next(error));
    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

// route for user to get the details of their home or one of their homes(if more than one is saved to their account)
router.get("/myhome/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const homeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(homeId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Home.findById(homeId)
      .then((userHome, err) => {
        if (err) {
          res.json(err);
          return;
        }
        res.json(userHome);
      })
      .catch(error => next(error));
    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

// route for user to add a home to their account
router.post("/myhome", parser, (req, res, next) => {
  if (req.isAuthenticated()) {
    const owner = req.user._id;

    // const homePhotos = req.files;
    // const images = [];

    // to see what is returned to you
    // console.log(req.files);

    // for (i = 0; i < homePhotos.length; i++) {
    //   let img = {
    //     url: homePhotos[i].url,
    //     id: homePhotos[i].id
    //   };
    //   images.push(img);
    // }

    // const {
    //   homeType,
    //   locationType,
    //   settingType,
    //   description,
    //   // street,
    //   // city,
    //   // state,
    //   // zipCode,
    //   // country
    // } = req.body;

    // const address = { street, city, state, zipCode, country };

    const { homeType, locationType, settingType, description } = req.body;

    const address = {
      street: req.body.address.street,
      city: req.body.address.city,
      state: req.body.address.state,
      zipCode: req.body.address.zipCode,
      country: req.body.address.country
    };
    // console.log(req.body.address);
    // console.log(req.user._id);
    // console.log(address);

    const userHome = new Home({
      owner,
      homeType,
      locationType,
      settingType,
      address,
      description
      // images
    });

    userHome
      .save()
      .then(userHome => {
        res.json({
          message: "New Home Added!"
        });
      })
      .catch(error => next(error));

    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

// route for user to delete their home or one of their homes(if more than one is saved to their account)
router.delete("/myhome/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const homeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(homeId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Home.remove({ _id: homeId })
      .then(message => {
        return res.json({
          message: "Home has been removed!"
        });
      })
      .catch(error => next(error));

    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

//route for user to edit the info for their home or one of their homes(if more than one is saved to their account)
router.put("/myhome/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const homeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(homeId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    const homeUpdate = {
      homeType: req.body.homeType,
      locationType: req.body.locationType,
      settingType: req.body.settingType,
      address: req.body.address,
      description: req.body.description
      // images:
    };

    Home.findByIdAndUpdate(homeId, homeUpdate, { new: true })
      .then(home => {
        return res.json({
          message: "Your home was updated successfully"
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
