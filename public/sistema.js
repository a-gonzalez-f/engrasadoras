// sistema.js

const nodeCircle = document.getElementById("nodeStatus");
const mongoCircle = document.getElementById("mongoStatus");
const motorCircle = document.getElementById("motorStatus");
const wsclientCircle = document.getElementById("wsclientStatus");

function setCircleStatus(circle, online) {
  if (!circle) return;
  circle.style.backgroundColor = online ? "#0f0" : "#f00";
}

async function checkStatus() {
  try {
    const res = await fetch("/api/sistema/status");
    const data = await res.json();

    setCircleStatus(nodeCircle, data.node);
    setCircleStatus(mongoCircle, data.mongo);
    setCircleStatus(motorCircle, data.motor);
    setCircleStatus(wsclientCircle, data.wsclient);
  } catch (err) {
    console.error("Error obteniendo estado del sistema:", err);
    setCircleStatus(nodeCircle, false);
    setCircleStatus(mongoCircle, false);
    setCircleStatus(motorCircle, false);
    setCircleStatus(wsclientCircle, false);
  }
}

setInterval(checkStatus, 1000);
checkStatus();
