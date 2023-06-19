const mongoose = require("mongoose");

const inventoryCountSchema = mongoose.Schema(
  {
    article_code: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      require: true,
    },
    warehouse: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      require: true,
    },
    qty: { type: Number, require: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    status: { type: String, enum: ["active", "inactive"] },
  },
  {
    timestamps: true,
  }
);

const InventoryCount = new mongoose.model(
  "InventoryCount",
  inventoryCountSchema
);
module.exports = InventoryCount;
