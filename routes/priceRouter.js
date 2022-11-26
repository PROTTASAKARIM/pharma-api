/**
 * prices API
 * 1. get all prices
 * 2. get Price by id
 * 3. get Price by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Price = require("../models/priceModel");
const checklogin = require("../middlewares/checkLogin");

const priceRouter = express.Router();

// GET ALL prices
priceRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const prices = await Price.find({});
    res.send(prices);
    // // res.send('removed');
    console.log(prices);
  })
);

// GET ONE prices
priceRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const prices = await Price.find({ _id: id });
    res.send(prices[0]);
    // // res.send('removed');
    console.log(prices);
  })
);

// GET prices By Product Article Code
priceRouter.get(
  "/product/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const prices = await Price.find({
      article_code: id,
    });
    res.send(prices);
    // // res.send('removed');
    // console.log("product:", prices);
  })
);

// CREATE ONE Price
priceRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const newPrice = new Price(req.body);
    console.log(req.body);
    try {
      console.log("before save");
      let savePrice = await newPrice.save(); //when fail its goes to catch
      console.log(savePrice); //when success it print.
      console.log("after save");
      res.status(200).json({
        status: "success",
        message: "Price is created Successfully",
        id: savePrice._id,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI prices
priceRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Price.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "prices are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Price
priceRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Price.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Price
priceRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Price.deleteOne({ _id: id })
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

module.exports = priceRouter;
