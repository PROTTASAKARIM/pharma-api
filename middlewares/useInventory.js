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
                    console.log("priceid", priceId)
                    console.log("pricetable", success.priceTable)
                    // const prices = success.priceTable
                    // const prices = success.priceTable[0].get('id')
                    // prices.forEach((value, key) => {
                    //     console.log(`${key}: ${value}`);
                    // });
                    // console.log("Prices", prices)
                    // console.log("Prices-id", prices.get('id'))
                    // console.log("prices", prices)

                    const checked = success.priceTable.filter((p) => p.get('id') === priceId);
                    const rest = success.priceTable.filter((p) => p.get('id') !== priceId);

                    console.log("checked", checked[0])
                    console.log("checkedid", checked[0].get('id'))
                    console.log("rest", rest)
                    if (checked?.length > 0) {
                        console.log(checked, "exist", qty, Number(checked[0].get('currentQty')));

                        inventory = {
                            // ...success,
                            priceTable: [
                                // ...rest,
                                {
                                    // ...checked[0],
                                    currentQty: Number(checked[0].get('currentQty')) - Number(qty),
                                    damageQty: Number(checked[0].get('damageQty')) + Number(qty),
                                    // ...checked,
                                    // currentQty: Number(checked.currentQty) - Number(qty),
                                    // damageQty: Number(checked.damageQty) + Number(qty),
                                },
                            ],
                            currentQty: Number(success.currentQty) - Number(qty),
                            damageQty: Number(success.damageQty) + Number(qty),
                        };
                        console.log("inventory", inventory)

                    } else {

                    }

                } else {
                    inventory = {
                        article_code: article_code,
                        name: name,
                        warehouse: "62b5b575b4facb87eef3b47c",
                        priceTable: [
                            ...success.priceTable,
                            {
                                id: priceId,
                                openingQty: -Number(qty),
                                currentQty: -Number(qty),
                                totalQty: -Number(qty),
                                soldQty: 0,
                                damageQty: Number(qty),
                                rtvQty: 0,
                            },
                        ],
                        openingQty: -Number(qty),
                        currentQty: -Number(qty),
                        totalQty: -Number(qty),
                        soldQty: 0,
                        damageQty: Number(qty),
                        rtvQty: 0,
                        status: "active",
                    };

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
