/**
 * tpns API
 * 1. get all tpns
 * 2. get Tpn by id
 * 3. get Tpn by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Tpn = require("../models/tpnModel");
const checklogin = require("../middlewares/checkLogin");
const { generateTpnId } = require("../middlewares/generateId");
const { startOfDay, endOfDay } = require("date-fns");
const {
  updateInventoryOutOnTPNIn,
  updateInventoryInOnTpnDel,
} = require("../middlewares/useInventory");

const tpnRouter = express.Router();

// GET ALL tpns
tpnRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const tpns = await Tpn.find();
    const sorted = tpns.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.send(sorted);
    // // res.send('removed');
    console.log(tpns);
  })
);

tpnRouter.get(
  "/grn/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      const tpn = await Tpn.find({ _id: id })
        // .populate("supplier", { company: 1, email: 1, phone: 1, address: 1 })
        .populate("warehouseTo", "name")
        .populate("warehouseFrom", "name")
        .populate("userId", "name")
        .populate({
          path: "products",
          populate: {
            path: "priceId",
            model: "Price",
          },
        });
      console.log(tpn);
      res.send(tpn[0]);
    } catch (err) {
      console.log(err);
    }
    // // res.send('removed');
  })
);
//tpn load by two dates
tpnRouter.get(
  "/byDate/:start/:end",
  expressAsyncHandler(async (req, res) => {
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());

    console.log(start, end, new Date());

    try {
      const tpn = await Tpn.find({
        createdAt: { $gte: start, $lte: end },
      })
        .populate("warehouseTo", "name")
        .populate("warehouseFrom", "name")
        .populate("userId", "name");
      res.send(tpn);
    } catch (err) {
      console.log(err)
    }
    // console.log(sales);
    // // res.send('removed');
  })
);
// GET ONE tpns
tpnRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const tpns = await Tpn.find({ _id: id })
      // .populate("warehouseTo", "name")
      // .populate("warehouseFrom", "name")
      .populate("warehouseTo", { name: 1, address: 1, phone: 1 })
      .populate("warehouseFrom", { name: 1, address: 1, phone: 1 })
      .populate("userId", "name");;
    res.send(tpns[0]);
    // // res.send('removed');
    console.log(tpns);
  })
);

// CREATE ONE Tpn
tpnRouter.post(
  "/",
  generateTpnId,
  updateInventoryOutOnTPNIn,
  expressAsyncHandler(async (req, res) => {
    const newTpn = new Tpn(req.body);
    try {
      await newTpn.save();
      res.status(200).json({
        message: "Tpn is created Successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI tpns
tpnRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Tpn.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "tpns are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Tpn
tpnRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Tpn.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Tpn
tpnRouter.delete(
  "/:id",
  updateInventoryInOnTpnDel,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Tpn.deleteOne({ _id: id })
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

module.exports = tpnRouter;
