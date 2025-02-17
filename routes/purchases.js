const express = require("express");
const { validatePurchase, PurchaseModel } = require("../models/purchaseModel");
const router = express.Router();

router.get("/", async (req, res) => {
    res.json({ msg: "Purchases work" });
})



router.post("/", async (req, res) => {
    let validBody = validatePurchase(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let order = new PurchaseModel(req.body);
        await order.save();
        res.json(order);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
})


module.exports = router;