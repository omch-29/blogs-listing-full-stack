const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const ejsmate = require("ejs-mate");

const app = express();
require("./config/passportConfig")(passport);
require("dotenv").config();


// Middlewares
app.engine('ejs', ejsmate);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "blogSecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use((req, res, next) => {
res.locals.user = req.user;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.redirect("/blogs"); 
});


const dbUrl = process.env.ATLASDB_URL;
mongoose
  .connect(dbUrl)
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/", require("./routes/authRoutes"));
app.use("/blogs", require("./routes/blogRoutes"));


app.listen(process.env.PORT || 5000, () => console.log("Server running on port 5000"));
