const mongoose = require("mongoose");

const genericSchema = mongoose.Schema(
    {
        name: { type: String, require: true },
        group: { type: mongoose.Types.ObjectId, ref: "Group", require: true },
        photo: { type: String },
        details: { type: String },
        status: { type: String, enum: ["active", "inactive"] },
    },
    {
        timestamps: true,
    }
);

const Generic = new mongoose.model("Generic", genericSchema);
module.exports = Generic;
