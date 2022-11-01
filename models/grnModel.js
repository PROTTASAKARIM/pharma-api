const mongoose = require("mongoose");

const grnSchema = mongoose.Schema(
  {
    grnNo: { type: String, require: true },
    poNo: { type: mongoose.Types.ObjectId, ref: "Purchase", require: true },
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
          newPrice: { type: Boolean },
          priceId: { type: Number, ref: "Price", require: true },
          tp: { type: Number, default: 0, require: true },
          mrp: { type: Number, default: 0, require: true },
          tax: { type: Number, default: 0, require: true },
          qty: { type: Number, default: 0, require: true },
          unit: { type: mongoose.Types.ObjectId, ref: "Unit", require: true },
          discount: {
            type: Number,
            default: 0,
            require: true,
          },
          order: { type: Number, require: true },
        }),
      },
    ],
    note: { type: String },
    doc: { type: String },
    totalItem: { type: Number, default: 0, require: true },
    total: { type: Number, default: 0, require: true },
    grossTotal: { type: Number, default: 0, require: true },
    discount: { type: Number, default: 0, require: true },
    tax: { type: Number, default: 0, require: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User", require: true },
    status: {
      type: String,
      enum: ["Partial", "Complete"],
    },
  },
  {
    timestamps: true,
  }
);

const Grn = new mongoose.model("Grn", grnSchema);
module.exports = Grn;
