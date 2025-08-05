// sistemaController.js

const mongoose = require("mongoose");

exports.obtenerEstadoSistema = async (req, res) => {
  const estado = {
    node: true,
    mongo: mongoose.connection.readyState === 1,
    motor: global.motorActivo || false,
  };

  res.json(estado);
};
