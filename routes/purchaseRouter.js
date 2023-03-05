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
const { startOfDay, endOfDay } = require("date-fns");

const purchaseRouter = express.Router();

// GET ALL Purchases
purchaseRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const purchases = await Purchase.find({})
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
      .populate("supplier", "company")
      .populate("warehouse", "name")
      .populate("userId", "name");
    //   .exec(callback);
    const sorted = purchases.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.send(sorted);
    // // res.send('removed');
    // console.log(Purchases);
  })
);


// GET weekly Purchases
purchaseRouter.get(
  "/week-purchase",
  expressAsyncHandler(async (req, res) => {
    const today = new Date();
    // const startDate = new Date(today.setDate(today.getDate() - 1 - today.getDay()));
    // const endDate = new Date(today.setDate(today.getDate() - today.getDay()));
    // const end = startOfDay(new Date(endDate))
    // const start = endOfDay(new Date(startDate))
    // console.log(startDate, endDate)

    const currentDate = new Date();
    const last7Days = [];

    for (let i = 0; i <= 10; i++) {
      let day = new Date(currentDate.getTime());
      day.setDate(currentDate.getDate() - i);
      last7Days.push(day);
    }

    console.log(last7Days);
    const to = endOfDay(currentDate)
    const end = startOfDay(new Date(last7Days[0]))
    const start = endOfDay(new Date(last7Days[8]))
    console.log("test1", start)
    console.log("test2", end)
    console.log("test2", to)
    try {
      const purchases = await Purchase.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lt: end
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
      res.send(purchases);
      // res.send(Purchases);
    } catch (err) {
      console.log(err);
    }
    // // res.send('removed');
  })
)

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
//purchase load by two dates
purchaseRouter.get(
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
      const purchase = await Purchase.find({
        createdAt: { $gte: start, $lte: end },
      })
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
        .populate("supplier", "company")
        .populate("warehouse", "name")
        .populate("userId", "name");
      res.send(purchase);
    } catch (err) {
      console.log(err)
    }
    // console.log(sales);
    // // res.send('removed');
  })
);

purchaseRouter.get(
  "/grn/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
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
      console.log(Purchases);
      res.send(Purchases[0]);
    } catch (err) {
      console.log(err);
    }
    // // res.send('removed');
  })
);
purchaseRouter.get(
  "/grnl",
  // expressAsyncHandler(async 
  (req, res) => {
    console.log("err")
  }
  // })
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
// UPDATE ONE Purchase Status
purchaseRouter.put(
  "/status/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    console.log("PO", id, update)
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
