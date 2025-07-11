// routes/engrasadoras.js

const express = require("express");
const router = express.Router();
const {
  getTodas,
  actualizarSeteo,
  agregarComentario,
  eliminarComentario,
  resetAccionamientos,
  resetHistorial,
  switchOnOff,
  crearEngrasadora,
  verificarId,
} = require("../controllers/engrasadorasController");

router.get("/", getTodas);
router.put("/:id", actualizarSeteo);
router.post("/:id/comentarios", agregarComentario);
router.delete("/:id/comentarios/:index", eliminarComentario);
router.put("/:id/resetAccionamientos", resetAccionamientos);
router.put("/:id/resetHistorial", resetHistorial);
router.put("/:id/switchOnOff", switchOnOff);
router.post("/", crearEngrasadora);
router.get("/:id", verificarId);

module.exports = router;
