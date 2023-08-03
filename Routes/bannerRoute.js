



const router = require("express").Router();
const Banner = require("../Models/bannerModel");
const multer = require('multer');
const express = require("express");

const Storage = multer.diskStorage({
    destination: 'uploads',
    filename: function (req, file, cb) {
        req.imageName = new Date().toISOString().replace(/:/g, '-') + file.originalname
        cb(null, req.imageName)
    }
})

// Serve images from the 'uploads' directory
router.use('/images', express.static('uploads'));

const upload = multer({
    storage: Storage
}).array('image'); // Use 'array' instead of 'single' for multiple file uploads

// Add the banner
router.post('/addBanner', async (req, res) => {
    try {
        // Use the multer middleware to process the uploaded files
        upload(req, res, async (err) => {
            if (err) {
                console.error(err); // Log multer-related errors
                return res.status(500).json({ success: false, msg: 'File upload failed' });
            }

            const { name, description, published } = req.body;

            // Check if any files were uploaded
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, msg: 'Invalid images data' });
            }

            const imageFileNames = req.files.map(file => file.filename);
            // Get the URLs for the uploaded images and include them in the response
            const imageUrls = imageFileNames.map(filename => {
                return `${req.protocol}://${req.get('host')}/images/${filename}`;
            });

            const addBanner = await Banner.create({
                name,
                image: imageUrls, // Store the filenames in the array
                description,
                published,
            });

            if (!addBanner) {
                return res.status(404).json({ success: false, msg: 'Banner Not Found' });
            }

            res.status(200).json({
                success: true,
                msg: 'Banner Added Successfully ......',
                data: addBanner,
            });
        });
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success: false, msg: `Backend Server Error:  ${error}` });
    }
});


//update the banner
router.put("/updateBanner/:bannerId", async (req, res) => {
    const { bannerId } = req.params;

    try {
        const bannerExists = await Banner.findOne({ _id: bannerId },);

        if (!bannerExists) {
            return res.status(404).json({ success: false, msg: `Banner Not Found` });
        }
        upload(req, res, async (err) => {
            if (err) {
                console.error(err); // Log multer-related errors
                return res.status(500).json({ success: false, msg: 'File upload failed' });
            }
            const { name, description, published, } = req.body;

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, msg: `Invalid images Found` });
            }

            const imageFileNames = req.files.map(file => file.filename);

            const imageUrls = imageFileNames.map(filename => {
                return `${req.protocol}://${req.get('host')}/images${filename}`
            })

            const updateBanner = await Banner.findByIdAndUpdate({ _id: bannerId }, {
                name: name, description: description,
                image: imageUrls,
                published: published
            }, { new: true });

            res
                .status(200)
                .json({
                    success: true,
                    msg: `Banner Updated Successfully ......`,
                    data: updateBanner,
                });
        });
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res
            .status(500)
            .json({ success: false, msg: `Backend Server Error:  ${error}` });
    }
});




//delete the banner
router.delete('/deleteBanner/:bannerId', async (req, res) => {

    const { bannerId } = req.params;

    try {

        const bannerExists = await Banner.findOneAndDelete({ _id: bannerId });

        if (!bannerExists) {
            return res.status(404).json({ success: false, msg: `Banner Not Found` })
        }

        res.status(200).json({ success: true, msg: `Banner Deleted Successfully ......`, data: bannerExists })

    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success: false, msg: `Backend Server Error:  ${error}` });
    }

});



//get all banner
router.get('/allBanner', async (req, res) => {

    try {

        const bannerExists = await Banner.find();

        if (!bannerExists) {
            return res.status(404).json({ success: false, msg: `Banner Not Found` })
        }

        res.status(200).json({ success: true, msg: `Get All Banner Successfully ......`, data: bannerExists })

    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success: false, msg: `Backend Server Error:  ${error}` });
    }

});




//get single banner
router.get('/singleBanner/:bannerId', async (req, res) => {

    const { bannerId } = req.params;
    try {

        const bannerExists = await Banner.findOne({ _id: bannerId });

        if (!bannerExists) {
            return res.status(404).json({ success: false, msg: `Banner Not Found` })
        }

        res.status(200).json({ success: true, msg: `Get Single Banner Successfully ......`, data: bannerExists })

    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success: false, msg: `Backend Server Error:  ${error}` });
    }

});




//published Banner
router.get('/publishedBanner', async (req, res) => {

    try {

        const bannerExists = await Banner.find({published : true});

        if (!bannerExists) {
            return res.status(404).json({ success: false, msg: `Banner Not Found` })
        }

        res.status(200).json({ success: true, msg: `Get Published Banner Successfully ......`, data: bannerExists })

    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ success: false, msg: `Backend Server Error:  ${error}` });
    }

});


module.exports = router;
