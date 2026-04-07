const messageSchema = require("../modal/message.schema");
const chatSchema = require('../modal/chat.schema');
const cloudinary = require('../config/cloudinary')
const fs = require('fs')
const userSchema = require('../modal/user.schema');


const create_chat = async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user.userId;
    try {
        // 🔍 check if chat already exists
        let chat = await chatSchema.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // 🆕 if not → create
        if (!chat) {
            chat = await chatSchema.create({
                participants: [senderId, receiverId]
            });
        }

        res.status(200).json({ chat });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}


const messagess = async (req, res) => {
    try {
        const { chatId } = req.params;
        const myId = req.user.userId;

        // 🛡️ Security: Check if user is participant
        const chat = await chatSchema.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const isParticipant = chat.participants.some(p => p.toString() === myId);
        if (!isParticipant) {
            return res.status(403).json({ message: "Unauthorized access to this chat" });
        }

        const message = await messageSchema.find({ chatId }).sort({ createdAt: 1 });
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
}


const sendMessage = async (req, res) => {
    try {
        const { chatId, text, receiverId } = req.body;
        const senderId = req.user.userId;

        const [sender, receiver] = await Promise.all([
            userSchema.findById(senderId).select("blockedUsers"),
            userSchema.findById(receiverId).select("blockedUsers")
        ]);

        const isByMe = sender.blockedUsers.some(id => id.toString() === receiverId.toString());
        const isByThem = receiver.blockedUsers.some(id => id.toString() === senderId.toString());

        if (isByMe || isByThem) {
            return res.status(403).json({
                message: "Action restricted due to block status"
            });
        }

        let imageUrl = null;
        if (req.file) {
            const cloudinary_response = await cloudinary.uploader.upload(req.file.path, {
                folder: "instagram_chats"
            });
            imageUrl = cloudinary_response.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const newMessage = await messageSchema.create({
            chatId,
            senderId,
            text: text || "",
            image: imageUrl
        });

        const io = req.app.get("io");
        const users = req.app.get("users");

        const receiverSocketId = users[receiverId];
        if (receiverSocketId) {
            // 🔥 1. send actual message
            io.to(receiverSocketId).emit("receiveMessage", newMessage);
            
            // 🔥 2. send notification
            io.to(receiverSocketId).emit("newMessageNotification", {
                senderId,
                chatId
            });
        }

        res.status(200).json(newMessage);

    } catch (error) {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const markMessagesSeen = async (req, res) => {
    try {
        const { chatId } = req.body;
        const myId = req.user.userId;

        const updated = await messageSchema.updateMany(
            { chatId, senderId: { $ne: myId }, seen: false },
            { $set: { seen: true } }
        );

        if (updated.modifiedCount > 0) {
            const chat = await chatSchema.findById(chatId);
            if (chat) {
                const otherParticipantId = chat.participants.find(p => p.toString() !== myId);
                if (otherParticipantId) {
                    const io = req.app.get("io");
                    const users = req.app.get("users");
                    const socketId = users[otherParticipantId.toString()];
                    if (socketId) {
                        io.to(socketId).emit("messagesSeen", { chatId });
                    }
                }
            }
        }
        res.status(200).json({ success: true, count: updated.modifiedCount });
    } catch (error) {
        res.status(500).json({ message: "Server Error" })
    }
};


// 🔥 React to a message with emoji
const reactToMessage = async (req, res) => {
    try {
        const { messageId, emoji } = req.body;
        const userId = req.user.userId;

        const msg = await messageSchema.findById(messageId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        // Check if user already reacted with this emoji — toggle off
        const existingIndex = msg.reactions.findIndex(
            r => r.userId.toString() === userId && r.emoji === emoji
        );

        if (existingIndex > -1) {
            msg.reactions.splice(existingIndex, 1);
        } else {
            // Remove any previous reaction from this user, then add new
            msg.reactions = msg.reactions.filter(r => r.userId.toString() !== userId);
            msg.reactions.push({ userId, emoji });
        }

        await msg.save();

        // Notify both participants via socket
        const chat = await chatSchema.findById(msg.chatId);
        if (chat) {
            const io = req.app.get("io");
            const users = req.app.get("users");
            chat.participants.forEach(pId => {
                const socketId = users[pId.toString()];
                if (socketId) {
                    io.to(socketId).emit("messageReaction", {
                        messageId,
                        reactions: msg.reactions
                    });
                }
            });
        }

        res.status(200).json({ reactions: msg.reactions });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// 🔥 Block a user
const blockUser = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const myId = req.user.userId;

        await userSchema.findByIdAndUpdate(myId, {
            $addToSet: { blockedUsers: targetUserId }
        });

        // 🔥 Notify target user via socket
        const io = req.app.get("io");
        const users = req.app.get("users");
        const targetSocketId = users[targetUserId];
        if (targetSocketId) {
            io.to(targetSocketId).emit("userBlocked", { blockerId: myId });
        }

        res.status(200).json({ message: "User blocked", blockedUserId: targetUserId });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


// 🔥 Unblock a user
const unblockUser = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const myId = req.user.userId;

        await userSchema.findByIdAndUpdate(myId, {
            $pull: { blockedUsers: targetUserId }
        });

        // 🔥 Notify target user via socket
        const io = req.app.get("io");
        const users = req.app.get("users");
        const targetSocketId = users[targetUserId];
        if (targetSocketId) {
            io.to(targetSocketId).emit("userUnblocked", { blockerId: myId });
        }

        res.status(200).json({ message: "User unblocked", unblockedUserId: targetUserId });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


// 🔥 Delete a message
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const myId = req.user.userId;

        const msg = await messageSchema.findById(messageId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        // 🛡️ Security: Only sender can delete
        if (msg.senderId.toString() !== myId) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        const chatId = msg.chatId;
        await messageSchema.findByIdAndDelete(messageId);

        // 🔥 Notify participants via socket
        const chat = await chatSchema.findById(chatId);
        if (chat) {
            const io = req.app.get("io");
            const users = req.app.get("users");
            chat.participants.forEach(pId => {
                const socketId = users[pId.toString()];
                if (socketId) {
                    io.to(socketId).emit("messageDeleted", { messageId, chatId });
                }
            });
        }

        res.status(200).json({ success: true, message: "Message deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


module.exports = { create_chat, messagess, sendMessage, markMessagesSeen, reactToMessage, blockUser, unblockUser, deleteMessage }
