// motor.js

require("dotenv").config({ path: "../.env" });
const WebSocket = require("ws");
const conectarDB = require("./db");
const Engrasadora = require("./models/engrasadora");

conectarDB()
  .then(() => {
    console.log("🟢 Motor.js conectado a MongoDB");
    iniciarMotor();
  })
  .catch((err) => {
    console.error("🔴 Error al conectar motor.js a MongoDB:", err);
  });

const gateways = [
  { nombre: "Agus", ip: "172.27.66.205", puerto: 80 },
  // { nombre: "Dani", ip: "172.21.31.182", puerto: 80 },
  // { nombre: "Pablo", ip: "172.27.66.205", puerto: 80 },
];

const conexiones = {};
const reconectando = {};

function iniciarMotor() {
  function intentarReconectar(gateway, intento = 1) {
    reconectando[gateway.nombre] = true;

    const delay = Math.min(10000, intento * 2000);
    console.log(
      `Intentando reconectar a ${gateway.nombre} en ${delay / 1000}s...`
    );

    setTimeout(() => {
      const ws = new WebSocket(`ws://${gateway.ip}:${gateway.puerto}/ws`);
      console.log(
        `Reintentando conexión a ${gateway.nombre} (intento ${intento})`
      );

      ws.on("open", () => {
        console.log(`${gateway.nombre} reconectado`);
        conexiones[gateway.nombre] = ws;
        reconectando[gateway.nombre] = false;

        ws.on("message", (data) => manejarMensaje(gateway.nombre, data));
        ws.on("close", () => {
          console.log(`Conexión cerrada con ${gateway.nombre}`);
          delete conexiones[gateway.nombre];
          intentarReconectar(gateway, 1);
        });
        ws.on("error", (err) => {
          console.error(`Error en ${gateway.nombre}:`, err.message);
        });
      });

      ws.on("error", (err) => {
        console.error(`Error al reconectar a ${gateway.nombre}:`, err.message);
        intentarReconectar(gateway, intento + 1);
      });
    }, delay);
  }

  async function manejarMensaje(nombre, data) {
    const msg = data.toString().trim();
    console.log(`Mensaje recibido crudo de ${nombre}:`, msg);

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
      const lora_signal = parseInt(msg.slice(22, 24));
      const falla = msg[25] === "1";

      console.log("→ Datos decodificados:");
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
        case "1":
          await procesarSeteo(maquina, datos, nombre);
          break;
        case "2":
          await procesarResetAccionamientos(maquina, datos, nombre);
          break;
        case "3":
          await procesarSwitchOnOff(maquina, datos, nombre);
          break;
        case "4":
          await procesarForzarEngrase(maquina, datos, nombre);
          break;
        default:
          console.warn(`Acción ${accion} no reconocida`);
      }
    } catch (err) {
      console.error("Error al decodificar o guardar:", err.message);
    }
  }

  function conectarGateway(gateway) {
    const ws = new WebSocket(`ws://${gateway.ip}:${gateway.puerto}/ws`);

    ws.on("open", () => {
      console.log(`🟢 Conectado a ${gateway.nombre}`);
      conexiones[gateway.nombre] = ws;

      ws.on("message", (data) => manejarMensaje(gateway.nombre, data));

      ws.on("close", () => {
        console.log(`Conexión cerrada con ${gateway.nombre}`);
        delete conexiones[gateway.nombre];
        intentarReconectar(gateway, 1);
      });

      ws.on("error", (err) => {
        console.error(`Error en ${gateway.nombre}:`, err.message);
      });
    });

    ws.on("error", (err) => {
      console.error(`Error al conectar a ${gateway.nombre}:`, err.message);
      intentarReconectar(gateway, 1);
    });
  }

  async function procesarSensado(maquina, datos, nombre) {
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
    maquina.lora_signal = datos.lora_signal;

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
      lora_signal: datos.lora_signal.toString(),
      user: "gateway_" + nombre,
    });

    await maquina.save();
    console.log(
      `→ Engrasadora ${maquina.id} actualizada con evento de sensado`
    );
  }

  async function procesarSeteo(maquina, datos, nombre) {
    // maquina.date = new Date();
    // maquina.set_ejes = datos.cant_ejes;
    // maquina.set_tiempodosif = datos.tiempo_dosif;

    // maquina.historial.push({
    //   nro_evento: maquina.historial.length + 1,
    //   tipo_evento: "Seteo",
    //   fecha: maquina.date,
    //   set_tiempodosif: datos.tiempo_dosif,
    //   set_ejes: datos.cant_ejes,
    //   user: "gateway_" + nombre,
    // });

    // await maquina.save();
    // console.log(`✅ Seteo actualizado para máquina ${maquina.id}`);
    console.log(`Seteo pendiente de implementación`);
  }

  // placeholders:
  async function procesarResetAccionamientos(maquina, datos, nombre) {
    console.log(`Reset Accionamientos pendiente de implementación`);
  }

  async function procesarSwitchOnOff(maquina, datos, nombre) {
    console.log(`Switch On/Off pendiente de implementación`);
  }

  async function procesarForzarEngrase(maquina, datos, nombre) {
    console.log(`Forzar Engrase pendiente de implementación`);
  }

  async function solicitarEstados() {
    try {
      const maquinas = await Engrasadora.find({}, "id");

      maquinas.forEach((maquina) => {
        if (maquina.id === undefined || maquina.id === null) {
          console.warn(`Engrasadora sin ID:`, maquina);
          return;
        }

        const idStr = maquina.id.toString().padStart(3, "0");
        const mensaje = `0${idStr}`;

        for (const nombre in conexiones) {
          const ws = conexiones[nombre];
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(mensaje);
            console.log(`Enviado a ${nombre}: ${mensaje}`);
          }
        }
      });
    } catch (err) {
      console.error("Error al solicitar estados:", err.message);
    }
  }

  gateways.forEach((gateway) => conectarGateway(gateway));

  // setInterval(solicitarEstados, 10 * 1000);
}

function enviarSeteoTiempo({ id, tiempo, ejes }) {
  console.log("👉 Enviando seteo de tiempo al motor:", id, tiempo, ejes);

  const idStr = id.toString().padStart(3, "0");
  const ejesStr = ejes.toString().padStart(3, "0");
  const tiempoStr = Math.trunc(tiempo * 10)
    .toString()
    .padStart(2, "0");

  const mensaje = `1${idStr}${ejesStr}${tiempoStr}0000000000000000`;
  // enviar a todos los gateways conectados
  for (const nombre in conexiones) {
    const ws = conexiones[nombre];
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(mensaje);
      console.log(`📤 Seteo enviado a ${nombre}: ${mensaje}`);
    }
  }
}

module.exports = {
  enviarSeteoTiempo,
};
