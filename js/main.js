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
/* ---------- Datos simulados ---------- */
const VIAS = [
  { id: "javier-prado", nombre: "Av. Javier Prado Este", distrito: "San Borja",       vel: 12, flujo: 5200, p: [40, 120, 560, 120] },
  { id: "arequipa",     nombre: "Av. Arequipa",          distrito: "Miraflores",      vel: 24, flujo: 4300, p: [180, 30, 180, 370] },
  { id: "via-expresa",  nombre: "Vía Expresa Sur",       distrito: "Miraflores",      vel: 46, flujo: 6100, p: [60, 300, 560, 300] },
  { id: "faucett",      nombre: "Av. Faucett",           distrito: "Callao",          vel: 58, flujo: 3800, p: [450, 30, 450, 370] },
  { id: "venezuela",    nombre: "Av. Venezuela",         distrito: "Cercado de Lima", vel: 26, flujo: 3900, p: [60, 210, 430, 210] },
  { id: "brasil",       nombre: "Av. Brasil",            distrito: "Cercado de Lima", vel: 11, flujo: 4700, p: [90, 30, 90, 370] },
];

const INCIDENTES = [
  { id: "INC-2847", titulo: "Accidente vial",  lugar: "Javier Prado Este, Km 4", distrito: "San Borja",       hora: "08:14", sev: "alta"  },
  { id: "INC-2846", titulo: "Obra vial",       lugar: "Av. Arequipa, cuadra 32", distrito: "Miraflores",      hora: "07:30", sev: "media" },
  { id: "INC-2845", titulo: "Vehículo varado", lugar: "Vía Expresa Sur, carril 2", distrito: "Miraflores",    hora: "06:58", sev: "baja"  },
  { id: "INC-2844", titulo: "Desbordamiento",  lugar: "Av. Brasil, cuadra 15",   distrito: "Cercado de Lima", hora: "06:12", sev: "alta"  },
  { id: "INC-2843", titulo: "Semáforo inoperativo", lugar: "Av. Faucett con Gambetta", distrito: "Callao",   hora: "05:40", sev: "media" },
];

const CAMARAS = [
  { n: "CAM-014", x: 180, y: 120 },
  { n: "CAM-027", x: 90,  y: 210 },
  { n: "CAM-033", x: 450, y: 300 },
  { n: "CAM-041", x: 180, y: 300 },
];

const ESTADOS = {
  severa: "Congestión severa",
  lenta:  "Tráfico lento",
  normal: "Flujo normal",
  libre:  "Vía libre",
};

function estadoPorVelocidad(v) {
  if (v < 15) return "severa";
  if (v < 30) return "lenta";
  if (v < 50) return "normal";
  return "libre";
}

/* ---------- Estado de filtros ---------- */
const monState = { distrito: "todos", via: "todas", sev: "todas", trafico: true, iot: true };

const NS = "http://www.w3.org/2000/svg";
const elDistrito = document.getElementById("f-distrito");
const elVia = document.getElementById("f-via");
const elSev = document.getElementById("f-sev");
const capaTrafico = document.getElementById("capa-trafico");
const capaIot = document.getElementById("capa-iot");

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function viaCoincide(via) {
  const okDistrito = monState.distrito === "todos" || via.distrito === monState.distrito;
  const okVia = monState.via === "todas" || via.id === monState.via;
  return okDistrito && okVia;
}

/* ---------- Select de vías (depende del distrito) ---------- */
function poblarVias() {
  const lista = VIAS.filter(
    (v) => monState.distrito === "todos" || v.distrito === monState.distrito
  );
  elVia.innerHTML = '<option value="todas">Todas</option>' +
    lista.map((v) => `<option value="${v.id}">${v.nombre}</option>`).join("");
  monState.via = "todas";
}

/* ---------- Mapa ---------- */
function renderMapa() {
  capaTrafico.replaceChildren();
  capaIot.replaceChildren();

  if (monState.trafico) {
    VIAS.forEach((via) => {
      const [x1, y1, x2, y2] = via.p;
      const estado = estadoPorVelocidad(via.vel);
      const activa = viaCoincide(via);

      const line = svgEl("line", { x1, y1, x2, y2, class: `road road--${estado}${activa ? "" : " is-dim"}` });
      const t = svgEl("title");
      t.textContent = `${via.nombre} (${via.distrito}): ${ESTADOS[estado]}, ${via.vel} km/h`;
      line.appendChild(t);
      capaTrafico.appendChild(line);

      const label = svgEl("text", {
        x: (x1 + x2) / 2 + (x1 === x2 ? 8 : 0),
        y: (y1 + y2) / 2 - (y1 === y2 ? 10 : 0),
        class: `map-label${activa ? "" : " is-dim"}`,
      });
      label.textContent = `${via.nombre} · ${via.vel} km/h`;
      capaTrafico.appendChild(label);
    });
  }

  if (monState.iot) {
    CAMARAS.forEach((c) => {
      const g = svgEl("g");
      g.appendChild(svgEl("rect", { x: c.x - 6, y: c.y - 6, width: 12, height: 12, rx: 2, class: "cam" }));
      const txt = svgEl("text", { x: c.x + 10, y: c.y + 4, class: "cam-label" });
      txt.textContent = c.n;
      g.appendChild(txt);
      capaIot.appendChild(g);
    });
  }
}

/* ---------- Métricas (calculadas sobre las vías filtradas) ---------- */
function renderMetricas() {
  const vias = VIAS.filter(viaCoincide);
  const set = (id, txt) => (document.getElementById(id).textContent = txt);

  if (!vias.length) {
    set("m-vel", "--"); set("m-flujo", "--"); set("m-cong", "--"); set("m-cong-txt", "Sin datos");
    return;
  }

  const velMedia = vias.reduce((s, v) => s + v.vel, 0) / vias.length;
  const flujo = vias.reduce((s, v) => s + v.flujo, 0);
  const indice = Math.max(0, Math.min(100, Math.round(100 - (velMedia / 60) * 100)));

  let nivel = "Bajo";
  if (indice >= 70) nivel = "Alto";
  else if (indice >= 50) nivel = "Moderado-alto";
  else if (indice >= 30) nivel = "Moderado";

  set("m-vel", `${Math.round(velMedia)} km/h`);
  set("m-flujo", `${flujo.toLocaleString("es-PE")} veh/h`);
  set("m-cong", `${indice}%`);
  set("m-cong-txt", `Nivel ${nivel}`);
}

/* ---------- Incidentes ---------- */
function renderIncidentes() {
  const lista = INCIDENTES.filter(
    (i) =>
      (monState.distrito === "todos" || i.distrito === monState.distrito) &&
      (monState.sev === "todas" || i.sev === monState.sev)
  );

  const ul = document.getElementById("inc-list");
  ul.innerHTML = lista.length
    ? lista.map((i) => `
        <li class="inc inc--${i.sev}">
          <div class="inc__top"><span>${i.id}</span><span>${i.hora}</span></div>
          <p class="inc__title">${i.titulo}</p>
          <p class="inc__place">${i.lugar}</p>
          <span class="badge badge--${i.sev === "alta" ? "high" : i.sev === "media" ? "mid" : "low"}">
            ${i.sev.toUpperCase()}
          </span>
        </li>`).join("")
    : '<li class="inc-empty">No hay incidentes con estos filtros.</li>';

  document.getElementById("inc-count").textContent = `${lista.length} activos`;
}

function renderMonitoreo() {
  renderMapa();
  renderMetricas();
  renderIncidentes();
}

/* ---------- Eventos ---------- */
elDistrito.addEventListener("change", () => {
  monState.distrito = elDistrito.value;
  poblarVias();
  renderMonitoreo();
});
elVia.addEventListener("change", () => { monState.via = elVia.value; renderMonitoreo(); });
elSev.addEventListener("change", () => { monState.sev = elSev.value; renderIncidentes(); });
document.getElementById("capa-trafico-chk").addEventListener("change", (e) => {
  monState.trafico = e.target.checked; renderMapa();
});
document.getElementById("capa-iot-chk").addEventListener("change", (e) => {
  monState.iot = e.target.checked; renderMapa();
});

/* Simulación de "tiempo real": las velocidades varían cada 5 s */
setInterval(() => {
  VIAS.forEach((v) => {
    v.vel = Math.max(5, Math.min(65, v.vel + Math.round((Math.random() - 0.5) * 6)));
  });
  renderMapa();
  renderMetricas();
}, 5000);

poblarVias();
renderMonitoreo();

/* ===== SECCIÓN: SIMULADOR (Persona 1) ===== */

/* ===== SECCIÓN: REPORTES (Persona 2) ===== */

/* ===== SECCIÓN: ALERTAS (Persona 2) ===== */

/* ===== SECCIÓN: TU APORTE (Persona 2) ===== */

/* ===== SECCIÓN: CONTACTO (Persona 2) ===== */