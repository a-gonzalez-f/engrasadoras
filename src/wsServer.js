// wsServer.js
const WebSocket = require("ws");
const Engrasadora = require("./models/engrasadora");

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  console.log("Servidor WebSocket iniciado");

  wss.on("connection", (ws) => {
    console.log("Cliente conectado al WebSocket");

    ws.on("message", (message) => {
      console.log("Mensaje recibido:", message);
    });

    ws.on("close", () => {
      console.log("Cliente desconectado del WebSocket");
    });
  });

  // Simulación de cambios en campo: actualizar random engrasadora cada X seg
  setInterval(async () => {
    try {
      const lineaDeseada = "A";
      const engrasadoras = await Engrasadora.find();
      // const engrasadoras = await Engrasadora.find({ linea: lineaDeseada });

      if (engrasadoras.length === 0) return;

      const randomIndex = Math.floor(Math.random() * engrasadoras.length);
      const engrasadora = engrasadoras[randomIndex];

      // Simulamos un cambio: estado aleatorio
      const posiblesEstados = ["funcionando", "alerta", "desconectada", "fs"];
      const nuevoEstado =
        posiblesEstados[Math.floor(Math.random() * posiblesEstados.length)];

      engrasadora.estado = nuevoEstado;
      engrasadora.date = new Date();
      engrasadora.historial.push({
        nro_evento: engrasadora.historial.length + 1,
        tipo_evento: "Simulado",
        fecha: new Date(),
        estado: nuevoEstado,
        set_tiempodosif: engrasadora.set_tiempodosif,
        set_ejes: engrasadora.set_ejes,
        sens_corriente: Math.random() * 10,
        sens_flujo: Math.random() < 0.5,
        sens_power: Math.random() < 0.5,
        cont_accionam: engrasadora.cont_accionam + 1,
        nombre: engrasadora.nombre,
        modelo: engrasadora.modelo,
        linea: engrasadora.linea,
      });

      await engrasadora.save();

      // Contamos los estados para mandar al front
      const conteo = await Engrasadora.aggregate([
        {
          $group: {
            _id: "$estado",
            cantidad: { $sum: 1 },
          },
        },
      ]);

      const payload = {
        funcionando: 0,
        alerta: 0,
        desconectada: 0,
        fs: 0,
      };

      conteo.forEach((e) => {
        if (payload.hasOwnProperty(e._id)) {
          payload[e._id] = e.cantidad;
        }
      });

      // Mandamos a todos los clientes conectados
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ tipo: "actualizacion", payload }));
        }
      });
    } catch (err) {
      console.error("Error simulando cambios:", err.message);
    }
  }, 1000);

  return wss;
}

module.exports = initWebSocket;
