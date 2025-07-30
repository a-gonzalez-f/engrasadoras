// routes/sistema.js

const express = require("express");
const router = express.Router();
const { obtenerEstadoSistema } = require("../controllers/sistemaController");

router.get("/status", obtenerEstadoSistema);

module.exports = router;
