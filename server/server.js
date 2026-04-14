require('dotenv').config()
const path = require('path')
const express = require('express')
const app = express()
const PORT = process.env.PORT
const cors = require('cors')
const router = require('./routes/routes')
const db_connection = require('./config/db')
const cookieParser = require('cookie-parser')
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(cookieParser());
const server = http.createServer(app)

const allowedOrigins = [
    process.env.CLIENT_URL,       // production (vercel)
    process.env.CLIENT_URL_DEV,   // local frontend
    "http://localhost:5173",
    "http://localhost:5000"
].filter(Boolean);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (origin.startsWith("http://192.168.") || origin.startsWith("http://127.0.0.1") || origin.startsWith("http://10.")) return true;
    return false;
};

app.use(cors({
    origin: function (origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST"]
    }
})

let users = {};

// 🛡️ Middleware: Authenticate Socket Connection
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error: No token provided"));
        
        const decoded = jwt.verify(token, process.env.JWT_secret);
        socket.userId = decoded.userId; // Save userId to socket object securely
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid or expired token"));
    }
});

io.on("connection", (socket) => {
    // console.log("User connected:", socket.userId);

    // 🔥 Trust the secure token ID, ignore generic "join" payloads from untrusted clients
    socket.on("join", () => {
        users[socket.userId] = socket.id;
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
        if (socket.userId && users[socket.userId] === socket.id) {
            delete users[socket.userId]; // Clean up memory leak!
        }
    });
});

app.set("io", io);
app.set("users", users);

app.use('/', router);
app.get("/test", (req, res) => {
    console.log("✅ TEST API HIT");
    res.send("OK");
});

app.get('*all', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

db_connection()
server.listen(PORT, () => {
    console.log('Server is running on PORT', PORT)
})
