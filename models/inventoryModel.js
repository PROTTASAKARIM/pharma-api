const mongoose = require("mongoose");

// const priceTable

const inventorySchema = new mongoose.Schema(
  {
    article_code: { type: String, require: true, unique: true }, //article_code
    warehouse: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      require: true,
    },
    name: { type: String, require: true },
    currentQty: { type: Number, require: true },
    openingQty: { type: Number, require: true },
    totalQty: { type: Number, require: true },
    soldQty: { type: Number, require: true },
    damageQty: { type: Number, require: true },
    rtvQty: { type: Number, require: true },
    tpnQty: { type: Number, require: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    status: { type: String, enum: ["active", "inactive"] },
  },
  {
    timestamps: true,
  }
);

const Inventory = new mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;
