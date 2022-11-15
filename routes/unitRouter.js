/**
 * units API
 * 1. get all units
 * 2. get Unit by id
 * 3. get Unit by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Unit = require("../models/unitModel");
const checklogin = require("../middlewares/checkLogin");

const unitRouter = express.Router();

// GET ALL units
unitRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const units = await Unit.find({});
    res.send(units);
    // // res.send('removed');
    // console.log(units);
  })
);

// GET ONE units
unitRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const units = await Unit.find({ _id: id, status: "active" });
    res.send(units[0]);
    // // res.send('removed');
    // console.log(units);
  })
);

// CREATE ONE Unit
unitRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const newUnit = new Unit(req.body);
    try {
      await newUnit.save();
      res.status(200).json({
        message: "Unit is created Successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI units
unitRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Unit.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "units are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Unit
unitRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    const update = req.body;
    try {
      await Unit.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Unit
unitRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Unit.deleteOne({ _id: id })
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

module.exports = unitRouter;
