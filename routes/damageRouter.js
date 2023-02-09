/**
 * damages API
 * 1. get all damages
 * 2. get Damage by id
 * 3. get Damage by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Damage = require("../models/damageModel");
const checklogin = require("../middlewares/checkLogin");
const { generateDamageId } = require("../middlewares/generateId");
const { updateInventoryOutOnDamageIn, updateInventoryInOnDamageOut } = require("../middlewares/useInventory");
const { startOfDay, endOfDay } = require("date-fns");

const damageRouter = express.Router();

// GET ALL damages
damageRouter.get(
  "/",
  // updateInventoryOutOnDamageIn,
  expressAsyncHandler(async (req, res) => {
    // console.log(req.body.damageNo)
    const damages = await Damage.find({})
      .select({
        _id: 1,
        product: 1,
        warehouse: 1,
        reason: 1,
        userId: 1,
        qty: 1,
        damageNo: 1,
        createdAt: 1,
        note: 1,
        total: 1,
        totalItem: 1
      })
      .populate("products", "name")
      .populate("warehouse", "name")
      .populate("userId", "name");

    res.send(damages);
    // // res.send('removed');
    console.log(damages);
  })
);

///// today grn
damageRouter.get(
  "/today-damage",
  expressAsyncHandler(async (req, res) => {
    const today = new Date();
    const end = startOfDay(new Date(today))
    const start = endOfDay(new Date(today))
    try {
      const damage = await Damage.aggregate([
        {
          $match: {
            createdAt: {
              $gte: end,
              $lt: start
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            total: {
              $sum: "$total"
            }
          }
        },
        {
          $sort: {
            "_id": 1
          }
        }
      ]);
      res.send(damage);
      // res.send(Purchases);
    } catch (err) {
      console.log(err);
    }
    // // res.send('removed');
  })
);


// GET ALL damages
damageRouter.get(
  "/export",
  expressAsyncHandler(async (req, res) => {
    const damages = await Damage.find({})
      .populate("products", { name: 1, article_code: 1 })
      .populate("warehouse", "name")
      .populate("userId", "name");

    res.send(damages);
    // // res.send('removed');
    console.log(damages);
  })
);
//grn load by two dates
damageRouter.get(
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
      const damages = await Damage.find({
        createdAt: { $gte: start, $lte: end },
      })
        .select({
          _id: 1,
          product: 1,
          warehouse: 1,
          reason: 1,
          userId: 1,
          qty: 1,
          damageNo: 1,
          createdAt: 1,
          note: 1,
          total: 1,
          totalItem: 1
        })
        .populate("products", "name")
        .populate("warehouse", "name")
        .populate("userId", "name");
      res.send(damages);
    } catch (err) {
      console.log(err)
    }
    // console.log(sales);
    // // res.send('removed');
  })
);
// GET ONE damages
damageRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const damages = await Damage.find({ _id: id })
      .select({
        _id: 1,
        product: 1,
        warehouse: 1,
        reason: 1,
        userId: 1,
        qty: 1,
        damageNo: 1,
        createdAt: 1,
        note: 1,
        total: 1,
        totalItem: 1
      })
      .populate("products", "name")
      .populate("products", "article_code")
      .populate("products", "priceList")
      .populate("products", { name: 1, article_code: 1 })
      .populate("warehouse", "name")
      .populate("userId", "name");
    res.send(damages[0]);
    // // res.send('removed');
    console.log(damages);
  })
);

// CREATE ONE Damage
damageRouter.post(
  "/",
  generateDamageId,
  updateInventoryOutOnDamageIn,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body)
    const newDamage = new Damage(req.body);

    console.log("Damage", newDamage);

    try {
      await newDamage.save();
      res.status(200).json({
        message: "Damage is created Successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI damages
damageRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Damage.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "damages are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Damage
damageRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Damage.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Damage
damageRouter.delete(
  "/:id",
  updateInventoryInOnDamageOut,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Damage.deleteOne({ _id: id })
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

module.exports = damageRouter;
