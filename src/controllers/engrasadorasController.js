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
    const engrasadora = await Engrasadora.findById(id);
    if (!engrasadora) return res.status(404).send("Engrasadora no encontrada");

    Object.assign(engrasadora, update);

    const snapshot = {
      nro_evento: engrasadora.historial.length + 1,
      tipo_evento: "Seteo",
      fecha: new Date(),
      estado: engrasadora.estado,
      set_tiempodosif: engrasadora.set_tiempodosif,
      set_ejes: engrasadora.set_ejes,
      sens_corriente: engrasadora.sens_corriente,
      sens_flujo: engrasadora.sens_flujo,
      sens_power: engrasadora.sens_power,
      cont_accionam: engrasadora.cont_accionam,
      nombre: engrasadora.nombre,
      modelo: engrasadora.modelo,
      linea: engrasadora.linea,
      date: engrasadora.date,
    };

    engrasadora.historial.push(snapshot);

    const result = await engrasadora.save();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar la engrasadora");
  }
};

const agregarComentario = async (req, res) => {
  const { id } = req.params;
  const { comentario, user } = req.body;

  if (!comentario || typeof comentario !== "string") {
    return res.status(400).send("Comentario inválido");
  }

  try {
    const engrasadora = await Engrasadora.findById(id);
    if (!engrasadora) return res.status(404).send("Engrasadora no encontrada");

    engrasadora.comentarios.push({
      date: new Date(),
      comentario,
      user: user || "Anónimo",
    });

    const result = await engrasadora.save();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al agregar comentario");
  }
};

const eliminarComentario = async (req, res) => {
  const { id, index } = req.params;

  try {
    const engrasadora = await Engrasadora.findById(id);
    if (!engrasadora) return res.status(404).send("Engrasadora no encontrada");

    if (index < 0 || index >= engrasadora.comentarios.length)
      return res.status(400).send("Índice inválido");

    engrasadora.comentarios.splice(index, 1);

    const result = await engrasadora.save();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar comentario");
  }
};

const resetAccionamientos = async (req, res) => {
  const { id } = req.params;

  try {
    const engrasadora = await Engrasadora.findById(id);
    if (!engrasadora) return res.status(404).send("Engrasadora no encontrada");

    engrasadora.cont_accionam = 0;

    const result = await engrasadora.save();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al resetear los accionamientos");
  }
};

module.exports = {
  getTodas,
  actualizarSeteo,
  agregarComentario,
  eliminarComentario,
  resetAccionamientos,
};
