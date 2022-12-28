const { parseISO, format, startOfDay, endOfDay } = require("date-fns");
// const { parseISO } = require("date-fns/esm");
const Damage = require("../models/damageModel");
const Inventory = require("../models/inventoryModel");
const Sale = require("../models/saleModel");

// Generate Damage In -> inventory Out
const updateInventoryOutOnDamageIn = async (req, res, next) => {
    // TODO:: todays total

    // const todayTotal = await Damage.countDocuments({
    //     createdAt: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
    // });
    const products = await req.body.products;

    // console.log("inventory Products", products);

    if (products.length > 0) {
        products.map(async (product) => {
            // console.log("single product", product);
            const { article_code, qty, priceId, name } = product;
            console.log(article_code);
            let inventory = {};
            const success = await Inventory.findOne({ article_code: article_code });

            if (success) {
                console.log("success", success);
                // res.send(success)
                console.log("PriceTable", success.priceTable);

                if (success.priceTable.length > 0) {
                    console.log("priceid", priceId);
                    console.log("pricetable", success.priceTable);
                    // const prices = success.priceTable
                    // const prices = success.priceTable[0].get('id')
                    // prices.forEach((value, key) => {
                    //     console.log(`${key}: ${value}`);
                    // });
                    // console.log("Prices", prices)
                    // console.log("Prices-id", prices.get('id'))
                    // console.log("prices", prices)

                    const checked = success.priceTable.filter(
                        (p) => p.get("id") === priceId
                    );
                    const rest = success.priceTable.filter(
                        (p) => p.get("id") !== priceId
                    );

                    //   console.log("checked", qty);
                    console.log("checked", checked[0]);
                    // console.log("checkedid", checked[0].get("id"));
                    console.log("rest", rest);
                    if (checked?.length > 0) {
                        console.log(
                            checked,
                            "exist",
                            qty,
                            Number(checked[0].get("currentQty"))
                        );

                        // const d = new Date.parse(success.createdAt);
                        console.log("date", success.createdAt)


                        inventory = {
                            name: success.name,
                            article_code: success.article_code,
                            warehouse: "62b5b575b4facb87eef3b47c",
                            currentQty: Number(success.currentQty) - Number(qty),
                            openingQty: success.openingQty,
                            totalQty: success.totalQty,
                            soldQty: success.soldQty,
                            damageQty: Number(success.damageQty) + Number(qty),
                            rtvQty: success.rtvQty,
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: checked[0].get("id"),
                                    currentQty: checked[0].get("currentQty") ? Number(checked[0].get("currentQty")) - Number(qty) : 0,
                                    openingQty: checked[0].get("openingQty") ? checked[0].get("openingQty") : 0,
                                    totalQty: checked[0].get("totalQty") ? checked[0].get("totalQty") : 0,
                                    soldQty: checked[0].get("soldQty") ? checked[0].get("soldQty") : 0,
                                    damageQty: checked[0].get("damageQty") ? Number(checked[0].get("damageQty")) + Number(qty) : 0 + Number(qty),
                                    rtvQty: checked[0].get("rtvQty") ? checked[0].get("rtvQty") : 0,

                                }
                            ]

                        }
                        console.log("inventory", inventory);
                    } else {
                        inventory = {
                            name: success.name,
                            article_code: success.article_code,
                            warehouse: "62b5b575b4facb87eef3b47c",
                            currentQty: Number(success.currentQty) - Number(qty),
                            openingQty: success.openingQty,
                            totalQty: success.totalQty,
                            soldQty: success.soldQty,
                            damageQty: Number(success.damageQty) + Number(qty),
                            rtvQty: success.rtvQty,
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: priceId,
                                    currentQty: -Number(qty),
                                    openingQty: -Number(qty),
                                    totalQty: -Number(qty),
                                    soldQty: 0,
                                    damageQty: 0 + Number(qty),
                                    rtvQty: 0,

                                }
                            ]

                        }
                        console.log("inventory", inventory);
                    }
                } else {
                    inventory = {
                        name: success.name,
                        article_code: success.article_code,
                        warehouse: "62b5b575b4facb87eef3b47c",
                        currentQty: -Number(qty),
                        openingQty: -Number(qty),
                        totalQty: -Number(qty),
                        soldQty: 0,
                        damageQty: Number(qty),
                        rtvQty: 0,
                        status: success.status,
                        createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                        updatedAt: new Date(Date.parse(success.updatedAt)),
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

                    };
                }
            }
            res.send(inventory)
            console.log("inventory final", inventory);
        });
    } else {
        return;
    }
};

// Generate Damage Out -> inventory In
// const updateInventoryOutOnDamageIn = async (req, res, next) => {
//     const products = req.body.products;
//     console.log("products", products);
//     // TODO::
//     // CHeck Inventory
//     // check Price ID
//     // Modify
//     // Update the Inventory

//     console.log("update inventory");

//     if (products.length > 0) {
//         // MAP through products
//         products.map(async (pro) => {
//             // init inventory data
//             let inventory = {};
//             //   get inventory data
//             const invData = await Inventory.findOne({
//                 article_code: pro.article_code,
//             });

//             if (invData) {
//                 console.log("price", invData);

//                 // res.send(invData);

//                 const priceTable = invData.priceTable;
//                 if (priceTable.length > 0) {
//                     console.log(priceTable[0].get("id"));
//                     //   priceTable.map((p) => console.log(JSON.parse(p)));
//                 }
//             }
//         });
//     }

//     next();
// };

module.exports = {
    updateInventoryOutOnDamageIn,
};
