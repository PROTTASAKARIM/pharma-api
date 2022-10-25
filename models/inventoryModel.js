const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema(
  {
    product: { type: mongoose.Types.ObjectId, ref: "Product", require: true },
    supplier: { type: mongoose.Types.ObjectId, ref: "Supplier", require: true },
    warehouse: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      require: true,
    },
    priceTable: {
      type: mongoose.Types.ObjectId,
      ref: "Price",
      require: true,
    },
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
