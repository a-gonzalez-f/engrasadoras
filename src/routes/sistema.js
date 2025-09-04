// routes/sistema.js

const express = require("express");
const router = express.Router();
const {
  obtenerEstadoSistema,
  guardarTime,
  getTime,
  getLogsSistema,
  agregarLogSistema,
} = require("../controllers/sistemaController");

router.get("/status", obtenerEstadoSistema);
router.post("/set-time", guardarTime);
router.get("/get-time", getTime);

router.get("/logs", getLogsSistema);
router.post("/logs", agregarLogSistema);

module.exports = router;
