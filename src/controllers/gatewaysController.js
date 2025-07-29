// controllers/gatewaysController.js

const Gateway = require("../models/gateway");

exports.listarGateways = async (req, res) => {
  try {
    const gateways = await Gateway.find()
      .populate("engrasadoras", "id nombre estado")
      .lean();
    res.json(gateways);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error listando gateways" });
  }
};

exports.getGateway = async (req, res) => {
  try {
    const gw = await Gateway.findById(req.params.id)
      .populate("engrasadoras", "id nombre estado")
      .lean();
    if (!gw) return res.status(404).json({ mensaje: "No encontrado" });
    res.json(gw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error" });
  }
};

exports.crearGateway = async (req, res) => {
  try {
    const gw = await Gateway.create(req.body);
    res.status(201).json(gw);
  } catch (err) {
    console.error(err);
    res.status(400).json({ mensaje: "Error creando gateway" });
  }
};

exports.actualizarGateway = async (req, res) => {
  try {
    const gw = await Gateway.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!gw) return res.status(404).json({ mensaje: "No encontrado" });
    res.json(gw);
  } catch (err) {
    console.error(err);
    res.status(400).json({ mensaje: "Error actualizando gateway" });
  }
};

exports.borrarGateway = async (req, res) => {
  try {
    await Gateway.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Gateway eliminado" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ mensaje: "Error eliminando gateway" });
  }
};
