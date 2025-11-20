// analytics-maq.js

const modal = document.getElementById("modalAnalyticsMaq");
const cerrarBtn = document.getElementById("cerrarAnalyticsMaq");
const message = document.getElementById("message-analyticsMaq");
const titulo = document.getElementById("analytics-de");

cerrarBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

export function abrirAnalyticsMaq(idMaq) {
  message.innerText = "Cargando...";
  message.style.display = "flex";

  titulo.innerText = idMaq ? `ID: ${idMaq}` : "Sin ID";

  modal.style.display = "flex";

  fetchMaq(idMaq);
}

async function fetchMaq(idMaq) {
  try {
    const res = await fetch(`/api/engrasadoras/snapshots/accionam/${idMaq}`);
    if (!res.ok) throw new Error("Error en servidor");

    const data = await res.json();

    renderAnalytics(data);

    message.style.display = "none";
  } catch (err) {
    console.error(err);
    message.innerText = "Error cargando analytics";
  }
}

function renderAnalytics(data) {
  console.log("datos a renderizar: ", data);
}

// swiper -------------------------------------------------------
const swiper = new Swiper(".mySwiper", {
  loop: false,
  spaceBetween: 30,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  allowTouchMove: true,
  touchStartPreventDefault: false,
});
