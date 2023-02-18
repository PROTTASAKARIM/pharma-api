const mongoose = require("mongoose");

const saleSchema = mongoose.Schema(
  {
    invoiceId: { type: String, require: true },
    source: { type: String, enum: ["web", "POS"], require: true },
    note: { type: String },
    // delivery_address: { type: String, require: true },
    warehouse: { type: String, require: true },
    products: [
      {
        type: Map,
        of: new mongoose.Schema({
          id: { type: mongoose.Types.ObjectId, require: true, ref: "Products" },
          tp: { type: Number, require: true },
          mrp: { type: Number, require: true },
          priceId: {
            type: mongoose.Types.ObjectId,
            require: true,
            ref: "Price",
          },
          supplier: {
            type: String,
            require: true,
          },
          order: { type: Number, require: true },
          vat: { type: Number, require: true },
          qty: { type: Number, require: true },
          promo_price: { type: String },
          promo_type: { type: Boolean, default: false },
          promo_start: { type: Date },
          promo_end: { type: Date },
        }),
      },
    ],
    returnProducts: [
      {
        type: Map,
        of: new mongoose.Schema({
          id: { type: mongoose.Types.ObjectId, require: true, ref: "Products" },
          tp: { type: Number, require: true },
          mrp: { type: Number, require: true },
          priceId: {
            type: mongoose.Types.ObjectId,
            require: true,
            ref: "Price",
          },
          supplier: {
            type: String,
            require: true,
          },
          order: { type: Number, require: true },
          vat: { type: Number, require: true },
          qty: { type: Number, require: true },
        }),
      },
    ],
    returnCal: {
      totalItem: { type: Number },
      total: { type: Number },
      vatAmount: { type: Number },
      grossTotal: { type: Number },
      grossTotalRound: { type: Number },
      point: { type: Number },
    },
    returnInvoice: {
      type: mongoose.Types.ObjectId,
      ref: "Sale",
      // sparse: true,
      default: null,
    },
    paidAmount: new mongoose.Schema({
      cash: { type: Number },
      mfs: {
        name: { type: String },
        amount: { type: Number },
      },
      card: {
        name: { type: String },
        amount: { type: Number },
      },
      point: { type: Number },
    }),
    changeAmount: { type: Number, require: true },
    totalReceived: { type: Number, require: true },
    grossTotal: { type: Number, require: true },
    grossTotalRound: { type: Number, require: true },
    totalItem: { type: Number, require: true },
    total: { type: Number, require: true },
    vat: { type: Number, require: true },
    point: {
      old: { type: Number },
      new: { type: Number },
    },
    todayPoint: { type: Number },
    discount: { type: Number, require: true },
    promo_discount: { type: Number },

    billerId: { type: mongoose.Types.ObjectId, require: true, ref: "User" },
    delivery: {
      address: { type: String },
      phone: { type: String },
    },
    delivery_charge: { type: Number },
    customerId: {
      type: mongoose.Types.ObjectId,
      require: true,
      ref: "Customer",
    },
    updateUser: { type: mongoose.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["order", "process", "confirm", "complete", "delete", "cancel", "deliver"] },
  },
  {
    timestamps: true,
  }
);
// saleSchema.options.toJSON = {
//   transform(zipRequestDocument, ret, options) {
//     // eslint-disable-line no-unused-vars
//     if (!ret.returnInvoice) {
//       ret.returnInvoice = {};
//     }
//   },
// };
const Sale = new mongoose.model("Sale", saleSchema);
module.exports = Sale;
