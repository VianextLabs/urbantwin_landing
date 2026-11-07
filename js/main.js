/* ===== NAVEGACIÓN ENTRE SECCIONES ===== */
const sections = document.querySelectorAll(".panel");
const links = document.querySelectorAll(".nav a");
const DEFAULT_SECTION = "monitoreo";

function showSection(id) {
  const target = document.getElementById(id) ? id : DEFAULT_SECTION;

  sections.forEach((s) => s.classList.toggle("is-active", s.id === target));
  links.forEach((a) => {
    if (a.dataset.section === target) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  // Accesibilidad: llevar el foco al título de la sección
  const heading = document.querySelector(`#${target} h1, #${target} h2`);
  if (heading) heading.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

window.addEventListener("hashchange", () =>
  showSection(location.hash.slice(1))
);
showSection(location.hash.slice(1));

/* ===== RELOJ DEL SISTEMA ===== */
const reloj = document.getElementById("reloj");
function actualizarReloj() {
  reloj.textContent = new Date().toLocaleTimeString("es-PE");
}
actualizarReloj();
setInterval(actualizarReloj, 1000);

/* ===== SECCIÓN: MONITOREO (Persona 1) ===== */

/* ===== SECCIÓN: SIMULADOR (Persona 1) ===== */

/* ===== SECCIÓN: REPORTES (Persona 2) ===== */

/* ===== SECCIÓN: ALERTAS (Persona 2) ===== */

/* ===== SECCIÓN: TU APORTE (Persona 2) ===== */

/* ===== SECCIÓN: CONTACTO (Persona 2) ===== */