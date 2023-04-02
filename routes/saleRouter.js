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
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
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
// today point
saleRouter.get(
  "/todayPoint",
  expressAsyncHandler(async (req, res) => {
    // res.send("hi");
    const today = new Date()
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    // console.log(start, end)
    // console.log(today)
    try {
      const sales = await Sale.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lt: end
            },

          }
        },
        // { $match: { "point.new": { $lt: "point.old" } } },
        // { $group: { _id: null, total: { $sum: "$point.new" } } }
      ]);
      const filtered = sales.filter(sale => sale?.point?.old > sale?.point?.new)
      console.log(filtered);
      let todayPoint = 0;
      filtered.map(sale => {
        todayPoint = todayPoint + (Number(sale.point.old) - Number(sale.point.new) + Number(sale.todayPoint))
      })
      console.log(todayPoint)
      res.send({ spentPoint: todayPoint });
    } catch (err) {
      console.log(err);
    }
  })
);
// weekly SALE Count
saleRouter.get(
  "/week-sale",
  expressAsyncHandler(async (req, res) => {
    const today = new Date();
    // const date = today.getDate() - 1
    // const newd = new Date(today.setDate(date))
    // const date2 = today.getDate() - 7
    // const newd2 = new Date(today.setDate(date2))
    // console.log("d", date)
    // console.log("e", newd)
    // console.log("f", date2)
    // console.log("g", newd2)

    // const end1 = startOfDay(new Date(newd))
    // const start1 = endOfDay(new Date(newd2))
    // console.log("h", end1)
    // console.log("i", start1)

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
    // console.log(startDate, endDate)
    try {
      const sales = await Sale.aggregate([
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
            grossTotalRound: {
              $sum: "$grossTotalRound"
            },
            total: {
              $sum: "$total"
            },
            vat: {
              $sum: "$vat"
            },
          }
        },
        {
          $sort: {
            "_id": 1
          }
        }
      ]);
      console.log(sales);
      res.send(sales);
    } catch (err) {
      console.log(err);
    }
  })
);

//grn by category  between two dates
saleRouter.get(
  "/category/:start/:end",
  expressAsyncHandler(async (req, res) => {
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());

    console.log(start, end, new Date());

    try {
      const sale = await Sale.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lt: end
            }
          }
        },
        {
          $unwind: '$products'
        },
        {
          $group: {
            _id: '$products.id',
            article_code: { $first: '$products.article_code' },
            totalQuantity: { $sum: { $toDouble: '$products.qty' } },
            name: { $first: '$products.name' },
            mrp: { $last: '$products.mrp' },
            tp: { $last: '$products.tp' },
            priceId: { $first: '$products.priceId' }

          }
        },
        {
          $sort: { totalQuantity: -1 }
        },
        {
          $lookup:
          {
            from: "products",
            localField: "article_code",
            foreignField: "article_code",
            as: "productId"
          }
        },
        {
          $unwind: '$productId'
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'productId.category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $group: {
            _id: '$category._id',
            totalQuantity: { $sum: { $toDouble: '$totalQuantity' } },
            totalValue: { $sum: { $multiply: [{ $toDouble: '$totalQuantity' }, { $toDouble: '$mrp' }] } }
          }
        },
        {
          $sort: { totalQuantity: -1 }
        },

      ]);
      const populateSale = await Category.populate(sale, {
        path: "_id",
        model: "Category",
      })
      res.send(populateSale);
    } catch (err) {
      console.log(err)
    }
    // console.log(sales);
    // // res.send('removed');
  })
);


// GET ALL sales by category
saleRouter.get(
  "/bySupplier/:start/:end/:supplierId",
  expressAsyncHandler(async (req, res) => {
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());
    const supplierId = req.params.supplierId
    console.log(supplierId)
    console.log(start, end);

    const product = await Sale.aggregate([
      {
        $match: {
          status: "complete",
          createdAt: { $gte: start, $lte: end },
        }
      },
      {
        $unwind: '$products'
      },
      {
        $group: {
          _id: '$products.id',
          article_code: { $first: '$products.article_code' },
          totalQuantity: { $sum: '$products.qty' },
          name: { $first: '$products.name' },
          mrp: { $last: '$products.mrp' },
          tp: { $last: '$products.tp' },
          priceId: { $first: '$products.priceId' },
          supplier: { $first: '$products.supplier' }

        }
      },
      {
        $sort: { totalQuantity: -1 }
      }
    ])
    // const populated = product.populate("priceId", "mrp")
    // res.send(populated);

    let pProduct_supplier = []
    product.map(pro => {
      pProduct_supplier = [...pProduct_supplier, pro.supplier]
    })
    const supplierProducts = product.filter(pro => pro.supplier == supplierId)

    res.send(supplierProducts);

  })
);
// GET ALL sales by category
saleRouter.get(
  "/byCategory/:start/:end/:catID",
  expressAsyncHandler(async (req, res) => {
    const start = req.params.start
      ? startOfDay(new Date(req.params.start))
      : startOfDay(new Date.now());
    const end = req.params.end
      ? endOfDay(new Date(req.params.end))
      : endOfDay(new Date.now());
    const catId = req.params.catID
    console.log(catId)
    console.log(start, end);

    const product = await Sale.aggregate([
      {
        $match: {
          status: "complete",
          createdAt: { $gte: start, $lte: end },
        }
      },
      {
        $unwind: '$products'
      },
      {
        $group: {
          _id: '$products.id',
          article_code: { $first: '$products.article_code' },
          totalQuantity: { $sum: '$products.qty' },
          name: { $first: '$products.name' },
          mrp: { $last: '$products.mrp' },
          tp: { $last: '$products.tp' },
          priceId: { $first: '$products.priceId' }

        }
      },
      {
        $sort: { totalQuantity: -1 }
      }
    ])
    // const populated = product.populate("priceId", "mrp")
    // res.send(populated);

    let pProduct_AC = []
    product.map(pro => {
      pProduct_AC = [...pProduct_AC, pro.article_code]
    })
    // console.log("pProduct", pProduct_AC)
    const matchProducts = await Product.find({ article_code: pProduct_AC })
    const catProduct = matchProducts.filter(pro => pro.master_category == catId || pro.category == catId)
    let filteredProducts = []
    catProduct.map(pro => {
      const p = product.filter(pp => pp.article_code === pro.article_code)
      filteredProducts = [...filteredProducts, p[0]]
    })
    console.log(product.length)
    console.log(catProduct.length)
    console.log(filteredProducts.length)
    const sortedProducts = filteredProducts.slice().sort((a, b) => b.totalQuantity - a.totalQuantity)
    console.log(sortedProducts.length)
    res.send(sortedProducts);

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
            "invoiceId": 1,
            "products.article_code": 1,
            "products.priceId": 1,
            "products.name": 1,
            "products.tp": 1,
            "products.mrp": 1,
            "products.qty": 1,
            "products.vat": 1,
            "createdAt": 1,
            "returnProducts.article_code": 1,
            "returnProducts.priceId": 1,
            "returnProducts.name": 1,
            "returnProducts.tp": 1,
            "returnProducts.mrp": 1,
            "returnProducts.qty": 1,
            "returnProducts.vat": 1,
            "returnInvoice": 1
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

// // TODAYS SALE Count
// saleRouter.get(
//   "/week-sale",
//   //
//   expressAsyncHandler(async (req, res) => {
//     const today = new Date();
//     const startDate = new Date(today.setDate(today.getDate() - today.getDay()));
//     const endDate = new Date(today.setDate(today.getDate() + 6 - today.getDay()));
//     console.log(startDate, endDate)
//     try {
//       const sales = await Sale.aggregate([
//         {
//           $match: {
//             date: {
//               $gte: startDate,
//               $lt: endDate
//             }
//           }
//         },
//         {
//           $group: {
//             _id: {
//               $dateToString: {
//                 format: "%Y-%m-%d",
//                 date: "$date"
//               }
//             },
//             totalDailySales: {
//               $sum: "$grossTotal"
//             }
//           }
//         },
//         {
//           $group: {
//             _id: {
//               $dayOfWeek: "$_id"
//             },
//             date: {
//               $first: "$_id"
//             },
//             totalWeeklySales: {
//               $sum: "$totalDailySales"
//             }
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             date: 1,
//             totalWeeklySales: 1
//           }
//         },
//         {
//           $sort: {
//             "_id": 1
//           }
//         }
//       ]);
//       console.log(sales);
//       res.send(sales);
//     } catch (err) {
//       console.log(err);
//     }
//   })
// );
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
      .populate("customerId", { phone: 1, name: 1, point: 1, address: 1 })
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
      .populate("customerId", { phone: 1, name: 1, point: 1, address: 1 });
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
// CREATE ONE SALE
saleRouter.post(
  "/ecom",
  generatePosId,
  // updateInventoryOutOnSaleIn,
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
  "/todaySale",
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

    // console.log(sale);
  })
);


module.exports = saleRouter;
