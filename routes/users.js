const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserModel, validateUser, validateLogin, createToken } = require("../models/userModel")
const { auth } = require("../auth/auth.js");
const router = express.Router();


router.get("/", async (req, res) => {
  res.json({ msg: "Users works Mate!" });
})


router.get("/checkToken", auth, async (req, res) => {
  try {
    res.json({ _id: req.tokenData._id });
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

// Create a new user
// Domain/users
router.post("/", async (req, res) => {
  let validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details)
  }
  try {
    let user = new UserModel(req.body);
    user.password = await bcryptjs.hash(user.password, 10);
    await user.save();
    user.password = "******";
    res.json(user);
  }
  catch (err) {
    console.log(err);
    if (err.code == 11000) {
      res.status(400).json({ msg: "email or user_name already exist", code: 11000 })
    }

  }
})

// Log in to get a token
// Domain/users/login

router.post("/login", async (req, res) => {
  let validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  let user = await UserModel.findOne({ user_name: req.body.user_name });
  if (!user) {
    return res.status(401).json({ msg: "user_name not found" });
  }
  let passValid = await bcryptjs.compare(req.body.password, user.password);
  if (!passValid) {
    return res.status(401).json({ msg: `problem with the password` });
  }

  let newToken = createToken(user._id, user.role, user.followings, user.email, user.user_name)
  res.json({ token: newToken });

})


module.exports = router;