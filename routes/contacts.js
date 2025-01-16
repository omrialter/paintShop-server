const express = require("express");
const { authAdmin } = require("../auth/auth");
const { ContactModel, validateContact } = require("../models/contactModel");
const router = express.Router();

router.get("/", async (req, res) => {
    res.json({ msg: "Contacts work" });
})


router.get("/getAll", authAdmin, async (req, res) => {
    try {
        let data = await ContactModel.find({});
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.get("/count", async (req, res) => {
    try {
        let perPage = req.query.perPage || 10;
        const count = await ContactModel.countDocuments({});
        res.json({ count, pages: Math.ceil(count / perPage) });
    }
    catch (err) {
        console.log("im an error");
        console.log(err);
        res.status(502).json({ err })
    }
})

router.post("/", async (req, res) => {
    let validBody = validateContact(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let contact = new ContactModel(req.body);
        await contact.save();
        res.json(contact);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

module.exports = router;