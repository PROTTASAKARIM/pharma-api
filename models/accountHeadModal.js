const mongoose = require("mongoose");

const accountHeadSchema = mongoose.Schema(
    {
        name: { type: String, require: true },
        code: { type: String, require: true },
        maId: { type: mongoose.Types.ObjectId, ref: "AccountHead" },
        photo: { type: String },
        description: { type: String },
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        status: { type: String, enum: ["active", "inactive"] },
    },
    {
        timestamps: true,
    }
);

const AccountHead = new mongoose.model("AccountHead", accountHeadSchema);
module.exports = AccountHead;
