const mongoose = require("mongoose");

const groupSchema = mongoose.Schema(
    {
        name: { type: String, require: true },
        symbol: { type: String },
        photo: { type: String },
        details: { type: String },
        status: { type: String, enum: ["active", "inactive"] },
    },
    {
        timestamps: true,
    }
);

const Group = new mongoose.model("Group", groupSchema);
module.exports = Group;
