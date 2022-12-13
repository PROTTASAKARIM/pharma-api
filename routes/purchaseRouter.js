/**
 * Purchases API
 * 1. get all Purchases
 * 2. get Purchase by id
 * 3. get Purchase by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Purchase = require("../models/purchaseModel");
const checklogin = require("../middlewares/checkLogin");
const { generatePoId } = require("../middlewares/generateId");

const purchaseRouter = express.Router();

// GET ALL Purchases
purchaseRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const Purchases = await Purchase.find({})
      .select({
        poNo: 1,
        supplier: 1,
        warehouse: 1,
        type: 1,
        totalItem: 1,
        total: 1,
        status: 1,
        createdAt: 1,
        shipping_cost: 1,
        note: 1,
      })
      .populate("supplier", "name")
      .populate("warehouse", "name")
      .populate("userId", "name");
    //   .exec(callback);

    res.send(Purchases);
    // // res.send('removed');
    // console.log(Purchases);
  })
);

// GET ONE Purchases
purchaseRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const Purchases = await Purchase.find({ _id: id })
      .populate("supplier", { company: 1, email: 1, phone: 1, address: 1 })
      .populate("warehouse", "name")
      .populate("userId", "name");
    // .populate("userId")
    res.send(Purchases[0]);
    // // res.send('removed');
    console.log(Purchases);
  })
);

// GET ONE Purchases
purchaseRouter.get(
  "/grn/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const Purchases = await Purchase.find({ _id: id })
      .populate("supplier", { company: 1, email: 1, phone: 1, address: 1 })
      // .populate("warehouse", "name")
      .populate("userId", "name")
      .populate({
        path: "products",
        populate: {
          path: "priceId",
          model: "Price",
        },
      });
    res.send(Purchases[0]);
    // // res.send('removed');
    console.log(Purchases);
  })
);

// CREATE ONE Purchase
purchaseRouter.post(
  "/",
  generatePoId,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const newPurchase = new Purchase(req.body);
    try {
      const result = await newPurchase.save();
      // console.log(result);
      res.status(200).json({
        message: "Purchase is created Successfully",
      });
    } catch (err) {
      // console.log(err);
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI Purchases
purchaseRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Purchase.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "Purchases are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Purchase
purchaseRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Purchase.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Purchase
purchaseRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Purchase.deleteOne({ _id: id })
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

// GET ALL GRN WITH PAGENATION & SEARCH
purchaseRouter.get(
  "/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = page + 0;

    let query = {};
    let purchase = [];
    // const size = parseInt(req.query.size);
    console.log("page:", currentPage, "size:", size, "search:", queryString);
    console.log(typeof queryString);

    //check if search or the pagenation

    if (queryString) {
      console.log("== query");

      console.log("search:", query);
      query = { poNo: { $regex: new RegExp(queryString + ".*?", "i") } };
      // search check if num or string
      // const isNumber = /^\d/.test(queryString);
      // console.log(isNumber);
      // if (!isNumber) {
      //   // if text then search name
      //   // query = { name:  queryString  };
      // } else {
      //   // if number search in ean and article code
      //   query = {
      //     $or: [
      //       { ean: { $regex: RegExp("^" + queryString + ".*", "i") } },
      //       {
      //         article_code: {
      //           $regex: RegExp("^" + queryString + ".*", "i"),
      //         },
      //       },
      //     ],
      //   };
      // }
      console.log(query);

      purchase = await Purchase.find(query)
        .select({
          poNo: 1,
          supplier: 1,
          warehouse: 1,
          type: 1,
          totalItem: 1,
          total: 1,
          status: 1,
          createdAt: 1,
          shipping_cost: 1,
          note: 1,
        })
        .limit(50)
        .populate("supplier", "name")
        .populate("warehouse", "name")
        .populate("userId", "name");
      res.status(200).json(Purchase);
    } else {
      console.log("no query");

      // regular pagination
      query = {};

      purchase = await Purchase.find(query)
        .select({
          poNo: 1,
          supplier: 1,
          warehouse: 1,
          type: 1,
          totalItem: 1,
          total: 1,
          status: 1,
          createdAt: 1,
          shipping_cost: 1,
          note: 1,
        })
        .limit(size)
        .skip(size * page)
        .populate("supplier", "name")
        .populate("warehouse", "name")
        .populate("userId", "name");
      res.status(200).json(purchase);
      console.log("done:", query);
    }
  })
);

module.exports = purchaseRouter;
