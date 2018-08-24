const express      = require('express');
const Home         = require('../models/home'); 

const router = express.Router();

// route for getting the user's home(s) saved in their account
router.get('/myhome', (req, res, next) => {
  const userId = req.user._id;

  Home.find({owner: userId})
  .then((userHomes, err)=> {
    if(err) {
      res.json(err);
      return;
    }
    res.json(userHomes);
  })
  .catch(error => next(error));

});

// route for user to get the details of their home or one of their homes(if more than one is saved to their account)
router.get('/myhome/:id', (req, res, next) => {
  const homeId = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(homeId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }
  
  Home.findById(homeId)
  .then((userHome, err) => {
    if(err) {
      res.json(err);
      return;
    }
    res.json(userHome);
  })
  .catch(error => next(error));

});

// route for user to add a home to their account
router.post('/myhome', (req, res, next) => {
  const userId = req.user._id;
  const {
    homeType, 
    locationType, 
    settingType,
    address,
    description
  } = req.body;
  // const homeImages = `/uploads/${req.file.filename}`

  const userHome = new Home({
    owner: userId,
    homeType,
    locationType,
    settingType,
    address,
    description,
    // images: homeImages
  });

  userHome.save()
  .then(userHome => {
    res.json({
      message: 'New Home Added!'
    });
  })
  .catch(error => next(error));

});

router.delete('/myhome/:id', (req, res, next) => {
  const homeId = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(homeId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Home.remove({ _id: homeId })
  .then(message => {
    return res.json({
      message: 'Phone has been removed!'
    });
  })
  .catch(error => next(error));
});

module.exports = router;