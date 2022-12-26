const { format, startOfDay, endOfDay } = require("date-fns");
const Damage = require("../models/damageModel");
const Inventory = require("../models/inventoryModel");


// Generate Damage Id
const updateInventoryOutOnDamageIn = async (req, res, next) => {
    // TODO:: todays total

    // const todayTotal = await Damage.countDocuments({
    //     createdAt: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
    // });
    const products = await req.body.products;
    console.log("inventory Products", products);
    if (products.length > 0) {

        products.map(async product => {
            console.log("single product", product)
            const { article_code, qty, priceId, name } = product;
            console.log(article_code);
            let inventory = {};
            const success = await Inventory.findOne({ article_code: article_code })

            if (success) {
                console.log("success", success)
                console.log("PriceTable", success.priceTable)

                if (success.priceTable.length > 0) {

                } else {
                    const newPrice = {
                        id: priceId,
                        openingQty: -Number(qty),
                        currentQty: -Number(qty),
                        totalQty: -Number(qty),
                        soldQty: 0,
                        damageQty: Number(qty),
                        rtvQty: 0,
                    }
                    const priceTableNew = success.priceTable.push(newPrice)
                    inventory = {
                        article_code: article_code,
                        name: name,
                        warehouse: "62b5b575b4facb87eef3b47c",
                        priceTable: priceTableNew,
                        openingQty: -Number(qty),
                        currentQty: -Number(qty),
                        totalQty: -Number(qty),
                        soldQty: 0,
                        damageQty: Number(qty),
                        rtvQty: 0,
                        status: "active",
                    }
                    console.log("new price inventory", inventory)

                }
            }


        })

    } else {
        return
    }



};

module.exports = {
    updateInventoryOutOnDamageIn,
};
