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
const Product = require("../models/productModel"); // Goods Recieve Note
const Category = require("../models/categoryModel"); // Goods Recieve Note
const checklogin = require("../middlewares/checkLogin");
const { generateGrnId } = require("../middlewares/generateId");
const { updatePurchaseStatus } = require("../middlewares/updatePurchaseOnGRnDel");
const {
  updateInventoryInOnGRNIn,
  updateInventoryOutOnGRNDel,
} = require("../middlewares/useInventory");
const { startOfDay, endOfDay } = require("date-fns");
const { handleNewPrice } = require("../middlewares/handlePrice");

const grnRouter = express.Router();

// GET ALL grns
grnRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const grns = await Grn.find({})
      .select({
        tpnNo: 1,
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
///// today grn
grnRouter.get(
  "/today-grn",
  expressAsyncHandler(async (req, res) => {
    const today = new Date();
    const end = startOfDay(new Date(today))
    const start = endOfDay(new Date(today))
    try {
      const grn = await Grn.aggregate([
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
      res.send(grn);
      // res.send(Purchases);
    } catch (err) {
      console.log(err);
    }
    // // res.send('removed');
  })
);

//grn by category  between two dates
grnRouter.get(
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
      const grn = await Grn.aggregate([
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
        }


      ]);
      const populateGrn = await Category.populate(grn, {
        path: "_id",
        model: "Category",
      })
      res.send(populateGrn);
    } catch (err) {
      console.log(err)
    }
    // console.log(sales);
    // // res.send('removed');
  })
);
//grn load by two dates
grnRouter.get(
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
      const grn = await Grn.find({
        createdAt: { $gte: start, $lte: end },
      })
        .select({
          tpnNo: 1,
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
        .populate("tpnNo", { tpnNo: 1, warehouseFrom: 1, warehouseTo: 1 })
        // .populate({
        //   path: "tpnNo",
        //   populate: {
        //     path: "warehouseFrom",
        //     model: "warehouse",
        //   },
        // })
        .populate("supplier", "company")
        .populate("userId", "name");
      res.send(grn);
    } catch (err) {
      console.log(err)
    }
    // console.log(sales);
    // // res.send('removed');
  })
);

grnRouter.get(
  "/week-grn",
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
      const grn = await Grn.aggregate([
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
      res.send(grn);
      // res.send(Purchases);
    } catch (err) {
      console.log(err);
    }
    // // res.send('removed');
  })
)

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
        tpnNo: 1,
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
        discount: 1
      })
      .populate("poNo", "poNo")
      // .populate("tpnNo", { tpnNo: 1, warehouseFrom: 1, warehouseTo: 1 })
      .populate({
        path: "tpnNo",
        select: { tpnNo: 1, warehouseFrom: 1, warehouseTo: 1 },
        populate: [
          {
            path: "warehouseFrom",
            model: "Warehouse",
          },
          {
            path: "warehouseTo",
            model: "Warehouse",
          },
        ],
      })
      .populate("supplier", { company: 1, email: 1, phone: 1, address: 1 })
      .populate("warehouse", "name")
      .populate("userId", "name");
    res.send(grns[0]);
    // // res.send('removed');
    // console.log(grns);
  })
);
// GET grns by supplier
// GET grns by supplier
grnRouter.get(
  "/supplier/account/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const grns = await Grn.find({ supplier: id })
      .select({
        tpnNo: 1,
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
    res.send(grns);
    // // res.send('removed');
    // console.log(grns);
  })
);

// CREATE ONE Grn
grnRouter.post(
  "/",
  generateGrnId,
  updateInventoryInOnGRNIn,
  handleNewPrice,
  expressAsyncHandler(async (req, res) => {
    console.log("New:", req.body.products);
    console.log("New:All", req.body);

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
      console.log("grn error", err)
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
  updatePurchaseStatus,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    console.log("b", id)
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
