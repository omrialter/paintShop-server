const mongoose = require("mongoose");
const Joi = require("joi");



const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    checked: {
        type: Boolean, default: false
    },
    date_created: {
        type: Date, default: Date.now
    },
})
exports.ContactModel = mongoose.model("contacts", contactSchema);






exports.validateContact = (_reqBody) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(2).max(200).email().required(),
        subject: Joi.string().min(3).max(60).required(),
        message: Joi.string().min(2).max(500).required(),

    })
    return joiSchema.validate(_reqBody)
}





