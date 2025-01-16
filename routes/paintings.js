const express = require("express");
const router = express.Router();
const { PaintingModel, validatePainting } = require("../models/paintingModel")
const { authAdmin } = require("../auth/auth.js");

router.get("/", async (req, res) => {
    res.json({ msg: "Paintings work" });
})

router.get("/allPaintings", async (req, res) => {
    try {
        let data = await PaintingModel
            .find({})
        res.json(data)
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.post("/", authAdmin, async (req, res) => {
    let validBody = validatePainting(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details)
    }
    try {
        let painting = new PaintingModel(req.body);

        await painting.save();

        res.json(painting);
    }
    catch (err) {
        console.log(err);
    }
})

router.delete("/:id", authAdmin, async (req, res) => {
    let id = req.params.id;
    let data;
    try {
        if (req.tokenData.role == "admin") {
            data = await PaintingModel.deleteOne({ _id: id });
        }

        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }

})


module.exports = router;