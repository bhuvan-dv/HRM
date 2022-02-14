const express = require("express");
const { PORT, MONGODB_URL } = require("./config");
//create top level function
const app = express();
const { connect } = require("mongoose");
const { engine } = require("express-handlebars");
//importing all routing module
const EmployeeRoute = require("./Route/employee");
const { join } = require("path");
const Handlebars = require("handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const AuthRoute = require("./Route/auth");
const passport = require("passport");
require("./middleware/passport")(passport);
//!======================database connection STARTS here===============
let DatabaseConnection = async () => {
  await connect(MONGODB_URL);
  console.log("database connected");
};
DatabaseConnection();
//!======================database connection ENDS here===============
//?=================to do template engine middleare STARTS here==================
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
//?=================to do template engine middleare ENDS here==================
//*=================BUILT in middlewares STARTS Here====================
app.use(express.static(join(__dirname, "public")));
app.use(express.static(join(__dirname, "node_modules")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//!session middlewares
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    // cookie: { secure: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());

//*connect flash middlewares
app.use(flash());
//*=================BUILT in middlewares ENDS Here====================

//*HANDLEBARS HELPER CLASSES
Handlebars.registerHelper("trimString", function (passedString) {
  var theString = passedString.slice(6);
  return new Handlebars.SafeString(theString);
});
Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context);
});
//?==============set global variables================
app.use(function (req, res, next) {
  app.locals.SUCCESS_MESSAGE = req.flash("SUCCESS_MESSAGE");
  app.locals.ERROR_MESSAGE = req.flash("ERROR_MESSAGE");
  app.locals.errors = req.flash("errors");
  app.locals.error = req.flash("error");
  app.locals.user = req.user || null;
  let userData = req.user || null;
  app.locals.finalData = Object.create(userData);
  app.locals.username = app.locals.finalData.username;
  next();
});

//!route setting for employees---application level middleware
app.use("/employee", EmployeeRoute);
app.use("/auth", AuthRoute);

//listen a port
app.listen(PORT, err => {
  if (err) throw err;
  console.log(`HRM app is running on port number ${PORT}`);
});
