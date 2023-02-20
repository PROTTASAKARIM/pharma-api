/**
 * PRODUCTS API
 * 1. get all product "/"
 * 1.1. get product by category
 * 2. get product by id "/:id"
 * 3. get product by article code "/code/:code"
 * 4. get product by ean "/ean/:ean"
 * 5. create one "/"
 * 6. create many "/all"
 * 7. updateOne "/:id"
 * 8. delete one "/:id"
 * Only I know what I have done for this
 */
const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { startOfDay, endOfDay } = require("date-fns");
const path = require("path");

// COUNT PRODUCT
router.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const total = await Product.countDocuments({});
    res.status(200).json(total);
  })
);

router.get(
  "/export",
  expressAsyncHandler(async (req, res) => {
    const products = await Product.find().select({
      _id: 1,
      name: 1,
      article_code: 1,
      unit: 1,
      category: 1,

    })
      .populate("category", { name: 1, code: 1, mcId: 1, group: 1 });
    res.status(200).json(products);
  })
);

// GET PRODUCT PRICE
router.get(
  "/price/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ _id: id }).select({
      _id: 1,
      priceList: 1,
    });
    res.status(200).json(products[0]);
  })
);

// GET ALL PRODUCTS WITH PAGENATION & SEARCH
router.get(
  "/all/:page/:size",
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

// GET ALL PRODUCTS UPDATED
router.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const products = await Product.find({})
        .select({
          name: 1,
          ean: 1,
          article_code: 1,
          priceList: 1,
          category: 1,
          promo_price: 1,
          promo_start: 1,
          promo_end: 1,
        })
        .populate("category", "name")
        .populate("priceList");

      res.send(products);
    } catch {
      res.status(500).json("Server side error");
    }
  })
);

// GET ALL ACTIVE PRODUCTS UPDATED
router.get(
  "/active",
  expressAsyncHandler(async (req, res) => {
    try {
      const products = await Product.findActive();
      res.send(products);
    } catch {
      res.status(500).json("Server side error");
    }
  })
);

// GET ALL PRODUCTS BY CATEGORY
router.get(
  "/pro",
  expressAsyncHandler(async (req, res) => {
    const products = await Product.find({
      priceList: { $exists: true, $not: { $size: 0 } },
    }).select({
      article_code: 1,
      name: 1,
      priceList: 1,
    });
    res.send(products);
  })
);
// GET ALL PRODUCTS BY CATEGORY
// router.get(
//   "/category/:category",
//   expressAsyncHandler(async (req, res) => {
//     const category = req.params.category;
//     const products = await Product.find({
//       category: { $regex: new RegExp("^" + category.toLowerCase(), "i") },
//     });
//     res.send(products);
//   })
// );

// GET ALL FEATURED PRODUCTS
router.get(
  "/featured",
  expressAsyncHandler(async (req, res) => {
    const products = await Product.find({
      featured: true,
    })
      .select({
        name: 1,
        ean: 1,
        article_code: 1,
        priceList: 1,
        category: 1,
        promo_price: 1,
        promo_start: 1,
        promo_end: 1,
        promo_type: 1,
      })
      .populate("category", "name")
      .populate("priceList");
    res.send(products);
  })
);

// GET ONE PRODUCT FOR PRICE TABLE
router.get(
  "/infoPrice/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ _id: id })
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        unit: 1,
        article_code: 1,
        priceList: 1,
        category: 1,
        master_category: 1,
        promo_price: 1,
        promo_start: 1,
        promo_end: 1,
        promo_type: 1,
      })
      .populate("category", "name")
      .populate("priceList", "mrp")
      .populate("master_category", "name");
    res.status(200).json(products[0]);
  })
);

// GET ONE PRODUCT inventory
router.get(
  "/inventory/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      const product = await Product.aggregate([
        {
          $lookup: {
            from: "inventory",
            localField: "article_code",
            foreignField: "article_code",
            as: "common",
          },
        },
        {
          $match: {
            article_code: id,
          },
        },
      ]);
      res.send(product);
    } catch (err) {
      console.log(err);
    }
  })
);
// GET ONE PRODUCT
router.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ _id: id }).populate(
      "category",
      "name"
    );
    // .populate("priceList", "mrp")
    res.send(products[0]);
  })
);
// GET ONE PRODUCT
router.get(
  "/promo-update/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ _id: id })
      .populate("category", "name")
      .populate("priceList", { mrp: 1, tp: 1, supplier: 1, _id: 1, status: 1 })
      .populate("promo_price", "mrp");
    res.send(products[0]);
  })
);
router.get(
  "/select/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ _id: id })
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        vat: 1,
        unit: 1,
        article_code: 1,
        priceList: 1,
        category: 1,
        master_category: 1,
      })
      .populate("category", "name")
      .populate("master_category", "name")
      .populate("priceList", { mrp: 1, tp: 1, supplier: 1, _id: 1, status: 1 });
    // .populate("priceList");
    res.send(products[0]);
  })
);

// GET PRODUCT DETAILS FOR PURCHASE PRODUCT IMPORT
router.get(
  "/pro-details/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ article_code: id })
      .select({
        _id: 1,
        name: 1,
        unit: 1,
        article_code: 1,
        priceList: 1,
        ean: 1,
        promo_start: 1,
        promo_end: 1,
        promo_price: 1,
        promo_type: 1,
      })
      .populate("priceList", { mrp: 1, tp: 1, _id: 1 });
    // .populate("priceList");
    res.send(products[0]);
  })
);

router.get(
  "/details/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ _id: id })
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
    res.send(products[0]);
  })
);

// GET ONE PRODUCT BY ARTICLE CODE
router.get(
  "/code/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ article_code: id })
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        vat: 1,
        unit: 1,
        article_code: 1,
        priceList: 1,
        promo_start: 1,
        promo_end: 1,
        promo_price: 1,
        promo_type: 1,
      })
      .populate("priceList", { mrp: 1, tp: 1, _id: 0 });
    res.send(products[0]);
  })
);

// GET MANY PRODUCT BY ARTICLE CODE
router.post(
  "/acode/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.data;
    const products = await Product.find({ article_code: id })
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        vat: 1,
        unit: 1,
        article_code: 1,
        priceList: 1,
        promo_start: 1,
        promo_end: 1,
        promo_price: 1,
        promo_type: 1,
      })
      .populate("priceList", { mrp: 1, tp: 1, _id: 0 });
    res.send(products[0]);
  })
);

// GET PRODUCT BY category
router.get(
  "/category/:id",
  expressAsyncHandler(async (req, res) => {
    const category = req.params.id;
    const products = await Product.find({ category: category })
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        unit: 1,
        vat: 1,
        article_code: 1,
        priceList: 1,
        promo_price: 1,
        promo_start: 1,
        promo_end: 1,
        promo_type: 1,
      })
      .populate("priceList", "mrp");
    // .limit(5);
    // Select fields
    // console.log(products);
    // console.log(category);
    res.send(products);
  })
);

// GET ONE PRODUCT BY EAN
router.get(
  "/ean/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ ean: id });
    res.send(products);
  })
);

// E COMMERCE SEARCH
router.get(
  "/web-search/:q",
  expressAsyncHandler(async (req, res) => {
    let payload = req.params.q.trim().toString().toLocaleLowerCase();

    query = { name: { $regex: new RegExp("^" + payload + ".*", "i") } };
    const search = await Product.find(query)
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        unit: 1,
        article_code: 1,
        photo: 1,
        priceList: 1,
        category: 1,
      })
      .limit(10);
    if (payload === "") {
      res.send([]);
    } else {
      res.send({ search });
    }
  })
);

// PRODUCTS SRARCH
router.get(
  "/search/:q",
  expressAsyncHandler(async (req, res) => {
    // let payload = req.query?.q?.trim().toString().toLocaleLowerCase();
    const payload = req.params?.q?.trim().toString().toLocaleLowerCase();
    // console.log(payload);

    const isNumber = /^\d/.test(payload);
    let query = {};
    if (!isNumber) {
      // query = { name: { $regex: new RegExp("^" + payload + ".*", "i") } };
      query = { name: { $regex: new RegExp("\\b" + payload + ".*?", "i") } };
      // name: { $regex: new RegExp(`/\b${payload}[^\b]*?\b/gi`, "i") },
      // query = {
      //   name: { $regex: new RegExp("\\b" + payload + "\\w+  ", "i") },
      //   // name: { $regex: new RegExp(payload + `/\b${payload}[^\b]*?w+/g`, "i") },
      // };

      // query = { name:  payload  };
    } else {
      query = {
        $or: [
          { ean: { $regex: new RegExp("^" + payload + ".*", "i") } },
          { article_code: { $regex: new RegExp("^" + payload + ".*", "i") } },
        ],
      };
    }
    // console.log(query);

    // console.log(payload);

    const search = await Product.find(query)
      .select({
        _id: 1,
        name: 1,
        ean: 1,
        unit: 1,
        vat: 1,
        article_code: 1,
        priceList: 1,
        promo_start: 1,
        promo_end: 1,
        promo_price: 1,
        promo_type: 1,
      })
      .populate("priceList", { mrp: 1, tp: 1, supplier: 1, status: 1 })
      .limit(10);
    if (payload === "") {
      res.send([]);
    } else {
      // console.log(search);
      res.send(search);
    }
  })
);

// CREATE ONE PRODUCT
router.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save((err, product) => {
      if (err) {
        res
          .status(500)
          .json({ error: err, message: "There was a server side error" });
      } else {
        res.status(200).json({
          data: product._id,
          message: "Product is created Successfully",
        });
      }
    });
  })
);

// CREATE MANY PRODUCTS
router.post(
  "/all",
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    await Product.deleteMany({});
    await Product.insertMany(req.body, (err) => {
      if (err) {
        res
          .status(500)
          .json({ error: "There was a server side error", err: err });
      } else {
        res.status(200).json({
          message: "Products are created Successfully",
        });
      }
    });
  })
);

// UPDATE ONE PRODUCT
router.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    console.log("update product", update);
    const start = startOfDay(new Date(update.promo_start));
    const end = endOfDay(new Date(update.promo_end));
    console.log("start", start, "end", end);
    const newProduct = { ...update, promo_start: start, promo_end: end };
    console.log("newProduct", newProduct);
    try {
      await Product.updateOne({ _id: id }, { $set: newProduct })
        .then((response) => {
          console.log("update", response);
          res.send(response);
        })
        .catch((err) => {
          console.log("update", response);
          res.send(err);
        });
    } catch (error) {
      console.error(error);
    }
  })
);

// DELETE PRODUCT
router.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      await Product.deleteOne({ _id: id })
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

// PRODUCT PHOTO UPLOAD
// Upload Endpoint
router.post(
  "/upload/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;

    // APP ROOT

    // APP ROOT
    // const appRoot = process.env.PWD;
    const appRoot = process.cwd();
    console.log(appRoot);
    // App Root

    console.log("env", process.env);
    // console.log("p", PWD)
    console.log("approot", appRoot);
    if (req.files === null) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const file = req.files.file;
    const name = file.name.split(".");
    const ext = name[1];
    const time = Date.now();
    const fileName = `${id}-${time}.${ext}`;
    console.log(`../uploads/${fileName}`);

    file.mv(`${appRoot}/uploads/product/${fileName}`, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      } else {
        await Product.updateOne(
          { _id: id },
          { $set: { photo: `/uploads/product/${fileName}` } }
        )
          .then((response) => {
            // res.send(response);
            res.json({
              fileName: fileName,
              filePath: `/uploads/product/${fileName}`,
            });
          })
          .catch((err) => {
            res.send(err);
          });
      }
    });
  })
);

// UPDATE PRODUCT PHOTO FIELD
// router.post("/emptyPhoto", async (req, res) => {
//   try {
//     const hi = await Product.updateMany(
//       { product_type: "standard" },
//       { $set: { photo: "" } }
//     );
//     res.send(hi);
//     // await Product.find({ product_type: "standard" }).update({
//     //   $set: { photo: "" },
//     console.log(hi);
//     // });
//   } catch (err) {
//     console.log("err");
//   }
// });

// // DELETE ALL
// router.get(
//   "/del-all",
//   expressAsyncHandler(async (req, res) => {
//     try {
//       await Product.remove((response) => {
//         res.send(response);
//       }).catch((err) => {
//         res.send(err);
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   })
// );

module.exports = router;
