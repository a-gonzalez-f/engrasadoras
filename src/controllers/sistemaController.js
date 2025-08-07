// sistemaController.js

const mongoose = require("mongoose");
const ConfigSistema = require("../models/sistema");

exports.obtenerEstadoSistema = async (req, res) => {
  const estado = {
    node: true,
    mongo: mongoose.connection.readyState === 1,
    motor: global.motorActivo || false,
  };

  res.json(estado);
};

exports.guardarTime = async (req, res) => {
  const { tiempo } = req.body;

  if (!tiempo || typeof tiempo !== "number" || tiempo < 1 || tiempo > 600)
    return res.status(400).json({ error: "Tiempo inválido" });

  try {
    let config = await ConfigSistema.findOne();

    if (!config) {
      config = new ConfigSistema({ request_time: tiempo });
    } else {
      config.request_time = tiempo;
    }

    await config.save();

    res.status(200).json({ message: "Tiempo actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el tiempo" });
  }
};

exports.getTime = async (req, res) => {
  try {
    const config = await ConfigSistema.findOne();

    if (!config) {
      return res.status(404).json({ error: "No hay configuración de sistema" });
    }

    res
      .status(200)
      .json({
        tiempo: config.request_time,
        user: config.user,
        updatedAt: config.updatedAt,
      });
  } catch (err) {
    console.error("Error al obtener el tiempo:", err);
    res.status(500).json({ error: "Error al obtener el tiempo" });
  }
};
