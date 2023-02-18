const mongoose = require("mongoose");

const customerSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    email: { type: String, unique: true, sparse: true },
    username: { type: String },
    password: { type: String },
    membership: { type: String, unique: true },
    address: [
      {
        type: Map,
        of: new mongoose.Schema({
          id: { type: String },
          type: { type: String, enum: ['Home', 'Work', 'Other'] },
          holdingNo: { type: String },
          sector: { type: String },
          street: { type: String },
          town: { type: String },
          city: { type: String },
          division: { type: String },
          country: { type: String },
          zipCode: { type: String },

        },
          {
            timestamps: true,
          }
        ),
      },

    ],
    // address: { type: String },
    type: {
      type: String,
      enum: ["regular", "premium", "vip"],
      default: "regular",
    },
    point: { type: Number, default: 0 },
    phone: { type: String, require: true, unique: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

const Customer = new mongoose.model("Customer", customerSchema);
module.exports = Customer;
