/**
 * groups API
 * 1. get all groups
 * 2. get Group by id
 * 3. get Group by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Group = require("../models/groupModel");
const checklogin = require("../middlewares/checkLogin");


const groupRouter = express.Router();


// COUNT PRODUCT
groupRouter.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const group = await Group.countDocuments({});
    res.status(200).json(group);
  })
);
// GET ALL groups
groupRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const groups = await Group.find({});
    res.send(groups);
    // // res.send('removed');
    console.log(groups);
  })
);

// GET ALL group WITH PAGENATION & SEARCH
groupRouter.get(
  "/all/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = page + 0;

    let query = {};
    let group = [];
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
          $or: [
            { name: { $regex: new RegExp(queryString + ".*?", "i") } },
          ],
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

      group = await Group.find(query)
        .limit(100);
      res.status(200).json(group);
    } else {
      // regular pagination
      query = {};

      group = await Group.find(query)
        .limit(size)
        .skip(size * page);
      res.status(200).json(group);
      console.log("done:", query);
    }
  })
);

// GET ONE groups
groupRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const group = await Group.findOne({ _id: id });
    res.send(group);
    // // res.send('removed');
    console.log(group);
  })
);

// CREATE ONE Group
groupRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const newGroup = new Group(req.body);

    try {
      await newGroup.save();
      res.status(200).json({
        message: "Group is created Successfully",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }
  })
);

// CREATE MULTI groups
groupRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Group.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "groups are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Group
groupRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    console.log('id', id, 'update', update)
    try {
      await Group.updateOne({ _id: id }, { $set: update })
        .then((response) => {
          res.send(response);
          console.error(response);
        })
        .catch((err) => {
          res.send(err);
          console.error(err);
        });
    } catch (error) {
      console.error(error);
    }
  })
);

// DELETE ONE Group
groupRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Group.deleteOne({ _id: id })
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

module.exports = groupRouter;
