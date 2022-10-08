/**
 * customers API
 * 1. get all customers
 * 2. get Customer by id
 * 3. get Customer by type
 * 4. create one
 * 5. create many
 * 6. updateOne
 * 7. delete one
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customerModel");
const checklogin = require("../middlewares/checkLogin");

const customerRouter = express.Router();

// COUNT CUSTOMER
customerRouter.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const total = await Customer.countDocuments({});
    // console.log("id");
    res.status(200).json(total);
  })
);

// GET ALL customers
customerRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const customers = await Customer.find({ status: "active" });
    res.send(customers);
    // console.log(customers);
    // // res.send('removed');
  })
);

// GET ALL CUSTOMER WITH PAGENATION & SEARCH
customerRouter.get(
  "/all/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = page + 0;

    let query = {};
    let customer = [];
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
            { email: { $regex: new RegExp("^" + queryString + ".*", "i") } },
          ],
        };
        // query = { name:  queryString  };
      } else {
        // if number search in ean and article code
        query = {
          phone: {
            $regex: RegExp("^" + queryString + ".*", "i"),
          },
        };
      }

      customer = await Customer.find(query)
        .select({
          _id: 1,
          name: 1,
          phone: 1,
        })
        .limit(50);
      res.status(200).json(customer);
    } else {
      // regular pagination
      query = {};

      customer = await Customer.find(query)
        .select({
          _id: 1,
          name: 1,
          phone: 1,
        })
        .limit(size)
        .skip(size * page);
      res.status(200).json(customer);
      console.log("done:", query);
    }
  })
);

// GET ALL CUSTOMER DW
customerRouter.get(
  "/dw",
  expressAsyncHandler(async (req, res) => {
    const customers = await Customer.find({ status: "active" }).select({
      _id: 1,
      name: 1,
      phone: 1,
      point: 1,
    });
    res.send(customers);
    // console.log(customers);
    // // res.send('removed');
  })
);

// GET ONE customers
customerRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const customers = await Customer.find({ _id: id, status: "active" });
    res.send(customers[0]);
    // // res.send('removed');
    // console.log(customers);
  })
);
// GET ONE CUSTOMER POINT
customerRouter.get(
  "/point/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const customers = await Customer.find({ _id: id, status: "active" }).select(
      {
        _id: 1,
        point: 1,
      }
    );
    res.send(customers[0]);
    // // res.send('removed');
    // console.log(customers);
  })
);

// CREATE ONE Customer
customerRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const newCustomer = new Customer(req.body);
    try {
      await newCustomer.save((err, customer) => {
        if (err) {
          res
            .status(500)
            .json({ message: "There was a server side error", error: err });
        } else {
          res.status(200).json({
            message: "Customer is created Successfully",
            id: customer._id,
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

// CREATE MULTI customers
customerRouter.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    await Customer.insertMany(req.body, (err) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({
          message: "customers are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE Customer
customerRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    try {
      await Customer.updateOne({ _id: id }, { $set: update })
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

// DELETE ONE Customer
customerRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Customer.deleteOne({ _id: id })
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

// USER SIGNIN
customerRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    try {
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      let userNameGen = req.body.name;
      let un = userNameGen.replace(" ", "").substring(0, 10).toLowerCase();
      const newCustomer = new Customer({
        name: req.body.name,
        email: req.body.email,
        username: un,
        phone: req.body.phone,
        type: req.body.type,
        address: req.body.address,
        membership: req.body.membership,
        password: hashPassword,
        status: req.body.status,
      });
      await newCustomer.save();
      res.status(200).json({
        message: "Registration Successful",
        status: "success",
        data: un,
      });
    } catch (error) {
      res.status(400).json({
        message: "Registration Unsuccessful",
        error: error,
        ststus: "fail",
      });
    }

    // res.send(newUser);?
  })
);

// USER LOGIN
customerRouter.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    try {
      const customer = await Customer.find({
        status: "active",
        username: req.body.username,
      });

      if (customer && customer.length > 0) {
        const isValidPassword = await bcrypt.compare(
          req.body.password,
          user[0].password
        );
        if (isValidPassword) {
          // generate token
          const token = jwt.sign(
            {
              username: customer[0].username,
              userId: customer[0]._id,
              type: customer[0].type,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          res.status(200).json({
            access_token: token,
            status: "success",
            message: "Login Successful",
          });
        } else {
          res.status(401).json({
            status: "fail",
            error: "Password Doesnot Match",
          });
        }
      } else {
        res.status(401).json({
          status: "fail",
          error: "User Not Found",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: "fail",
        error: err,
      });
    }
  })
);

module.exports = customerRouter;
