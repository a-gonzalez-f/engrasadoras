// routes/engrasadoras.js

const express = require("express");
const router = express.Router();
const {
  resumenDashboard,
  setear,
  resetAccionamientos,
  switchOnOff,
  getPorLinea,
  getPorLineaFiltrada,
  actualizarSeteo,
  agregarComentario,
  eliminarComentario,
  resetHistorial,
  crearEngrasadora,
  verificarId,
  getUnaEngrasadora,
  engrasadoraActualizada,
  actualizarEngrasadora,
  deleteEngrasadora,
  consultaExterna,
  getHistorialPaginado,
  editarID,
  ultimaVersionAll,
  resumenPorLinea,
  resumenTotal,
  accionamHora,
  snapshotId,
} = require("../controllers/engrasadorasController");

router.post("/setear", setear);
router.post("/resetAccionam", resetAccionamientos);
router.post("/switchOnOff", switchOnOff);
router.post("/editarID", editarID);

router.get("/resumen", resumenDashboard);
router.get("/", getPorLinea);
router.get("/filtrado", getPorLineaFiltrada);
router.put("/:id", actualizarSeteo);
router.post("/:id/comentarios", agregarComentario);
router.delete("/:id/comentarios/:index", eliminarComentario);
router.put("/:id/resetHistorial", resetHistorial);
router.post("/", crearEngrasadora);
router.get("/full/:id", getUnaEngrasadora);
router.get("/actualizada/:id", engrasadoraActualizada);
router.put("/:id/editar", actualizarEngrasadora);
router.delete("/:id/", deleteEngrasadora);
router.get("/ultimaVersion", ultimaVersionAll);

router.get("/consulta", consultaExterna);

router.get("/:id", verificarId);

router.get("/historial/:id", getHistorialPaginado);

// analytics ----------------------------------------------
router.get("/resumen/linea", resumenPorLinea);
router.get("/resumen/linea/:linea", resumenPorLinea);
router.get("/resumen/total", resumenTotal);
router.get("/resumenHora/accionam/:linea", accionamHora);
router.get("/snapshots/:id", snapshotId);

module.exports = router;
