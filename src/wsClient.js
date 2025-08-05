// wsClient.js

const WebSocket = require("ws");
const readline = require("readline");

global.wsClientConectado = false;

const gateways = [
  { nombre: "Agus", ip: "172.21.31.96", puerto: 80 },
  // { nombre: "Dani", ip: "192.168.2.232", puerto: 80 },
  // { nombre: "Pablo", ip: "172.27.66.202", puerto: 80 },
];

const conexiones = {};
const reconectando = {};

function actualizarEstadoWsClient() {
  global.wsClientConectado = Object.keys(conexiones).length > 0;
}

function conectarGateway(gateway) {
  if (reconectando[gateway.nombre]) return;

  const url = `ws://${gateway.ip}:${gateway.puerto}/ws`;
  const ws = new WebSocket(url);

  console.log(`wsClient: Conectando a ${gateway.nombre}...`);

  ws.on("open", () => {
    console.log(`wsClient: ${gateway.nombre} conectado`);
    conexiones[gateway.nombre] = ws;
    reconectando[gateway.nombre] = false;
    actualizarEstadoWsClient();
  });

  ws.on("message", (data) => {
    console.log(
      `wsClient: Mensaje recibido de ${gateway.nombre}:`,
      data.toString()
    );
  });

  ws.on("close", () => {
    console.log(`wsClient: Conexión cerrada con ${gateway.nombre}`);
    delete conexiones[gateway.nombre];
    intentarReconectar(gateway);
    actualizarEstadoWsClient();
  });

  ws.on("error", (err) => {
    console.error(`wsClient: Error en ${gateway.nombre}:`, err.message);
  });
}

function intentarReconectar(gateway, intento = 1) {
  reconectando[gateway.nombre] = true;

  const delay = Math.min(10000, intento * 5000);
  console.log(
    `wsClient: Intentando reconectar a ${gateway.nombre} en ${delay / 1000}s...`
  );

  setTimeout(() => {
    const ws = new WebSocket(`ws://${gateway.ip}:${gateway.puerto}/ws`);

    console.log(
      `wsClient: Reintentando conexión a ${gateway.nombre} (intento ${intento})`
    );

    ws.on("open", () => {
      console.log(`wsClient: ${gateway.nombre} reconectado`);
      conexiones[gateway.nombre] = ws;
      reconectando[gateway.nombre] = false;

      ws.on("message", (data) => {
        console.log(
          `wsClient: Mensaje recibido de ${gateway.nombre}:`,
          data.toString()
        );
      });

      ws.on("close", () => {
        console.log(`wsClient: Conexión cerrada con ${gateway.nombre}`);
        delete conexiones[gateway.nombre];
        intentarReconectar(gateway, 1);
      });

      ws.on("error", (err) => {
        console.error(`wsClient: Error en ${gateway.nombre}:`, err.message);
      });
    });

    ws.on("error", (err) => {
      console.error(
        `wsClient: Error al reconectar a ${gateway.nombre}:`,
        err.message
      );
      intentarReconectar(gateway, intento + 1);
    });
  }, delay);
}

// Inicializar todas las conexiones
gateways.forEach((gateway) => conectarGateway(gateway));

// Interfaz de consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("wsClient: Cuando quieras enviar un mensaje, usá el formato:");
console.log("wsClient: [nombre del gateway]: [mensaje]");

rl.on("line", (input) => {
  const partes = input.split(":");
  if (partes.length < 2) {
    console.log("wsClient: Formato incorrecto. Usá: Gateway 1: mensaje");
    return;
  }

  const nombre = partes[0].trim();
  const mensaje = partes.slice(1).join(":").trim();

  const ws = conexiones[nombre];
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.log(`wsClient: No hay conexión activa con ${nombre}`);
    return;
  }

  ws.send(mensaje);
  console.log(`wsClient: Mensaje enviado a ${nombre}: ${mensaje}`);
});
