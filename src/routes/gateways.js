// routes/gateways.js

const express = require("express");
const router = express.Router();
const {
  listarGateways,
  crearGateway,
  actualizarGateway,
  getGateway,
  borrarGateway,
  actualizarEstadoGW,
  toggleBypass,
  buscarPorEngrasadora,
} = require("../controllers/gatewaysController");

router.get("/", listarGateways);
router.get("/:id", getGateway);
router.post("/", crearGateway);
router.put("/:id", actualizarGateway);
router.delete("/:id", borrarGateway);

router.put("/nombre/:nombre", actualizarEstadoGW);

router.patch("/:id/bypass", toggleBypass);

router.get("/buscar/:idEngrasadora", buscarPorEngrasadora);

module.exports = router;
