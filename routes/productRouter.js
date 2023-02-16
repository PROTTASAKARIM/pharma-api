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
    });
    res.status(200).json(products);
  })
);
router.get(
  "/test",
  expressAsyncHandler(async (req, res) => {
    const products = await Product.find({
      article_code: ['5310188',
        '5310189',
        '5310190',
        '5310191',
        '5310192',
        '5310193',
        '5310194',
        '5310195',
        '5310196',
        '5310197',
        '5310198',
        '5310199',
        '5310200',
        '5310201',
        '5310202',
        '5310203',
        '5610308',
        '5610309',
        '5610310',
        '5610311',
        '5610312',
        '5610313',
        '5610314',
        '5610315',
        '5610316',
        '5610317',
        '5610318',
        '5610319',
        '5610320',
        '5610321',
        '5610322',
        '5610323',
        '5610324',
        '5610325',
        '5610326',
        '5610327',
        '5610328',
        '5610329',
        '6011206',
        '6011207',
        '6011208',
        '6011209',
        '6011210',
        '6011211',
        '6011212',
        '6011213',
        '6011214',
        '6011215',
        '6011216',
        '6011217',
        '6011218',
        '6011219',
        '6011220',
        '6011221',
        '6011222',
        '6011223',
        '6011224',
        '6011225',
        '6011226',
        '6011227',
        '6011228',
        '6011229',
        '6011230',
        '6011231',
        '6011232',
        '6011233',
        '6011234',
        '6011235',
        '6011236',
        '6011237',
        '6011238',
        '6011239',
        '6011240',
        '6011241',
        '6011242',
        '6011243',
        '6011244',
        '6011245',
        '6011246',
        '6011247',
        '6011248',
        '6011249',
        '6011250',
        '6011251',
        '6011252',
        '6011253',
        '6011254',
        '6011255',
        '6011256',
        '6011257',
        '6011258',
        '6011259',
        '6011260',
        '6011261',
        '6011262',
        '6011263',
        '6011264',
        '6011265',
        '6011266',
        '6011267',
        '6011268',
        '6011269',
        '6011270',
        '6011271',
        '6011272',
        '6011273',
        '6011274',
        '6011275',
        '6011276',
        '6011277',
        '6011278',
        '6011279',
        '6011280',
        '6011281',
        '6011282',
        '6011283',
        '6011284',
        '6011285',
        '6011286',
        '6011287',
        '6011288',
        '6011289',
        '6011290',
        '6011291',
        '6011292',
        '6011293',
        '6011294',
        '6011295',
        '6011296',
        '6011297',
        '6011298',
        '6011299',
        '6011300',
        '6011301',
        '6011302',
        '6011303',
        '6011304',
        '6011305',
        '6011306',
        '6011307',
        '6011308',
        '6011309',
        '6011310',
        '6011311',
        '6011312',
        '6011313',
        '6011314',
        '6011315',
        '6011316',
        '6011317',
        '6011318',
        '6011319',
        '6011320',
        '6011321',
        '6011322',
        '6011323',
        '6011324',
        '6011325',
        '6011326',
        '6011327',
        '6011328',
        '6011329',
        '6011330',
        '6011331',
        '6011332',
        '6011333',
        '6011334',
        '6011335',
        '6011336',
        '6011337',
        '6012089',
        '6012090',
        '5812091',
        '5812092',
        '5812093',
        '6012094',
        '6012095',
        '6012096',
        '6012097',
        '6012098',
        '6012099',
        '6012100',
        '5612101',
        '5612102',
        '5612103',
        '5612104',
        '6312105',
        '6312106',
        '6014683',
        '6014684',
        '5814685',
        '6314850',
        '5314851',
        '5614852',
        '6014853',
        '5314890',
        '6014891',
        '6014892',
        '6014893',
        '6014894',
        '6014895',
        '6014896',
        '6014897',
        '6014898',
        '5614937',
        '6014938',
        '6014939',
        '6014940',
        '5614941',
        '6015236',
        '6015237',
        '6015238',
        '6015239',
        '6015240',
        '5615216',
        '6015323',
        '6015324',
        '6015453',
        '6015454',
        '6015455',
        '6015456',
        '6015531',
        '6015532',
        '6015533',
        '6015534',
        '6015535',
        '6015536',
        '6015537',
        '6015538',
        '6015742',
        '6015743',
        '6015744',
        '6015745',
        '6015746',
        '6015747',
        '6015748',
        '6015749',
        '6015750',
        '6015751',
        '6015752',
        '6015948',
        '6015949',
        '6015950',
        '5815951',
        '6015952',
        '6015953',
        '6015954',
        '6015955',
        '6015956',
        '6015957',
        '6015958',
        '6015959',
        '6015960',
        '6016128',
        '6016138',
        '6016139',
        '6016140',
        '6016141',
        '6016142',
        '6016143',
        '6016583',
        '6016584',
        '6017012',
        '6017015',
        '6017016',
        '5317022',
        '6017023',
        '6017024',
        '6017025',
        '6017026',
        '6017027',
        '6017028',
        '6017059',
        '6017067',
        '6017068',
        '6017069',
        '6017071',
        '6017072',
        '6017073',
        '6017247',
        '6017248',
        '5317250',
        '6317881',
        '6018584'
      ]
    }).select({
      _id: 1,
      name: 1,
      article_code: 1,
      unit: 1,
    });
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

    const appRoot = process.env.PWD;
    // const appRoot = process.cwd();
    //  console.log("p", PWD)
    console.log("env", process.env)
    // console.log("p", PWD)
    console.log("approot", appRoot)
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
