// models/sistema.js

const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const ConfigSistema = new mongoose.Schema(
  {
    request_time: { type: Number, required: true },
    time_out: { type: Number, required: true, default: 1 },
    user: { type: String, default: "userX" },
    logs: [LogSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("configSistema", ConfigSistema);
