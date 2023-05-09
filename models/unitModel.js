const mongoose = require("mongoose");

const unitSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    symbol: { type: String, require: true, unique: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    status: { type: String, enum: ["active", "inactive"] },
  },
  {
    timestamps: true,
  }
);

const Unit = new mongoose.model("Unit", unitSchema);
module.exports = Unit;
