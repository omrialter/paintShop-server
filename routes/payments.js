const express = require("express");
const router = express.Router();
const paypal = require('../services/paypal');
const sendEmail = require("../services/mails");



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
        const subject = "New Purchase";
        const text = "Some one made a purchase, go check for more details in the website!";
        await sendEmail(subject, text);
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).send('Error: ' + error);
    }
});







module.exports = router;