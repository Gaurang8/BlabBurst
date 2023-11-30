const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

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


app.get("/", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.send(`Database Connected to ${process.env.BASE_ADDR}`);
  } else {
    res.send("Database connection failed.");
  }
});

module.exports = app;
