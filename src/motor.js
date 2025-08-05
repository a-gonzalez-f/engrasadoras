// motor.js

require("dotenv").config({ path: "../.env" });
const WebSocket = require("ws");
const conectarDB = require("./db");
const Engrasadora = require("./models/engrasadora");

const readline = require("readline");

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
    console.error("Motor: 🔴 Error al conectar motor.js a MongoDB:", err);
  });

const gateways = [
  { nombre: "Agus", ip: "172.21.31.96", puerto: 80 },
  // { nombre: "Dani", ip: "192.168.2.232", puerto: 80 },
  // { nombre: "Pablo", ip: "172.27.66.202", puerto: 80 },
];

const conexiones = {};
const reconectando = {};

function iniciarMotor() {
  actualizarEstadoMotor();

  function intentarReconectar(gateway, intento = 1) {
    reconectando[gateway.nombre] = true;

    const delay = Math.min(10000, intento * 2000);
    console.log(
      `Motor: Intentando reconectar a ${gateway.nombre} en ${delay / 1000}s...`
    );

    setTimeout(() => {
      const ws = new WebSocket(`ws://${gateway.ip}:${gateway.puerto}/ws`);
      console.log(
        `Motor: Reintentando conexión a ${gateway.nombre} (intento ${intento})`
      );

      ws.on("open", () => {
        actualizarEstadoMotor();
        console.log(`Motor: ${gateway.nombre} reconectado`);
        conexiones[gateway.nombre] = ws;
        reconectando[gateway.nombre] = false;

        ws.on("message", (data) => manejarMensaje(gateway.nombre, data));
        ws.on("close", () => {
          actualizarEstadoMotor();
          console.log(`Motor: Conexión cerrada con ${gateway.nombre}`);
          delete conexiones[gateway.nombre];
          intentarReconectar(gateway, 1);
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
    console.log(`Motor: Mensaje recibido crudo de ${nombre}:`, msg);

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
      console.log(`Motor: 🟢 Conectado a ${gateway.nombre}`);
      conexiones[gateway.nombre] = ws;

      actualizarEstadoMotor();

      ws.on("message", (data) => manejarMensaje(gateway.nombre, data));

      ws.on("close", () => {
        console.log(`Motor: Conexión cerrada con ${gateway.nombre}`);
        delete conexiones[gateway.nombre];

        actualizarEstadoMotor();

        intentarReconectar(gateway, 1);
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

    await maquina.save();
    console.log(
      `Motor: ✅ Switch on_off actualizado para máquina ${maquina.id}`
    );
  }

  async function procesarForzarEngrase(maquina, datos, nombre) {
    console.log(`Motor: Forzar Engrase pendiente de implementación`);
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
            console.log(`Motor: Enviado a ${nombre}: ${mensaje}`);
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

function enviarSeteoTiempo({ id, modelo, tiempo, ejes }) {
  console.log(
    "Motor: 👉 Enviando seteo de tiempo al motor:",
    id,
    modelo,
    tiempo,
    ejes
  );

  const idStr = id.toString().padStart(3, "0");
  const modeloStr = modelo.toString();
  const ejesStr = ejes.toString().padStart(3, "0");
  const tiempoStr = Math.trunc(tiempo * 10)
    .toString()
    .padStart(2, "0");

  const mensaje = `1${idStr}${modeloStr}${ejesStr}${tiempoStr}`;
  // enviar a todos los gateways conectados
  for (const nombre in conexiones) {
    const ws = conexiones[nombre];
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(mensaje);
      console.log(`Motor: 📤 Seteo enviado a ${nombre}: ${mensaje}`);
    }
  }
}

function enviarSeteoEjes({ id, modelo, tiempo, ejes }) {
  console.log(
    "Motor: 👉 Enviando seteo de ejes al motor:",
    id,
    modelo,
    tiempo,
    ejes
  );

  const idStr = id.toString().padStart(3, "0");
  const modeloStr = modelo.toString();
  const ejesStr = ejes.toString().padStart(3, "0");
  const tiempoStr = Math.trunc(tiempo * 10)
    .toString()
    .padStart(2, "0");

  const mensaje = `1${idStr}${modeloStr}${ejesStr}${tiempoStr}`;
  // enviar a todos los gateways conectados
  for (const nombre in conexiones) {
    const ws = conexiones[nombre];
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(mensaje);
      console.log(`Motor: 📤 Seteo enviado a ${nombre}: ${mensaje}`);
    }
  }
}

function enviarResetAccionam({ id }) {
  console.log("Motor: 👉 Enviando reset accionamientos:", id);

  const idStr = id.toString().padStart(3, "0");

  const mensaje = `2${idStr}`;
  // enviar a todos los gateways conectados
  for (const nombre in conexiones) {
    const ws = conexiones[nombre];
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(mensaje);
      console.log(`Motor: 📤 Reset Accionam enviado a ${nombre}: ${mensaje}`);
    }
  }
}

function enviarOnOff({ id, on_off }) {
  console.log("Motor: 👉 Enviando on-off:", id);

  const idStr = id.toString().padStart(3, "0");
  const on_offStr = on_off ? "1" : "0";

  const mensaje = `3${idStr}${on_offStr}`;
  // enviar a todos los gateways conectados
  for (const nombre in conexiones) {
    const ws = conexiones[nombre];
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(mensaje);
      console.log(`Motor: 📤 ON-OFF enviado a ${nombre}: ${mensaje}`);
    }
  }
}

// Interfaz de consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Motor: Cuando quieras enviar un mensaje, usá el formato:");
console.log("Motor: [nombre del gateway]: [mensaje]");

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
  enviarSeteoTiempo,
  enviarSeteoEjes,
  enviarResetAccionam,
  enviarOnOff,
};
