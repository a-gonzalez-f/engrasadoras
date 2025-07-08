// simularGateway.js
const WebSocket = require("ws");
const readline = require("readline");

const wss = new WebSocket.Server({ port: 80 });

let conexionActual = null;

wss.on("connection", (ws) => {
  console.log("Backend conectado al Gateway simulado");
  conexionActual = ws;

  ws.on("message", (message) => {
    console.log("Mensaje recibido del backend:", message.toString());
  });

  ws.on("close", () => {
    console.log("Conexión cerrada con el backend");
    conexionActual = null;
  });
});

console.log("Gateway simulado escuchando en puerto 80");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  if (conexionActual && conexionActual.readyState === WebSocket.OPEN) {
    conexionActual.send(input);
    console.log("Mensaje enviado al backend:", input);
  } else {
    console.log("No hay conexión activa con el backend.");
  }
});
