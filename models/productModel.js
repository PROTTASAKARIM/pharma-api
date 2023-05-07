const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    ean: { type: String },
    article_code: { type: String, require: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    generic: { type: mongoose.Schema.Types.ObjectId, ref: "Generic", default: null },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    product_type: { type: String, enum: ["standard", "combo", "offer"] },
    priceList: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Price", default: null },
    ],
    slug: { type: String, require: true },
    details: { type: String },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", default: null },
    alert_quantity: { type: Number, require: true },
    pcsBox: { type: Number },
    size: { type: Number, require: true },
    minQty: { type: Number, require: true },
    maxQty: { type: Number, require: true },
    vat: { type: Number, require: true },
    vat_method: { type: Boolean, require: true, default: false },
    discount: { type: Number, require: true },
    discount_method: { type: Boolean, require: true, default: false },
    hide_website: { type: Boolean, require: true },
    photo: { type: String },
    details: { type: String },
    note: { type: String },
    type: { type: String, enum: ["local", "foreign"], require: true },
    status: { type: String, enum: ["active", "inactive"] },
  },
  {
    timestamps: true,
  }
);

const Product = new mongoose.model("Product", productSchema);

productSchema.method = {
  findActive: function () {
    return mongoose.model("Product");
  },
};

module.exports = Product;
