const mongoose = require("mongoose");

const damageSchema = mongoose.Schema(
  {
    damageNo: { type: String, require: true },
    products: [
      {
        type: Map,
        of: new mongoose.Schema({
          priceId: { type: mongoose.Types.ObjectId, ref: "Price" },
          qty: { type: Number, require: true },
          article_code: { type: String, require: true },
          name: { type: String, require: true },
          tp: { type: String, require: true },
          reason: { type: String },
        }),
      },
    ],
    warehouse: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      require: true,
    },
    note: { type: String },
    total: { type: Number, require: true },
    totalItem: { type: Number, require: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User", require: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
    },
  },
  {
    timestamps: true,
  }
);

const Damage = new mongoose.model("Damage", damageSchema);
module.exports = Damage;
