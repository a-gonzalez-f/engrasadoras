// routes/engrasadoras.js

const express = require("express");
const router = express.Router();
const {
  setearTiempo,
  setearEjes,
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
} = require("../controllers/engrasadorasController");

router.post("/setearTiempo", setearTiempo);
router.post("/setearEjes", setearEjes);
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

module.exports = router;
