// sistemaController.js

const mongoose = require("mongoose");

exports.obtenerEstadoSistema = async (req, res) => {
  const estado = {
    node: true,
    mongo: mongoose.connection.readyState === 1,
    motor: global.motorActivo || false,
    wsclient: global.wsClientConectado || false,
  };

  res.json(estado);
};
