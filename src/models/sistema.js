// models/sistema.js

const mongoose = require("mongoose");

const ConfigSistema = new mongoose.Schema(
  {
    request_time: { type: Number, required: true },
    user: { type: String, default: "userX" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("configSistema", ConfigSistema);
