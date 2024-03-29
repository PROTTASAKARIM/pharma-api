[
    {
        $lookup: {
            from: "inventories",
            localField: "article_code",
            foreignField: "article_code",
            as: "products"
        }
    },
    {
        $unwind: '$products'
    },
    {
        $lookup: {
            from: "grns",
            let: { article_code: "$products.article_code" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [

                                {
                                    $lt: ["$createdAt", new Date("2023-08-31T18:00:00.000Z")]
                                }
                            ]
                        }

                    }
                },
                {
                    $addFields: {
                        products: {
                            $filter: {
                                input: "$products",
                                as: "product",
                                cond: {
                                    $eq: ["$$product.article_code", "$$article_code"]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "products": { $gt: [] }
                    }
                }
            ],
            as: "grnsPrevious"
        }
    },
    {
        $lookup: {
            from: "grns",
            let: { article_code: "$products.article_code" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                //ji
                                {
                                    $gte: ["$createdAt", new Date("2023-08-31T18:00:00.000Z")]
                                },
                                {
                                    $lt: ["$createdAt", new Date("2023-09-30T17:59:59.999Z")]
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        products: {
                            $filter: {
                                input: "$products",
                                as: "product",
                                cond: {
                                    $eq: ["$$product.article_code", "$$article_code"]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "products": { $gt: [] }
                    }
                }
            ],
            as: "grns"
        }
    },

    {
        $addFields: {
            grnPQty: {
                $reduce: {
                    input: "$grnsPrevious",
                    initialValue: 0,
                    in: {
                        $sum: [
                            "$$value",
                            {
                                $sum: {
                                    $map: {
                                        input: "$$this.products",
                                        as: "product",
                                        in: {
                                            $toInt: {
                                                $ifNull: [ // Handle null or invalid values
                                                    { $toDouble: "$$product.qty" }, // Convert to double without trimming
                                                    0 // Default value if conversion fails
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },
        }
    },
    {
        $addFields: {
            grnQty: {
                $reduce: {
                    input: "$grns",
                    initialValue: 0,
                    in: {
                        $sum: [
                            "$$value",
                            {
                                $sum: {
                                    $map: {
                                        input: "$$this.products",
                                        as: "product",
                                        in: {
                                            $toInt: {
                                                $ifNull: [ // Handle null or invalid values
                                                    { $toDouble: "$$product.qty" }, // Convert to double without trimming
                                                    0 // Default value if conversion fails
                                                ]
                                            }
                                        }

                                    }
                                }
                            }
                        ]
                    }
                }
            },
        }
    },

    {
        $lookup: {
            from: "sales",
            let: { article_code: "$products.article_code" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                // {
                                // $gte: ["$createdAt",  new Date("2023-09-30T17:59:59.999Z")]
                                // },
                                {
                                    $lt: ["$createdAt", new Date("2023-09-30T17:59:59.999Z")]
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        products: {
                            $filter: {
                                input: "$products",
                                as: "product",
                                cond: {
                                    $eq: ["$$product.article_code", "$$article_code"]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "products": { $gt: [] }
                    }
                }
            ],
            as: "salesPrevious"
        }
    },
    {
        $lookup: {
            from: "sales",
            let: { article_code: "$products.article_code" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                // {
                                // $gte: ["$createdAt",  new Date("2023-09-30T17:59:59.999Z")]
                                // },
                                {
                                    $lt: ["$createdAt", new Date("2023-09-30T17:59:59.999Z")]
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        products: {
                            $filter: {
                                input: "$returnProducts",
                                as: "product",
                                cond: {
                                    $eq: ["$$product.article_code", "$$article_code"]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "products": { $gt: [] }
                    }
                }
            ],
            as: "salesReturnPrevious"
        }
    },
    {
        $lookup: {
            from: "sales",
            let: { article_code: "$products.article_code" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $gte: ["$createdAt", new Date("2023-08-31T18:00:00.000Z")]
                                },
                                {
                                    $lt: ["$createdAt", new Date("2023-09-30T17:59:59.999Z")]
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        products: {
                            $filter: {
                                input: "$returnProducts",
                                as: "product",
                                cond: {
                                    $eq: ["$$product.article_code", "$$article_code"]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "products": { $gt: [] }
                    }
                }
            ],
            as: "salesReturn"
        }
    },
    {
        $lookup: {
            from: "sales",
            let: { article_code: "$products.article_code" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $gte: ["$createdAt", new Date("2023-08-31T18:00:00.000Z")]
                                },
                                {
                                    $lt: ["$createdAt", new Date("2023-09-30T17:59:59.999Z")]
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        products: {
                            $filter: {
                                input: "$products",
                                as: "product",
                                cond: {
                                    $eq: ["$$product.article_code", "$$article_code"]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "products": { $gt: [] }
                    }
                }
            ],
            as: "sales"
        }
    },

    {
        $addFields: {
            saleRQty: {
                $reduce: {
                    input: "$salesReturn",
                    initialValue: 0,
                    in: {
                        $sum: [
                            "$$value",
                            {
                                $sum: {
                                    $map: {
                                        input: "$$this.products",
                                        as: "product",
                                        in: {
                                            $toInt: {
                                                $ifNull: [ // Handle null or invalid values
                                                    { $toDouble: "$$product.qty" }, // Convert to double without trimming
                                                    0 // Default value if conversion fails
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },

        }
    },
    {
        $addFields: {
            saleRPQty: {
                $reduce: {
                    input: "$salesReturnPrevious",
                    initialValue: 0,
                    in: {
                        $sum: [
                            "$$value",
                            {
                                $sum: {
                                    $map: {
                                        input: "$$this.products",
                                        as: "product",
                                        in: {
                                            $toInt: {
                                                $ifNull: [ // Handle null or invalid values
                                                    { $toDouble: "$$product.qty" }, // Convert to double without trimming
                                                    0 // Default value if conversion fails
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },

        }
    },
    {
        $addFields: {
            salePQty: {
                $reduce: {
                    input: "$salesPrevious",
                    initialValue: 0,
                    in: {
                        $sum: [
                            "$$value",
                            {
                                $sum: {
                                    $map: {
                                        input: "$$this.products",
                                        as: "product",
                                        in: {
                                            $toInt: {
                                                $ifNull: [ // Handle null or invalid values
                                                    { $toDouble: "$$product.qty" }, // Convert to double without trimming
                                                    0 // Default value if conversion fails
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },

        }
    },
    {
        $addFields: {
            saleQty: {
                $reduce: {
                    input: "$sales",
                    initialValue: 0,
                    in: {
                        $sum: [
                            "$$value",
                            {
                                $sum: {
                                    $map: {
                                        input: "$$this.products",
                                        as: "product",
                                        in: {
                                            $toInt: {
                                                $ifNull: [ // Handle null or invalid values
                                                    { $toDouble: "$$product.qty" }, // Convert to double without trimming
                                                    0 // Default value if conversion fails
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },

        }
    },
    {
        $lookup: {
            from: "groups",
            localField: "group", // Convert to ObjectId
            foreignField: "_id",
            as: "group",
        },
    },
    {
        $unwind: "$group"
    },

    {
        $project: {
            _id: 0,
            name: 1,
            article_code: 1,
            group: 1,
            tp: 1,
            mrp: 1,
            grnPQty: 1,
            grnQty: 1,
            saleQty: 1,
            salePQty: 1,
            saleRPQty: 1,
            saleRQty: 1,
        },
    },


]