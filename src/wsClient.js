// wsClient.js
const WebSocket = require("ws");
const readline = require("readline");

// Lista de Gateways a los que te querés conectar
const gateways = [
  //   { nombre: "Agus", ip: "172.21.31.81", puerto: 80 },
  { nombre: "Pablo", ip: "172.27.66.205", puerto: 80 },
  { nombre: "Dani", ip: "172.21.31.147", puerto: 80 },
];

// Objeto para guardar las conexiones activas
const conexiones = {};

gateways.forEach((gateway) => {
  const ws = new WebSocket(`ws://${gateway.ip}:${gateway.puerto}/ws`);

  ws.on("open", () => {
    console.log(`${gateway.nombre} conectado`);

    conexiones[gateway.nombre] = ws;
  });

  ws.on("message", (data) => {
    console.log(`Mensaje recibido de ${gateway.nombre}:`, data.toString());
  });

  ws.on("close", () => {
    console.log(`Conexión cerrada con ${gateway.nombre}`);
    delete conexiones[gateway.nombre];
  });

  ws.on("error", (err) => {
    console.error(`Error en ${gateway.nombre}:`, err.message);
  });
});

// Interfaz para enviar mensajes
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Cuando quieras enviar un mensaje, usá el formato:");
console.log("[nombre del gateway]: [mensaje]");

rl.on("line", (input) => {
  const partes = input.split(":");
  if (partes.length < 2) {
    console.log("Formato incorrecto. Usá: Gateway 1: mensaje");
    return;
  }

  const nombre = partes[0].trim();
  const mensaje = partes.slice(1).join(":").trim();

  const ws = conexiones[nombre];
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.log(`No hay conexión activa con ${nombre}`);
    return;
  }

  ws.send(mensaje);
  console.log(`Mensaje enviado a ${nombre}: ${mensaje}`);
});
