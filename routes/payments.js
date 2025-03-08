const express = require("express");
const router = express.Router();
const paypal = require('../services/paypal');



router.get("/", async (req, res) => {
    res.json({ msg: "Express homepage work" });
})


router.get("/getToken", async (req, res) => {
    try {
        const data = await paypal.getTokenOk();
        res.json({ data });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error creating PayPal order');
    }
})



router.get('/pay', async (req, res) => {
    try {
        const url = await paypal.createOrder()
        res.json(url);
        // res.redirect(url)
    } catch (error) {
        res.send('Error: ' + error)
    }
})


router.get('/completeOrder', async (req, res) => {
    try {
        const token = req.query.token;
        const result = await paypal.capturePayment(token);
        res.send('Payment successfully captured');
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).send('Error: ' + error);
    }
});





module.exports = router;