// db.js
const mongoose = require("mongoose");
require("dotenv").config();

function conectarDB() {
  return mongoose.connect(process.env.MONGO_URI);
}

module.exports = conectarDB;
