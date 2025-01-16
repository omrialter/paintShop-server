const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserModel, validateUser, validateLogin, createToken, validateUpdate, validateChangePass } = require("../models/userModel")
const { auth, authAdmin } = require("../auth/auth.js");
const router = express.Router();

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

router.get("/", async (req, res) => {
  res.json({ msg: "Users works Mate!" });
})


// only check the token 
router.get("/checkToken", auth, async (req, res) => {
  res.json({ _id: req.tokenData._id, role: req.tokenData.role });
})


// Get user info 
// Domain/users/userInfo
router.get("/userInfo", auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 }).
      res.json(user)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})



//get all users(only admin)
//Domain/users/userList
router.get("/usersList", authAdmin, async (req, res) => {
  try {
    let perPage = req.query.perPage || 8;
    let page = req.query.page - 1 || 0;
    let data = await UserModel
      .find({}, { password: 0 })
      .limit(perPage)
      .skip(page * perPage)
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})



router.get("/count", async (req, res) => {
  try {
    let perPage = req.query.perPage || 8;
    const count = await UserModel.countDocuments({});
    res.json({ count, pages: Math.ceil(count / perPage) });
  }
  catch (err) {
    console.log("im an error");
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/search", auth, async (req, res) => {
  let s = req.query.s;
  let searchExp = new RegExp(s, "i");
  try {
    let data = await UserModel
      .find({ user_name: searchExp })
      .limit(10)
    res.json(data);
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

// Update user (you cant update password or email)
// Domain/users/(id of the user you want to update)

router.put("/:id", auth, async (req, res) => {
  let validBody = validateUpdate(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details)
  }
  try {
    let id = req.params.id.trim();
    let data;
    if (req.tokenData.role == "admin") {
      data = await UserModel.updateOne({ _id: id }, req.body);
    } else if (id == req.tokenData._id) {
      data = await UserModel.updateOne({ _id: id }, req.body);
    }
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})




// Delete
// Domain/users/(id of the user)
router.delete("/:id", auth, async (req, res) => {
  let id = req.params.id;
  let data;
  try {
    if (req.tokenData.role == "admin" && id != "643aeef089f3063e797886ae") {
      data = await UserModel.deleteOne({ _id: id });
    }
    else if (id == req.tokenData._id) {
      data = await UserModel.deleteOne({ _id: id });
    }
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }

})



module.exports = router;