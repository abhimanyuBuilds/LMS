import express from "express";
import { upload } from "../utils/multer.js";
import { uploadOnCLoudinary } from "./utils/cloudinary.js";

const router = express.Router();

router.route('/upload-video').post(upload.single('file'), async (req, res) => {
    try {
        const result = await uploadOnCLoudinary(req.file.path);
        res.status(200).json({
            success: true ,
            message: "File uploaded Successfully",
            data: result
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error while Uploading file."
        })
    }
});

export default router