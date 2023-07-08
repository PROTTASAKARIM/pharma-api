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
const Sale = require("../models/saleModel");
const Inventory = require("../models/inventoryModel");
const { startOfDay, endOfDay } = require("date-fns");
const path = require("path");
const mongoose = require('mongoose');
const {
  updateSupplierProducts,
} = require("../middlewares/supplierProductRemove");
const Supplier = require("../models/supplierModel");

// COUNT PRODUCT
router.get(
  "/count",
  expressAsyncHandler(async (req, res) => {
    const total = await Product.countDocuments({});
    res.status(200).json(total);
  })
);
// last PRODUCT
router.get(
  "/last",
  expressAsyncHandler(async (req, res) => {
    const total = await Product.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
      { $project: { article_code: 1 } },
    ]);
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
      group: 1,
      generic: 1,
      brand: 1,
      tp: 1,
      mrp: 1,
      pcsBox: 1
    })
      .populate("group", { name: 1 })
      .populate("generic", { name: 1 })
      .populate("brand", { name: 1 })

    res.status(200).json(products);
  })
);
// GET PRODUCT DETAILS FOR PURCHASE PRODUCT IMPORT
router.get(
  "/article/:code",
  expressAsyncHandler(async (req, res) => {
    const code = req.params.code;
    const products = await Product.findOne({ article_code: code })
      .select({
        _id: 1,
        name: 1,
        unit: 1,
        article_code: 1,
        generic: 1,
        group: 1,
        brand: 1,
        tp: 1,
        mrp: 1,
      })
      .populate("group", { _id: 1, name: 1 })
      .populate("generic", { _id: 1, name: 1 })
      .populate("brand", { _id: 1, name: 1 })
      .populate("unit", { _id: 1, name: 1 })
    res.send(products);
  })
);
// GET PRODUCT DETAILS FOR PURCHASE PRODUCT IMPORT
router.get(
  "/pro-details/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.findOne({ article_code: id })
      .select({
        _id: 1,
        name: 1,
        unit: 1,
        article_code: 1,
        tp: 1,
        mrp: 1,
        group: 1
      })
      .populate("unit", { _id: 1, name: 1 })
      .populate("group", { _id: 1, name: 1 })
    res.send(products);
  })
);

//product details
router.get(
  "/details/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.findOne({ _id: id })
      .select({
        _id: 1,
        name: 1,
        unit: 1,
        article_code: 1,
        photo: 1,
        tp: 1,
        mrp: 1,
        size: 1,
        vat: 1,
        pcsBox: 1,
        discount: 1,
        group: 1
      })
      .populate("group", { _id: 1, name: 1 })
    res.send(products);
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
      console.log("isNumber", isNumber);
      if (!isNumber) {
        // if text then search name
        const escapeRegExp = (string) => {
          return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        };
        const escapedQueryString = escapeRegExp(queryString);
        query = {
          // name: { $regex: new RegExp(".*" + queryString + ".*?", "i") },
          // name: { $regex: new RegExp(queryString, "i") },
          // name: { $regex: new RegExp(`\\b${queryString}\\b`, "i") },
          // name: { $regex: new RegExp(`.*${queryString}.*`, "i") },
          name: { $regex: new RegExp(`.*${escapedQueryString}.*`, "i") },
        };
        // query = { name:  queryString  };
      } else {
        // if number search in ean and article code
        query = {
          article_code: {
            $regex: RegExp("^" + queryString + ".*", "i"),
          },
        };
      }
      console.log(query);

      product = await Product.find(query)
        .select({
          _id: 1,
          name: 1,
          unit: 1,
          article_code: 1,
          photo: 1,
          tp: 1,
          mrp: 1,
          size: 1
        })
        .limit(100);
      res.status(200).json(product);
    } else {
      console.log("no query");

      // regular pagination
      query = {};

      product = await Product.find(query)
        .select({
          _id: 1,
          name: 1,
          unit: 1,
          article_code: 1,
          photo: 1,
          tp: 1,
          mrp: 1,
          size: 1
        })
        .limit(size)
        .skip(size * page);
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
          tp: 1,
          mrp: 1
        })
        .populate("priceList");

      res.send(products);
    } catch {
      res.status(500).json("Server side error");
    }
  })
);

// PRODUCTS SRARCH
router.get(
  "/search/inventory/:q",
  expressAsyncHandler(async (req, res) => {
    // let payload = req.query?.q?.trim().toString().toLocaleLowerCase();
    const payload = req.params?.q?.trim().toString().toLocaleLowerCase();
    // console.log(payload);

    const isNumber = /^\d/.test(payload);
    let query = {};
    if (!isNumber) {
      query = { name: { $regex: new RegExp("\\b" + payload + ".*?", "i") } };
    } else {
      query = {
        $or: [
          { article_code: { $regex: new RegExp("^" + payload + ".*", "i") } },
        ],
      };
    }

    const search = await Product.find(query)
      // TODO:: UPDATE AGREEGET FOR GET STOCK VALUE
      .select({
        _id: 1,
        name: 1,
        unit: 1,
        vat: 1,
        article_code: 1,
        tp: 1,
        mrp: 1,
        group: 1,
        discount: 1,
        generic: 1,
        brand: 1,
        size: 1,
        pcsBox: 1,
      })
      .populate("unit", "name")
      .populate("group", "name")
      .populate("generic", "name")
      .populate("brand", "name")
      .limit(10);
    if (payload === "") {
      res.send([]);
    } else {
      res.send(search);
    }
  })
);
// PRODUCTS SRARCH
router.get(
  "/search/new/:q",
  expressAsyncHandler(async (req, res) => {
    // let payload = req.query?.q?.trim().toString().toLocaleLowerCase();
    const payload = req.params?.q?.trim().toString().toLocaleLowerCase();
    // console.log(payload);

    const isNumber = /^\d/.test(payload);
    let query = {};
    if (!isNumber) {
      query = { name: { $regex: new RegExp("\\b" + payload + ".*?", "i") } };
    } else {
      query = {
        $or: [
          { article_code: { $regex: new RegExp("^" + payload + ".*", "i") } },
        ],
      };
    }

    const search = await Product.find(query)
      // TODO:: UPDATE AGREEGET FOR GET STOCK VALUE
      .select({
        _id: 1,
        name: 1,
        unit: 1,
        vat: 1,
        article_code: 1,
        tp: 1,
        mrp: 1,
        group: 1,
        discount: 1,
        brand: 1,
        size: 1,
        pcsBox: 1,
      })
      .populate("unit", "name")
      .populate("group", "name")
      .limit(10);
    if (payload === "") {
      res.send([]);
    } else {
      res.send(search);
    }
  })
);
router.get(
  "/search/nnew/test/:q",
  expressAsyncHandler(async (req, res) => {
    // let payload = req.query?.q?.trim().toString().toLocaleLowerCase();
    const payload = req.params?.q?.trim().toString().toLocaleLowerCase();
    console.log(payload);

    const isNumber = /^\d/.test(payload);
    let query = {};
    if (!isNumber) {
      query = { name: { $regex: new RegExp("\\b" + payload + ".*?", "i") } };
    } else {
      query = {
        $or: [
          { article_code: { $regex: new RegExp("^" + payload + ".*", "i") } },
        ],
      };
    }

    // const search = await Product.find(query)
    //   // TODO:: UPDATE AGREEGET FOR GET STOCK VALUE
    //   .select({
    //     _id: 1,
    //     name: 1,
    //     unit: 1,
    //     vat: 1,
    //     article_code: 1,
    //     tp: 1,
    //     mrp: 1,
    //     discount: 1,
    //     group: 1,
    //     brand: 1,
    //     size: 1,
    //     pcsBox: 1,
    //   })
    //   .populate("brand", "name")
    //   .populate("unit", "symbol")
    //   .populate("group", "name")
    //   .limit(10);
    // if (payload === "") {
    //   res.send([]);
    // } else {
    //   res.send(search);
    // }

    const search = await Product.aggregate([
      {
        $match: query,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          unit: 1,
          vat: 1,
          article_code: 1,
          tp: 1,
          mrp: 1,
          discount: 1,
          group: 1,
          brand: 1,
          size: 1,
          pcsBox: 1,
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $lookup: {
          from: "units",
          localField: "unit",
          foreignField: "_id",
          as: "unit",
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "group",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $addFields: {
          nameLength: { $strLenCP: "$name" },
        },
      },
      {
        $sort: {
          nameLength: 1, // -1 for descending, 1 for ascending
        },
      },
      {
        $limit: 10,
      },
    ]);
    if (payload === "") {
      res.send([]);
    } else {
      res.send(search);
    }
  })
);


router.get(
  "/search/:q",
  expressAsyncHandler(async (req, res) => {
    // let payload = req.query?.q?.trim().toString().toLocaleLowerCase();
    const payload = req.params?.q?.trim().toString().toLocaleLowerCase();
    // console.log(payload);

    const isNumber = /^\d/.test(payload);
    let query = {};
    if (!isNumber) {
      // query = { name: { $regex: new RegExp("\\b" + payload + ".*?", "i") } };
      query = { name: { $regex: new RegExp(payload, "i") } };
    } else {
      query = {
        $or: [
          { article_code: { $regex: new RegExp(payload, "i") } },
          // { article_code: { $regex: new RegExp("^" + payload + ".*", "i") } },
        ],
      };
    }

    const search = await Product.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $lookup: {
          from: "units",
          localField: "unit",
          foreignField: "_id",
          as: "unit",
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "group",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $lookup: {
          from: "inventories",
          localField: "article_code", // Convert to ObjectId
          foreignField: "article_code",
          as: "inventory",
        },
      },
      // {
      //   $unwind: '$products',
      // },
      {
        $project: {
          _id: 1,
          name: 1,
          unit: 1,
          vat: 1,
          article_code: 1,
          tp: 1,
          mrp: 1,
          discount: 1,
          group: 1,
          brand: 1,
          size: 1,
          pcsBox: 1,
          inventory: 1,
          stock: {
            $cond: {
              if: { $gt: [{ $size: "$inventory" }, 0] },
              then: { $arrayElemAt: ["$inventory.currentQty", 0] },
              else: 0
            }
          }

        },
      },
      {
        $addFields: {
          nameLength: { $strLenCP: "$name" },
        },
      },
      {
        $sort: {
          nameLength: 1, // -1 for descending, 1 for ascending
        },
      },
      {
        $limit: 10,
      },
    ]);

    // Access the results
    console.log(search);


    if (payload === "") {
      res.send([]);
    } else {
      res.send(search);
    }
  })
);
router.get(
  "/search/supplier/:q",
  expressAsyncHandler(async (req, res) => {
    // let payload = req.query?.q?.trim().toString().toLocaleLowerCase();
    const payload = req.params?.q?.trim().toString().toLocaleLowerCase();
    // console.log(payload);

    const isNumber = /^\d/.test(payload);
    let query = {};
    if (!isNumber) {
      // query = { name: { $regex: new RegExp("\\b" + payload + ".*?", "i") } };
      // query = { name: { $regex: new RegExp(payload, "i") } }; // previous search 
      // query = {
      //   name: { $regex: new RegExp(`\\b${queryString}\\b`, "i") },
      // };

      const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      };
      const escapedQueryString = escapeRegExp(payload);
      query = {
        // name: { $regex: new RegExp(".*" + queryString + ".*?", "i") },
        // name: { $regex: new RegExp(queryString, "i") },
        // name: { $regex: new RegExp(`\\b${queryString}\\b`, "i") },
        // name: { $regex: new RegExp(`.*${queryString}.*`, "i") },
        name: { $regex: new RegExp(`.*${escapedQueryString}.*`, "i") },
        // name: { $regex: new RegExp(`^${escapedQueryString}$`, "i") },
      };


    } else {
      query = {
        article_code: { $regex: new RegExp(payload, "i") },
        // { article_code: { $regex: new RegExp("^" + payload + ".*", "i") } },
      };
    }

    const search = await Product.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $lookup: {
          from: "units",
          localField: "unit",
          foreignField: "_id",
          as: "unit",
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "group",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $lookup: {
          from: "inventories",
          localField: "article_code", // Convert to ObjectId
          foreignField: "article_code",
          as: "inventory",
        },
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "article_code", // Convert to ObjectId
          foreignField: "products.article_code",
          as: "supplier",
        },
      },
      // {
      //   $unwind: '$products',
      // },
      {
        $project: {
          _id: 1,
          name: 1,
          unit: 1,
          vat: 1,
          article_code: 1,
          tp: 1,
          mrp: 1,
          discount: 1,
          group: 1,
          brand: 1,
          size: 1,
          pcsBox: 1,
          inventory: 1,
          // supplier: 1,
          stock: {
            $cond: {
              if: { $gt: [{ $size: "$inventory" }, 0] },
              then: { $arrayElemAt: ["$inventory.currentQty", 0] },
              else: 0
            }
          },
          supplierId: {
            $cond: {
              if: { $gt: [{ $size: "$supplier" }, 0] },
              then: { $arrayElemAt: ["$supplier._id", 0] },
              else: null
            }
          },
          supplierCompany: {
            $cond: {
              if: { $gt: [{ $size: "$supplier" }, 0] },
              then: { $arrayElemAt: ["$supplier.company", 0] },
              else: ""
            }
          },
          supplierName: {
            $cond: {
              if: { $gt: [{ $size: "$supplier" }, 0] },
              then: { $arrayElemAt: ["$supplier.name", 0] },
              else: ""
            }
          },
          supplierCode: {
            $cond: {
              if: { $gt: [{ $size: "$supplier" }, 0] },
              then: { $arrayElemAt: ["$supplier.code", 0] },
              else: ""
            }
          },
          supplierEmail: {
            $cond: {
              if: { $gt: [{ $size: "$supplier" }, 0] },
              then: { $arrayElemAt: ["$supplier.email", 0] },
              else: ""
            }
          },
          supplierPhone: {
            $cond: {
              if: { $gt: [{ $size: "$supplier" }, 0] },
              then: { $arrayElemAt: ["$supplier.phone", 0] },
              else: ""
            }
          },
          supplierAddress: {
            $cond: {
              if: { $gt: [{ $size: "$supplier" }, 0] },
              then: { $arrayElemAt: ["$supplier.address", 0] },
              else: ""
            }
          },
          // supplierId: {
          //   $arrayElemAt: ["$supplier._id", 0]
          // },
          // supplierCompany: {
          //   $arrayElemAt: ["$supplier.company", 0]
          // },
          // supplierName: {
          //   $arrayElemAt: ["$supplier.name", 0]
          // },

        },
      },
      {
        $addFields: {
          nameLength: { $strLenCP: "$name" },
        },
      },
      {
        $sort: {
          nameLength: 1, // -1 for descending, 1 for ascending
        },
      },
      {
        $limit: 10,
      },
    ]);

    // Access the results
    console.log(search);


    if (payload === "") {
      res.send([]);
    } else {
      res.send(search);
    }
  })
);

// GET ONE PRODUCT
router.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const products = await Product.find({ _id: id });
    // .populate("priceList", "mrp")
    res.send(products[0]);
  })
);
router.get(
  "/select/inventory/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findOne({ _id: id }).select({
      _id: 1,
      name: 1,
      unit: 1,
      vat: 1,
      article_code: 1,
      tp: 1,
      mrp: 1,
      discount: 1,
      brand: 1,
      group: 1,
      generic: 1,
      size: 1,
      pcsBox: 1,
    })
      .populate("brand", "name")
      .populate("group", "name")
      .populate("generic", "name")

    // .populate("priceList");
    res.send(product);
  })
);
router.get(
  "/select/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findOne({ _id: id }).select({
      _id: 1,
      name: 1,
      unit: 1,
      vat: 1,
      article_code: 1,
      tp: 1,
      mrp: 1,
      discount: 1,
      brand: 1,
      size: 1,
      pcsBox: 1,
    });
    // .populate("category", "name")

    // .populate("priceList");
    res.send(product);
  })
);

// GET ONE PRODUCT
// router.get(
//   "/details/:id",
//   expressAsyncHandler(async (req, res) => {
//     const id = req.params.id;
//     const product = await Product.findOne({ _id: id });
//     console.log("product", product)

//     res.send(product);
//   })
// );
// GET ONE PRODUCT
router.get(
  "/details/new/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    let search = []
    const product = await Product.findOne({ _id: id });
    console.log("product", product)
    const supplierP = await Supplier.aggregate([
      {
        $unwind: "$products"
      },
      {
        $match: { "products.article_code": product.article_code }
      },
      {
        $lookup: {
          from: "products",
          localField: "products.article_code", // Convert to ObjectId
          foreignField: "article_code",
          as: "productDetails",
        },
      },
    ])
    console.log("supplierP", supplierP)
    console.log("supplierP.length", supplierP.length)

    if (supplierP.length > 0) {
      search = await Supplier.aggregate([
        {
          $unwind: "$products"
        },
        {
          $match: { "products.article_code": product.article_code }
        },
        {
          $lookup: {
            from: "products",
            localField: "products.article_code", // Convert to ObjectId
            foreignField: "article_code",
            as: "productDetails",
          },
        },
        {
          $lookup: {
            from: "groups", // Assuming the collection name is "groups"
            localField: "productDetails.group",
            foreignField: "_id",
            as: "group",
          },
        },
        {
          $lookup: {
            from: "generics", // Assuming the collection name is "generics"
            localField: "productDetails.generic",
            foreignField: "_id",
            as: "generic",
          },
        },
        {
          $lookup: {
            from: "brands", // Assuming the collection name is "brands"
            localField: "productDetails.brand",
            foreignField: "_id",
            as: "brand",
          },
        },
        {
          $lookup: {
            from: "units", // Assuming the collection name is "brands"
            localField: "productDetails.unit",
            foreignField: "_id",
            as: "unit",
          },
        },
        {
          $lookup: {
            from: "inventories",
            localField: "products.article_code", // Convert to ObjectId
            foreignField: "article_code",
            as: "inventory",
          },
        },
        {
          $project: {
            _id: "$products.id",
            supplierId: "$_id",
            supplierCode: "$code",
            supplierCompany: "$company",
            supplierName: "$name",
            supplierEmail: "$email",
            supplierPhone: "$phone",
            supplierAddress: "$address",
            productId: "$products.id",
            article_code: "$products.article_code",
            name: "$products.name",

            // unit: "$products.unit",
            productDetails: 1,
            group: 1,
            generic: 1,
            brand: 1,
            unit: 1,
            tp: {
              $arrayElemAt: ["$productDetails.tp", 0]
            },
            mrp: {
              $arrayElemAt: ["$productDetails.mrp", 0]
            },
            pcsBox: {
              $arrayElemAt: ["$productDetails.pcsBox", 0]
            },
            size: {
              $arrayElemAt: ["$productDetails.size", 0]
            },
            // pGenericName: {
            //   $arrayElemAt: ["$productGeneric.name", 0]
            // },
            // pBrandName: {
            //   $arrayElemAt: ["$productBrand.name", 0]
            // },
            // pUnitName: {
            //   $arrayElemAt: ["$productUnit.name", 0]
            // },
            stock: {
              $cond: {
                if: { $gt: [{ $size: "$inventory" }, 0] },
                then: { $arrayElemAt: ["$inventory.currentQty", 0] },
                else: 0
              }
            }
            ,
            // "productGroup.name": 1,
            // "productDetails.group": 1,
            // "productDetails.generic": 1,
            // "productDetails.brand": 1,
            // "productDetails.brand.name": 1,
            inventory: 1
          }
        }

      ]);
    } else {
      search = await Product.aggregate([
        {
          $match: { article_code: product.article_code },
        },
        {
          $lookup: {
            from: "brands",
            localField: "brand",
            foreignField: "_id",
            as: "brand",
          },
        },
        {
          $lookup: {
            from: "units",
            localField: "unit",
            foreignField: "_id",
            as: "unit",
          },
        },
        {
          $lookup: {
            from: "groups",
            localField: "group",
            foreignField: "_id",
            as: "group",
          },
        },
        {
          $lookup: {
            from: "inventories",
            localField: "article_code",
            foreignField: "article_code",
            as: "inventory",
          },
        },
        {
          $addFields: {
            nameLength: { $strLenCP: "$name" },
          },
        },
        {
          $sort: {
            nameLength: 1, // -1 for descending, 1 for ascending
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            unit: 1,
            vat: 1,
            article_code: 1,
            tp: 1,
            mrp: 1,
            discount: 1,
            group: 1,
            brand: 1,
            size: 1,
            pcsBox: 1,
            inventory: 1,
            stock: {
              $cond: {
                if: { $gt: [{ $size: "$inventory" }, 0] },
                then: { $arrayElemAt: ["$inventory.currentQty", 0] },
                else: 0
              }
            }
            ,
            supplierId: null
          },
        },
        {
          $limit: 10,
        },
      ]);
    }

    console.log(search)
    res.send(search);
  })
);
router.get(
  "/all-details/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findOne({ _id: id })
      .populate("group", { name: 1 })
      .populate("generic", { name: 1 })
      .populate("brand", { name: 1 })
    res.send(product);
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
        tp: 1,
      })
      .populate("priceList", { mrp: 1, tp: 1, _id: 0 });
    res.send(products[0]);
  })
);

// CREATE ONE PRODUCT
router.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    console.log("product", req.body)
    const newProduct = new Product(req.body);
    console.log(newProduct)
    try {
      const result = await newProduct.save();
      // console.log(result);
      if (result) {
        res.status(200).json({
          product: result,
          message: "Purchase is created Successfully",
        });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: "There was a server side error", error: err });
    }

  })
);
// // CREATE ONE PRODUCT
// router.post(
//   "/",
//   expressAsyncHandler(async (req, res) => {
//     console.log("product", req.body)
//     const newProduct = new Product(req.body.product);
//     await newProduct.save(async (err, product) => {
//       if (err) {
//         res
//           .status(500)
//           .json({ error: err, message: "There was a server side error" });
//       } else {
//         console.log(product)
//         // let inventory = {
//         //   name: product.name,
//         //   article_code: product.article_code,
//         //   warehouse: "645c9297ed6d5d94af257be9",
//         //   currentQty: 0,
//         //   openingQty: 0,
//         //   totalQty: 0,
//         //   soldQty: 0,
//         //   damageQty: 0,
//         //   rtvQty: 0,
//         //   tpnQty: 0,
//         //   status: "active",
//         //   createdAt: new Date(Date.now()),
//         //   updatedAt: new Date(Date.now()),

//         // };
//         // const newInventory = new Inventory(inventory);
//         // const update = await newInventory.save()
//         res.status(200).json({
//           data: product?._id,
//           message: "Product is created Successfully",
//         });
//       }
//     });
//   })
// );

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

    try {
      await Product.updateOne({ _id: id }, { $set: update })
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
// UPDATE ONE PRODUCT pricelist
router.put(
  "/priceList/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = { priceList: req.body };
    console.log(id, update);
    try {
      await Product.updateOne({ _id: id }, { $set: update })
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
// UPDATE ONE PRODUCT pricelist
router.put(
  "/mrp/:id",
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const update = req.body.editedMrp;
    console.log("id", id);
    console.log("req.body", req.body);
    console.log("update", update);
    try {
      await Product.updateOne({ _id: id }, { $set: update })
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
  updateSupplierProducts,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    console.log("id", id);
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

module.exports = router;
