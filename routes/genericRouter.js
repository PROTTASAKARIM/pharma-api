/**
 * generics API
 * 1. get all generics
 * 2. get Generic by id
 * 3. get Generic by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Generic = require("../models/genericModel");
const checklogin = require("../middlewares/checkLogin");

const genericRouter = express.Router();

// COUNT PRODUCT
genericRouter.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const generic = await Generic.countDocuments({});
    res.status(200).json(generic);
  })
);
// GET ALL generics
genericRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const generics = await Generic.find({});
    res.send(generics);
    // // res.send('removed');
    console.log(generics);
  })
);
genericRouter.get(
  "/export",
  expressAsyncHandler(async (req, res) => {
    const generics = await Generic.find({});
    res.send(generics);
    // // res.send('removed');
    console.log(generics);
  })
);
genericRouter.get(
  "/new",
  expressAsyncHandler(async (req, res) => {
    const generics = await Generic.find({}).limit(20);
    res.send(generics);
    // // res.send('removed');
    console.log(generics);
  })
);
// GET ALL generic WITH PAGENATION & SEARCH
genericRouter.get(
  "/all/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = page + 0;

    let query = {};
    let generic = [];
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

      generic = await Generic.find(query).limit(100);
      res.status(200).json(generic);
    } else {
      // regular pagination
      query = {};

      generic = await Generic.find(query)
        .limit(size)
        .skip(size * page);
      res.status(200).json(generic);
      console.log("done:", query);
    }
  })
);

// Generic DW SEARCH
genericRouter.get(
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

    const search = await Generic.find(query)
      // TODO:: UPDATE AGREEGET FOR GET STOCK VALUE
      .select({
        _id: 1,
        name: 1,
        code: 1,
      })
      .limit(20);

    res.send(search);
  })
);

// GET ONE generics
genericRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const generic = await Generic.findOne({ _id: id });
    res.send(generic);
    // // res.send('removed');
    // console.log(generics);
  })
);

// CREATE ONE Generic
genericRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const newGeneric = new Generic(req.body);

    try {
      await newGeneric.save();
      res.status(200).json({
        message: "Generic is created Successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI generics
genericRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Generic.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "generics are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Generic
genericRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Generic.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Generic
genericRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Generic.deleteOne({ _id: id })
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

module.exports = genericRouter;
