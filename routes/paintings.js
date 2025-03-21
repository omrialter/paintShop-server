const express = require("express");
const router = express.Router();
const { PaintingModel, validatePainting, validateUpdate } = require("../models/paintingModel")
const { auth } = require("../auth/auth.js");
const cloudinary = require("cloudinary").v2;
const { config } = require("../config/secret");



cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

router.get("/", async (req, res) => {
    res.json({ msg: "Paintings work" });
})

router.get("/allPaintings", async (req, res) => {
    const perPage = parseInt(req.query.limit) || 9;  // dynamically get limit
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    try {
        const paintings = await PaintingModel.find({})
            .limit(perPage)
            .skip((page - 1) * perPage);

        const totalPaintings = await PaintingModel.countDocuments({});

        res.json({
            paintings,
            currentPage: page,
            perPage,
            totalPaintings,
            totalPages: Math.ceil(totalPaintings / perPage)
        });
    } catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});


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

router.post("/cloud", async (req, res) => {
    try {
        const dataUpload = await cloudinary.uploader.upload(req.body.image, { unique_filename: true })
        res.json({ data: dataUpload });  // Respond with the uploaded image data
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})



router.put("/:id", auth, async (req, res) => {
    let validBody = validateUpdate(req.body);

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





router.patch('/updateAvailability', async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Please provide an array of painting IDs." });
        }

        const paintings = await PaintingModel.find({ _id: { $in: ids } });

        if (paintings.length !== ids.length) {
            return res.status(404).json({ message: "One or more paintings not found." });
        }

        const updatePromises = paintings.map(painting =>
            PaintingModel.findByIdAndUpdate(
                painting._id,
                { available: !painting.available },
                { new: true }
            )
        );

        const updatedPaintings = await Promise.all(updatePromises);

        res.json({
            message: "Paintings availability successfully updated.",
            updatedPaintings
        });

    } catch (error) {
        console.error('Error updating paintings:', error);
        res.status(502).json({ message: 'Failed to update paintings', error });
    }
});



router.delete("/:id", auth, async (req, res) => {
    let id = req.params.id;
    let data;
    try {
        data = await PaintingModel.deleteOne({ _id: id });

        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }

})


module.exports = router;