/**
 * Suppliers API
 * 1. get all Suppliers
 * 2. get Supplier by id
 * 3. get Supplier by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Supplier = require("../models/supplierModel");
const checklogin = require("../middlewares/checkLogin");

const supplierRouter = express.Router();

// COUNT PRODUCT
supplierRouter.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const total = await Supplier.countDocuments({});
    res.status(200).json(total);
  })
);

// GET ALL suppliers
supplierRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({});
    res.send(suppliers);
    // // res.send('removed');
    console.log(suppliers);
  })
);

// GET Count suppliers
supplierRouter.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const total = await Supplier.countDocuments({});
    // console.log("id");
    res.status(200).json(total);
  })
);

// GET ONE suppliers
supplierRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const suppliers = await Supplier.find({
      _id: id,
      status: "active",
    });
    // }).populate("Product.id", "name", "ean", "article_code", "unit");
    res.send(suppliers[0]);
    // // res.send('removed');
    console.log(suppliers);
  })
);

// GET suppliers by Product article_code
supplierRouter.get(
  "/product/:code",
  expressAsyncHandler(async (req, res) => {
    const code = req.params.code;
    const suppliers = await Supplier.find({
      // _id: id,
      status: "active",
    });
    console.log(code);
    // }).populate("Product.id", "name", "ean", "article_code", "unit");
    res.send(suppliers);
    // // res.send('removed');
    console.log(suppliers.name);
  })
);

// CREATE ONE Supplier
supplierRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const newSupplier = new Supplier(req.body);
    try {
      await newSupplier.save();
      res.status(200).json({
        message: "Supplier is created Successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI suppliers
supplierRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Supplier.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "suppliers are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Supplier
supplierRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    // console.log(req.body);
    try {
      await Supplier.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Supplier
supplierRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Supplier.deleteOne({ _id: id })
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
supplierRouter.get(
  "/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = page + 0;

    let query = {};
    let suppliers = [];
    // const size = parseInt(req.query.size);
    // console.log("page:", currentPage, "size:", size, "search:", queryString);
    // console.log(typeof queryString);

    //check if search or the pagenation

    if (queryString) {
      // console.log("== query");

      console.log("search:", query);
      // query = { grnNo: { $regex: new RegExp(queryString + ".*?", "i") } };
      // search check if num or string
      const isNumber = /^\d/.test(queryString);
      console.log(isNumber);
      if (!isNumber) {
        // if text then search name
        // query = { name:  queryString  };
        query = { company: { $regex: RegExp(queryString + ".*", "i") } };
      } else {
        // if number search in ean and article code
        query = {
          $or: [
            { code: { $regex: RegExp("^" + queryString + ".*", "i") } },
            { phone: { $regex: RegExp("^" + queryString + ".*", "i") } },
          ],
        };
      }
      // console.log(query);

      suppliers = await Supplier.find(query)
        .select({
          name: 1,
          email: 1,
          code: 1,
          company: 1,
          phone: 1,
        })
        .limit(50);
      // .populate("userId", "name")
      // .populate("poNo", "poNo")
      // // .populate("supplier", { company: 1, email: 1, phone: 1, address: 1 })
      // .populate("warehouse", "name");
      res.status(200).json(suppliers);
    } else {
      console.log("no query");

      // regular pagination
      query = {};

      suppliers = await Supplier.find(query).select({
        name: 1,
        email: 1,
        code: 1,
        company: 1,
        phone: 1,
      });
      // .limit(size)
      // .skip(size * page)
      // .populate("warehouse", "name");
      res.status(200).json(suppliers);
      console.log("done:", query);
    }
  })
);

module.exports = supplierRouter;
