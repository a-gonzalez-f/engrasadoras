const WebSocket = require("ws");
const readline = require("readline");

const gateways = [
  { nombre: "Agus", ip: "172.27.66.205", puerto: 80 },
  // { nombre: "Dani", ip: "172.27.66.240", puerto: 80 },
  // { nombre: "Pablo", ip: "172.27.66.205", puerto: 80 },
];

const conexiones = {};
const reconectando = {};

function conectarGateway(gateway) {
  if (reconectando[gateway.nombre]) return;

  const url = `ws://${gateway.ip}:${gateway.puerto}/ws`;
  const ws = new WebSocket(url);

  console.log(`Conectando a ${gateway.nombre}...`);

  ws.on("open", () => {
    console.log(`${gateway.nombre} conectado`);
    conexiones[gateway.nombre] = ws;
    reconectando[gateway.nombre] = false;
  });

  ws.on("message", (data) => {
    console.log(`Mensaje recibido de ${gateway.nombre}:`, data.toString());
  });

  ws.on("close", () => {
    console.log(`Conexión cerrada con ${gateway.nombre}`);
    delete conexiones[gateway.nombre];
    intentarReconectar(gateway);
  });

  ws.on("error", (err) => {
    console.error(`Error en ${gateway.nombre}:`, err.message);
  });
}

function intentarReconectar(gateway, intento = 1) {
  reconectando[gateway.nombre] = true;

  const delay = Math.min(10000, intento * 5000);
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

      ws.on("message", (data) => {
        console.log(`Mensaje recibido de ${gateway.nombre}:`, data.toString());
      });

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

// Inicializar todas las conexiones
gateways.forEach((gateway) => conectarGateway(gateway));

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
