const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const socketIo = require("socket.io");

const authRoutes = require("./routes/authroutes");
const chatRoutes = require("./routes/Chatroutes");

dotenv.config();
app.use(express.json());
app.use(cors({  origin: process.env.BASE_ADDR, credentials: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());


app.use("/auth", authRoutes);
app.use('/api', chatRoutes);

const io = socketIo(server, {
  cors: {
    origin: "*",
  },
  path: "/socket.io",
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on('connection', socket => {
  console.log("connected");

  socket.on("addUser", userId => {
    addUser(userId, socket.id);
    io.emit("getOnlineuser", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = users.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  socket.on('offer', (data) => {
    const { targetUserId, offer } = data;
    const targetUser = users.find((user) => user.userId === targetUserId);
    const sender = users.find((user) => user.socketId === socket.id);

    if (targetUser) {
      io.to(targetUser.socketId).emit('receiveOffer', { senderId: sender.userId , offer });
    }
  });

  socket.on('answer', (data) => {
    const { targetUserId, answer } = data;
    const targetUser = users.find((user) => user.userId === targetUserId);

    const sender = users.find((user) => user.socketId === socket.id);

    console.log("targetUserId", targetUser);
    console.log("answer", data);

    if (targetUser) {
      io.to(targetUser.socketId).emit('receiveAnswer', { senderId: sender.senderId, answer });
    }
  });


  socket.on('disconnect', () => {
    console.log("disconnected");
    removeUser(socket.id);
    io.emit("getOnlineuser", users);
  });
});



app.get("/", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.send(`Database Connected to ${process.env.BASE_ADDR}`);
  } else {
    res.send("Database connection failed.");
  }
});

module.exports = {app, server, io};
