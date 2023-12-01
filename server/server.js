const { app, server, io } = require("./app"); 
const mongoose = require("mongoose");

const port = process.env.PORT || 8000;

const url = `${process.env.MONGODB_URI}Chats?retryWrites=true&w=majority`;


mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to the database successfully");
    server.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database: ", error);
  });
