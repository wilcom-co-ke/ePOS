var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
//Routes
var auth = require("./routes/SystemAdmin/auth");
var SystemUsers = require("./routes/SystemAdmin/SystemUsers");
var UserAccess = require("./routes/SystemAdmin/UserAccess");
var UserGroups = require("./routes/SystemAdmin/UserGroups");
var GroupAccess = require("./routes/SystemAdmin/GroupAccess");
var Branches = require("./routes/SystemAdmin/Branches");
var Companies = require("./routes/SystemAdmin/Companies");
var Uploads = require("./routes/SystemAdmin/Uploads");
var BranchAccess = require("./routes/SystemAdmin/BranchAccess");
var Audittrails = require("./routes/SystemAdmin/Audittrails");
var UpdateProfile=require("./routes/SystemAdmin/UpdateProfile");
var ValidateTokenExpiry = require("./routes/SystemAdmin/ValidateTokenExpiry");

//SetUps
var PaymentModes=require("./routes/Setups/PaymentModes")
var ItemCategories=require("./routes/Setups/ItemCategories")
var Suppliers=require("./routes/Setups/Suppliers")
var Items=require("./routes/Setups/Items")

//Inventory
var Requisitions=require("./routes/Inventory/Requisitions")
var RequisitionsApproval=require("./routes/Inventory/RequisitionsApproval")
 //PDF
 var PO=require("./routes/generatepdf/po");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static("uploads"));
app.use("/api/login", auth.router);
app.use("/api/ValidateTokenExpiry", ValidateTokenExpiry);
app.use("/api/Uploads", Uploads);
//PDF
app.use("/api/PO",PO)

app.use(auth.validateToken);
app.use("/api/users", SystemUsers);
app.use("/api/UserAccess", UserAccess);
app.use("/api/SecurityGroups", UserGroups);
app.use("/api/GroupAccess", GroupAccess);
app.use("/api/Branches", Branches);
app.use("/api/Companies", Companies);
app.use("/api/BranchAccess", BranchAccess);
app.use("/api/Audittrails", Audittrails);
app.use("/api/UpdateProfile", UpdateProfile);

//Patient management


//SetUps

app.use("/api/PaymentModes", PaymentModes);
app.use("/api/ItemCategories", ItemCategories);
app.use("/api/Suppliers", Suppliers);
app.use("/api/Items", Items);

//Inventory
app.use("/api/Requisitions",Requisitions)
app.use("/api/RequisitionsApproval",RequisitionsApproval)



// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

module.exports = app;
