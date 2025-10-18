// const express = require("express");
// const router = express.Router();
// const passport = require("passport");
// const User = require("../models/user");
// const bcrypt = require("bcryptjs");

// // Register Route
// router.post("/register", async (req, res) => {
//   const { username, password } = req.body;
//   const user = new User({ username, password });
//   await user.save();
//   res.send("✅ User registered");
// });

// // Login Route
// router.post("/login", passport.authenticate("local", {
//   successRedirect: "/blogs",
//   failureRedirect: "/login",
//   failureFlash: true,
// }));

// // Logout Route
// router.get("/logout", (req, res) => {
//   req.logout(() => {
//     res.redirect("/");
//   });
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Register Page
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

// Register User
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // check if user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    req.flash("error_msg", "Username already exists");
    return res.redirect("/register");
  }

  const user = new User({ username, password });
  await user.save();
  req.flash("success_msg", "Registration successful! Please log in.");
  res.redirect("/login");
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Login Handler
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

module.exports = router;
