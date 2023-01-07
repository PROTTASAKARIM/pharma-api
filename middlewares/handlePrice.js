// const { default: id } = require("date-fns/esm/locale/id/index.js");
const Price = require("../models/priceModel");
const handleNewPrice = async (req, res, next) => {
    // console.log("new Price", req.body)
    let grnData = req.body;
    let products = grnData.products;
    // let updatedProducts = []
    let upProducts = []
    let temp = false;
    // console.log("grn products", grnData.products)

    // LOOP
    const updatedProducts = products?.map(async product => {
        // CHECK PRODUCT PRICE
        if (product.newPrice === true) {
            const price = {
                article_code: product.id,
                supplier: grnData.supplier,
                warehouse: grnData.warehouse,
                newPrice: false,
                tp: product.tp,
                mrp: product.mrp,
                status: "active",
            };

            // NEW PRODUCT PRICE
            const newPrice = new Price(price)
            return new Promise(async (resolve, reject) => {
                await newPrice.save((error) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        //    IF SAVE NEW PRICE

                        // console.log("new price", newPrice)
                        // console.log("products", product)
                        // console.log("rest", rest)
                        resolve({ ...product, priceId: newPrice._id, newPrice: false })
                    }
                });
            });


        } // Data match and create new price


    }) //Loop END
    Promise.all(updatedProducts)
        .then(result => {
            console.log("result", result)
            // let productData = req.body.products;

            let newProductList;
            result.map(pro => {
                // console.log(pro)
                if (pro !== undefined) {
                    // GET ALL PRODUCTS WITHOUT THIS PRODUCT
                    console.log("pro", pro)
                    console.log("products", products)
                    const rest = products.filter((pro1) => pro1.id != pro.id)
                    console.log("rest", rest)
                    products = [...rest, pro]

                }
            })

            console.log("newProductList", products)
            req.body.products = products
            console.log(req.body)
            next();
        })
        .catch(err => { console.log(err) })
}
module.exports = {
    handleNewPrice
};