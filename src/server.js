// src/server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const engrasadorasRoutes = require("./routes/engrasadoras");

dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/engrasadoras", engrasadorasRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conectado a MongoDB");
    app.listen(process.env.PORT, () =>
      console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

app.get("/ingreso", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/ingresoMaq.html"));
});

app.get("/detalle", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/detalle.html"));
});
