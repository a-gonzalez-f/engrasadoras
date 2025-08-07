// routes/sistema.js

const express = require("express");
const router = express.Router();
const {
  obtenerEstadoSistema,
  guardarTime,
  getTime,
} = require("../controllers/sistemaController");

router.get("/status", obtenerEstadoSistema);
router.post("/set-time", guardarTime);
router.get("/get-time", getTime);

module.exports = router;
