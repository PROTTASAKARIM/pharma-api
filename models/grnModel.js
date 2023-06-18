const mongoose = require("mongoose");

const grnSchema = mongoose.Schema(
  {
    grnNo: { type: String, require: true },
    poNo: { type: mongoose.Types.ObjectId, ref: "Purchase" },
    tpnNo: { type: mongoose.Types.ObjectId, ref: "Tpn" },
    supplier: { type: mongoose.Types.ObjectId, ref: "Supplier" },
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
          article_code: { type: String, require: true },
          newPrice: { type: Boolean },
          tp: { type: String, default: "0", require: true },
          mrp: { type: String, default: "0", require: true },
          tax: { type: String, default: "0", require: true },
          qty: { type: String, default: "0", require: true },
          discount: {
            type: String,
            default: "0",
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
    shipping_cost: { type: Number, default: 0 },
    userId: { type: mongoose.Types.ObjectId, ref: "User", require: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
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
