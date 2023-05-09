const mongoose = require("mongoose");

const brandSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    company: { type: String },
    photo: { type: String },
    details: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    status: { type: String, enum: ["active", "inactive"] },
  },
  {
    timestamps: true,
  }
);

const Brand = new mongoose.model("Brand", brandSchema);
module.exports = Brand;
