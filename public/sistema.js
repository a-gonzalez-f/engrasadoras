// sistema.js

const nodeCircle = document.getElementById("nodeStatus");
const mongoCircle = document.getElementById("mongoStatus");
const motorCircle = document.getElementById("motorStatus");
const wsclientCircle = document.getElementById("wsclientStatus");

let lastStatus = {
  node: false,
  mongo: false,
  motor: false,
  wsclient: false,
};

let lastUpdate = {
  node: 0,
  mongo: 0,
  motor: 0,
  wsclient: 0,
};

function setCircleStatus(circle, online) {
  if (!circle) return;
  circle.style.backgroundColor = online ? "#0f0" : "#f00";
}

// Cada 1 segundo: se consulta el backend y se actualizan los "últimos estados"
async function checkStatus() {
  try {
    const res = await fetch("/api/sistema/status");
    const data = await res.json();

    const now = Date.now();

    for (const key of ["node", "mongo", "motor", "wsclient"]) {
      if (data[key] !== undefined) {
        lastStatus[key] = data[key];
        lastUpdate[key] = now;
      }
    }
  } catch (err) {
    console.error("Error obteniendo estado del sistema:", err);
  }
}

// Cada 500ms: se actualiza visualmente el estado, y si no hubo respuesta en 3 segundos, se apaga
function updateCircles() {
  const now = Date.now();
  const TIMEOUT = 3000;

  setCircleStatus(
    nodeCircle,
    lastStatus.node && now - lastUpdate.node < TIMEOUT
  );
  setCircleStatus(
    mongoCircle,
    lastStatus.mongo && now - lastUpdate.mongo < TIMEOUT
  );
  setCircleStatus(
    motorCircle,
    lastStatus.motor && now - lastUpdate.motor < TIMEOUT
  );
  setCircleStatus(
    wsclientCircle,
    lastStatus.wsclient && now - lastUpdate.wsclient < TIMEOUT
  );
}

setInterval(checkStatus, 1000);
setInterval(updateCircles, 500);
checkStatus();
