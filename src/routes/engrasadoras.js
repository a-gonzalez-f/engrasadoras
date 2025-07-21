// routes/engrasadoras.js

const express = require("express");
const router = express.Router();
const {
  setearTiempo,
  setearEjes,
  resetAccionamientos,
  getPorLinea,
  actualizarSeteo,
  agregarComentario,
  eliminarComentario,
  resetHistorial,
  switchOnOff,
  crearEngrasadora,
  verificarId,
  getUnaEngrasadora,
} = require("../controllers/engrasadorasController");

router.post("/setearTiempo", setearTiempo);
router.post("/setearEjes", setearEjes);
router.post("/resetAccionam", resetAccionamientos);

router.get("/", getPorLinea);
router.put("/:id", actualizarSeteo);
router.post("/:id/comentarios", agregarComentario);
router.delete("/:id/comentarios/:index", eliminarComentario);
router.put("/:id/resetHistorial", resetHistorial);
router.put("/:id/switchOnOff", switchOnOff);
router.post("/", crearEngrasadora);
router.get("/:id", verificarId);
router.get("/full/:id", getUnaEngrasadora);

module.exports = router;
