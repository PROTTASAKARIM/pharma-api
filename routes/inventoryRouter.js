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

// COUNT Inventory
inventoryRouter.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const total = await Inventory.countDocuments({});
    res.status(200).json(total);
  })
);

// GET ALL INVENTORY WITH PAGENATION & SEARCH
inventoryRouter.get(
  "/all/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = parseInt(page) + 0;

    let query = {};
    let product = [];
    // const size = parseInt(req.query.size);
    console.log("page:", currentPage, "size:", size, "search:", queryString);
    console.log(typeof queryString);

    //check if search or the pagenation

    if (queryString) {
      console.log("== query");

      console.log("search:", query);
      // search check if num or string
      const isNumber = /^\d/.test(queryString);
      console.log(isNumber);
      if (!isNumber) {
        // if text then search name
        query = {
          name: { $regex: new RegExp(".*" + queryString + ".*?", "i") },
        };
        // query = { name:  queryString  };
      } else {
        // console.log("num");
        // if number search in ean and article code
        query = {
          article_code: {
            $regex: RegExp(queryString + ".*", "i"),
          },
        };
      }
      console.log("qry", query);

      product = await Inventory.find(query)
        .select({
          _id: 1,
          name: 1,
          article_code: 1,
          priceTable: 1,
          currentQty: 1,
          openingQty: 1,
          totalQty: 1,
          damageQty: 1,
          rtvQty: 1,
          soldQty: 1,
        })
        .limit(100);
      // .populate("category", "name")
      // .populate("priceList");
      console.log("res", product);
      res.status(200).json(product);
    } else {
      //   console.log("no query");

      // regular pagination
      // query = {};

      product = await Inventory.find(query)
        .select({
          _id: 1,
          name: 1,
          article_code: 1,
          priceTable: 1,
          currentQty: 1,
          openingQty: 1,
          totalQty: 1,
          damageQty: 1,
          rtvQty: 1,
          soldQty: 1,
        })
        .limit(size)
        .skip(size * page);
      // .populate("priceList");
      res.status(200).json(product);
      console.log("done:", query);
    }
  })
);

// GET ONE inventories
inventoryRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const inventories = await Inventory.find({
      _id: id,
      status: "active",
    })
      .select({
        _id: 1,
        name: 1,
        article_code: 1,
        warehouse: 1,
        priceTable: 1,
        currentQty: 1,
        openingQty: 1,
        totalQty: 1,
        soldQty: 1,
      })
      // .populate("warehouse", "name")
      .populate({
        path: "priceTable",
        populate: {
          path: "id",
          model: "Price",
          populate: [
            {
              path: "supplier",
              select: "company",
            },
            {
              path: "warehouse",
              select: "name",
            },
          ],
        },
      });
    console.log(inventories);
    res.send(inventories[0]);
  })
);
// GET ONE BY Article Code
inventoryRouter.get(
  "/article_code/:article_code",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.article_code;
    try {
      const inventory = await Inventory.find({
        article_code: id,
        status: "active",
      });
      res.status(200).json(inventory[0]);
    } catch (err) {
      res.status(500).json(err);
    }
    // res.send(id);
    console.log(id);
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
        data: newInventory,
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
// // CREATE ONE Inventory
// inventoryRouter.post(
//   "/price",
//   expressAsyncHandler(async (req, res) => {
//     const article_code = req.body.article_code;

//     console.log(req.body);

//     try {
//       // GET INVENTORY BY ARTICLE CODE
//       const selectedInventory = await Inventory.find({
//         article_code: article_code,
//         status: "active",
//       });

//       res.status(200).json(selectedInventory);
//     } catch (err) {
//       res.status(500).json({ err });
//     }
//   })
// );

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
