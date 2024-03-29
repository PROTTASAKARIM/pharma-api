const mongoose = require("mongoose");

const supplierSchema = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    code: { type: String, require: true, unique: true },
    company: { type: String },
    products: [
      {
        type: Map,
        of: new mongoose.Schema({
          id: { type: mongoose.Types.ObjectId, ref: "Product", require: true },
          ean: { type: String, require: true },
          article_code: { type: String, require: true },
          name: { type: String, require: true },
          unit: { type: String, require: true },
          order: { type: Number, require: true },
        }),
      },
    ],
    address: { type: String },
    type: { type: String },
    phone: { type: String },
    companyLayer: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    status: { type: String, enum: ["active", "inactive"] },
  },
  {
    timestamps: true,
  }
);

const Supplier = new mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
