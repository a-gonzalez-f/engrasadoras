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
  // { nombre: "Dani", ip: "172.21.31.199", puerto: 80 },
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

    if (msg.length < 26) {
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
      const power = msg[17] === "1";
      const corriente = parseFloat(msg.slice(18, 21));
      const flujo = msg[21] === "1";
      const lora_signal = parseInt(msg.slice(22, 25));
      const falla = msg[26] === "1";

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

      const maquina = await Engrasadora.findOne({ id });

      if (!maquina) {
        console.warn(`Engrasadora con ID ${id} no encontrada`);
        return;
      }

      // Actualizar datos actuales
      maquina.date = new Date();
      maquina.modelo = modelo;
      maquina.set_tiempodosif = tiempo_dosif;
      maquina.set_ejes = cant_ejes;
      maquina.sens_corriente = corriente;
      maquina.sens_flujo = flujo;
      maquina.on_off = on_off;
      maquina.sens_power = power;
      maquina.cont_accionam = total_accionam;
      maquina.estado = falla ? "alerta" : "funcionando";
      maquina.lora_signal = lora_signal;

      // Crear evento de historial
      maquina.historial.push({
        nro_evento: maquina.historial.length + 1,
        tipo_evento: "Sensado",
        fecha: new Date(),
        estado: maquina.estado,
        set_tiempodosif: tiempo_dosif,
        set_ejes: cant_ejes,
        sens_corriente: corriente,
        sens_flujo: flujo,
        on_off: on_off,
        sens_power: power,
        cont_accionam: total_accionam,
        lora_signal: lora_signal.toString(),
        user: "gateway_" + nombre,
      });

      // Guardar cambios
      await maquina.save();

      console.log(`→ Engrasadora ${id} actualizada con evento de sensado`);
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

  setInterval(solicitarEstados, 10 * 1000);
}
