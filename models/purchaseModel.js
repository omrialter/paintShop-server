const mongoose = require("mongoose");
const Joi = require("joi");



const purchaseSchema = new mongoose.Schema({
    paintings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "paintings",
    }],
    total: Number,
    first_name: String,
    last_name: String,
    email: String,
    phone_number: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zip_code: String,
    date_created: {
        type: Date, default: Date.now
    },
})
exports.PurchaseModel = mongoose.model("purchases", purchaseSchema);



exports.validatePurchase = (_reqBody) => {
    const Joi = require('joi').extend(require('joi-objectid')); // Ensure Joi ObjectId is extended

    let joiSchema = Joi.object({
        paintings: Joi.array().items(Joi.objectId().required()).min(1).required(),
        total: Joi.number().min(0).required(),
        first_name: Joi.string().min(2).max(50).required(),
        last_name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(4).max(200).email().required(),
        phone_number: Joi.string().min(8).max(13).required(),
        address: Joi.string().min(3).max(100).required(),
        country: Joi.string().min(2).max(20).required(),
        zip_code: Joi.string().min(2).max(20).required(),
        city: Joi.string().min(2).max(20).required(),
        state: Joi.string().min(2).max(20).when('country', { is: 'USA', then: Joi.required() }),
    })
    return joiSchema.validate(_reqBody);
}







