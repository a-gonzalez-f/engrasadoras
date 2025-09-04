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
  const { tiempo, timeOut } = req.body;

  if (!tiempo || typeof tiempo !== "number" || tiempo < 1 || tiempo > 600)
    return res.status(400).json({ error: "Tiempo inválido" });

  if (!timeOut || typeof timeOut !== "number" || timeOut < 1 || timeOut > 600)
    return res.status(400).json({ error: "TimeOut inválido" });

  try {
    let config = await ConfigSistema.findOne();

    if (!config) {
      config = new ConfigSistema({ request_time: tiempo, time_out: timeOut });
    } else {
      config.request_time = tiempo;
      config.time_out = timeOut;
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

    res.status(200).json({
      tiempo: config.request_time,
      timeOut: config.time_out,
      user: config.user,
      updatedAt: config.updatedAt,
    });
  } catch (err) {
    console.error("Error al obtener el tiempo:", err);
    res.status(500).json({ error: "Error al obtener el tiempo" });
  }
};

exports.getLogsSistema = async (req, res) => {
  try {
    const { skip = 0, limit = 20 } = req.query;

    const config = await ConfigSistema.findOne().lean();

    if (!config) {
      return res
        .status(404)
        .json({ error: "No hay configuración de sistema encontrada" });
    }

    const logs = config.logs || [];

    const logsOrdenados = logs
      .slice()
      .reverse()
      .slice(Number(skip), Number(skip) + Number(limit));

    res.status(200).json({ logs: logsOrdenados });
  } catch (err) {
    console.error("Error al obtener los logs:", err);
    res.status(500).json({ error: "Error al obtener los logs del sistema" });
  }
};

exports.agregarLogSistema = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .json({ error: "El mensaje es requerido y debe ser un string." });
  }

  try {
    let config = await ConfigSistema.findOne();

    if (!config) {
      config = new ConfigSistema({
        logs: [{ message }],
      });
    } else {
      config.logs.push({ message });

      if (config.logs.length > 100) {
        config.logs = config.logs.slice(-100);
      }
    }

    await config.save();

    res.status(201).json({ message: "Log agregado exitosamente." });
  } catch (err) {
    console.error("Error al agregar log:", err);
    res.status(500).json({ error: "Error al agregar log al sistema" });
  }
};
