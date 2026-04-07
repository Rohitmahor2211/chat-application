const userSchema = require('../modal/user.schema')
const chatSchema = require('../modal/chat.schema')
const messageSchema = require('../modal/message.schema')
const mongoose = require('mongoose')

const dashboard = async (req, res) => {
    const userId = req.user.userId;

    try {
        const currentUser = await userSchema.findById(userId).select("blockedUsers").lean();
        const blockedByMeIds = (currentUser?.blockedUsers || []).map(id => id.toString());

        const response = await userSchema.find({
            _id: { $ne: userId },
        }).select("profileName profilePic blockedUsers").lean();

        if (!response) {
            return res.status(404).json({ message: "no users" });
        }

        const myChats = await chatSchema.find({ participants: userId });
        const chatIds = myChats.map(c => c._id);

        const unreadCounts = await messageSchema.aggregate([
            { 
                $match: { 
                    chatId: { $in: chatIds }, 
                    senderId: { $ne: new mongoose.Types.ObjectId(userId) }, 
                    seen: false 
                } 
            },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);

        const unreadMap = {};
        unreadCounts.forEach(item => {
            unreadMap[item._id.toString()] = item.count;
        });

        const usersWithMetadata = response.map(user => {
            const userIdStr = user._id.toString();
            return {
                ...user,
                unreadCount: unreadMap[userIdStr] || 0,
                isBlockedByMe: blockedByMeIds.includes(userIdStr),
                hasBlockedMe: (user.blockedUsers || []).some(id => id.toString() === userId.toString()),
            };
        });

        // Optional: Filter out users who have blocked me if we want them totally hidden, 
        // but for now let's just mark them for the UI logic.
        return res.status(200).json({
            message: "all users send to client..!",
            response: usersWithMetadata
        })
    } catch (error) {
        res.status(500).json({
            message: "server Error",
            error: error.message
        })
    }
}

const searchUsers = async (req, res) => {
    const userId = req.user.userId;
    const { q } = req.query;

    try {
        if (!q || !q.trim()) {
            return res.status(200).json({ results: [] });
        }

        const currentUser = await userSchema.findById(userId).select("blockedUsers").lean();
        const blockedByMeIds = (currentUser?.blockedUsers || []).map(id => id.toString());

        const results = await userSchema.find({
            _id: { $ne: userId },
            profileName: { $regex: q.trim(), $options: 'i' }
        }).select("profileName profilePic blockedUsers").lean();

        const resultsWithMetadata = results.map(user => {
            const userIdStr = user._id.toString();
            return {
                ...user,
                isBlockedByMe: blockedByMeIds.includes(userIdStr),
                hasBlockedMe: (user.blockedUsers || []).some(id => id.toString() === userId.toString()),
            };
        });

        return res.status(200).json({ results: resultsWithMetadata });
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
}

module.exports = { dashboard, searchUsers }