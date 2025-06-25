// routes/engrasadoras.js

const express = require("express");
const router = express.Router();
const {
  getTodas,
  actualizarSeteo,
  agregarComentario,
  eliminarComentario,
} = require("../controllers/engrasadorasController");

router.get("/", getTodas);
router.put("/:id", actualizarSeteo);
router.post("/:id/comentarios", agregarComentario);
router.delete("/:id/comentarios/:index", eliminarComentario);

module.exports = router;
