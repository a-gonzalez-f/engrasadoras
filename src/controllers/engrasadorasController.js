// controllers/engrasadorasController.js

const {
  Engrasadora,
  ResumenDia,
  SnapshotHora,
  ResumenHora,
} = require("../models/engrasadora");
const motor = require("../motor");

const resumenDashboard = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.linea) {
      filtro.linea = req.query.linea;
    }

    const engrasadoras = await Engrasadora.find(
      filtro,
      "id nombre linea modelo date set_tiempodosif set_ejes sens_corriente sens_flujo sens_power cont_accionam estado _id"
    );

    res.json(engrasadoras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las engrasadoras" });
  }
};

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

const getPorLineaFiltrada = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.linea) {
      filtro.linea = req.query.linea;
    }

    const engrasadoras = await Engrasadora.find(
      filtro,
      "nombre modelo estado lora_signal sens_corriente sens_flujo sens_power cont_accionam id _id"
    );

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
    const engrasadora = await Engrasadora.findById(req.params.id).lean();
    if (!engrasadora) return res.status(404).json({ error: "No encontrada" });

    const vistos = new Set();
    const filtrado = [];

    for (let i = engrasadora.historial.length - 1; i >= 0; i--) {
      const h = engrasadora.historial[i];

      if (h.tipo_evento === "Sensado") {
        if (!vistos.has(h.cont_accionam)) {
          filtrado.push(h);
          vistos.add(h.cont_accionam);
        }
      } else {
        filtrado.push(h);
      }

      if (filtrado.length >= 20) break;
    }

    filtrado.reverse();

    engrasadora.historial = filtrado;

    res.json(engrasadora);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener la engrasadora" });
  }
};

const engrasadoraActualizada = async (req, res) => {
  try {
    const { id } = req.params;

    const engrasadora = await Engrasadora.findOne({ id });

    if (!engrasadora) {
      return res.status(404).json({ error: "Engrasadora no encontrada" });
    }

    res.json({
      id: engrasadora._id,
      set_tiempodosif: engrasadora.set_tiempodosif,
      set_ejes: engrasadora.set_ejes,
    });
  } catch (err) {
    console.error("Error obteniendo engrasadora:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const setear = async (req, res) => {
  const { id, tiempo, ejes } = req.body;
  if (!id || tiempo === undefined || ejes === undefined) {
    return res.status(400).json({ mensaje: "Faltan datos para el seteo" });
  }

  try {
    console.log("Enviando al motor:", { id, tiempo, ejes });
    await motor.enviarSeteo({ id, tiempo, ejes });
    return res.json({
      mensaje: `Confirmación recibida de la engrasadora ${id}`,
    });
  } catch (err) {
    console.error("Error al enviar seteo de tiempo:", err);
    return res.status(504).json({ mensaje: err.message });
  }
};

const resetAccionamientos = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ mensaje: "Faltan datos para el seteo" });
  }

  try {
    console.log("Enviando al motor:", { id });
    await motor.enviarResetAccionam({ id });
    return res.json({
      mensaje: `Confirmación recibida de la engrasadora ${id}`,
    });
  } catch (err) {
    console.error("Error al enviar reset accionamientos:", err);
    return res.status(504).json({ mensaje: err.message });
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
    await motor.enviarOnOff({ id, on_off });
    return res.json({
      mensaje: `Switch ${on_offStr} confirmado por la engrasadora ${id}`,
    });
  } catch (err) {
    console.error("Error al enviar switch on-off:", err);
    return res
      .status(500)
      .json({ mensaje: "Error al enviar switch on-off al motor" });
  }
};

const editarID = async (req, res) => {
  const { id, idNuevo } = req.body;

  if (!id || !idNuevo) {
    return res.status(400).json({ mensaje: "Faltan datos para el seteo" });
  }

  try {
    console.log("Enviando al motor:", { id, idNuevo });
    await motor.enviarCambioID({ id, idNuevo });
    return res.json({
      mensaje: `Cambio de ID ${id} por ${idNuevo} confirmado por la engrasadora`,
    });
  } catch (err) {
    console.error("Error al enviar el cambio de ID:", err);
    return res
      .status(500)
      .json({ mensaje: "Error al enviar el cambio de ID al motor" });
  }
};

const actualizarEngrasadora = async (req, res) => {
  try {
    const { id: nuevoId } = req.body;
    const { id } = req.params;

    if (nuevoId) {
      const existeId = await Engrasadora.findOne({
        id: nuevoId,
        _id: { $ne: id },
      });

      if (existeId) {
        return res.status(400).json({
          mensaje: `El ID ${nuevoId} ya está en uso por otra engrasadora.`,
        });
      }
    }

    const eng = await Engrasadora.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!eng) {
      return res.status(404).json({ mensaje: "No encontrado" });
    }

    res.json(eng);
  } catch (err) {
    console.error(err);
    res.status(400).json({ mensaje: "Error actualizando engrasadora" });
  }
};

const deleteEngrasadora = async (req, res) => {
  try {
    const engrasadora = await Engrasadora.findByIdAndDelete(req.params.id);

    if (!engrasadora) {
      return res.status(404).json({ mensaje: "Engrasadora no encontrada" });
    }

    res.json({ mensaje: "Engrasadora eliminada" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ mensaje: "Error eliminando engrasadora" });
  }
};

const consultaExterna = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.linea) {
      filtro.linea = req.query.linea;
    }

    const resumen = await Engrasadora.find(filtro, {
      id: 1,
      nombre: 1,
      linea: 1,
      estado: 1,
      cont_accionam: 1,
      _id: 0,
    });

    res.json(resumen);
  } catch (error) {
    console.error("Error al obtener resumen de engrasadoras:", error);
    res.status(500).json({ error: "Error al obtener resumen de engrasadoras" });
  }
};

const getHistorialPaginado = async (req, res) => {
  try {
    const { id } = req.params;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 50;

    const { tipo, estado, fecha, flujo, power, onoff, repetidos } = req.query;

    const engrasadora = await Engrasadora.findById(id).select("historial");

    if (!engrasadora) {
      return res.status(404).json({ error: "Engrasadora no encontrada" });
    }

    let historial = engrasadora.historial.slice().reverse();

    // Aplicar filtros
    if (tipo && tipo !== "todos") {
      historial = historial.filter((h) => h.tipo_evento === tipo);
    }

    if (estado && estado !== "todos") {
      historial = historial.filter((h) => h.estado === estado);
    }

    if (fecha) {
      const fechaStr = new Date(fecha).toISOString().slice(0, 10);
      historial = historial.filter((h) => {
        const fechaEventoStr = new Date(h.fecha).toISOString().slice(0, 10);
        return fechaEventoStr === fechaStr;
      });
    }

    if (flujo && flujo !== "todos") {
      historial = historial.filter((h) => String(h.sens_flujo) === flujo);
    }

    if (power && power !== "todos") {
      historial = historial.filter((h) => String(h.sens_power) === power);
    }

    if (onoff && onoff !== "todos") {
      historial = historial.filter((h) => String(h.on_off) === onoff);
    }

    if (repetidos === "false") {
      const vistos = new Set();
      historial = historial.filter((h) => {
        if (vistos.has(h.cont_accionam)) {
          return false;
        }
        vistos.add(h.cont_accionam);
        return true;
      });
    }

    const historialPaginado = historial.slice(offset, offset + limit);

    res.json({
      historial: historialPaginado,
      total: historial.length,
    });
  } catch (err) {
    console.error("Error obteniendo historial paginado:", err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};

const ultimaVersionAll = async (req, res) => {
  try {
    const engrasadoras = await Engrasadora.find(
      req.query.linea ? { linea: req.query.linea } : {}
    )
      .select("_id __v")
      .lean();

    res.json(engrasadoras);
  } catch (err) {
    console.error("Error en ultimaVersionAll:", err);
    res.status(500).json({ error: "Error al obtener las últimas versiones" });
  }
};

// Analytics -------------------------------------------
const accionamSnapshots = async (req, res) => {
  try {
    const { id } = req.params;
    const { desde, hasta } = req.query;

    const filtro = { id: Number(id) };
    let query;

    // Si hay rango de fechas
    if (desde && hasta) {
      filtro.fecha = {
        $gte: new Date(desde),
        $lte: new Date(hasta),
      };

      query = SnapshotHora.find(filtro)
        .select("delta_accionam set_ejes fecha -_id")
        .sort({ fecha: 1 });
    } else {
      query = SnapshotHora.find(filtro)
        .select("delta_accionam set_ejes fecha -_id")
        .sort({ fecha: -1 })
        .limit(168); // Últimos 168 snapshots (7*24hs)
    }

    let data = await query;

    if (!desde || !hasta) {
      data = data.reverse();
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo snapshots" });
  }
};

const accionamHora = async (req, res) => {
  try {
    const { linea } = req.params;
    const { desde, hasta } = req.query;

    const filtro = { linea: linea, tipo: "linea" };
    let query;

    // Si hay rango de fechas
    if (desde && hasta) {
      filtro.fecha = {
        $gte: new Date(desde),
        $lte: new Date(hasta),
      };

      query = ResumenHora.find(filtro)
        .select("total_delta_accionam fecha -_id")
        .sort({ fecha: 1 });
    } else {
      query = ResumenHora.find(filtro)
        .select("total_delta_accionam fecha -_id")
        .sort({ fecha: -1 })
        .limit(168); // Últimos 168 snapshots (7*24hs)
    }

    let data = await query;

    if (!desde || !hasta) {
      data = data.reverse();
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo resumenHora" });
  }
};

// Por línea
const resumenPorLinea = async (req, res) => {
  const { fecha, desde, hasta } = req.query;
  const { linea } = req.params;

  const filtro = { tipo: "linea" };
  if (linea) filtro.linea = linea; // solo si se especifica

  if (fecha) filtro.fecha = new Date(fecha);
  if (desde && hasta) {
    filtro.fecha = { $gte: new Date(desde), $lte: new Date(hasta) };
  }

  const data = await ResumenDia.find(filtro).sort({ fecha: 1 });
  res.json(data);
};

// Total
const resumenTotal = async (req, res) => {
  const { fecha, desde, hasta } = req.query;
  const filtro = { tipo: "total" };

  if (fecha) filtro.fecha = new Date(fecha);
  if (desde && hasta) {
    filtro.fecha = { $gte: new Date(desde), $lte: new Date(hasta) };
  }

  const data = await ResumenDia.find(filtro).sort({ fecha: 1 });
  res.json(data);
};

module.exports = {
  resumenDashboard,
  setear,
  resetAccionamientos,
  switchOnOff,
  editarID,
  getPorLinea,
  getPorLineaFiltrada,
  actualizarSeteo,
  agregarComentario,
  eliminarComentario,
  resetHistorial,
  crearEngrasadora,
  verificarId,
  getUnaEngrasadora,
  engrasadoraActualizada,
  actualizarEngrasadora,
  deleteEngrasadora,
  consultaExterna,
  getHistorialPaginado,
  ultimaVersionAll,
  accionamSnapshots,
  accionamHora,
  resumenPorLinea,
  resumenTotal,
};
