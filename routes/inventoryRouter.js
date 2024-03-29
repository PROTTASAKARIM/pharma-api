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
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
// const { adjustInventoryOnSale } = require("../middlewares/useInventory");


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
// count
inventoryRouter.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const total = await Inventory.countDocuments({});
    res.status(200).json(total);
  })
);
// GET ALL inventories for export
inventoryRouter.get(
  "/export",
  expressAsyncHandler(async (req, res) => {
    const inventories = await Inventory.aggregate([
      {
        $match: {
          status: "active",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "article_code",
          foreignField: "article_code",
          as: "product",
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "warehouse", // Replace "warehouseId" with the actual field name that holds the warehouse reference in the "inventories" collection
          foreignField: "_id", // Replace "_id" with the actual field name that holds the reference to the warehouse in the "warehouses" collection
          as: "warehouse",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          article_code: 1,
          warehouse: { $arrayElemAt: ["$warehouse.name", 0] }, // Assuming "name" is the field you want to populate in the "warehouse" field
          currentQty: 1,
          openingQty: 1,
          totalQty: 1,
          soldQty: 1,
          damageQty: 1,
          rtvQty: 1,
          tpnQty: 1,
          product: 1,
        },
      },
    ]);

    console.log(inventories);
    res.send(inventories);
  })
);


// Adjust Inventory
inventoryRouter.put(
  "/adjust",
  // adjustInventoryOnSale,
  expressAsyncHandler(async (req, res) => {
    console.log("update", req.body.update)
    // const total = await Inventory.countDocuments({});
    res.status(200).json("success");
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

      // product = await Inventory.find(query)
      //   .select({
      //     _id: 1,
      //     name: 1,
      //     article_code: 1,
      //     currentQty: 1,
      //     openingQty: 1,
      //     totalQty: 1,
      //     damageQty: 1,
      //     rtvQty: 1,
      //     soldQty: 1,
      //     damageQty: 1,
      //     rtvQty: 1,
      //     tpnQty: 1,
      //   })
      //   .limit(100);



      product = await Inventory.aggregate([
        {
          $match: query
        },
        {
          $lookup: {
            from: "products",
            localField: "article_code",
            foreignField: "article_code",
            as: "product",
          },
        },
        {
          $unwind: '$product',
        },
        {
          $limit: 100
        }
      ])

      console.log("res", product);
      res.status(200).json(product);
    } else {
      //   console.log("no query");

      // regular pagination
      // query = {};


      // product = await Inventory.find(query)
      //   .select({
      //     _id: 1,
      //     name: 1,
      //     article_code: 1,
      //     currentQty: 1,
      //     openingQty: 1,
      //     totalQty: 1,
      //     damageQty: 1,
      //     rtvQty: 1,
      //     soldQty: 1,
      //     damageQty: 1,
      //     rtvQty: 1,
      //     tpnQty: 1,
      //   })
      //   .limit(size)
      //   .skip(size * page);

      console.log("size", size, "currentPage", currentPage);

      product = await Inventory.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "article_code",
            foreignField: "article_code",
            as: "product",
          },
        },
        {
          $unwind: '$product',
        },
        {
          $skip: size * currentPage
        },
        {
          $limit: size
        },
      ])

      res.status(200).json(product);
      console.log("done:", query);
    }
  })
);

inventoryRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    console.log("id", id);

    const inventories = await Inventory.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
          status: "active",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "article_code",
          foreignField: "article_code",
          as: "product",
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          article_code: 1,
          warehouse: 1,
          currentQty: 1,
          openingQty: 1,
          totalQty: 1,
          soldQty: 1,
          damageQty: 1,
          rtvQty: 1,
          tpnQty: 1,
          product: 1,
        },
      },
    ]).exec();

    res.send(inventories[0]);
  })
);




// GET ONE inventories
inventoryRouter.get(
  "/new/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    console.log("id", id)
    const inventories = await Inventory.findOne({
      _id: id,
      status: "active",
    })
      .select({
        _id: 1,
        name: 1,
        article_code: 1,
        warehouse: 1,
        currentQty: 1,
        openingQty: 1,
        totalQty: 1,
        soldQty: 1,
        damageQty: 1,
        rtvQty: 1,
        tpnQty: 1,
      })

    res.send(inventories);
  })
);
// GET ONE BY Article Code
inventoryRouter.get(
  "/article_code/:article_code",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.article_code;
    try {
      const inventory = await Inventory.findOne({
        article_code: id,
        status: "active",
      });
      res.status(200).json(inventory);
    } catch (err) {
      res.status(500).json(err);
    }
    // res.send(id);
    console.log(id);
  })
);


inventoryRouter.get(
  "/snapshot",
  expressAsyncHandler(async (req, res) => {
    console.log("snap")
    try {
      // Read data from secondary nodes with a preferred read preference
      const snapshotData = await Inventory.find().readPreference('secondaryPreferred').toArray();

      console.log("snapshotData", snapshotData);
      res.send(snapshotData);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }));
inventoryRouter.get(
  "/snapshot/ss",
  expressAsyncHandler(async (req, res) => {
    try {
      const dbUrl = `mongodb+srv://test:QFNOIr4QbpGGpA4D@cluster0.1hsyopn.mongodb.net/pharmacyDb?retryWrites=true&w=majority`;
      const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
      const session = client.startSession();
      session.startTransaction();
      // Read data from secondary nodes with a preferred read preference
      const snapshotData = await Inventory.find().readPreference('secondaryPreferred').toArray();

      await session.commitTransaction();

      console.log("snapshotData", snapshotData);
      res.send(snapshotData);
    } catch (error) {
      console.error("Error:", error);
      await session.abortTransaction();
      res.status(500).send("Internal Server Error");
    } finally {
      session.endSession();
    }
  })
);



// CREATE ONE Inventory
inventoryRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    console.log("hi", req.body)
    const newInventory = new Inventory(req.body);
    console.log("newInventory", newInventory);
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
    console.log("in id", id)
    console.log("in up", update)
    try {
      await Inventory.updateOne({ _id: id }, { $set: update })
        .then((response) => {
          // console.log("inventory updating")
          console.log("inventory updating", response)
          res.send(response);
        })
        .catch((err) => {
          console.log("inventory not updating", err)
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
// GET ALL INVENTORY WITH PAGENATION & SEARCH
inventoryRouter.get(
  "/all/ttt/:page/:size",
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
        query = {
          article_code: {
            $regex: RegExp(queryString + ".*", "i"),
          },
        };
      }
      console.log("qry", query);

      product = await Inventory.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'products', // The name of the price collection
            localField: 'article_code',
            foreignField: 'article_code',
            as: 'products',
          },
        },
        {
          $limit: 100,
        },
        {
          $unwind: '$products',
        },
        {
          $lookup: {
            from: 'prices', // The name of the price collection
            localField: 'products._id',
            foreignField: 'article_code',
            as: 'prices',
          },
        },
        {
          $unwind: '$prices',
        },
        {
          $sort: { 'prices.updatedAt': -1 },
        },
        {
          $sort: { 'article_code': 1 },
        },
        {
          $group: {
            _id: '$_id', // Unique identifier field
            name: { $first: '$name' },
            article_code: { $first: '$article_code' },
            warehouse: { $first: '$warehouse' },
            openingQty: { $first: '$openingQty' },
            currentQty: { $first: '$currentQty' },
            totalQty: { $first: '$totalQty' },
            soldQty: { $first: '$soldQty' },
            damageQty: { $first: '$damageQty' },
            rtvQty: { $first: '$rtvQty' },
            tpnQty: { $first: '$tpnQty' },
            priceTable: { $first: '$priceTable' },
            status: { $first: '$status' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' },
            __v: { $first: '$__v' },
            products: { $first: '$products' },
            prices: { $first: '$prices' },
          },
        },
      ])
      // console.log("res", product);
      res.status(200).json(product);
    } else {

      product = await Inventory.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'products', // The name of the price collection
            localField: 'article_code',
            foreignField: 'article_code',
            as: 'products',
          },
        },
        {
          $skip: size * page,
        },
        {
          $limit: size,
        },
        {
          $unwind: '$products',
        },
        {
          $lookup: {
            from: 'prices', // The name of the price collection
            localField: 'products._id',
            foreignField: 'article_code',
            as: 'prices',
          },
        },
        {
          $unwind: '$prices',
        },
        {
          $sort: { 'prices.updatedAt': -1 },
        },
        {
          $sort: { 'article_code': 1 },
        },
        {
          $group: {
            _id: '$_id', // Unique identifier field
            name: { $first: '$name' },
            article_code: { $first: '$article_code' },
            warehouse: { $first: '$warehouse' },
            openingQty: { $first: '$openingQty' },
            currentQty: { $first: '$currentQty' },
            totalQty: { $first: '$totalQty' },
            soldQty: { $first: '$soldQty' },
            damageQty: { $first: '$damageQty' },
            rtvQty: { $first: '$rtvQty' },
            tpnQty: { $first: '$tpnQty' },
            priceTable: { $first: '$priceTable' },
            status: { $first: '$status' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' },
            __v: { $first: '$__v' },
            products: { $first: '$products' },
            prices: { $first: '$prices' },
          },
        },
      ])

      // .populate("priceList");
      // console.log("res", product);

      console.log("done:", query);
      res.status(200).json(product);
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
