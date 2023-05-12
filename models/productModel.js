const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    article_code: { type: String, require: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    generic: { type: mongoose.Schema.Types.ObjectId, ref: "Generic", default: null },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    tp: { type: Number, require: true },
    mrp: { type: Number, require: true },
    details: { type: String },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", default: null },
    alert_qty: { type: Number, require: true },
    pcsBox: { type: Number },
    size: { type: Number, require: true },
    product_type: { type: String, enum: ["mg", "ml"], require: true },
    minQty: { type: Number, require: true },
    maxQty: { type: Number, require: true },
    vat: { type: Number, require: true },
    vat_method: { type: Boolean, require: true, default: false },
    discount: { type: Number, require: true },
    discount_type: { type: Boolean, require: true, default: false },
    hide_website: { type: Boolean, require: true },
    photo: { type: String },
    details: { type: String },
    type: { type: String, enum: ["local", "foreign"], require: true },
    shipping_method: { type: String, enum: ["cod", "free", "uttara"] },
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
