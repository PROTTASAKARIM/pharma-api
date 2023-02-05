/**
 * grns API
 * 1. get all grns
 * 2. get Grn by id
 * 3. get Grn by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Grn = require("../models/grnModel"); // Goods Recieve Note
const checklogin = require("../middlewares/checkLogin");
const { generateGrnId } = require("../middlewares/generateId");
const {
  updateInventoryInOnGRNIn,
  updateInventoryOutOnGRNDel,
} = require("../middlewares/useInventory");
const { handleNewPrice } = require("../middlewares/handlePrice");

const grnRouter = express.Router();

// GET ALL grns
grnRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const grns = await Grn.find({})
      .select({
        poNo: 1,
        grnNo: 1,
        userId: 1,
        totalItem: 1,
        supplier: 1,
        total: 1,
        status: 1,
        createdAt: 1,
        shipping_cost: 1,
        note: 1,
      })
      .populate("poNo", "poNo")
      .populate("supplier", "company")
      .populate("userId", "name");
    res.send(grns);
    // // res.send('removed');
    // console.log(grns);
  })
);

grnRouter.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const total = await Grn.countDocuments({});
    res.status(200).json(total);
  })
);

// GET ONE grns
grnRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const grns = await Grn.find({ _id: id })
      .select({
        poNo: 1,
        grnNo: 1,
        userId: 1,
        supplier: 1,
        warehouse: 1,
        products: 1,
        type: 1,
        totalItem: 1,
        total: 1,
        status: 1,
        createdAt: 1,
        shipping_cost: 1,
        note: 1,
      })
      .populate("poNo", "poNo")
      .populate("supplier", { company: 1, email: 1, phone: 1, address: 1 })
      .populate("warehouse", "name")
      .populate("userId", "name");
    res.send(grns[0]);
    // // res.send('removed');
    // console.log(grns);
  })
);

// CREATE ONE Grn
grnRouter.post(
  "/",
  generateGrnId,
  // updateInventoryInOnGRNIn,
  handleNewPrice,
  expressAsyncHandler(async (req, res) => {
    console.log("New:", req.body.products);

    const newGrn = new Grn(req.body);
    console.log(newGrn);
    try {
      const result = await newGrn.save();

      console.log("result", result);
      if (result) {
        res.status(200).json({
          data: result,
          message: "Grn is created Successfully",
          status: "success",
        });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI grns
grnRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Grn.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "grns are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Grn
grnRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Grn.updateOne({ _id: id }, { $set: update })
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
grnRouter.get(
  "/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = page + 0;

    let query = {};
    let grn = [];
    // const size = parseInt(req.query.size);
    console.log("page:", currentPage, "size:", size, "search:", queryString);
    console.log(typeof queryString);

    //check if search or the pagenation

    if (queryString) {
      console.log("== query");

      console.log("search:", query);
      query = { grnNo: { $regex: new RegExp(queryString + ".*?", "i") } };
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

      grn = await Grn.find(query)
        .select({
          poNo: 1,
          grnNo: 1,
          userId: 1,
          supplier: 1,
          warehouse: 1,
          products: 1,
          type: 1,
          totalItem: 1,
          total: 1,
          status: 1,
          createdAt: 1,
          shipping_cost: 1,
          note: 1,
        })
        .populate("poNo", "poNo")
        .populate("supplier", { company: 1, email: 1, phone: 1, address: 1 })
        .populate("warehouse", "name")
        .populate("userId", "name");
      res.status(200).json(grn);
    } else {
      // console.log("no query");

      // regular pagination
      query = {};

      grn = await Grn.find(query)
        .select({
          poNo: 1,
          grnNo: 1,
          userId: 1,
          supplier: 1,
          warehouse: 1,
          products: 1,
          type: 1,
          totalItem: 1,
          total: 1,
          status: 1,
          createdAt: 1,
          shipping_cost: 1,
          note: 1,
        })
        .populate("poNo", "poNo")
        .populate("supplier", { company: 1, email: 1, phone: 1, address: 1 })
        .populate("warehouse", "name")
        .populate("userId", "name");
      res.status(200).json(grn);
      // console.log("done:", query);
    }
  })
);

// DELETE ONE Grn
grnRouter.delete(
  "/:id",
  updateInventoryOutOnGRNDel,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Grn.deleteOne({ _id: id })
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

module.exports = grnRouter;
