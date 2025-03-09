const express = require("express");
const router = express.Router();
const paypal = require('../services/paypal');



router.get("/", async (req, res) => {
    res.json({ msg: "Express homepage work" });
})




router.post('/pay', async (req, res) => {
    try {
        const { items, total } = req.body;
        const url = await paypal.createOrder(items, total)
        res.json(url);
    } catch (error) {
        res.send('Error: ' + error)
    }
})


router.get('/completeOrder', async (req, res) => {
    try {
        const token = req.query.token;
        await paypal.capturePayment(token);
        res.send('Payment successfully captured');
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).send('Error: ' + error);
    }
});





module.exports = router;