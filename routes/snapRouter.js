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
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Inventory = require("../models/inventoryModel");
const checklogin = require("../middlewares/checkLogin");
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
// const { adjustInventoryOnSale } = require("../middlewares/useInventory");

// const dbUrl = `mongodb+srv://test:QFNOIr4QbpGGpA4D@cluster0.1hsyopn.mongodb.net/pharmacyDb?retryWrites=true&w=majority`;
// const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const snapRouter = express.Router();

snapRouter.get(
  "/snapshot",
  expressAsyncHandler(async (req, res) => {
    console.log("snap")
    const dbUrl = `mongodb+srv://test:QFNOIr4QbpGGpA4D@cluster0.1hsyopn.mongodb.net/pharmacyDb?retryWrites=true&w=majority`;
    const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
      await client.connect();
      // Read data from secondary nodes with a preferred read preference
      const snapshotData = await Inventory.find().readPreference('secondaryPreferred').toArray();

      console.log("snapshotData", snapshotData);
      res.send(snapshotData);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    } finally {
      client.close();
    }
  }));

snapRouter.get(
  "/snapshot/ss",
  expressAsyncHandler(async (req, res) => {
    let session;
    const dbUrl = `mongodb+srv://test:QFNOIr4QbpGGpA4D@cluster0.1hsyopn.mongodb.net/pharmacyDb?retryWrites=true&w=majority`;
    const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    try {

      await client.connect();
      session = client.startSession();
      //session object created. This session object is a handle that you can use to execute operations within a transaction.
      session.startTransaction();
      //MongoDB is about to execute a series of operations as part of a single transaction.
      const snapshotData = await Inventory.find().session(session);
      //It ensures that the query is executed within the context of the specified session, allowing the query's operations to be part of the session's transaction.
      await session.commitTransaction();
      //method is used to finalize and apply the changes made within the transaction to the database.
      console.log("snapshotData", snapshotData);
      res.send(snapshotData);
    } catch (error) {
      console.error("Error:", error);
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      // Handle the error and send an appropriate error response
      return res.status(500).send("Internal Server Error");
    } finally {
      if (session) {
        session.endSession();
      }
      if (client.isConnected()) {
        client.close();
      }
    }
  })
);

// GET ALL inventories

module.exports = snapRouter;
