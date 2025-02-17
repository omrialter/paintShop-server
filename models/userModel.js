const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("../config/secret");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    date_created: {
        type: Date, default: Date.now
    },
    role: {
        type: String, default: "user"
    },
})
exports.UserModel = mongoose.model("users", userSchema);
//const user = module.exports = mongoose.model("users", userSchema);

exports.createToken = (user_id, role) => {
    let token = jwt.sign({ _id: user_id, role: role }, config.tokenSecret, { expiresIn: "5h" });

    return token;
}



exports.validateUser = (_reqBody) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(200).required(),
        email: Joi.string().min(2).max(200).email().required(),
        password: Joi.string().min(3).max(20).required(),
    })
    return joiSchema.validate(_reqBody)
}

exports.validateLogin = (_reqBody) => {
    let joiSchema = Joi.object({
        email: Joi.string().min(2).max(100).email().required(),
        password: Joi.string().min(6).max(20).required(),

    })
    return joiSchema.validate(_reqBody)
}

exports.validateUpdate = (_reqBody) => {
    let joiSchema = Joi.object({
        email: Joi.string().min(2).max(100).email().required(),
        password: Joi.forbidden(),
        name: Joi.string().min(2).max(200).allow(null, ""),

    })
    return joiSchema.validate(_reqBody)
}

