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

const crearEngrasadora = async (req, res) => {
  try {
    const nueva = new Engrasadora(req.body);
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: "Error al crear la engrasadora" });
  }
};

module.exports = { getTodas, crearEngrasadora };
