const express = require("express");
const { validatePurchase, PurchaseModel } = require("../models/purchaseModel");
const router = express.Router();
const { auth } = require("../auth/auth");
const mongoose = require("mongoose");


router.get("/", async (req, res) => {
    res.json({ msg: "Purchases work" });
})


router.get("/getAll", auth, async (req, res) => {
    try {
        let data = await PurchaseModel.find({}).sort('-date_created').populate({ path: "paintings", select: ["name", "image_url"] });
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.get("/count-unchecked", async (req, res) => {
    try {
        let perPage = req.query.perPage || 10;
        const count = await PurchaseModel.countDocuments({ checked: false });
        res.json({ count, pages: Math.ceil(count / perPage) });
    }
    catch (err) {
        console.log("im an error");
        console.log(err);
        res.status(502).json({ err })
    }
})



router.post("/", async (req, res) => {
    let validBody = validatePurchase(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        console.log("Before conversion:", req.body.paintings);
        req.body.paintings = req.body.paintings.map(id => new mongoose.Types.ObjectId(id));
        let order = new PurchaseModel(req.body);
        await order.save();
        res.json(order);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
})





router.patch("/changeIsChecked/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;
        const purchasePost = await PurchaseModel.findById(id);
        if (!purchasePost) {
            return res.status(404).json({ message: "Painting not found" });
        }

        const update = await PurchaseModel.findByIdAndUpdate(
            id,
            { checked: !purchasePost.checked },
            { new: true }
        )
        res.json(update);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})


module.exports = router;