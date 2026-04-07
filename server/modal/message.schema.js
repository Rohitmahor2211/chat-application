const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User_Account",
        required: true
    },

    // 🔥 Message content
    text: {
        type: String,
        default: ""
    },

    image: {
        type: String, // cloudinary URL
        default: null
    },

    // 🔥 Message status
    seen: {
        type: Boolean,
        default: false
    },

    // 🔥 Emoji reactions
    reactions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User_Account"
        },
        emoji: String
    }],

    // 🔥 Auto-delete after 30 days
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        index: { expires: 0 }
    }

}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);