// routes/engrasadoras.js

const express = require("express");
const router = express.Router();
const {
  getTodas,
  actualizarSeteo,
  agregarComentario,
} = require("../controllers/engrasadorasController");

router.get("/", getTodas);
router.put("/:id", actualizarSeteo);
router.post("/:id/comentarios", agregarComentario);

module.exports = router;
