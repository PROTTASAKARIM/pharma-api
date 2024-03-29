const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    article_code: { type: String, require: true, unique: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    generic: { type: mongoose.Schema.Types.ObjectId, ref: "Generic", default: null },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    tp: { type: String, require: true },
    mrp: { type: String, require: true },
    profit: { type: String, require: true },
    details: { type: String },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", default: null },
    alert_qty: { type: String, require: true },
    pcsBox: { type: String },
    size: { type: String, require: true },
    // product_type: { type: String, enum: ["mg", "ml"], require: true },
    minQty: { type: String, require: true },
    maxQty: { type: String, require: true },
    vat: { type: String, require: true },
    vat_method: { type: Boolean, require: true, default: false },
    discount: { type: String, require: true },
    discount_type: { type: Boolean, require: true, default: false },
    hide_website: { type: Boolean, require: true },
    photo: { type: String },
    details: { type: String },
    type: { type: String, enum: ["LOCAL", "FOREIGN"], require: true },
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
