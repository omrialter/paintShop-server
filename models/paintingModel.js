const mongoose = require("mongoose");
const Joi = require("joi");



const paintingSchema = new mongoose.Schema({
    name: String,
    price: String,
    available: {
        type: Boolean,
        default: true
    },
    desc: String,
    image_url: String,

    date_created: {
        type: Date, default: Date.now
    },
})
exports.PaintingModel = mongoose.model("paintings", paintingSchema);






exports.validatePainting = (_reqBody) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        price: Joi.string().min(2).max(15).required(),
        desc: Joi.string().min(3).max(60).required(),
        image_url: Joi.string().min(2).max(500).required(),

    })
    return joiSchema.validate(_reqBody)
}





