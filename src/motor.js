// motor.js
const WebSocket = require("ws");

// Lista de Gateways
const gateways = [
  { nombre: "Agus", ip: "172.21.31.43", puerto: 80 },
  { nombre: "Pablo", ip: "172.27.66.205", puerto: 80 },
];

const conexiones = {};

gateways.forEach((gateway) => {
  const ws = new WebSocket(`ws://${gateway.ip}:${gateway.puerto}/ws`);

  ws.on("open", () => {
    console.log(`Conectado a ${gateway.nombre}`);
    conexiones[gateway.nombre] = ws;
  });

  ws.on("message", (data) => {
    const msg = data.toString().trim();
    console.log(`Mensaje recibido crudo de ${gateway.nombre}:`, msg);

    if (msg.length < 25) {
      console.warn("Mensaje demasiado corto o malformado");
      return;
    }

    try {
      // Asignación por posición
      const accion = msg[0];
      const id = msg.slice(1, 4);
      const modelo = msg[4];
      const cant_ejes = parseInt(msg.slice(5, 8));
      const tiempo_dosif = parseInt(msg.slice(8, 10)) / 10; // ej: 12 → 1.2s
      const total_accionam = parseInt(msg.slice(10, 16));
      const on_off = msg[16] === "1"; // booleano
      const corriente = parseFloat(msg.slice(17, 20));
      const flujo = msg[20] === "1"; // booleano
      const lora_signal = parseInt(msg.slice(21, 24));
      const falla = msg[24] === "1"; // booleano

      // Mostrar resultados
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
    } catch (err) {
      console.error("Error al decodificar mensaje:", err.message);
    }
  });

  ws.on("close", () => {
    console.log(`Conexión cerrada con ${gateway.nombre}`);
    delete conexiones[gateway.nombre];
  });

  ws.on("error", (err) => {
    console.error(`Error en ${gateway.nombre}:`, err.message);
  });
});
