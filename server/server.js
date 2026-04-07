require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT
const cors = require('cors')
const router = require('./routes/routes')
const db_connection = require('./config/db')
const cookieParser = require('cookie-parser')
const http = require("http");
const { Server } = require("socket.io");

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"]
    }
})

let users = {};

io.on("connection", (socket) => {
    // console.log("User connected");

    socket.on("join", (userId) => {
        users[userId] = socket.id;
    });

    // 🔥 👉 ADD TYPING HERE
    socket.on("typing", async ({ receiverId }) => {
        const userId = Object.keys(users).find(key => users[key] === socket.id);
        if (!userId) return;

        const receiverSocketId = users[receiverId];
        if (receiverSocketId) {
            try {
                const userSchema = require('./modal/user.schema');
                const [me, receiver] = await Promise.all([
                    userSchema.findById(userId).select("blockedUsers"),
                    userSchema.findById(receiverId).select("blockedUsers")
                ]);

                const isBlockedByMe = me?.blockedUsers?.some(id => id.toString() === receiverId.toString());
                const isBlockedByThem = receiver?.blockedUsers?.some(id => id.toString() === userId.toString());

                if (!isBlockedByMe && !isBlockedByThem) {
                    io.to(receiverSocketId).emit("typing");
                }
            } catch (err) {
                console.error("Typing indicator block check failed:", err);
            }
        }
    });

    socket.on("disconnect", () => {
        // console.log("User disconnected");
    });
});

app.set("io", io);
app.set("users", users);

app.use('/', router);

db_connection()
server.listen(PORT, () => {
    // console.log('Server is running on PORT', PORT)
})
