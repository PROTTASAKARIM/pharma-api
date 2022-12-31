/**
 * sales API
 * 1. get all sales
 * 2. get Sale by id
 * 3. get Sale by type
 * 3.1 get Sale by email
 * 3.2 get Sale by phone
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Sale = require("../models/saleModel");
const checklogin = require("../middlewares/checkLogin");
const { generatePosId } = require("../middlewares/generateId");
const { startOfDay, endOfDay } = require("date-fns");
const { updateInventoryInOnSaleDel,
  updateInventoryOutOnSaleIn } = require("../middlewares/useInventory");

const saleRouter = express.Router();

// GET ALL sales
saleRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const sales = await Sale.find({
      status: "complete",
    })
      .select({
        invoiceId: 1,
        totalItem: 1,
        grossTotalRound: 1,
        total: 1,
        status: 1,
        billerId: 1,
        createdAt: 1,
        changeAmount: 1,
      })
      .populate("billerId", "name");
    res.send(sales);
    // // res.send('removed');
  })
);
// GET ALL sales
saleRouter.get(
  "/byDate/:start/:end",
  expressAsyncHandler(async (req, res) => {
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());
    // console.log(start, end, new Date());
    const sales = await Sale.find({
      status: "complete",
      createdAt: { $gte: start, $lte: end },
    })
      .select({
        invoiceId: 1,
        totalItem: 1,
        grossTotalRound: 1,
        total: 1,
        status: 1,
        billerId: 1,
        totalReceived: 1,
        createdAt: 1,
        changeAmount: 1,
        customerId: 1,
      })
      .populate("billerId", "name")
      .populate("customerId", "phone");
    res.send(sales);
    // console.log(sales);
    // // res.send('removed');
  })
);

// GET export sales
saleRouter.get(
  "/export/:start/:end",
  expressAsyncHandler(async (req, res) => {
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());
    // console.log(start, end, new Date());
    const sales = await Sale.find({
      status: "complete",
      createdAt: { $gte: start, $lte: end },
    })
      .select({
        invoiceId: 1,
        totalItem: 1,
        grossTotalRound: 1,
        total: 1,
        vat: 1,
        status: 1,
        paidAmount: 1,
        billerId: 1,
        totalReceived: 1,
        createdAt: 1,
        changeAmount: 1,
        customerId: 1,
        tp: 1,
      })
      .populate("billerId", "name")
      .populate("customerId", "phone");
    res.send(sales);
    // console.log(sales);
    // // res.send('removed');
  })
);
// GET export sales
saleRouter.get(
  "/exportDel/:start/:end",
  expressAsyncHandler(async (req, res) => {
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());
    // console.log(start, end, new Date());
    const sales = await Sale.find({
      status: "delete",
      createdAt: { $gte: start, $lte: end },
    })
      .select({
        invoiceId: 1,
        totalItem: 1,
        grossTotalRound: 1,
        total: 1,
        vat: 1,
        status: 1,
        paidAmount: 1,
        billerId: 1,
        totalReceived: 1,
        createdAt: 1,
        changeAmount: 1,
        customerId: 1,
        updatedAt: 1,
        updateUser: 1,
        tp: 1,
      })
      .populate("billerId", "name")
      .populate("updateUser", "name")
      .populate("customerId", "phone");
    res.send(sales);
    // console.log(sales);
    // // res.send('removed');
  })
);

// articleSales

saleRouter.get(
  "/exportArticale/:start/:end",
  expressAsyncHandler(async (req, res) => {
    const q = req.query.q;
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());
    // console.log(start, end, new Date());

    // const sales = await Sale.find({
    //   status: "complete",
    //   createdAt: { $gte: start, $lte: end },
    // }).select({
    //   invoiceId: 1,
    //   // totalItem: 1,
    //   // grossTotalRound: 1,
    //   // total: 1,
    //   // vat: 1,
    //   // status: 1,
    //   // paidAmount: 1,
    //   // billerId: 1,
    //   // totalReceived: 1,
    //   createdAt: 1,
    //   // changeAmount: 1,
    //   // customerId: 1,
    //   products: 1,
    //   // tp:1
    // });
    // // .populate("billerId", "name")
    // // .populate("customerId", "phone");

    // res.send(sales);
    // console.log(sales);
    // // res.send('removed');

    try {
      const sales = await Sale.aggregate([
        {
          $match: {
            $and: [
              {
                status: "complete",
              },
              {
                createdAt: {
                  $gt: start,
                  $lt: end,
                },
              },
            ],
          },
        },
        {
          $project: {
            invoiceId: 1,
            "products.article_code": 1,
            "products.name": 1,
            "products.tp": 1,
            "products.mrp": 1,
            "products.qty": 1,
            "products.vat": 1,
          },
        },
      ]);
      console.log(sales);
      res.send(sales);
    } catch (err) {
      console.log(err);
    }
  })
);

// TODAYS SALE Total
saleRouter.get(
  "/total/:start/:end",
  //
  expressAsyncHandler(async (req, res) => {
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());
    // console.log(start, end, new Date());
    // const day = parseInt(1);
    try {
      const sales = await Sale.aggregate([
        {
          $match: {
            $and: [
              {
                status: "complete",
              },
              {
                createdAt: {
                  $gt: start,
                  $lt: end,
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: null,
            grossTotalRound: { $sum: "$grossTotalRound" },
            total: { $sum: "$total" },
            vat: { $sum: "$vat" },
          },
        },
      ]);
      res.send(sales);
    } catch (err) {
      console.log(err);
    }
  })
);
// TODAYS SALE Count
saleRouter.get(
  "/footfall/:start/:end",
  //
  expressAsyncHandler(async (req, res) => {
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());
    // console.log(start, end, new Date());
    const day = parseInt(1);
    try {
      const sales = await Sale.aggregate([
        {
          $match: {
            $and: [
              {
                status: "complete",
              },
              {
                createdAt: {
                  $gt: start,
                  $lt: end,
                },
              },
            ],
          },
        },
        {
          $count: "footfall",
        },
      ]);
      res.send(sales);
    } catch (err) {
      console.log(err);
    }
  })
);

// saleRouter.get(
//   "/export/:start/:end/",
//   expressAsyncHandler(async (req, res) => {
//     const start = req.params.start
//       ? startOfDay(new Date(req.params.start))
//       : startOfDay(new Date.now());
//     const end = req.query.end
//       ? endOfDay(new Date(req.params.end))
//       : endOfDay(new Date.now());

//     const biller = req.query.billerId;
//     console.log(biller);
// const sales = await Sale.find({
//   status: "complete",
//   createdAt: { $gte: start, $lte: end },
// })
//   .select({
//     invoiceId: 1,
//     totalItem: 1,
//     grossTotalRound: 1,
//     total: 1,
//     billerId: 1,
//     totalReceived: 1,
//     createdAt: 1,
//     changeAmount: 1,
//     customerId: 1,
//   })
//   .populate("billerId", "name")
//   .populate("customerId", "phone");
//     res.send("sales");
//     // console.log(sales);
//     // // res.send('removed');
//   })
// );

// GET ONE sales
saleRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const sales = await Sale.find({ _id: id, status: "complete" })
      .populate("billerId", "name")
      .populate("customerId", { phone: 1, name: 1, point: 1 })
      .populate("returnInvoice", "invoiceId");
    res.send(sales[0]);
    // // res.send('removed');
    // console.log(sales);
  })
);

// GET ONE sales
saleRouter.get(
  "/invoice/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const sales = await Sale.find({ invoiceId: id, status: "complete" })
      .populate("billerId", "name")
      .populate("customerId", { phone: 1, name: 1, point: 1 });
    res.send(sales[0]);
    // // res.send('removed');
    // console.log(sales);
  })
);

// CREATE ONE SALE
saleRouter.post(
  "/",
  generatePosId,
  updateInventoryOutOnSaleIn,
  expressAsyncHandler(async (req, res) => {
    console.log("body", req.body);
    let newSale = new Sale(req.body);
    console.log("newSale", newSale);
    try {
      await newSale.save((err, sale) => {
        if (err) {
          console.log("err:", res, err);
          res
            .status(500)
            .json({ message: "There was a server side error", error: err });
        } else {
          console.log(sale);
          res.status(200).json({
            message: "Sale is created Successfully",
            data: sale,
            status: 200,
          });
        }
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI sales
saleRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Sale.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "sales are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Sale
saleRouter.put(
  "/:id",
  updateInventoryInOnSaleDel,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Sale.updateOne({ _id: id }, { $set: update })
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
// Temporary del ONE Sale
saleRouter.put(
  "deletetemp/:id",
  // updateInventoryInOnSaleDel,
  expressAsyncHandler(async (req, res) => {
    const id = req.params._id;
    const update = req.body;
    try {
      await Sale.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Sale
saleRouter.delete(
  "/:id",
  updateInventoryInOnSaleDel,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    // try {
    //   await Sale.deleteOne({ _id: id })
    //     .then((response) => {
    //       res.send(response);
    //     })
    //     .catch((err) => {
    //       res.send(err);
    //     });
    // } catch (error) {
    //   console.error(error);
    // }
  })
);
// SALES AGGREGATION
saleRouter.get(
  "todaySale",
  expressAsyncHandler(async (req, res) => {
    const sale = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: ISODate("2013-01-01T00:00:00.0Z"),
            $lt: ISODate("2013-02-01T00:00:00.0Z"),
          },
        },
      },
      // { $group: { _id: null, count: { $count: "$_id" } } },
    ]);

    console.log(sale);
  })
);

module.exports = saleRouter;
