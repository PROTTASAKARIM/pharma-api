const Price = require("../models/priceModel");
const Product = require("../models/productModel");
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
                await newPrice.save(async (error) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        //    IF SAVE NEW PRICE

                        console.log("product", product.id)
                        console.log("price id", newPrice._id)
                        // console.log("rest", rest)

                        // const convertToString = String(product.id)
                        // console.log("convertToString", convertToString)
                        // console.log("productId", productId)
                        const previousProduct = await Product.find({ _id: product?.id })

                        console.log("Previous price List", previousProduct[0]?.priceList)
                        console.log("price id", newPrice?._id)
                        const updatedPriceList = [...previousProduct[0].priceList, newPrice._id]

                        console.log("Updated", updatedPriceList)
                        await Product.updateOne({ _id: product?.id }, { $set: { priceList: updatedPriceList } }, { upsert: true })
                            .then(res => {
                                console.log("res status", res)
                                resolve({ ...product, priceId: newPrice._id, newPrice: false })
                            })


                    }
                });
            });


        } // Data match and create new price


    }) //Loop END
    Promise.all(updatedProducts)
        .then(async result => {
            // console.log("result", result)
            // let productData = req.body.products;

            let newProductList;
            result.map(pro => {
                // console.log(pro)
                if (pro !== undefined) {
                    // GET ALL PRODUCTS WITHOUT THIS PRODUCT
                    // console.log("pro", pro)
                    // console.log("products", products)
                    const rest = products.filter((pro1) => pro1.id != pro.id)
                    // console.log("rest", rest)
                    products = [...rest, pro]

                }
            })

            // console.log("newProductList", products)
            // const matchProducts = products.map(async product => {

            // const previousProduct = await Product.find({ article_code: product.article_code })
            // console.log("matched priceList", previousProduct[0].priceList)
            req.body.products = products
            // console.log(req.body)
            next();
        })
        .catch(err => { console.log(err) })
}
module.exports = {
    handleNewPrice
};