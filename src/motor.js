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
  { nombre: "Agus", ip: "172.21.31.64", puerto: 80 },
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

    if (msg.length < 25) {
      console.warn("Mensaje demasiado corto o malformado");
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
      const corriente = parseFloat(msg.slice(17, 20));
      const flujo = msg[20] === "1";
      const lora_signal = parseInt(msg.slice(21, 24));
      const falla = msg[24] === "1";

      console.log("→ Datos decodificados:");
      console.log({
        accion,
        id,
        modelo,
        cant_ejes,
        tiempo_dosif,
        total_accionam,
        on_off,
        corriente,
        flujo,
        lora_signal,
        falla,
      });

      await Engrasadora.findOneAndUpdate(
        { id },
        {
          date: new Date(),
          modelo,
          set_tiempodosif: tiempo_dosif,
          set_ejes: cant_ejes,
          sens_corriente: corriente,
          sens_flujo: flujo,
          sens_power: on_off,
          cont_accionam: total_accionam,
          estado: falla ? "alerta" : "funcionando",
          lora_signal: lora_signal,
        },
        { upsert: true, new: true }
      );

      console.log(`→ Engrasadora ${id} actualizada en MongoDB`);
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

  gateways.forEach((gateway) => conectarGateway(gateway));
}
