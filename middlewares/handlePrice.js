const Price = require("../models/priceModel");
// const handleNewPrice = async (req, res, next) => {
//     // console.log("new Price", req.body)
//     let grnData = req.body;
//     let products = grnData.products;
//     let updatedProducts = []
//     let upProducts = []
//     let temp = false;
//     // console.log("grn products", grnData.products)

//     products?.map(async product => {
//         // console.log("single products", product)
//         // let price = {};
//         if (product.newPrice === true) {
//             const price = {
//                 article_code: product.id,
//                 supplier: grnData.supplier,
//                 warehouse: grnData.warehouse,
//                 // newPrice: false,
//                 tp: product.tp,
//                 mrp: product.mrp,
//                 status: "active",
//             };
//             // console.log(price)
//             // console.log(product.id)
//             const newPrice = new Price(price)
//             let savePrice = await newPrice.save();
//             if (savePrice) {
//                 // console.log("savePrice", savePrice)
//                 const rest = products.filter((pro) => pro.article_code != product.article_code)

//                 // console.log("rest", rest)

//                 upProducts = [...rest,
//                 {
//                     ...product,
//                     priceId: savePrice._id,
//                     newPrice: false,
//                 }]
//                 // console.log("newProductList", products)
//                 updatedProducts = [...products];
//                 if (updatedProducts.length > 0) {
//                     temp = true
//                 }

//                 console.log("updated", updatedProducts)
//                 // req.body.products = products;
//             }

//         } // Data match and create new price

//     }) //Loop END

//     if (temp) {
//         req.body.newProducts = updatedProducts;
//         next()
//     }

//     // console.log("grn dATA", req.body)

// }

function handleNewPrice(req, res, next) {
  const updatedArray = req.body.products.map((obj) => {
    if (obj.newPrice === true) {
      // create new price ofject
      const price = {
        article_code: obj.id,
        supplier: req.body.supplier,
        warehouse: req.body.warehouse,
        newPrice: false,
        tp: obj.tp,
        mrp: obj.mrp,
        status: "active",
      };
      const newEntry = new Price(price);
      return new Promise((resolve, reject) => {
        newEntry.save((error) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            // update the object with the new entry
            console.log(newEntry);
            resolve({ ...obj, newEntry });
          }
        });
      });
    }
  });

  Promise.all(updatedArray)
    .then((results) => {
      req.body.products = results;
      //   next();
      console.log(req.body);
    })
    .catch((error) => {
      // handle the error
      console.log(error);
    });
}

module.exports = {
  handleNewPrice,
};
