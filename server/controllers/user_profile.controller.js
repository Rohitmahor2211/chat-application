const { z } = require("zod")
const path = require("path")
const fs = require('fs')
const fileSchema = require('../modal/fileSchema.zod')
const cloudinary = require('../config/cloudinary')
const bcrypt = require('bcrypt')
const profileSchema = require('../modal/profile.schema')


const user_profile = async (req, res) => {
    const userId = req.user.userId;
    // 1. Text fields are now available here    
    const { profileName, password } = req.body;
    // 2. File info is available here
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const validateFile = fileSchema.parse(file)
        console.log("File received and validated:", validateFile.originalname);

        const cloudinary_response = await cloudinary.uploader.upload(req.file.path, {
            folder: "instagram" // Folder name in Cloudinary
        })
        fs.unlinkSync(req.file.path)

        const exesting_profile = await profileSchema.findOne({ profileName })

        if (exesting_profile) {
            return res.status(400).json({
                message: "profile already exists..!"
            })
        }


        const hashPassword = await bcrypt.hash(password, 10)
        try {
            const response = await profileSchema.create({
                userId, profileName, password: hashPassword, profilePic: cloudinary_response.secure_url
            })

            console.log(response)
            return res.status(200).json({
                message: "user profile created successfully..! 🚀",
                user: profileName,
                imageUrl: cloudinary_response.secure_url
            });
        } catch (error) {
            return res.status(404).json({
                message: "user profile not created..!",
                error: error.message
            })
        }
    }
    catch (error) {
        if (file && file.path) {
            fs.unlink(file.path, (err) => {
                if (err) console.error("Error deleting invalid file:", err);
                else console.log("Successfully deleted invalid upload:", file.path);
            });
        }

        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors, message: "zod schema not matched" });
        }
        res.status(500).json({ error: "Something went wrong" });
    }
    // console.log("Saving file to database path:", file.path);

};

module.exports = { user_profile };