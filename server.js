const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const router = require("./routes/route.js");

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use("/api", router);

const url = "mongodb://127.0.0.1:27017/todoes";
mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected successfully to MongoDB");
    app.listen(PORT, () => {
      console.log("Express server started on port 3000");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
