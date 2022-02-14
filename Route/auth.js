const { Router } = require("express");
const router = Router();
const USERSCHEMA = require("../Model/Auth");
const bcrypt = require("bcryptjs");
const passport = require("passport");
/*
@HTTP GET REQUEST
@ACCESS PUBLIC
@URL /auth/register
*/
router.get("/register", (req, res) => {
  res.render("../views/auth/register", {});
});
/*
@HTTP GET REQUEST
@ACCESS PUBLIC
@URL /auth/login
*/
router.get("/login", (req, res) => {
  res.render("../views/auth/login", {});
});
/*
@HTTP GET REQUEST
@ACCESS PRIVATE
@URL /auth/logout
*/
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("SUCCESS_MESSAGE", "Successfully logged out");
  res.redirect("/auth/login", 302, {});
});
/*
@HTTP POST REQUEST
@ACCESS PUBLIC
@URL /auth/register
*/
router.post("/register", async (req, res) => {
  let { username, email, password, password1 } = req.body;
  let errors = [];
  if (!username) {
    errors.push({ text: "username is required" });
  }
  // if (username.length < 6) {
  //   errors.push({ text: "username minimum 6 characters" });
  // }
  if (!email) {
    errors.push({ text: "email is required" });
  }
  if (!password) {
    errors.push({ text: "password is required" });
  }
  if (password !== password1) {
    errors.push({ text: "password does not match" });
  }
  if (errors.length > 0) {
    // req.flash("ERROR_MESSAGE", `failed to register`);
    res.render("../views/auth/register", {
      errors,
      username,
      email,
      password,
      password1,
    });
  } else {
    let user = await USERSCHEMA.findOne({ email: email });
    if (user) {
      req.flash(
        "ERROR_MESSAGE",
        "email already exists please add new email address"
      );
      res.redirect("/auth/register", 302, {});
    } else {
      let newUser = new USERSCHEMA({
        username,
        email,
        password,
      });
      bcrypt.genSalt(12, (err, salt) => {
        if (err) throw err;
        console.log(salt);
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          // console.log(hash);
          if (err) throw err;
          newUser.password = hash;
          await newUser.save();
          req.flash("SUCCESS_MESSAGE", "successfully registered");
          res.redirect("/auth/login", 302, {});
        });
      });
    }
    // req.flash("SUCCESS_MESSAGE", "successfully registered");
    // res.redirect("/employee/home", 302, {});
  }
});
/*
@HTTP POST REQUEST
@ACCESS PUBLIC
@URL /auth/login
*/
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/employee/emp-profile",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
});
module.exports = router;
