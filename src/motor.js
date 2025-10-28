// motor.js

require("dotenv").config({ path: "../.env" });
const WebSocket = require("ws");
const conectarDB = require("./db");
const Engrasadora = require("./models/engrasadora");
const Gateway = require("./models/gateway");

const readline = require("readline");

let tiempoSolicitud = 60;
let timeOut = 2;
let intervaloSolicitudes = null;

let max_eventos = 100000;

const confirmacionesPendientes = new Map();

async function obtenerTiempo() {
  try {
    const response = await fetch("http://localhost:3000/api/sistema/get-time");
    if (!response.ok) {
      throw new Error("Error al obtener el tiempo");
    }

    const data = await response.json();
    const nuevoTiempoSolicitud = data.tiempo;
    const nuevoTimeOut = data.timeOut;

    if (nuevoTimeOut !== timeOut) {
      timeOut = nuevoTimeOut;
      let confirmacion = `⏱️ Nuevo timeOut: ${timeOut}`;
      console.log(confirmacion);
      guardarLog(confirmacion);
    }

    if (nuevoTiempoSolicitud !== tiempoSolicitud) {
      tiempoSolicitud = nuevoTiempoSolicitud;
      let confirmacion = `⏱️ Nuevo tiempoSolicitud: ${tiempoSolicitud}`;
      console.log(confirmacion);
      guardarLog(confirmacion);

      if (intervaloSolicitudes) {
        clearInterval(intervaloSolicitudes);
      }

      intervaloSolicitudes = setInterval(
        solicitarEstados,
        tiempoSolicitud * 1000
      );
    }
  } catch (error) {
    console.error("Hubo un error:", error.message);
    guardarLog(error.message);
  }
}

todosComunicacionOFF();

global.motorActivo = false;

function actualizarEstadoMotor() {
  global.motorActivo = Object.keys(conexiones).length > 0;
}

conectarDB()
  .then(() => {
    console.log("Motor: 🟢 Motor.js conectado a MongoDB");
    iniciarMotor();
  })
  .catch((err) => {
    let message = `Motor: 🔴 Error al conectar motor.js a MongoDB: ${err}`;
    console.error(message);
  });

const conexiones = {};
const reconectando = {};

async function iniciarMotor() {
  actualizarEstadoMotor();
  iniciarGatewaysDesdeDB();
  await obtenerTiempo();
  setInterval(obtenerTiempo, 10 * 1000);
}

async function manejarMensaje(nombre, data) {
  const msg = data.toString().trim();
  console.log(`Motor: Mensaje recibido crudo de ${nombre}:`, msg);

  if (msg.length === 7) {
    const accion = msg[0];
    if (accion !== "4") {
      console.warn("Código de 7 caracteres que no es acción 4");
      return;
    }

    const idOriginal = parseInt(msg.slice(1, 4));
    const idOriginalStr = msg.slice(1, 4);
    const idNuevo = parseInt(msg.slice(4, 7));

    const maquina = await Engrasadora.findOne({ id: idOriginal });

    if (!maquina) {
      console.warn(`Engrasadora con ID ${idOriginal} no encontrada`);
      return;
    }

    if (confirmacionesPendientes.has(idOriginalStr)) {
      const pendiente = confirmacionesPendientes.get(idOriginalStr);
      clearTimeout(pendiente.timer);
      pendiente.resolve(`Cambio de ID confirmado para ${idOriginalStr}`);
      confirmacionesPendientes.delete(idOriginalStr);
      console.log(
        `Motor: ✅ Cambio de ID confirmado y promesa resuelta para máquina ${idOriginalStr}`
      );
    } else {
      console.log(
        `Motor: Cambio de ID confirmado para ${idOriginalStr} sin promesa pendiente`
      );
    }

    await procesarCambioID(maquina, idOriginal, idNuevo);

    return;
  }

  if (msg.length !== 26) {
    console.warn("El codigo no es de 26 caracteres");
    return;
  }

  try {
    const accion = msg[0];
    const id = parseInt(msg.slice(1, 4));
    const modelo = msg[4];
    const cant_ejes = parseInt(msg.slice(5, 8));
    const tiempo_dosif = parseInt(msg.slice(8, 10)) / 10;
    const total_accionam = parseInt(msg.slice(10, 16));
    const on_off = msg[16] === "1";
    const power = msg[17] === "1";
    const corriente = parseFloat(msg.slice(18, 21));
    const flujo = msg[21] === "1";
    const lora_signal = parseInt(msg.slice(22, 25));
    const falla = msg[25] === "1";

    console.log("Motor: → Datos decodificados:");
    console.log({
      accion,
      id,
      modelo,
      cant_ejes,
      tiempo_dosif,
      total_accionam,
      on_off,
      power,
      corriente,
      flujo,
      lora_signal,
      falla,
    });

    const datos = {
      accion,
      id,
      modelo,
      cant_ejes,
      tiempo_dosif,
      total_accionam,
      on_off,
      power,
      corriente,
      flujo,
      lora_signal,
      falla,
    };

    const maquina = await Engrasadora.findOne({ id });

    if (!maquina) {
      console.warn(`Engrasadora con ID ${id} no encontrada`);
      return;
    }

    switch (accion) {
      case "0":
        await procesarSensado(maquina, datos, nombre);
        break;
      case "1": {
        if (confirmacionesPendientes.has(id)) {
          const pendiente = confirmacionesPendientes.get(id);
          clearTimeout(pendiente.timer);
          await procesarSeteo(maquina, datos, nombre);
          pendiente.resolve(`Seteo confirmado para ${id}`);
          confirmacionesPendientes.delete(id);
          console.log(
            `Motor: ✅ Seteo actualizado para máquina ${id} (promesa resuelta)`
          );
        } else {
          await procesarSeteo(maquina, datos, nombre);
          console.log(
            `Motor: ✅ Seteo actualizado para máquina ${id} (sin promesa pendiente)`
          );
        }
        break;
      }
      case "2":
        if (confirmacionesPendientes.has(id)) {
          const pendiente = confirmacionesPendientes.get(id);
          clearTimeout(pendiente.timer);
          await procesarResetAccionamientos(maquina, datos, nombre);
          pendiente.resolve(`Seteo confirmado para ${id}`);
          confirmacionesPendientes.delete(id);
          console.log(
            `Motor: ✅ Accionamientos reseteados para máquina ${id} (promesa resuelta)`
          );
        } else {
          await procesarResetAccionamientos(maquina, datos, nombre);
          console.log(
            `Motor: ✅ Accionamiento reseteados para máquina ${id} (sin promesa pendiente)`
          );
        }
        break;
      case "3":
        if (confirmacionesPendientes.has(id)) {
          const pendiente = confirmacionesPendientes.get(id);
          clearTimeout(pendiente.timer);
          await procesarSwitchOnOff(maquina, datos, nombre);
          pendiente.resolve(`Seteo confirmado para ${id}`);
          confirmacionesPendientes.delete(id);
          console.log(
            `Motor: ✅ Switch confirmado para máquina ${id} (promesa resuelta)`
          );
        } else {
          await procesarSwitchOnOff(maquina, datos, nombre);
          console.log(
            `Motor: ✅ Switch confirmado para máquina ${id} (sin promesa pendiente)`
          );
        }
        break;
      default:
        console.warn(`Acción ${accion} no reconocida`);
    }
  } catch (err) {
    let message = `Error al decodificar o guardar: ${err.message}`;
    console.error(message);
    await guardarLog(message);
  }
}

function conectarGateway(gateway) {
  const ws = new WebSocket(`ws://${gateway.ip}:${gateway.puerto}/ws`);

  ws.cierrePorCambioIP = false;

  ws.on("open", () => {
    console.log(`CONECTAR-GW: 🟢 Conectado a ${gateway.nombre}`);

    actualizarComunicacion(gateway.nombre, true);

    conexiones[gateway.nombre] = ws;

    actualizarEstadoMotor();

    ws.on("message", (data) => manejarMensaje(gateway.nombre, data));

    ws.on("close", async () => {
      try {
        let message = `CONECTAR-GW: Conexión cerrada con ${gateway.nombre}`;
        console.log(message);
        await guardarLog(message);
      } catch (err) {
        console.error("Error guardando log en 'close':", err.message);
      }

      actualizarComunicacion(gateway.nombre, false);
      delete conexiones[gateway.nombre];
      actualizarEstadoMotor();
    });
  });

  ws.on("error", async (err) => {
    try {
      let message = `Error al conectar a ${gateway.nombre}: ${err.message}`;
      console.error(message);
      await guardarLog(message);
    } catch (err2) {
      console.error("Error guardando log en 'error':", err2.message);
    }
  });
}

async function procesarSensado(maquina, datos, nombre) {
  // limpiar timeout y resetear contador
  if (solicitudesPendientes.has(maquina.id)) {
    clearTimeout(solicitudesPendientes.get(maquina.id));
    solicitudesPendientes.delete(maquina.id);
  }

  maquina.perdidos = 0;
  maquina.estado = datos.falla ? "alerta" : "funcionando";

  maquina.date = new Date();
  maquina.modelo = datos.modelo;
  maquina.set_tiempodosif = datos.tiempo_dosif;
  maquina.set_ejes = datos.cant_ejes;
  maquina.sens_corriente = datos.corriente;
  maquina.sens_flujo = datos.flujo;
  maquina.on_off = datos.on_off;
  maquina.sens_power = datos.power;
  maquina.cont_accionam = datos.total_accionam;
  maquina.estado = datos.falla ? "alerta" : "funcionando";
  maquina.lora_signal = datos.lora_signal * -1;

  maquina.historial.push({
    nro_evento: maquina.historial.length + 1,
    tipo_evento: "Sensado",
    fecha: new Date(),
    estado: maquina.estado,
    set_tiempodosif: datos.tiempo_dosif,
    set_ejes: datos.cant_ejes,
    sens_corriente: datos.corriente,
    sens_flujo: datos.flujo,
    on_off: datos.on_off,
    sens_power: datos.power,
    cont_accionam: datos.total_accionam,
    lora_signal: datos.lora_signal * -1,
    user: "gateway_" + nombre,
  });

  if (maquina.historial.length > max_eventos) {
    maquina.historial = maquina.historial.slice(-max_eventos);
  }

  await maquina.save();
  console.log(
    `Motor: → Engrasadora ${maquina.id} actualizada con evento de sensado`
  );
}

async function procesarSeteo(maquina, datos, nombre) {
  maquina.date = new Date();
  maquina.set_tiempodosif = datos.tiempo_dosif;
  maquina.set_ejes = datos.cant_ejes;

  maquina.historial.push({
    nro_evento: maquina.historial.length + 1,
    tipo_evento: "Seteo",
    fecha: maquina.date,
    set_tiempodosif: datos.tiempo_dosif,
    set_ejes: datos.cant_ejes,
    user: "gateway_" + nombre,
  });

  if (maquina.historial.length > max_eventos) {
    maquina.historial = maquina.historial.slice(-max_eventos);
  }

  await maquina.save();
  console.log(`Motor: ✅ Seteo actualizado para máquina ${maquina.id}`);
}

async function procesarResetAccionamientos(maquina, datos, nombre) {
  maquina.date = new Date();
  maquina.cont_accionam = 0;

  maquina.historial.push({
    nro_evento: maquina.historial.length + 1,
    tipo_evento: "Reset Accionam.",
    fecha: maquina.date,
    set_tiempodosif: datos.tiempo_dosif,
    set_ejes: datos.cant_ejes,
    cont_accionam: 0,
    user: "gateway_" + nombre,
  });

  if (maquina.historial.length > max_eventos) {
    maquina.historial = maquina.historial.slice(-max_eventos);
  }

  await maquina.save();
  console.log(
    `Motor: ✅ Reseteo accionamientos actualizado para máquina ${maquina.id}`
  );
}

async function procesarSwitchOnOff(maquina, datos, nombre) {
  maquina.date = new Date();
  const on_offDig = datos.on_off ? "1" : "0";
  maquina.on_off = on_offDig;
  maquina.estado = datos.on_off ? "funcionando" : "pm";
  maquina.set_tiempodosif = datos.tiempo_dosif;
  maquina.set_ejes = datos.cant_ejes;
  maquina.sens_corriente = datos.corriente;
  maquina.sens_flujo = datos.flujo;
  maquina.sens_power = datos.power;
  maquina.cont_accionam = datos.total_accionam;
  maquina.lora_signal = datos.lora_signal;

  maquina.historial.push({
    nro_evento: maquina.historial.length + 1,
    tipo_evento: "Switch ON/OFF",
    fecha: new Date(),
    estado: maquina.estado,
    set_tiempodosif: datos.tiempo_dosif,
    set_ejes: datos.cant_ejes,
    sens_corriente: datos.corriente,
    sens_flujo: datos.flujo,
    on_off: datos.on_off,
    sens_power: datos.power,
    cont_accionam: datos.total_accionam,
    lora_signal: datos.lora_signal.toString(),
    user: "gateway_" + nombre,
  });

  if (maquina.historial.length > max_eventos) {
    maquina.historial = maquina.historial.slice(-max_eventos);
  }

  await maquina.save();
  console.log(`Motor: ✅ Switch on_off actualizado para máquina ${maquina.id}`);
}

async function procesarCambioID(maquina, idOriginal, idNuevo) {
  console.log(`Motor: Procesando cambio de ID para máquina ${idOriginal}`);

  const existeIDNuevo = await Engrasadora.findOne({ id: idNuevo });
  if (existeIDNuevo) {
    console.warn(
      `❌ Ya existe una máquina con ID ${idNuevo}, no se puede aplicar`
    );
    await guardarLog(`❌ Error: ya existe una máquina con ID ${idNuevo}`);
    return;
  }

  const idAnterior = maquina.id;
  maquina.id = idNuevo;
  maquina.date = new Date();

  await maquina.save();

  const gateway = await Gateway.findOne({ engrasadoras: idOriginal });
  if (gateway) {
    const index = gateway.engrasadoras.indexOf(idOriginal);
    if (index !== -1) {
      gateway.engrasadoras[index] = idNuevo;
      await gateway.save();
      console.log(
        `Engrasadora conectada en Gateway actualizada: ID ${idOriginal} reemplazado por ${idNuevo}`
      );
    }
  }

  console.log(`Motor: ✅ Cambio de ID confirmado: ${idAnterior} → ${idNuevo}`);
  await guardarLog(`✅ Cambio de ID confirmado: ${idAnterior} → ${idNuevo}`);
}

const solicitudesPendientes = new Map();

async function solicitarEstados() {
  try {
    const maquinas = await Engrasadora.find({}, "id");

    for (const maquina of maquinas) {
      if (maquina.id == null) {
        // console.warn(`Engrasadora sin ID:`, maquina);
        continue;
      }

      const gateway = await Gateway.findOne({ engrasadoras: maquina.id });
      if (!gateway || gateway.bypass) {
        continue;
      }

      const idStr = maquina.id.toString().padStart(3, "0");
      const mensaje = `&e0${idStr}#`;

      const mensajeFueEnviado = await enviarMensajePorID({
        idEngrasadora: maquina.id,
        mensaje,
      });
      if (!mensajeFueEnviado) {
        continue;
      }

      // arrancar timer de respuesta
      if (solicitudesPendientes.has(maquina.id)) {
        clearTimeout(solicitudesPendientes.get(maquina.id));
      }

      const max_fallos = 5;

      const timer = setTimeout(async () => {
        try {
          const m = await Engrasadora.findOne({ id: maquina.id });
          if (m) {
            if (m.perdidos < 999 && m.estado !== "fs" && m.on_off) {
              m.perdidos = (m.perdidos || 0) + 1;
            }

            if (m.perdidos >= max_fallos && m.estado !== "fs" && m.on_off) {
              m.estado = "desconectada";
            }

            if (m.perdidos === max_fallos) {
              m.historial.push({
                nro_evento: m.historial.length + 1,
                tipo_evento: "Falla de comunicación",
                fecha: new Date(),
                estado: "desconectada",
                set_tiempodosif: m.set_tiempodosif,
                set_ejes: m.set_ejes,
                sens_corriente: m.corriente,
                sens_flujo: m.flujo,
                on_off: m.on_off,
                sens_power: m.power,
                cont_accionam: m.cont_accionam,
                lora_signal: m.lora_signal,
              });
            }
            await m.save();
            let message = `❌ Engrasadora ${maquina.id} no respondió (fallos: ${m.perdidos}) (${gateway.nombre})`;
            console.log(message);
            await guardarLog(message);
          }
        } catch (err) {
          let message = `Error incrementando perdidos: ${err.message}`;
          console.error(message);
          await guardarLog(message);
        }
        solicitudesPendientes.delete(maquina.id);
      }, timeOut * 1000);

      solicitudesPendientes.set(maquina.id, timer);
    }
  } catch (err) {
    let message = `Error al solicitar estados:", ${err.message}`;
    console.error(message);
    await guardarLog(message);
  }
}

async function iniciarGatewaysDesdeDB() {
  const gateways = await Gateway.find({});

  for (const gateway of gateways) {
    if (gateway.bypass) {
      let message = `⏸️  Gateway ${gateway.nombre} está en bypass, no se conecta`;
      // console.log(message);
      continue;
    }
    gateway.puerto = gateway.puerto || 80;
    conectarGateway(gateway);
  }
}

async function enviarMensajePorID({ idEngrasadora, mensaje }) {
  try {
    const gateway = await Gateway.findOne({ engrasadoras: idEngrasadora });
    const engrasadora = await Engrasadora.findOne({ id: idEngrasadora });

    if (!gateway) {
      // console.warn(
      //   `❌ No se encontró un gateway con la engrasadora ID ${idEngrasadora}`
      // );
      return;
    }

    if (mensaje && mensaje.startsWith("&e0")) {
      if (gateway && gateway.bypass) {
        console.log(
          `⏸️ Mensaje bloqueado: Gateway ${gateway.nombre} en bypass`
        );
        return;
      }

      if (engrasadora && engrasadora.estado === "fs") {
        console.log(
          `⏸️ Mensaje bloqueado: Engrasadora ${idEngrasadora} en Fuera Servicio`
        );
        return;
      }

      if (engrasadora && !engrasadora.on_off) {
        console.log(
          `⏸️ Mensaje bloqueado: Engrasadora ${idEngrasadora} en Pausa Manual`
        );
        return;
      }
    }

    const nombre = gateway.nombre || gateway.ip;
    const ws = conexiones[nombre];

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(`❌ Gateway ${nombre} no está conectado`);
      return;
    }

    ws.send(mensaje);
    console.log(`📤 Mensaje enviado a ${nombre}: ${mensaje}`);
    return true;
  } catch (err) {
    let message = `Error al enviar mensaje: ${err.message}`;
    console.error(message);
    await guardarLog(message);
    return false;
  }
}

async function enviarSeteo({ id, tiempo, ejes }) {
  return new Promise(async (resolve, reject) => {
    const idStr = id.toString().padStart(3, "0");
    const ejesStr = ejes.toString().padStart(3, "0");
    const tiempoStr = Math.trunc(tiempo * 10)
      .toString()
      .padStart(2, "0");

    const mensaje = `&e1${idStr}${ejesStr}${tiempoStr}#`;

    console.log("Motor: 👉 Enviando seteo:", mensaje);
    await enviarMensajePorID({ idEngrasadora: id, mensaje });

    const timer = setTimeout(() => {
      confirmacionesPendientes.delete(id);
      reject(new Error(`La Engrasadora ${id} no respondió`));
    }, timeOut * 1000);

    confirmacionesPendientes.set(id, { resolve, reject, timer });
  });
}

async function enviarResetAccionam({ id }) {
  return new Promise(async (resolve, reject) => {
    console.log("Motor: 👉 Enviando reset accionamientos:", id);

    const idStr = id.toString().padStart(3, "0");

    const mensaje = `&e2${idStr}#`;

    await enviarMensajePorID({ idEngrasadora: id, mensaje });
    const timer = setTimeout(() => {
      confirmacionesPendientes.delete(id);
      reject(new Error(`La Engrasadora ${id} no respondió`));
    }, timeOut * 1000);

    confirmacionesPendientes.set(id, { resolve, reject, timer });
  });
}

async function enviarOnOff({ id, on_off }) {
  return new Promise(async (resolve, reject) => {
    console.log("Motor: 👉 Enviando on-off:", id);

    const idStr = id.toString().padStart(3, "0");
    const on_offStr = on_off ? "1" : "0";
    const mensaje = `&e3${idStr}${on_offStr}#`;

    await enviarMensajePorID({ idEngrasadora: id, mensaje });

    const timer = setTimeout(() => {
      confirmacionesPendientes.delete(id);
      reject(new Error(`La Engrasadora ${id} no respondió`));
    }, timeOut * 1000);

    confirmacionesPendientes.set(id, { resolve, reject, timer });
  });
}

async function enviarCambioID({ id, idNuevo }) {
  return new Promise(async (resolve, reject) => {
    console.log("Motor: 👉 Enviando cambio ID:", id, "por:", idNuevo);

    const idOriginalStr = id.toString().padStart(3, "0");
    const idONuevolStr = idNuevo.toString().padStart(3, "0");
    const mensaje = `&e4${idOriginalStr}${idONuevolStr}#`;

    await enviarMensajePorID({ idEngrasadora: id, mensaje });

    const timer = setTimeout(() => {
      confirmacionesPendientes.delete(idOriginalStr);
      reject(new Error(`La Engrasadora ${id} no respondió`));
    }, timeOut * 1000);

    confirmacionesPendientes.set(idOriginalStr, { resolve, reject, timer });
  });
}

async function actualizarComunicacion(nombreGateway, estado) {
  try {
    const gateway = await Gateway.findOne({ nombre: nombreGateway });
    if (!gateway) return;

    const ultimoEvento = gateway.historial[gateway.historial.length - 1];

    if (
      ultimoEvento &&
      ultimoEvento.tipo_evento === (estado ? "Conexión" : "Desconexión")
    ) {
      return;
    }

    gateway.comunicacion_back = estado;

    gateway.historial.push({
      nro_evento: gateway.historial.length + 1,
      tipo_evento: estado ? "Conexión" : "Desconexión",
      fecha: new Date(),
      estado: estado ? "Conectado" : "Desconectado",
      bypass: gateway.bypass,
      user: "motor",
    });

    if (gateway.historial.length > 100) {
      gateway.historial = gateway.historial.slice(-100);
    }

    await gateway.save();
  } catch (err) {
    let message = `Error actualizando comunicacion gateway: ${err.message}`;
    console.error(message);
    await guardarLog(message);
  }
}

async function todosComunicacionOFF() {
  try {
    const gateways = await Gateway.find({}, "id");

    if (gateways.length === 0) {
      console.log("Motor: No se encontraron gateways para actualizar.");
      return;
    }

    await Gateway.updateMany({}, { $set: { comunicacion_back: false } });
    console.log("Todos los gw actualizados a comunicacion_back: false");
  } catch (err) {
    let message = `Error al resetear Comunicacion_back: ${err.message}`;
    console.error(message);
    await guardarLog(message);
  }
}

async function verificarCambioIPTodas() {
  try {
    const gateways = await Gateway.find({});

    for (const gateway of gateways) {
      if (gateway.bypass) {
        let message = `⏸️ Gateway ${gateway.nombre} está en bypass, no se conecta`;
        // console.log(message);
        continue;
      }
      const nombre = gateway.nombre;
      const conexionActiva = conexiones[nombre];
      const ipDB = gateway.ip;

      if (conexionActiva && conexionActiva._url !== `ws://${ipDB}/ws`) {
        console.log(
          `VERIFICADOR_IP: Cambio de IP detectado en ${nombre}. Reconectando...
          Conexión vieja: ${conexionActiva._url}, Conexión nueva: ws://${ipDB}/ws`
        );
        try {
          console.log("VERIFICADOR_IP: Cerrando conexión vieja");
          conexionActiva.cierrePorCambioIP = true;
          conexionActiva.terminate();
        } catch (err) {
          let message = `Error cerrando conexión vieja: ${err.message}`;
          console.error(message);
          await guardarLog(message);
        }
        conectarGateway(gateway);
      }

      if (!conexionActiva) {
        console.log(
          `VERIFICADOR_IP: ${nombre} sin conexión, intentando con IP ${ipDB}`
        );
        conectarGateway(gateway);
      }
    }
  } catch (err) {
    let message = `Error en verificarCambioIPTodas: ${err.message}`;
    console.error(message);
    await guardarLog(message);
  }
}

setInterval(verificarCambioIPTodas, 5000);

async function guardarLog(message) {
  try {
    const res = await fetch("http://localhost:3000/api/sistema/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      console.log("Log guardado correctamente");
    } else {
      console.log("Error al guardar el log");
    }
  } catch (err) {
    console.error(err);
  }
}

async function verificarConexionesActivas() {
  try {
    const gateways = await Gateway.find({ bypass: false });

    for (const gateway of gateways) {
      const nombre = gateway.nombre;
      const ws = conexiones[nombre];

      const estaConectado = ws && ws.readyState === WebSocket.OPEN;

      if (gateway.comunicacion_back !== estaConectado) {
        gateway.comunicacion_back = estaConectado;

        gateway.historial.push({
          nro_evento: gateway.historial.length + 1,
          tipo_evento: estaConectado ? "Conexión" : "Desconexión",
          fecha: new Date(),
          estado: estaConectado ? "Conectado" : "Desconectado",
          bypass: gateway.bypass,
          user: "verificador",
        });

        if (gateway.historial.length > 100) {
          gateway.historial = gateway.historial.slice(-100);
        }

        await gateway.save();

        const logMsg = `${nombre} actualizado a ${
          estaConectado ? "Conectado" : "Desconectado"
        }`;
        console.log(logMsg);
        await guardarLog(logMsg);
      }
    }
  } catch (err) {
    const msg = `Error en verificarConexionesActivas: ${err.message}`;
    console.error(msg);
    await guardarLog(msg);
  }
}

setInterval(verificarConexionesActivas, 15000);

// Interfaz de consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Cuando quieras enviar un mensaje, usá el formato:");
console.log("[nombre del gateway]: [mensaje]");

rl.on("line", (input) => {
  const partes = input.split(":");
  if (partes.length < 2) {
    console.log("Motor: Formato incorrecto. Usá: Gateway 1: mensaje");
    return;
  }

  const nombre = partes[0].trim();
  const mensaje = partes.slice(1).join(":").trim();

  const ws = conexiones[nombre];
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.log(`Motor: No hay conexión activa con ${nombre}`);
    return;
  }

  ws.send(mensaje);
  console.log(`Motor: Mensaje enviado a ${nombre}: ${mensaje}`);
});

module.exports = {
  enviarSeteo,
  enviarResetAccionam,
  enviarOnOff,
  enviarCambioID,
};
