const { parseISO, format, startOfDay, endOfDay } = require("date-fns");
// const { parseISO } = require("date-fns/esm");
const Damage = require("../models/damageModel");
const Inventory = require("../models/inventoryModel");

// Generate Damage In -> inventory Out
const updateInventoryOutOnDamageIn = async (req, res, next) => {
    // TODO:: todays total

    // const todayTotal = await Damage.countDocuments({
    //     createdAt: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
    // });
    const products = await req.body.products;

    // console.log("inventory Products", products);

    try {
        if (products.length > 0) {
            products.map(async (product) => {
                // console.log("single product", product);
                const { id, article_code, qty, priceId, name } = product;
                // console.log(article_code);
                let inventory = {};
                const success = await Inventory.findOne({ article_code: article_code });

                if (success) {
                    // console.log("success", success);
                    // res.send(success)
                    // console.log("PriceTable", success.priceTable);

                    if (success.priceTable.length > 0) {
                        // console.log("priceid", priceId);
                        // console.log("pricetable", success.priceTable);
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
                        // console.log("checked", checked[0]);
                        // console.log("checkedid", checked[0].get("id"));
                        // console.log("rest", rest);
                        if (checked?.length > 0) {
                            // console.log(
                            //     checked,
                            //     "exist",
                            //     qty,
                            //     Number(checked[0].get("currentQty"))
                            // );

                            // const d = new Date.parse(success.createdAt);
                            // console.log("date", success.createdAt)


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
                                        openingQty: checked[0].get("openingQty") ? checked[0].get("openingQty") - Number(qty) : 0 - Number(qty),
                                        totalQty: checked[0].get("totalQty") ? checked[0].get("totalQty") - Number(qty) : 0 - Number(qty),
                                        soldQty: checked[0].get("soldQty") ? checked[0].get("soldQty") : 0,
                                        damageQty: checked[0].get("damageQty") ? Number(checked[0].get("damageQty")) + Number(qty) : 0 + Number(qty),
                                        rtvQty: checked[0].get("rtvQty") ? checked[0].get("rtvQty") : 0,

                                    }
                                ]

                            }
                            // console.log("inventory", inventory);
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
                            // console.log("inventory", inventory);
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
                } else {
                    inventory = {
                        name: name,
                        article_code: article_code,
                        warehouse: "62b5b575b4facb87eef3b47c",
                        currentQty: -Number(qty),
                        openingQty: -Number(qty),
                        totalQty: -Number(qty),
                        soldQty: 0,
                        damageQty: Number(qty),
                        rtvQty: 0,
                        status: "active",
                        createdAt: new Date(Date.now()),
                        updatedAt: new Date(Date.now()),
                        priceTable: [

                            {
                                id: priceId,
                                openingQty: - Number(qty),
                                currentQty: -Number(qty),
                                totalQty: -Number(qty),
                                soldQty: 0,
                                damageQty: Number(qty),
                                rtvQty: 0,
                            },
                        ],

                    };
                }
                // res.send(inventory)
                // console.log("id", id)
                console.log("inventory final", inventory);
                const update = await Inventory.updateOne({ article_code: article_code }, { $set: inventory })
                if (update) {
                    console.log("update", update)
                }
            });
        } else {
            return;
        }
    } catch (err) {
        console.log(err)
    }
    finally {
        next()
    }

};
// Generate Damage out -> inventory in
const updateInventoryInOnDamageOut = async (req, res, next) => {
    // TODO:: todays total

    // const todayTotal = await Damage.countDocuments({
    //     createdAt: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
    // });
    const id = req.params.id;
    console.log("damage delete", id)
    const damageData = await Damage.find({ _id: id })
    console.log("damage Data", damageData)
    const products = damageData[0].products;
    console.log("inventory Products", products);

    try {
        if (products.length > 0) {
            products.map(async (product) => {
                console.log("single product", product);
                const id = product.get("id");
                const name = product.get("name");
                const article_code = product.get("article_code");
                const qty = product.get("qty")
                const order = product.get("order");
                const priceId = product.get("priceId");
                const reason = product.get("reason")
                const tp = product.get("tp")

                const newProduct = {
                    id: id,
                    name: name,
                    article_code: article_code,
                    qty: qty,
                    order: order,
                    priceId: priceId,
                    reason: reason,
                    tp: tp,
                }

                // const { id, article_code, qty, priceId, name } = product;
                console.log(article_code);
                let inventory = {};
                const success = await Inventory.findOne({ article_code: article_code });

                if (success) {
                    // console.log("success", success);
                    // res.send(success)
                    // console.log("PriceTable", success.priceTable);

                    if (success.priceTable.length > 0) {
                        // console.log("priceid", priceId);
                        // console.log("pricetable", success.priceTable);
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
                        // console.log("checked", checked[0]);
                        // console.log("checkedid", checked[0].get("id"));
                        // console.log("rest", rest);
                        if (checked?.length > 0) {
                            // console.log(
                            //     checked,
                            //     "exist",
                            //     qty,
                            //     Number(checked[0].get("currentQty"))
                            // );

                            // const d = new Date.parse(success.createdAt);
                            // console.log("date", success.createdAt)


                            inventory = {
                                name: success.name,
                                article_code: success.article_code,
                                warehouse: "62b5b575b4facb87eef3b47c",
                                currentQty: Number(success.currentQty) + Number(qty),
                                openingQty: success.openingQty,
                                totalQty: success.totalQty,
                                soldQty: success.soldQty,
                                damageQty: Number(success.damageQty) - Number(qty),
                                rtvQty: success.rtvQty,
                                status: success.status,
                                createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                                updatedAt: new Date(Date.parse(success.updatedAt)),
                                priceTable: [
                                    ...rest,
                                    {
                                        id: checked[0].get("id"),
                                        currentQty: checked[0].get("currentQty") ? Number(checked[0].get("currentQty")) + Number(qty) : 0,
                                        openingQty: checked[0].get("openingQty") ? checked[0].get("openingQty") + Number(qty) : 0 + Number(qty),
                                        totalQty: checked[0].get("totalQty") ? checked[0].get("totalQty") + Number(qty) : 0 + Number(qty),
                                        soldQty: checked[0].get("soldQty") ? checked[0].get("soldQty") : 0,
                                        damageQty: checked[0].get("damageQty") ? Number(checked[0].get("damageQty")) - Number(qty) : 0 - Number(qty),
                                        rtvQty: checked[0].get("rtvQty") ? checked[0].get("rtvQty") : 0,

                                    }
                                ]

                            }
                            // console.log("inventory", inventory);
                        } else {
                            inventory = {
                                name: success.name,
                                article_code: success.article_code,
                                warehouse: "62b5b575b4facb87eef3b47c",
                                currentQty: Number(success.currentQty) + Number(qty),
                                openingQty: success.openingQty,
                                totalQty: success.totalQty,
                                soldQty: success.soldQty,
                                damageQty: Number(success.damageQty) - Number(qty),
                                rtvQty: success.rtvQty,
                                status: success.status,
                                createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                                updatedAt: new Date(Date.parse(success.updatedAt)),
                                priceTable: [
                                    ...rest,
                                    {
                                        id: priceId,
                                        currentQty: Number(qty),
                                        openingQty: Number(qty),
                                        totalQty: Number(qty),
                                        soldQty: 0,
                                        damageQty: 0 - Number(qty),
                                        rtvQty: 0,

                                    }
                                ]

                            }
                            // console.log("inventory", inventory);
                        }
                    } else {
                        inventory = {
                            name: success.name,
                            article_code: success.article_code,
                            warehouse: "62b5b575b4facb87eef3b47c",
                            currentQty: Number(qty),
                            openingQty: Number(qty),
                            totalQty: Number(qty),
                            soldQty: 0,
                            damageQty: -Number(qty),
                            rtvQty: 0,
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...success.priceTable,
                                {
                                    id: priceId,
                                    openingQty: Number(qty),
                                    currentQty: Number(qty),
                                    totalQty: Number(qty),
                                    soldQty: 0,
                                    damageQty: -Number(qty),
                                    rtvQty: 0,
                                },
                            ],

                        };
                    }
                } else {
                    inventory = {
                        name: name,
                        article_code: article_code,
                        warehouse: "62b5b575b4facb87eef3b47c",
                        currentQty: Number(qty),
                        openingQty: Number(qty),
                        totalQty: Number(qty),
                        soldQty: 0,
                        damageQty: -Number(qty),
                        rtvQty: 0,
                        status: "active",
                        createdAt: new Date(Date.now()),
                        updatedAt: new Date(Date.now()),
                        priceTable: [

                            {
                                id: priceId,
                                openingQty: Number(qty),
                                currentQty: Number(qty),
                                totalQty: Number(qty),
                                soldQty: 0,
                                damageQty: -Number(qty),
                                rtvQty: 0,
                            },
                        ],

                    };
                }
                // res.send(inventory)
                // console.log("id", id)
                console.log("inventory final", inventory);
                const update = await Inventory.updateOne({ article_code: article_code }, { $set: inventory })
                if (update) {
                    console.log("update", update)
                }
            });
        } else {
            return;
        }
    } catch (err) {
        console.log(err)
    }
    finally {
        next()
    }
};

// Generate Rtv In -> inventory Out
const updateInventoryOutOnRTVIn = async (req, res, next) => {
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
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty + Number(qty),
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: checked[0].get("id"),
                                    currentQty: checked[0].get("currentQty") ? Number(checked[0].get("currentQty")) - Number(qty) : 0 - Number(qty),
                                    openingQty: checked[0].get("openingQty") ? checked[0].get("openingQty") - Number(qty) : 0 - Number(qty),
                                    totalQty: checked[0].get("totalQty") ? checked[0].get("totalQty") - Number(qty) : 0 - Number(qty),
                                    soldQty: checked[0].get("soldQty") ? checked[0].get("soldQty") : 0,
                                    damageQty: checked[0].get("damageQty") ? Number(checked[0].get("damageQty")) : 0,
                                    rtvQty: checked[0].get("rtvQty") ? checked[0].get("rtvQty") + Number(qty) : 0 + Number(qty),

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
                            totalQty: success.totalQty - Number(qty),
                            soldQty: success.soldQty,
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty + Number(qty),
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
                                    damageQty: 0,
                                    rtvQty: 0 + Number(qty),

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
                        damageQty: 0,
                        rtvQty: Number(qty),
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
                                damageQty: 0,
                                rtvQty: Number(qty),
                            },
                        ],

                    };
                }
            } else {
                inventory = {
                    name: name,
                    article_code: article_code,
                    warehouse: "62b5b575b4facb87eef3b47c",
                    currentQty: -Number(qty),
                    openingQty: -Number(qty),
                    totalQty: -Number(qty),
                    soldQty: 0,
                    damageQty: 0,
                    rtvQty: Number(qty),
                    status: "active",
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                    priceTable: [

                        {
                            id: priceId,
                            openingQty: -Number(qty),
                            currentQty: -Number(qty),
                            totalQty: -Number(qty),
                            soldQty: 0,
                            damageQty: 0,
                            rtvQty: Number(qty),
                        },
                    ],

                };
            }
            // res.send(inventory)
            Inventory.updateOne({ _id: _id }, { $set: inventory })
            console.log("inventory final", inventory);
        });
    } else {
        return;
    }
};
// Generate Rtv out -> inventory in
const updateInventoryINOnRTVOut = async (req, res, next) => {
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
                            currentQty: Number(success.currentQty)
                                + Number(qty),
                            openingQty: success.openingQty,
                            totalQty: success.totalQty,
                            soldQty: success.soldQty,
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty - Number(qty),
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: checked[0].get("id"),
                                    currentQty: checked[0].get("currentQty") ? Number(checked[0].get("currentQty")) + Number(qty) : 0 + Number(qty),
                                    openingQty: checked[0].get("openingQty") ? checked[0].get("openingQty") + Number(qty) : 0 + Number(qty),
                                    totalQty: checked[0].get("totalQty") ? checked[0].get("totalQty") + Number(qty) : 0 + Number(qty),
                                    soldQty: checked[0].get("soldQty") ? checked[0].get("soldQty") : 0,
                                    damageQty: checked[0].get("damageQty") ? Number(checked[0].get("damageQty")) : 0,
                                    rtvQty: checked[0].get("rtvQty") ? checked[0].get("rtvQty") - Number(qty) : 0 - Number(qty),

                                }
                            ]

                        }
                        console.log("inventory", inventory);
                    } else {
                        inventory = {
                            name: success.name,
                            article_code: success.article_code,
                            warehouse: "62b5b575b4facb87eef3b47c",
                            currentQty: Number(success.currentQty) + Number(qty),
                            openingQty: success.openingQty,
                            totalQty: success.totalQty + Number(qty),
                            soldQty: success.soldQty,
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty - Number(qty),
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: priceId,
                                    currentQty: Number(qty),
                                    openingQty: Number(qty),
                                    totalQty: Number(qty),
                                    soldQty: 0,
                                    damageQty: 0,
                                    rtvQty: 0 - Number(qty),

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
                        currentQty: Number(qty),
                        openingQty: Number(qty),
                        totalQty: Number(qty),
                        soldQty: 0,
                        damageQty: 0,
                        rtvQty: -Number(qty),
                        status: success.status,
                        createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                        updatedAt: new Date(Date.parse(success.updatedAt)),
                        priceTable: [
                            ...success.priceTable,
                            {
                                id: priceId,
                                openingQty: Number(qty),
                                currentQty: Number(qty),
                                totalQty: Number(qty),
                                soldQty: 0,
                                damageQty: 0,
                                rtvQty: -Number(qty),
                            },
                        ],

                    };
                }
            } else {
                inventory = {
                    name: name,
                    article_code: article_code,
                    warehouse: "62b5b575b4facb87eef3b47c",
                    currentQty: Number(qty),
                    openingQty: Number(qty),
                    totalQty: Number(qty),
                    soldQty: 0,
                    damageQty: 0,
                    rtvQty: -Number(qty),
                    status: "active",
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                    priceTable: [

                        {
                            id: priceId,
                            openingQty: Number(qty),
                            currentQty: Number(qty),
                            totalQty: Number(qty),
                            soldQty: 0,
                            damageQty: 0,
                            rtvQty: -Number(qty),
                        },
                    ],

                };
            }
            // res.send(inventory)
            Inventory.updateOne({ _id: _id }, { $set: inventory })
            console.log("inventory final", inventory);
        });
    } else {
        return;
    }
};


// Generate Sale Del -> inventory in
const updateInventoryInOnSaleDel = async (req, res, next) => {
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
                            currentQty: Number(success.currentQty) + Number(qty),
                            openingQty: success.openingQty,
                            totalQty: success.totalQty,
                            soldQty: success.soldQty - Number(qty),
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty,
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: checked[0].get("id"),
                                    currentQty: checked[0].get("currentQty") ? Number(checked[0].get("currentQty")) + Number(qty) : 0 + Number(qty),
                                    openingQty: checked[0].get("openingQty") ? checked[0].get("openingQty") : 0,
                                    totalQty: checked[0].get("totalQty") ? checked[0].get("totalQty") : 0,
                                    soldQty: checked[0].get("soldQty") ? checked[0].get("soldQty") - Number(qty) : 0 - Number(qty),
                                    damageQty: checked[0].get("damageQty") ? Number(checked[0].get("damageQty")) : 0,
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
                            currentQty: Number(success.currentQty) + Number(qty),
                            openingQty: success.openingQty,
                            totalQty: success.totalQty,
                            soldQty: success.soldQty - Number(qty),
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty,
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: priceId,
                                    currentQty: Number(qty),
                                    openingQty: Number(qty),
                                    totalQty: Number(qty),
                                    soldQty: 0 - Number(qty),
                                    damageQty: 0,
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
                        currentQty: Number(success.currentQty) + Number(qty),
                        openingQty: success.openingQty,
                        totalQty: success.totalQty,
                        soldQty: success.soldQty - Number(qty),

                        damageQty: 0,
                        rtvQty: Number(qty),
                        status: success.status,
                        createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                        updatedAt: new Date(Date.parse(success.updatedAt)),
                        priceTable: [
                            ...success.priceTable,
                            {
                                id: priceId,
                                openingQty: Number(qty),
                                currentQty: Number(qty),
                                totalQty: Number(qty),
                                soldQty: -Number(qty),
                                damageQty: 0,
                                rtvQty: 0,
                            },
                        ],

                    };
                }
            } else {
                inventory = {
                    name: name,
                    article_code: article_code,
                    warehouse: "62b5b575b4facb87eef3b47c",
                    currentQty: Number(qty),
                    openingQty: Number(qty),
                    totalQty: Number(qty),
                    soldQty: - Number(qty),
                    damageQty: 0,
                    rtvQty: 0,
                    status: "active",
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                    priceTable: [

                        {
                            id: priceId,
                            openingQty: Number(qty),
                            currentQty: Number(qty),
                            totalQty: Number(qty),
                            soldQty: - Number(qty),
                            damageQty: 0,
                            rtvQty: 0,
                        },
                    ],

                };
            }
            // res.send(inventory)
            Inventory.updateOne({ _id: _id }, { $set: inventory })
            console.log("inventory final", inventory);
        });
    } else {
        return;
    }
};
// Generate Sale in -> inventory Out
const updateInventoryOutOnSaleIn = async (req, res, next) => {
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
                            currentQty: Number(success.currentQty)
                                - Number(qty),
                            openingQty: success.openingQty,
                            totalQty: success.totalQty,
                            soldQty: success.soldQty + Number(qty),
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty,
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: checked[0].get("id"),
                                    currentQty: checked[0].get("currentQty") ? Number(checked[0].get("currentQty")) - Number(qty) : 0 - Number(qty),
                                    openingQty: checked[0].get("openingQty") ? checked[0].get("openingQty") : 0,
                                    totalQty: checked[0].get("totalQty") ? checked[0].get("totalQty") : 0,
                                    soldQty: checked[0].get("soldQty") ? checked[0].get("soldQty") + Number(qty) : 0 + Number(qty),
                                    damageQty: checked[0].get("damageQty") ? Number(checked[0].get("damageQty")) : 0,
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
                            soldQty: success.soldQty + Number(qty),
                            damageQty: Number(success.damageQty),
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
                                    totalQty: - Number(qty),
                                    soldQty: 0 + Number(qty),
                                    damageQty: 0,
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
                        currentQty: - Number(qty),
                        openingQty: - Number(qty),
                        totalQty: - Number(qty),
                        soldQty: Number(qty),
                        damageQty: 0,
                        rtvQty: 0,
                        status: success.status,
                        createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                        updatedAt: new Date(Date.parse(success.updatedAt)),
                        priceTable: [
                            ...success.priceTable,
                            {
                                id: priceId,
                                openingQty: - Number(qty),
                                currentQty: - Number(qty),
                                totalQty: -Number(qty),
                                soldQty: Number(qty),
                                damageQty: 0,
                                rtvQty: 0,
                            },
                        ],

                    };
                }
            } else {
                inventory = {
                    name: name,
                    article_code: article_code,
                    warehouse: "62b5b575b4facb87eef3b47c",
                    currentQty: - Number(qty),
                    openingQty: - Number(qty),
                    totalQty: -Number(qty),
                    soldQty: Number(qty),
                    damageQty: 0,
                    rtvQty: 0,
                    status: "active",
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                    priceTable: [

                        {
                            id: priceId,
                            openingQty: - Number(qty),
                            currentQty: - Number(qty),
                            totalQty: -Number(qty),
                            soldQty: Number(qty),
                            damageQty: 0,
                            rtvQty: 0,
                        },
                    ],

                };
            }
            // res.send(inventory)
            Inventory.updateOne({ _id: _id }, { $set: inventory })
            console.log("inventory final", inventory);
        });
    } else {
        return;
    }
};


// Generate Sale Del -> inventory in
const updateInventoryInOnGRNIn = async (req, res, next) => {
    // TODO:: todays total

    // const todayTotal = await Damage.countDocuments({
    //     createdAt: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
    // });
    const products = await req.body.products;

    // console.log("inventory Products", products);

    if (products.length > 0) {
        products.map(async (product) => {
            // console.log("single product", product);
            const { _id, article_code, qty, priceId, name } = product;
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
                            currentQty: Number(success.currentQty) + Number(qty),
                            openingQty: success.openingQty,
                            totalQty: success.totalQty + Number(qty),
                            soldQty: success.soldQty,
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty,
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: checked[0].get("id"),
                                    currentQty: checked[0].get("currentQty") ? Number(checked[0].get("currentQty")) + Number(qty) : 0 + Number(qty),
                                    openingQty: checked[0].get("openingQty") ? checked[0].get("openingQty") : 0,
                                    totalQty: checked[0].get("totalQty") ? checked[0].get("totalQty") + Number(qty) : 0 + Number(qty),
                                    soldQty: checked[0].get("soldQty") ? checked[0].get("soldQty") : 0,
                                    damageQty: checked[0].get("damageQty") ? Number(checked[0].get("damageQty")) : 0,
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
                            currentQty: Number(success.currentQty) + Number(qty),
                            openingQty: success.openingQty + Number(qty),
                            totalQty: success.totalQty + Number(qty),
                            soldQty: success.soldQty,
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty,
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: priceId,
                                    currentQty: Number(qty),
                                    openingQty: Number(qty),
                                    totalQty: Number(qty),
                                    soldQty: 0,
                                    damageQty: 0,
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
                        currentQty: Number(success.currentQty) + Number(qty),
                        openingQty: success.openingQty + Number(qty),
                        totalQty: success.totalQty + Number(qty),
                        soldQty: success.soldQty,

                        damageQty: 0,
                        rtvQty: Number(qty),
                        status: success.status,
                        createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                        updatedAt: new Date(Date.parse(success.updatedAt)),
                        priceTable: [
                            ...success.priceTable,
                            {
                                id: priceId,
                                openingQty: Number(qty),
                                currentQty: Number(qty),
                                totalQty: Number(qty),
                                soldQty: 0,
                                damageQty: 0,
                                rtvQty: 0,
                            },
                        ],

                    };
                }
            } else {
                inventory = {
                    name: name,
                    article_code: article_code,
                    warehouse: "62b5b575b4facb87eef3b47c",
                    currentQty: Number(qty),
                    openingQty: Number(qty),
                    totalQty: Number(qty),
                    soldQty: 0,
                    damageQty: 0,
                    rtvQty: 0,
                    status: "active",
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                    priceTable: [

                        {
                            id: priceId,
                            openingQty: Number(qty),
                            currentQty: Number(qty),
                            totalQty: Number(qty),
                            soldQty: 0,
                            damageQty: 0,
                            rtvQty: 0,
                        },
                    ],

                };
            }
            // res.send(inventory)
            Inventory.updateOne({ _id: _id }, { $set: inventory })
            console.log("inventory final", inventory);
        });
    } else {
        return;
    }
};
// Generate Sale in -> inventory Out
const updateInventoryOutOnGRNDel = async (req, res, next) => {
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
                            currentQty: Number(success.currentQty)
                                - Number(qty),
                            openingQty: success.openingQty,
                            totalQty: success.totalQty - Number(qty),
                            soldQty: success.soldQty,
                            damageQty: Number(success.damageQty),
                            rtvQty: success.rtvQty,
                            status: success.status,
                            createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                            updatedAt: new Date(Date.parse(success.updatedAt)),
                            priceTable: [
                                ...rest,
                                {
                                    id: checked[0].get("id"),
                                    currentQty: checked[0].get("currentQty") ? Number(checked[0].get("currentQty")) - Number(qty) : 0 - Number(qty),
                                    openingQty: checked[0].get("openingQty") ? checked[0].get("openingQty") : 0,
                                    totalQty: checked[0].get("totalQty") ? checked[0].get("totalQty") - Number(qty) : 0 - Number(qty),
                                    soldQty: checked[0].get("soldQty") ? checked[0].get("soldQty") : 0,
                                    damageQty: checked[0].get("damageQty") ? Number(checked[0].get("damageQty")) : 0,
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
                            openingQty: success.openingQty - Number(qty),
                            totalQty: success.totalQty - Number(qty),
                            soldQty: success.soldQty,
                            damageQty: Number(success.damageQty),
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
                                    totalQty: - Number(qty),
                                    soldQty: 0,
                                    damageQty: 0,
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
                        currentQty: - Number(qty),
                        openingQty: - Number(qty),
                        totalQty: - Number(qty),
                        soldQty: 0,
                        damageQty: 0,
                        rtvQty: 0,
                        status: success.status,
                        createdAt: success.createdAt !== undefined ? new Date(Date.parse(success.createdAt)) : new Date(Date.now()),
                        updatedAt: new Date(Date.parse(success.updatedAt)),
                        priceTable: [
                            ...success.priceTable,
                            {
                                id: priceId,
                                openingQty: - Number(qty),
                                currentQty: - Number(qty),
                                totalQty: -Number(qty),
                                soldQty: 0,
                                damageQty: 0,
                                rtvQty: 0,
                            },
                        ],

                    };
                }
            } else {
                inventory = {
                    name: name,
                    article_code: article_code,
                    warehouse: "62b5b575b4facb87eef3b47c",
                    currentQty: - Number(qty),
                    openingQty: - Number(qty),
                    totalQty: -Number(qty),
                    soldQty: 0,
                    damageQty: 0,
                    rtvQty: 0,
                    status: "active",
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                    priceTable: [

                        {
                            id: priceId,
                            openingQty: - Number(qty),
                            currentQty: - Number(qty),
                            totalQty: -Number(qty),
                            soldQty: 0,
                            damageQty: 0,
                            rtvQty: 0,
                        },
                    ],

                };
            }
            // res.send(inventory)
            Inventory.updateOne({ _id: _id }, { $set: inventory })
            console.log("inventory final", inventory);
        });
    } else {
        return;
    }
};





module.exports = {
    updateInventoryOutOnDamageIn,
    updateInventoryInOnDamageOut,
    updateInventoryOutOnRTVIn,
    updateInventoryINOnRTVOut,
    updateInventoryInOnSaleDel,
    updateInventoryOutOnSaleIn,
    updateInventoryInOnGRNIn,
    updateInventoryOutOnGRNDel
};
