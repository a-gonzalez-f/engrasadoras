// controllers/engrasadorasController.js

const Engrasadora = require("../models/engrasadora");
const motor = require("../motor");

const getPorLinea = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.linea) {
      filtro.linea = req.query.linea;
    }

    const engrasadoras = await Engrasadora.find(filtro);
    res.json(engrasadoras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las engrasadoras" });
  }
};

const actualizarSeteo = async (req, res) => {
  const { id } = req.params;
  const { set_tiempodosif, set_ejes, estado, ubicacion } = req.body;

  const update = {};
  let huboCambioEstado = false;

  if (ubicacion !== undefined) {
    if (typeof ubicacion !== "string") {
      return res.status(400).send("Ubicación inválida");
    }
    if (ubicacion.trim().length > 50) {
      return res
        .status(400)
        .send("La ubicación debe tener como máximo 50 caracteres");
    }
    update.ubicacion = ubicacion.trim();
  }

  if (estado !== undefined) {
    if (typeof estado !== "string") {
      return res.status(400).send("Estado inválido");
    }
    huboCambioEstado = true;
  }

  if (set_tiempodosif !== undefined) {
    if (
      typeof set_tiempodosif !== "number" ||
      set_tiempodosif < 0.2 ||
      set_tiempodosif > 2
    ) {
      return res
        .status(400)
        .send("El tiempo de dosificación debe ser entre 0.2s y 2s");
    }
    update.set_tiempodosif = set_tiempodosif;
  }

  if (set_ejes !== undefined) {
    if (!Number.isInteger(set_ejes) || set_ejes < 1 || set_ejes > 128) {
      return res.status(400).send("La cantidad de ejes debe ser entre 1 y 128");
    }
    update.set_ejes = set_ejes;
  }

  if (Object.keys(update).length === 0 && !huboCambioEstado) {
    return res
      .status(400)
      .send("No se proporcionaron campos válidos para actualizar");
  }

  try {
    const engrasadora = await Engrasadora.findById(id);
    if (!engrasadora) return res.status(404).send("Engrasadora no encontrada");

    Object.assign(engrasadora, update);

    if (huboCambioEstado && estado !== engrasadora.estado) {
      engrasadora.estado = estado;
    }

    const actualizoUbicacionSolo =
      Object.keys(update).length === 1 && update.ubicacion !== undefined;

    if (!actualizoUbicacionSolo) {
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
    }

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

const resetHistorial = async (req, res) => {
  const { id } = req.params;

  try {
    const engrasadora = await Engrasadora.findById(id);
    if (!engrasadora) return res.status(404).send("Engrasadora no encontrada");

    engrasadora.historial = [];

    const result = await engrasadora.save();

    res.json({ historial: result.historial });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al resetear el historial");
  }
};

const crearEngrasadora = async (req, res) => {
  try {
    const { id } = req.body;

    const engrasadoraExistente = await Engrasadora.findOne({ id });
    if (engrasadoraExistente) {
      return res
        .status(400)
        .json({ error: "El ID ya existe en la base de datos" });
    }

    const data = req.body;
    const nueva = new Engrasadora(data);
    const saved = await nueva.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error al crear engrasadora:", error);
    res.status(500).json({ error: "Error al crear engrasadora" });
  }
};

const verificarId = async (req, res) => {
  try {
    const { id } = req.params;
    const engrasadora = await Engrasadora.findOne({ id });
    if (!engrasadora) {
      return res.status(404).json({ error: "ID no encontrado" });
    }
    res.status(200).json({ message: "ID ya existe" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al verificar el ID" });
  }
};

const getUnaEngrasadora = async (req, res) => {
  try {
    const engrasadora = await Engrasadora.findById(req.params.id);
    if (!engrasadora) return res.status(404).json({ error: "No encontrada" });
    res.json(engrasadora);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener la engrasadora" });
  }
};

const setearTiempo = async (req, res) => {
  const { id, modelo, tiempo, ejes } = req.body;

  if (
    !id ||
    tiempo === undefined ||
    ejes === undefined ||
    modelo === undefined
  ) {
    return res.status(400).json({ mensaje: "Faltan datos para el seteo" });
  }

  try {
    console.log("Enviando al motor:", { id, modelo, tiempo, ejes });
    motor.enviarSeteoTiempo({ id, modelo, tiempo, ejes });
    res.json({ mensaje: `Seteo de tiempo enviado a la engrasadora ${id}` });
  } catch (err) {
    console.error("Error al enviar seteo de tiempo:", err);
    res.status(500).json({ mensaje: "Error al enviar el seteo al motor" });
  }
};

const setearEjes = async (req, res) => {
  const { id, modelo, tiempo, ejes } = req.body;

  if (
    !id ||
    tiempo === undefined ||
    ejes === undefined ||
    modelo === undefined
  ) {
    return res.status(400).json({ mensaje: "Faltan datos para el seteo" });
  }

  try {
    console.log("Enviando al motor:", { id, modelo, tiempo, ejes });
    motor.enviarSeteoEjes({ id, modelo, tiempo, ejes });
    res.json({ mensaje: `Seteo de ejes enviado a la engrasadora ${id}` });
  } catch (err) {
    console.error("Error al enviar seteo de ejes:", err);
    res.status(500).json({ mensaje: "Error al enviar el seteo al motor" });
  }
};

const resetAccionamientos = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ mensaje: "Faltan datos para el seteo" });
  }

  try {
    console.log("Enviando al motor:", { id });
    motor.enviarResetAccionam({ id });
    res.json({
      mensaje: `Reset de accionamientos enviado a la engrasadora ${id}`,
    });
  } catch (err) {
    console.error("Error al enviar reset accionam:", err);
    res
      .status(500)
      .json({ mensaje: "Error al enviar el reset accionam al motor" });
  }
};

const switchOnOff = async (req, res) => {
  const { id, on_off } = req.body;
  const on_offStr = on_off ? "ON" : "OFF";

  if (!id) {
    return res.status(400).json({ mensaje: "Faltan datos para el seteo" });
  }

  try {
    console.log("Enviando al motor:", { id, on_off });
    motor.enviarOnOff({ id, on_off });
    res.json({
      mensaje: `Switch ${on_offStr} enviado a la engrasadora ${id}`,
    });
  } catch (err) {
    console.error("Error al enviar switch on-off:", err);
    res.status(500).json({ mensaje: "Error al enviar switch on-off al motor" });
  }
};

module.exports = {
  setearTiempo,
  setearEjes,
  resetAccionamientos,
  switchOnOff,
  getPorLinea,
  actualizarSeteo,
  agregarComentario,
  eliminarComentario,
  resetHistorial,
  crearEngrasadora,
  verificarId,
  getUnaEngrasadora,
};
