const express = require("express");
const { auth } = require("../auth/auth");
const { ContactModel, validateContact } = require("../models/contactModel");
const router = express.Router();

router.get("/", async (req, res) => {
    res.json({ msg: "Contacts work" });
})


router.get("/getAll", auth, async (req, res) => {
    try {
        let data = await ContactModel.find({}).sort('-date_created');;
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
        const count = await ContactModel.countDocuments({ checked: false });
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


router.patch("/changeIsChecked/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;
        const contactPost = await ContactModel.findById(id);
        if (!contactPost) {
            return res.status(404).json({ message: "Painting not found" });
        }

        const update = await ContactModel.findByIdAndUpdate(
            id,
            { checked: !contactPost.checked },
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