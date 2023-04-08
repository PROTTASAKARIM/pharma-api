const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const AccountHead = require("../models/accountHeadModal");
const checklogin = require("../middlewares/checkLogin");

const accountHeadRouter = express.Router();
// accountHead

accountHeadRouter.get(
    "/",
    expressAsyncHandler(async (req, res) => {
        const accountHead = await AccountHead.find({});
        res.send(accountHead);
        // // res.send('removed');
        console.log(accountHead);
    })
);
// GET ONE AccountHead
accountHeadRouter.get(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const id = req.params.id;
        const accountHead = await AccountHead.findOne({ _id: id, status: "active" });
        res.send(accountHead);
        // // res.send('removed');
        console.log(accountHead);
    })
);
// CREATE ONE AccountHead
accountHeadRouter.post(
    "/",
    expressAsyncHandler(async (req, res) => {
        const newAccountHead = new AccountHead(req.body);

        try {
            await newAccountHead.save();
            res.status(200).json({
                message: "AccountHead is created Successfully",
            });
        } catch (err) {
            res
                .status(500)
                .json({ message: "There was a server side error", error: err });
        }
    })
);

// CREATE MULTI AccountHead
accountHeadRouter.post(
    "/all",
    expressAsyncHandler(async (req, res) => {
        await AccountHead.insertMany(req.body, (err) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                res.status(200).json({
                    message: "AccountHead are created Successfully",
                });
            }
        });
    })
);
// UPDATE ONE AccountHead
accountHeadRouter.put(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const id = req.params.id;
        const update = req.body;
        try {
            await AccountHead.updateOne({ _id: id }, { $set: update })
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
// DELETE ONE AccountHead
accountHeadRouter.delete(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const id = req.params.id;
        try {
            await AccountHead.deleteOne({ _id: id })
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
module.exports = accountHeadRouter;
