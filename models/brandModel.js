const mongoose = require("mongoose");

const brandSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    code: { type: String },
    company: { type: String },
    photo: { type: String },
    details: { type: String },
    companyLayer: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    status: { type: String, enum: ["active", "inactive"] },
  },
  {
    timestamps: true,
  }
);

const Brand = new mongoose.model("Brand", brandSchema);
module.exports = Brand;
