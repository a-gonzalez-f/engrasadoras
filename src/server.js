// src/server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { exec } = require("child_process");

const engrasadorasRoutes = require("./routes/engrasadoras");
const gatewaysRoutes = require("./routes/gateways");
const sistemaRoutes = require("./routes/sistema");

dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/engrasadoras", engrasadorasRoutes);
app.use("/api/gateways", gatewaysRoutes);
app.use("/api/sistema", sistemaRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dashboard/index.html"));
});

app.get("/ingreso", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/ingresoMaq/ingresoMaq.html"));
});

app.get("/detalle", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/engrasadoras/detalle.html"));
});

app.get("/sistema", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/sistema/sistema.html"));
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conectado a MongoDB");

    server.listen(process.env.PORT, () =>
      console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`)
    );

    ejecutarSnapshotHora();

    setInterval(ejecutarSnapshotHora, 60 * 60 * 1000);

    // server.listen(process.env.PORT, "0.0.0.0", () =>
    //   console.log(`Servidor corriendo en el puerto ${process.env.PORT}`)
    // );
  })
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

function ejecutarSnapshotHora() {
  const comando = `node ${path.join(__dirname, "snapshotHora.js")}`;
  console.log(`⏱ Ejecutando snapshot hora: ${new Date().toISOString()}`);

  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error ejecutando snapshot hora:", error.message);
      return;
    }
    if (stderr) console.error("⚠️", stderr);
    if (stdout) console.log(stdout.trim());
  });
}
