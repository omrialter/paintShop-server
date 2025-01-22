const express = require("express");
const router = express.Router();
const { PaintingModel, validatePainting } = require("../models/paintingModel")
const { auth } = require("../auth/auth.js");

router.get("/", async (req, res) => {
    res.json({ msg: "Paintings work" });
})

router.get("/allPaintings", async (req, res) => {
    try {
        let data = await PaintingModel.find({})
        res.json(data)
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.get("/OnePainting/:id", async (req, res) => {
    try {
        const id = req.params.id;
        let data = await PaintingModel.findOne({ _id: id })
        res.json(data)
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})




router.get("/count", async (req, res) => {
    try {
        let perPage = req.query.perPage || 10;
        const count = await PaintingModel.countDocuments({});
        res.json({ count, pages: Math.ceil(count / perPage) });
    }
    catch (err) {
        console.log("im an error");
        console.log(err);
        res.status(502).json({ err })
    }
})

router.post("/", auth, async (req, res) => {
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



router.put("/:id", auth, async (req, res) => {
    let validBody = validatePainting(req.body);

    if (validBody.error) {
        return res.status(400).json(validBody.error.details)
    }
    try {
        let id = req.params.id;
        let data;
        data = await PaintingModel.updateOne({ _id: id }, req.body);

        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})



router.patch("/changeAvailablity/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;
        const painting = await PaintingModel.findById(id);
        if (!painting) {
            return res.status(404).json({ message: "Painting not found" });
        }

        const updatedPainting = await PaintingModel.findByIdAndUpdate(
            id,
            { available: !painting.available },
            { new: true }
        );

        res.json(updatedPainting);
    } catch (err) {
        console.log(err);
        res.status(502).json({ err: "Error updating painting availability", details: err.message });
    }
});


router.delete("/:id", auth, async (req, res) => {
    let id = req.params.id;
    let data;
    try {
        data = await PaintingModel.deleteOne({ id: id });

        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }

})


module.exports = router;