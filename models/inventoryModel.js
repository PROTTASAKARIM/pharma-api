const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema(
  {
    article_code: { type: Number, require: true, unique: true }, //article_code
    warehouse: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      require: true,
    },
    priceTable: [
      {
        type: Map,
        of: new mongoose.Schema({
          id: { type: mongoose.Types.ObjectId, ref: "Price" },
          currentQty: { type: Number },
          openingQty: { type: Number },
          totalQty: { type: Number },
          soldQty: { type: Number },
        }),
      },
    ],
    name: { type: String, require: true },
    currentQty: { type: Number, require: true },
    openingQty: { type: Number, require: true },
    totalQty: { type: Number, require: true },
    soldQty: { type: Number, require: true },
    status: { type: String, enum: ["active", "inactive"] },
  },
  {
    timestamps: true,
  }
);

const Inventory = new mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;
