// controllers/engrasadorasController.js

const Engrasadora = require("../models/engrasadora");

const getTodas = async (req, res) => {
  try {
    const engrasadoras = await Engrasadora.find();
    res.json(engrasadoras);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las engrasadoras" });
  }
};

module.exports = { getTodas };
