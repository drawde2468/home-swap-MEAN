const express = require('express');
const mongoose = require("mongoose");
const Connection = require("../models/connection");
const Travel = require("../models/travel");

const router = express.Router();

//route for getting all the user's connections
router.get("/connection", (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = req.user._id;

    Connection.find({$or:[{user1: user},{user2: user}]}, '-_id -__v -updatedAt')
      .then((connections, err) => {
        if (err) {
          res.json(err);
          return;
        }
        res.json(connections);
      })
      .catch(error => next(error));

    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

//route for creating a connection
router.post("/connection/:id1/:id2", (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = req.user._id;
    const userRequest = req.params.id1;
    const otherUserRequest = req.params.id2;
    
    // let connectionId;

    const connection = new Connection({
      user1: user,
      userRequest1: userRequest,
      userRequest2: otherUserRequest,
    });

    connection
      .save()
      .then(newConnection => {
        let connectionId = newConnection._id;
        // querying to get the newly created connection in order to pull the user2 id from the user2 travel request reference
        // and set it equal to user2 reference id in the newly created connection (see connection model)
        Connection.findById(connectionId, 'userRequest2')
        .populate({path:'userRequest2', select:'user -_id',
          populate:{path:'user', select:'_id'}
        })
        .then(connection => {
          let user2=connection.userRequest2.user._id;
          connection.set({ user2: user2 });
          connection.save()
          .then(updatedConnection => {
            res.json( {
              message: "You have a new travel connection!"
            });
          })
          .catch(error => next(error));
        })
        .catch(error => next(error));
      })
      .catch(error => next(error));

    return;
  }

  res.status(403).json({
    message: "Unauthorized"
  });
});

//route for user to accept a connection
router.put("/connection/accept/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const connectionId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Connection.findOne({ _id: connectionId})
    .then(connection => {
      if (connection.confirmed1==='') {
        connection.set({confirmed1: 'true'});
        connection.save(updatedConnection => {
          return res.json({
            message: "You have confirmed the connection successfully"
          });
        });
      }
      else {
        connection.set({confirmed2: 'true', active: 'true'});
        connection.save(updatedConnection => {
          return res.json({
            message: "You and your connection have both confirmed successfully"
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

//route for user to decline a connection
router.put("/connection/decline/:id", (req, res, next) => {
  if (req.isAuthenticated()) {
    const connectionId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Connection.findOne({ _id: connectionId})
    .then(connection => {
      if (connection.confirmed1==='') {
        connection.set({confirmed1: 'false', active: 'false'});
        connection.save(updatedConnection => {
          return res.json({
            message: "You have declined the connection"
          });
        });
      }
      else {
        connection.set({confirmed2: 'false', active: 'false'});
        connection.save(updatedConnection => {
          return res.json({
            message: "You have declined the connection"
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