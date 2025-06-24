// controllers/engrasadorasController.js

const Engrasadora = require("../models/engrasadora");

const getTodas = async (req, res) => {
  try {
    const engrasadoras = await Engrasadora.find();
    res.json(engrasadoras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las engrasadoras" });
  }
};

const actualizarSeteo = async (req, res) => {
  const { id } = req.params;
  const { set_tiempodosif, set_ejes } = req.body;

  const update = {};

  if (set_tiempodosif !== undefined) {
    if (
      typeof set_tiempodosif !== "number" ||
      set_tiempodosif < 0.2 ||
      set_tiempodosif > 0.8
    ) {
      return res
        .status(400)
        .send("El tiempo de dosificación debe ser entre 0.2s y 0.8s");
    }
    update.set_tiempodosif = set_tiempodosif;
  }

  if (set_ejes !== undefined) {
    if (!Number.isInteger(set_ejes) || set_ejes < 1 || set_ejes > 128) {
      return res.status(400).send("La cantidad de ejes debe ser entre 1 y 128");
    }
    update.set_ejes = set_ejes;
  }

  if (Object.keys(update).length === 0) {
    return res
      .status(400)
      .send("No se proporcionaron campos válidos para actualizar");
  }

  try {
    const result = await Engrasadora.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!result) return res.status(404).send("Engrasadora no encontrada");

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar la engrasadora");
  }
};

module.exports = { getTodas, actualizarSeteo };
