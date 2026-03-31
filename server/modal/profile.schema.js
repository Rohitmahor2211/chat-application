const mongoose = require("mongoose")
const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User_Account", // 🔗 link
        required: true,
        unique: true // one profile per user
    },

    profileName: { type: String, unique: true },
    password: String,
    profilePic: String,

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User_Account" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User_Account" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User_Account" }]

}, { timestamps: true });
module.exports = mongoose.model("Profile", profileSchema);