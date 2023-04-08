const mongoose = require("mongoose");

const accountSchema = mongoose.Schema(
    {
        acId: { type: String, require: true },
        supplier: { type: mongoose.Types.ObjectId, ref: "Supplier" },
        paidAmount: new mongoose.Schema({
            cash: { type: Number },
            mfs: {
                name: { type: String },
                amount: { type: Number },
            },
            card: {
                name: { type: String },
                amount: { type: Number },
            },
            cheque: {
                name: { type: String },
                no: { type: String },
                amount: { type: Number },
            },
            point: { type: Number },
        }),
        photo: { type: String },
        accountHead: { type: mongoose.Types.ObjectId, ref: "AccountHead" },
        User: { type: mongoose.Types.ObjectId, ref: "User" },
        date: { type: Date },
        amount: { type: String },
        type: { type: String, enum: ["Debit", "Credit"] },
        grnId: { type: mongoose.Types.ObjectId, ref: "Grn" },
        poId: { type: mongoose.Types.ObjectId, ref: "Purchase" },
        note: { type: String },
        status: { type: String, enum: ["active", "inactive"] },
    },
    {
        timestamps: true,
    }
);

const Account = new mongoose.model("Account", accountSchema);
module.exports = Account;