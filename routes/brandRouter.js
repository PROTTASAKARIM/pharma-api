/**
 * brands API
 * 1. get all brands
 * 2. get Brand by id
 * 3. get Brand by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Brand = require("../models/brandModel");
const checklogin = require("../middlewares/checkLogin");

const brandRouter = express.Router();

// COUNT PRODUCT
brandRouter.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const brand = await Brand.countDocuments({});
    res.status(200).json(brand);
  })
);

// GET ALL brands
brandRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const brands = await Brand.find({});
    res.send(brands);
    // // res.send('removed');
    console.log(brands);
  })
);
// GET ALL brands
brandRouter.get(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const brands = await Brand.find({}).limit(20);
    res.send(brands);
    // // res.send('removed');
    console.log(brands);
  })
);

brandRouter.get(
  "/all/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = page + 0;

    let query = {};
    let brand = [];
    // const size = parseInt(req.query.size);
    console.log("page:", currentPage, "size:", size, "search:", queryString);

    //check if search or the pagenation

    if (queryString) {
      console.log("search:", query);
      // search check if num or string
      const isNumber = /^\d/.test(queryString);
      console.log(isNumber);
      if (!isNumber) {
        // if text then search name
        query = {
          $or: [{ name: { $regex: new RegExp(queryString + ".*?", "i") } }],
        };
        // query = { name:  queryString  };
      } else {
        // if number search in ean and article code
        query = {
          code: {
            $regex: RegExp("^" + queryString + ".*", "i"),
          },
        };
      }
      console.log("done:", query);

      brand = await Brand.find(query).limit(100);
      res.status(200).json(brand);
    } else {
      // regular pagination
      query = {};
      console.log("done:", query);

      brand = await Brand.find(query)
        .limit(size)
        .skip(size * page);
      res.status(200).json(brand);
    }
  })
);

// GET ONE brands
brandRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const brand = await Brand.findOne({ _id: id });
    res.send(brand);
    // // res.send('removed');
    console.log(brand);
  })
);

// BRAND DW SEARCH
brandRouter.get(
  "/search/:q",
  expressAsyncHandler(async (req, res) => {
    const payload = req.params?.q?.trim().toString().toLocaleLowerCase();

    let query = {};

    if (payload === "") {
      query = {};
    } else {
      const isNumber = /^\d/.test(payload);
      if (!isNumber) {
        query = { name: { $regex: new RegExp("\\b" + payload + ".*?", "i") } };
      } else {
        query = {
          $or: [{ code: { $regex: new RegExp("^" + payload + ".*", "i") } }],
        };
      }
    }

    const search = await Brand.find(query)
      // TODO:: UPDATE AGREEGET FOR GET STOCK VALUE
      .select({
        _id: 1,
        name: 1,
        code: 1,
      })
      .limit(10);

    res.send(search);
  })
);

// CREATE ONE Brand
brandRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    console.log("Brand", req.body);
    const newBrand = new Brand(req.body);

    try {
      await newBrand.save();
      res.status(200).json({
        message: "Brand is created Successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI brands
brandRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Brand.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "brands are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Brand
brandRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Brand.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Brand
brandRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Brand.deleteOne({ _id: id })
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

module.exports = brandRouter;
