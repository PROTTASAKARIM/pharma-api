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
        const accountHead = await AccountHead.find({}).populate("maId", {
            name: 1, code: 1, description: 1,
            status: 1
        });;
        res.send(accountHead);
        // // res.send('removed');
        console.log(accountHead);
    })
);
accountHeadRouter.get(
    "/master",
    expressAsyncHandler(async (req, res) => {
        const accountHead = await AccountHead.find({
            status: "active",
            maId: { $exists: false },
        });
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
        const accountHead = await AccountHead.findOne({ _id: id, status: "active" })
            .select({
                name: 1,
                code: 1,
                maId: 1,
                photo: 1,
                description: 1,
                status: 1
            })
            .populate("maId", {
                name: 1, code: 1, description: 1,
                status: 1
            });
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

// Upload Endpoint
accountHeadRouter.post(
    "/upload/:id",
    expressAsyncHandler(async (req, res) => {
        const id = req.params.id;

        // APPRoot
        // const appRoot = path.dirname(require.main.filename);
        // const appRoot = process.env.PWD;
        const appRoot = process.cwd();
        // APPRoot
        if (req.files === null) {
            return res.status(400).json({ msg: "No file uploaded" });
        }

        const file = req.files.file;
        const name = file.name.split(".");
        const ext = name[1];
        const time = Date.now();
        const fileName = `${id}-${time}.${ext}`;
        // console.log(`../uploads/${fileName}`);

        file.mv(`${appRoot}/uploads/accounthead/${fileName}`, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send(err);
            } else {
                await AccountHead.updateOne(
                    { _id: id },
                    { $set: { photo: `/uploads/accounthead/${fileName}` } }
                )
                    .then((response) => {
                        // res.send(response);
                        res.json({
                            fileName: fileName,
                            filePath: `/uploads/accounthead/${fileName}`,
                        });
                    })
                    .catch((err) => {
                        res.send(err);
                    });
            }
        });
    })
);

module.exports = accountHeadRouter;
