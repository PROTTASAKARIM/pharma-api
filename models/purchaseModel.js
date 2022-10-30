const mongoose = require("mongoose");

const purchaseSchema = mongoose.Schema(
  {
    poNo: { type: String, require: true },
    supplier: { type: mongoose.Types.ObjectId, ref: "Supplier", require: true },
    warehouse: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      require: true,
    },
    products: [
      {
        type: Map,
        of: new mongoose.Schema({
          id: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            require: true,
          },
          tp: { type: Number, default: 0, require: true },
          priceId: {
            type: mongoose.Types.ObjectId,
            ref: "Price",
            require: true,
          },
          tax: { type: Number, default: 0, require: true },
          qty: { type: Number, default: 0, require: true },
          unit: { type: String, require: true },
          discount: {
            type: Number,
            default: 0,
            require: true,
          },
          order: { type: Number, require: true },
        }),
      },
    ],
    type: { type: String },
    note: { type: String },
    doc: { type: String },
    totalItem: { type: Number, default: 0, require: true },
    total: { type: Number, default: 0, require: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    userId: { type: mongoose.Types.ObjectId, ref: "User", require: true },
    shipping_cost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Ordered", "Partial", "Received"],
    },
  },
  {
    timestamps: true,
  }
);

const Purchase = new mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;
