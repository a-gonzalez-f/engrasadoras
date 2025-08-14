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
} = require("../controllers/gatewaysController");

router.get("/", listarGateways);
router.get("/:id", getGateway);
router.post("/", crearGateway);
router.put("/:id", actualizarGateway);
router.delete("/:id", borrarGateway);

router.put("/nombre/:nombre", actualizarEstadoGW);

module.exports = router;
