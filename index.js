const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const productRouter = require("./routes/productRouter");
const userRouter = require("./routes/userRouter");
const categoryRouter = require("./routes/categoryRouter");
const saleRouter = require("./routes/saleRouter");
const supplierRouter = require("./routes/supplierRouter");
const customerRouter = require("./routes/customerRouter");
const brandRouter = require("./routes/brandRouter");
const unitRouter = require("./routes/unitRouter");
const priceRouter = require("./routes/priceRouter");
const warehouseRouter = require("./routes/warehouseRouter");
const inventoryRouter = require("./routes/inventoryRouter");
const inventoryCountRouter = require("./routes/inventoryCountRouter");
const poRouter = require("./routes/purchaseRouter");
const grnRouter = require("./routes/grnRouter");
const rtvRouter = require("./routes/rtvRouter");
const tpnRouter = require("./routes/tpnRouter");
const companyRouter = require("./routes/companyRouter");
const damageRouter = require("./routes/damageRouter");
const ecomRouter = require("./routes/ecomRouter");
const multer = require("multer");
const fileUpload = require("express-fileupload");

require("dotenv").config();
const PORT = process.env.PORT || 5001;

// app init
const app = express();

// MiddleWare
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(express.json());
app.use(express.static(__dirname + "/template"));

// const dbUrl = `mongodb+srv://posdb-user:IOK6faeoehDttV7o@cluster0.jmnaf.mongodb.net/pos-api-v1?retryWrites=true&w=majority`;
const dbUrl = `mongodb+srv://pos-tester:vgQJZDIxungr8ywt@cluster0.3sihhom.mongodb.net/?retryWrites=true&w=majority`;
// const dbUrl = `mongodb+srv://pos-tester:vgQJZDIxungr8ywt@cluster0.3sihhom.mongodb.net/?retryWrites=true&w=majority`;
// const dbUrl = `mongodb+srv://tcm:rXWmC6cp4Q3FZ2ef@cluster0.0s2yh4f.mongodb.net/?retryWrites=true&w=majority`;
// const dbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3sihhom.mongodb.net/?retryWrites=true&w=majority`;

console.log(dbUrl);
// // mongodb+srv://pos-tester:vgQJZDIxungr8ywt@cluster0.3sihhom.mongodb.net/?retryWrites=true&w=majority
// // database connection
mongoose
  .connect(dbUrl)
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

// application router
app.use(fileUpload());
app.use("/api/product", productRouter);
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/sale", saleRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/customer", customerRouter);
app.use("/api/brand", brandRouter);
app.use("/api/unit", unitRouter);
app.use("/api/price", priceRouter);
app.use("/api/warehouse", warehouseRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/inventoryCount", inventoryCountRouter);
app.use("/api/purchase", poRouter);
app.use("/api/grn", grnRouter);
app.use("/api/rtv", rtvRouter);
app.use("/api/tpn", tpnRouter);
app.use("/api/company", companyRouter);
app.use("/api/damage", damageRouter);
app.use("/api/ecom", ecomRouter);
app.use("/uploads", express.static("uploads"));
// Home
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname + "/template/home.html"));
});

// API DOCS
app.get("/api/v1/docs", async (req, res) => {
  res.sendFile(path.join(__dirname + "/template/docs.html"));
});

// error Handle
const errorHandler = (err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  } else {
    if (err instanceof multer.MulterError) {
      res.status(500).send(err.message);
    } else {
      res.status(500).json({ err: err });
    }
  }
};

app.use(errorHandler);

// start app
app.listen(PORT, () => {
  console.log("Listing port:", PORT);
});
