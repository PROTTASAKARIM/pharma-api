/**
 * generics API
 * 1. get all generics
 * 2. get Generic by id
 * 3. get Generic by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Generic = require("../models/genericModel");
const checklogin = require("../middlewares/checkLogin");


const genericRouter = express.Router();

// GET ALL generics
genericRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const generics = await Generic.find({});
    res.send(generics);
    // // res.send('removed');
    console.log(generics);
  })
);

// GET ONE generics
genericRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const generic = await Generic.findOne({ _id: id });
    res.send(generic);
    // // res.send('removed');
    console.log(generics);
  })
);

// CREATE ONE Generic
genericRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const newGeneric = new Generic(req.body);

    try {
      await newGeneric.save();
      res.status(200).json({
        message: "Generic is created Successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI generics
genericRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Generic.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "generics are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Generic
genericRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Generic.updateOne({ _id: id }, { $set: update })
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          res.send(err);
        });
    } catch (error) {
      console.error(error);
    }
  })
);

// DELETE ONE Generic
genericRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Generic.deleteOne({ _id: id })
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          res.send(err);
        });
    } catch (error) {
      console.error(error);
    }
  })
);

module.exports = genericRouter;
