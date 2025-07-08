// simularGateway.js
const WebSocket = require("ws");
const readline = require("readline");

const wss = new WebSocket.Server({ port: 80 });

wss.on("connection", (ws) => {
  console.log("Backend conectado al Gateway simulado");

  ws.on("message", (message) => {
    console.log("Mensaje recibido del backend:", message.toString());
  });

  // Leer de consola y enviar al backend
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (input) => {
    ws.send(input);
    console.log("Mensaje enviado al backend:", input);
  });
});

console.log("Gateway simulado escuchando en puerto 80");
