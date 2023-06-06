const mongoose = require("mongoose");

const genericSchema = mongoose.Schema(
    {
        name: { type: String, require: true, unique: true },
        code: { type: String },
        photo: { type: String },
        details: { type: String },
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    {
        timestamps: true,
    }
);

const Generic = new mongoose.model("Generic", genericSchema);
module.exports = Generic;
