const Price = require("../models/priceModel");
const handleNewPrice = async (req, res, next) => {
    // console.log("new Price", req.body)
    let grnData = req.body;
    // const products = grnData.products;
    console.log("grn products", grnData.products)
    try {
        grnData?.products?.map(async product => {
            // console.log("single products", product)
            // let price = {};
            if (product.newPrice === true) {
                const price = {
                    article_code: product.id,
                    supplier: grnData.supplier,
                    warehouse: grnData.warehouse,
                    // newPrice: false,
                    tp: product.tp,
                    mrp: product.mrp,
                    status: "active",
                };
                // console.log(price)
                // console.log(product.id)
                const newPrice = new Price(price)
                let savePrice = await newPrice.save();
                if (savePrice) {
                    // console.log("savePrice", savePrice)
                    const rest = grnData.products.filter((pro) => pro.article_code != product.article_code)
                    grnData = {
                        ...grnData,
                        products: [...rest,
                        {
                            ...product,
                            priceId: savePrice._id,
                            newPrice: false,
                        }]
                    }

                    // console.log("Loop", grnData)
                    // const newProductList = [...rest,
                    // {
                    //     ...product,
                    //     // tp: savePrice.tp ? Number(savePrice.tp) : savePrice.tp,
                    //     // mrp: savePrice.mrp ? Number(savePrice.mrp) : savePrice.tp,
                    //     priceId: savePrice._id,
                    //     newPrice: false,
                    // }]
                    // console.log("newProductList", newProductList)
                }

            }

        })
        req.body = { ...grnData };
        // console.log("grn body", req.body)
        // console.log("grn dATA", grnData)
        next()

    } catch (err) {
        console.log(err)
    } finally {
        console.log("grn dATA", req.body)
    }
}
module.exports = {
    handleNewPrice
};