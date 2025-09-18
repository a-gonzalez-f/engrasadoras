// routes/engrasadoras.js

const express = require("express");
const router = express.Router();
const {
  setear,
  resetAccionamientos,
  switchOnOff,
  getPorLinea,
  actualizarSeteo,
  agregarComentario,
  eliminarComentario,
  resetHistorial,
  crearEngrasadora,
  verificarId,
  getUnaEngrasadora,
  engrasadoraActualizada,
  actualizarEngrasadora,
} = require("../controllers/engrasadorasController");

router.post("/setear", setear);
router.post("/resetAccionam", resetAccionamientos);
router.post("/switchOnOff", switchOnOff);

router.get("/", getPorLinea);
router.put("/:id", actualizarSeteo);
router.post("/:id/comentarios", agregarComentario);
router.delete("/:id/comentarios/:index", eliminarComentario);
router.put("/:id/resetHistorial", resetHistorial);
router.post("/", crearEngrasadora);
router.get("/:id", verificarId);
router.get("/full/:id", getUnaEngrasadora);
router.get("/actualizada/:id", engrasadoraActualizada);
router.put("/:id/editar", actualizarEngrasadora);

module.exports = router;
