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

const parser = multer({ storage: storage }).array("file", 10);

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
    .populate('reviews', {_id: 0, home: 0})
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
    // console.log(req.body);
    const parsedAddress = JSON.parse(req.body.address);
    // console.log(parsedAddress);

    const file = req.files;
    let images = [];

    // to see what is returned to you
    // console.log(req.files);

    for (i = 0; i < file.length; i++) {
      let img = {
        url: file[i].url,
        id: file[i].id
      };
      images.push(img);
    }

    const { home, setting, landscape, bedrooms, beds, baths, description } = req.body;

    const address = {
      street: parsedAddress.street,
      city: parsedAddress.city,
      state: parsedAddress.state,
      zipCode: parsedAddress.zipCode,
      country: parsedAddress.country
    };

    const userHome = new Home({
      owner,
      home,
      setting,
      landscape,
      bedrooms,
      beds,
      baths,
      address,
      description,
      images
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

//route for user to edit the info for their home or one of their homes(if more than one is saved to their account)
router.put("/myhome/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const homeId = req.params.id;
    const parsedAddress = JSON.parse(req.body.address);

    if (!mongoose.Types.ObjectId.isValid(homeId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

     const addressUpdate = {
      street: parsedAddress.street,
      city: parsedAddress.city,
      state: parsedAddress.state,
      zipCode: parsedAddress.zipCode,
      country: parsedAddress.country
    };

    const homeUpdate = {
      home: req.body.home,
      setting: req.body.setting,
      landscape: req.body.landscape,
      bedrooms: req.body.bedrooms,
      beds: req.body.beds,
      baths: req.body.baths,
      address: addressUpdate,
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

module.exports = router;
