import path from 'path';
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'Please upload a file' });
        }

        const filename = `${req.file.fieldname}-${Date.now()}`;

        // Compress and convert to webp using sharp
        const buffer = await sharp(req.file.buffer)
            .webp({ quality: 80 })
            .toBuffer();

        // Upload to Cloudinary
        const imageUrl = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'glitz-creativez',
                    public_id: filename, 
                    format: 'webp',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                }
            );
            uploadStream.end(buffer);
        });

        res.send({
            message: 'Image uploaded successfully',
            image: imageUrl,
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).send({ message: 'Failed to upload image' });
    }
});

export default router;
