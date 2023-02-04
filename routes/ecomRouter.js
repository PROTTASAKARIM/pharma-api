const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Sale = require("../models/saleModel");
const Product = require("../models/productModel");
const Customer = require("../models/customerModel");
const Category = require("../models/categoryModel");
const bcrypt = require("bcrypt");
const checklogin = require("../middlewares/checkLogin");
const { generateEcomId } = require("../middlewares/generateId");
const { startOfDay, endOfDay } = require("date-fns");
const ecomRouter = express.Router();

/*==========================
* PRODUCT
===========================*/

// GET FEATURED PRODUCTS
// GET PRODUCT BY CATEGORY
ecomRouter.get(
  "/featured",
  expressAsyncHandler(async (req, res) => {
    const product = await Product.find({ featured: true })
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        unit: 1,
        article_code: 1,
        priceList: 1,
        category: 1,
        promo_price: 1,
        promo_start: 1,
        promo_end: 1,
        promo_type: 1,
        featured: 1,
        photo: 1,
      })
      .limit(20)
      .populate("category", "name")
      .populate("priceList");
    if (product) {
      console.log(product);
    }
    res.status(200).json(product);
  })
);

// GET PRODUCT BY CATEGORY
ecomRouter.get(
  "/product/category/:id/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const category = req.params.id;
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = parseInt(page) + 0;

    let query = {};
    let product = [];
    // const size = parseInt(req.query.size);
    console.log("page:", currentPage, "size:", size, "search:", queryString);
    console.log(typeof queryString);

    //check if search or the pagenation

    if (queryString) {
      console.log("== query");

      console.log("search:", query);
      // search check if num or string
      const isNumber = /^\d/.test(queryString);
      console.log(isNumber);
      if (!isNumber) {
        // if text then search name
        query = {
          category: category,
          name: { $regex: new RegExp(".*" + queryString + ".*?", "i") },
        };
        // query = { name:  queryString  };
      } else {
        // if number search in ean and article code
        query = {
          $or: [
            {
              category: category,
              ean: { $regex: RegExp("^" + queryString + ".*", "i") },
            },
            {
              category: category,
              article_code: {
                $regex: RegExp("^" + queryString + ".*", "i"),
              },
            },
          ],
        };
      }
      console.log(query);

      product = await Product.find(query)
        .select({
          _id: 1,
          name: 1,
          ean: 1,
          unit: 1,
          article_code: 1,
          priceList: 1,
          category: 1,
          promo_price: 1,
          promo_start: 1,
          promo_end: 1,
          promo_type: 1,
        })
        .limit(100)
        .populate("category", "name")
        .populate("priceList");
      res.status(200).json(product);
    } else {
      console.log("no query");

      // regular pagination
      query = { category: category };

      product = await Product.find(query)
        .select({
          _id: 1,
          name: 1,
          ean: 1,
          unit: 1,
          article_code: 1,
          priceList: 1,
          category: 1,
          promo_price: 1,
          promo_start: 1,
          promo_end: 1,
          promo_type: 1,
        })
        .limit(size)
        .skip(size * page)
        .populate("category", "name")
        .populate("priceList");
      res.status(200).json(product);
      console.log("done:", query);
    }
  })
);
// ecomRouter.get(
//     "/product/category/:id",
//     expressAsyncHandler(async (req, res) => {
//         const category = req.params.id;
//         const products = await Product.find({ category: category })
//             .select({
//                 _id: 1,
//                 name: 1,
//                 ean: 1,
//                 unit: 1,
//                 vat: 1,
//                 article_code: 1,
//                 priceList: 1,
//                 promo_price: 1,
//                 promo_start: 1,
//                 promo_end: 1,
//                 promo_type: 1
//             })
//             .populate("priceList", "mrp");
//         // .limit(5);
//         // Select fields
//         // console.log(products);
//         // console.log(category);
//         res.send(products);
//     })
// );

// GET PRODUCTS BY SIZE AND PAGE
ecomRouter.get(
  "/product/:page/:size",
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const size = parseInt(req.params.size);
    const queryString = req.query?.q?.trim().toString().toLocaleLowerCase();
    const currentPage = parseInt(page) + 0;

    let query = {};
    let product = [];
    // const size = parseInt(req.query.size);
    console.log("page:", currentPage, "size:", size, "search:", queryString);
    console.log(typeof queryString);

    //check if search or the pagenation

    if (queryString) {
      console.log("== query");

      console.log("search:", query);
      // search check if num or string
      const isNumber = /^\d/.test(queryString);
      console.log(isNumber);
      if (!isNumber) {
        // if text then search name
        query = {
          name: { $regex: new RegExp(".*" + queryString + ".*?", "i") },
        };
        // query = { name:  queryString  };
      } else {
        // if number search in ean and article code
        query = {
          $or: [
            { ean: { $regex: RegExp("^" + queryString + ".*", "i") } },
            {
              article_code: {
                $regex: RegExp("^" + queryString + ".*", "i"),
              },
            },
          ],
        };
      }
      console.log(query);

      product = await Product.find(query)
        .select({
          _id: 1,
          name: 1,
          ean: 1,
          unit: 1,
          article_code: 1,
          priceList: 1,
          category: 1,
          promo_price: 1,
          promo_start: 1,
          promo_end: 1,
          promo_type: 1,
        })
        .limit(100)
        .populate("category", "name")
        .populate("priceList");
      res.status(200).json(product);
    } else {
      console.log("no query");

      // regular pagination
      query = {};

      product = await Product.find(query)
        .select({
          _id: 1,
          name: 1,
          ean: 1,
          unit: 1,
          article_code: 1,
          priceList: 1,
          category: 1,
          promo_price: 1,
          promo_start: 1,
          promo_end: 1,
          promo_type: 1,
        })
        .limit(size)
        .skip(size * page)
        .populate("category", "name")
        .populate("priceList");
      res.status(200).json(product);
      console.log("done:", query);
    }
  })
);

// GET PRODUCTS DETAILS BY ID
ecomRouter.get(
  "/product/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.findOne({ _id: id })
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        vat: 1,
        unit: 1,
        article_code: 1,
        priceList: 1,
        ean: 1,
        promo_start: 1,
        promo_end: 1,
        promo_price: 1,
        promo_type: 1,
        category: 1,
      })
      .populate("priceList", { mrp: 1, tp: 1, supplier: 1, _id: 1, status: 1 })
      .populate("category", { name: 1 });
    if (products) {
      console.log(products);
      res.send(products);
    }
  })
);

// GET PRODUCT BY CATEGORY
ecomRouter.get(
  "/product_category/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ category: id })
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        vat: 1,
        unit: 1,
        article_code: 1,
        priceList: 1,
        ean: 1,
        promo_start: 1,
        promo_end: 1,
        promo_price: 1,
        promo_type: 1,
      })
      .populate("priceList", { mrp: 1, tp: 1, supplier: 1, _id: 1, status: 1 });
    if (products) {
      //   console.log(products);
      res.send(products);
    }
  })
);

/*==========================
* CATEGORY
===========================*/
// GET ALL CATEGORY BY GROUP
ecomRouter.get(
  "/category/group/:group",
  expressAsyncHandler(async (req, res) => {
    const group = req.params.group;
    const categories = await Category.find({ group: group });
    res.send(categories);
  })
);

// GET ALL CATEGORY BY MASTER CATEGORY
ecomRouter.get(
  "/category/master/:mcId",
  expressAsyncHandler(async (req, res) => {
    const mcId = req.params.mcId;
    const categories = await Category.find({
      mcId: mcId,
      mc: { $exists: true },
    });
    res.send(categories);
  })
);

/*==========================
* SALE
===========================*/
/*==========================
* CUSTOMERS
===========================*/
// GET ALL sales
ecomRouter.get(
  "/sale",
  expressAsyncHandler(async (req, res) => {
    const sales = await Sale.find({
      source: "web"
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
        status: 1,
      })
    // .populate("billerId", "name");
    res.send(sales);
    // // res.send('removed');
  })
);
// GET ALL type sale
ecomRouter.get(
  "/sale/:status",
  expressAsyncHandler(async (req, res) => {
    let query = {}
    let statusType = {}
    let status = req.params.status;
    console.log(status)
    if (status === "process") {
      statusType = { status: { $in: ["confirm", "deliver", "process"] } }
    } else {
      statusType = { status: status }
    }
    query = {
      source: "web",
      status: statusType.status
    }

    console.log(query)
    const sales = await Sale.find(query)
      .select({
        invoiceId: 1,
        totalItem: 1,
        grossTotalRound: 1,
        total: 1,
        status: 1,
        billerId: 1,
        createdAt: 1,
        changeAmount: 1,
        status: 1,
      })
    console.log("billerId", sales);
    res.send(sales);
    // // res.send('removed');
  })
);

// GET ONE sales
ecomRouter.get(
  "/sale/details/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    console.log(id)
    const sales = await Sale.find({ _id: id, source: "web" })
      .populate("billerId", "name")
      .populate("customerId", { phone: 1, name: 1, point: 1, email: 1, address: 1 });
    res.send(sales[0]);
    // // res.send('removed');
    // console.log(sales);
  })
);

ecomRouter.post(
  "/sale",
  generateEcomId,
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

// UPDATE ONE Sale
ecomRouter.put(
  "/sale/:id",
  // updateInventoryInOnSaleDel,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body.newData;
    console.log("ecom sale Update", update)
    console.log('id', id)
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
// // GET ALL CATEGORY BY GROUP
// ecomRouter.get(
//     "/category/group/:group",
//     expressAsyncHandler(async (req, res) => {
//         const group = req.params.group.toLowerCase();
//         const categories = await Category.find({ group: group });
//         res.send(categories);
//     })
// );
// // GET ALL CATEGORY BY GROUP
ecomRouter.get(
  "/product/:catID",
  expressAsyncHandler(async (req, res) => {
    const catID = req.params.catID;
    const product = await Product.find({ category: catID })
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        unit: 1,
        article_code: 1,
        priceList: 1,
        category: 1,
        promo_price: 1,
        promo_start: 1,
        promo_end: 1,
        promo_type: 1,
      })
      .limit(100)
      .populate("category", "name")
      .populate("priceList");
    res.status(200).json(product);
  })
);

/*==========================
* log in register
===========================*/
// Customer SIGNIN
ecomRouter.post(
  "/customer/register",
  expressAsyncHandler(async (req, res) => {
    console.table(req.body);
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    console.log("hashpassss", hashPassword);
    console.log(hashPassword);
    const newUser = new Customer({
      name: req.body.name,
      email: req.body.email,
      username: req.body.phone,
      phone: req.body.phone,
      type: req.body.type,
      membership: req.body.membership,
      address: "",
      // privilege: {},
      password: hashPassword,
      status: req.body.status,
    });
    try {
      console.log("newUser", newUser);
      const user = await newUser.save();
      console.log("p", user);
      if (user) {
        const token = jwt.sign(
          {
            username: user.username,
            userId: user._id,
            type: user.type,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.status(200).json({
          access_token: token,
          status: true,
          message: "Registration Successful",
          //   newUser: user,
        });
      }
    } catch (error) {
      // res.status(400).json({
      res
        .status(500)
        .json({ message: "There was a server side error", error: error });
      // });
    }

    // res.send(newUser);
  })
);

// Customer LOGIN
// ecomRouter.post(
//   "/customer/login",
//   expressAsyncHandler(async (req, res) => {
//     const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
//       req.body.email
//     );
//     // console.log({ body: req.body, email: isEmail })
//     try {
//       let user;
//       if (isEmail) {
//         user = await Customer.find({
//           status: "active",
//           email: req.body.email.toLowerCase(),
//         });
//       } else {
//         user = await Customer.find({
//           status: "active",
//           username: req.body.email.toLowerCase(),
//         });
//       }
//       // console.log(user)
//       if (user && user.length > 0) {
//         console.log("user", user);
//         const isValidPassword = await bcrypt.compare(
//           req.body.password,
//           user[0].password
//         );
//         if (isValidPassword) {
//           // generate token
//           const token = jwt.sign(
//             {
//               username: user[0].username,
//               userId: user[0]._id,
//               type: user[0].type,
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: "1h" }
//           );

//           res.status(200).json({
//             access_token: token,
//             status: true,
//             user: {
//               id: user[0]._id,
//               name: user[0].name,
//               username: user[0].username,
//               email: user[0].email,
//               type: user[0].type,
//             },
//             message: "Login Successful",
//           });
//         } else {
//           res.status(401).json({
//             status: false,
//             error: "Password Does not Match",
//           });
//         }
//       } else {
//         res.status(401).json({
//           status: false,
//           error: "User Not Found",
//         });
//       }
//     } catch (err) {
//       res.status(404).json({
//         status: false,
//         error: err,
//       });
//     }
//   })
// );

ecomRouter.post(
  "/customer/login",
  expressAsyncHandler(async (req, res) => {
    const isPhone = req.body.phone;
    console.log({ body: req.body, phone: isPhone });
    try {
      let user;
      if (isPhone) {
        user = await Customer.find({
          status: "active",
          phone: req.body.phone,
        });
      } else {
        user = await Customer.find({
          status: "active",
          username: req.body.username,
        });
      }
      // console.log(user)
      if (user && user.length > 0) {
        console.log("user", user);
        const isValidPassword = await bcrypt.compare(
          req.body.password,
          user[0].password
        );
        if (isValidPassword) {
          // generate token
          const token = jwt.sign(
            {
              username: user[0].username,
              userId: user[0]._id,
              type: user[0].type,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          res.status(200).json({
            access_token: token,
            status: true,
            user: {
              id: user[0]._id,
              name: user[0].name,
              username: user[0].username,
              phone: user[0].phone,
              type: user[0].type,
              point: user[0].point,
            },
            message: "Login Successful",
          });
        } else {
          res.status(401).json({
            status: false,
            error: "Password Does not Match",
          });
        }
      } else {
        res.status(401).json({
          status: false,
          error: "User Not Found",
        });
      }
    } catch (err) {
      res.status(404).json({
        status: false,
        error: err,
      });
    }
  })
);

module.exports = ecomRouter;
