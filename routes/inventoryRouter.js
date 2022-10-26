/**
 * inventories API
 * 1. get all inventories
 * 2. get Inventory by id
 * 3. get Inventory by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Inventory = require("../models/inventoryModel");
const checklogin = require("../middlewares/checkLogin");

const inventoryRouter = express.Router();

// GET ALL inventories
inventoryRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const inventories = await Inventory.find({ status: "active" });
    res.send(inventories);
    // console.log(inventories);
    console.log(inventories);
  })
);

// GET ONE inventories
inventoryRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const inventories = await Inventory.find({ _id: id, status: "active" });
    res.send(inventories[0]);
    // // res.send('removed');
    console.log(inventories);
  })
);

// CREATE ONE Inventory
inventoryRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const newInventory = new Inventory(req.body);
    console.log(newInventory);
    try {
      await newInventory.save();
      res.status(200).json({
        status: true,
        message: "Inventory is created Successfully",
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "There was a server side error",
        error: err,
      });
    }
  })
);

// CREATE MULTI inventories
inventoryRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Inventory.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "inventories are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Inventory
inventoryRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Inventory.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Inventory
inventoryRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Inventory.deleteOne({ _id: id })
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

// DELETE ALL
// inventoryRouter.get(
//   "/delete-all",
//   expressAsyncHandler(async (req, res) => {
//     try {
//       await Inventory.remove((response) => {
//         res.send(response);
//       }).catch((err) => {
//         res.send(err);
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   })
// );

module.exports = inventoryRouter;
