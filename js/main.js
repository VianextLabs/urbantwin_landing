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
  if (reloj) {
    reloj.textContent = new Date().toLocaleTimeString("es-PE");
  }
}
actualizarReloj();
setInterval(actualizarReloj, 1000);

/* ===== SECCIÓN: MONITOREO (Persona 1) ===== */
const VIAS = [
  { id: "javier-prado", nombre: "Av. Javier Prado Este", distrito: "San Borja",      vel: 12, flujo: 5200, p: [40, 120, 560, 120] },
  { id: "arequipa",     nombre: "Av. Arequipa",          distrito: "Miraflores",      vel: 24, flujo: 4300, p: [180, 30, 180, 370] },
  { id: "via-expresa",  nombre: "Vía Expresa Sur",       distrito: "Miraflores",      vel: 46, flujo: 6100, p: [60, 300, 560, 300] },
  { id: "faucett",      nombre: "Av. Faucett",           distrito: "Callao",          vel: 58, flujo: 3800, p: [450, 30, 450, 370] },
  { id: "venezuela",    nombre: "Av. Venezuela",         distrito: "Cercado de Lima", vel: 26, flujo: 3900, p: [60, 210, 430, 210] },
  { id: "brasil",       nombre: "Av. Brasil",            distrito: "Cercado de Lima", vel: 11, flujo: 4700, p: [90, 30, 90, 370] },
];

const INCIDENTES = [
  { id: "INC-2847", titulo: "Accidente vial",  lugar: "Javier Prado Este, Km 4", distrito: "San Borja",      hora: "08:14", sev: "alta"  },
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

function poblarVias() {
  if (!elVia) return;
  const lista = VIAS.filter(
    (v) => monState.distrito === "todos" || v.distrito === monState.distrito
  );
  elVia.innerHTML = '<option value="todas">Todas</option>' +
    lista.map((v) => `<option value="${v.id}">${v.nombre}</option>`).join("");
  monState.via = "todas";
}

function renderMapa() {
  if (!capaTrafico || !capaIot) return;
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

function renderMetricas() {
  const vias = VIAS.filter(viaCoincide);
  const set = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

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

function renderIncidentes() {
  const lista = INCIDENTES.filter(
    (i) =>
      (monState.distrito === "todos" || i.distrito === monState.distrito) &&
      (monState.sev === "todas" || i.sev === monState.sev)
  );

  const ul = document.getElementById("inc-list");
  if (ul) {
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
  }

  const countEl = document.getElementById("inc-count");
  if (countEl) countEl.textContent = `${lista.length} activos`;
}

function renderMonitoreo() {
  renderMapa();
  renderMetricas();
  renderIncidentes();
}

if (elDistrito) {
  elDistrito.addEventListener("change", () => {
    monState.distrito = elDistrito.value;
    poblarVias();
    renderMonitoreo();
  });
}
if (elVia) {
  elVia.addEventListener("change", () => { monState.via = elVia.value; renderMonitoreo(); });
}
if (elSev) {
  elSev.addEventListener("change", () => { monState.sev = elSev.value; renderIncidentes(); });
}
const chkTrafico = document.getElementById("capa-trafico-chk");
if (chkTrafico) {
  chkTrafico.addEventListener("change", (e) => {
    monState.trafico = e.target.checked; renderMapa();
  });
}
const chkIot = document.getElementById("capa-iot-chk");
if (chkIot) {
  chkIot.addEventListener("change", (e) => {
    monState.iot = e.target.checked; renderMapa();
  });
}

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
const simForm = document.getElementById("sim-form");
const simModal = document.getElementById("sim-modal");
const simProgreso = document.getElementById("sim-progreso");
const simCancelar = document.getElementById("sim-cancelar");
const simDuracion = document.getElementById("sim-duracion");
const simDuracionTxt = document.getElementById("sim-duracion-txt");
const btnParcial = document.getElementById("sim-parcial");
const btnTotal = document.getElementById("sim-total");

let tipoCierre = "parcial";
if (btnParcial && btnTotal) {
  btnParcial.addEventListener("click", () => {
    tipoCierre = "parcial";
    btnParcial.setAttribute("aria-pressed", "true");
    btnTotal.setAttribute("aria-pressed", "false");
  });
  btnTotal.addEventListener("click", () => {
    tipoCierre = "total";
    btnTotal.setAttribute("aria-pressed", "true");
    btnParcial.setAttribute("aria-pressed", "false");
  });
}

if (simDuracion && simDuracionTxt) {
  simDuracion.addEventListener("input", () => {
    simDuracionTxt.textContent = `${simDuracion.value} hora${simDuracion.value > 1 ? "s" : ""}`;
  });
}

let simInterval = null;
if (simForm) {
  simForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const viaSelect = document.getElementById("sim-via");
    const aforoInput = document.getElementById("sim-aforo");
    const viaError = document.getElementById("sim-via-error");
    const aforoError = document.getElementById("sim-aforo-error");
    const viaField = viaSelect.closest(".field");
    const aforoField = aforoInput.closest(".field");

    let valid = true;
    if (!viaSelect.value) {
      viaField.classList.add("has-error");
      viaError.textContent = "Selecciona una vía afectada.";
      viaError.hidden = false;
      valid = false;
    } else {
      viaField.classList.remove("has-error");
      viaError.hidden = true;
    }

    const aforoVal = parseInt(aforoInput.value, 10);
    if (isNaN(aforoVal) || aforoVal < 100 || aforoVal > 10000) {
      aforoField.classList.add("has-error");
      aforoError.textContent = "El aforo debe estar entre 100 y 10,000 veh/h.";
      aforoError.hidden = false;
      valid = false;
    } else {
      aforoField.classList.remove("has-error");
      aforoError.hidden = true;
    }

    if (!valid) return;

    if (simModal && typeof simModal.showModal === "function") {
      simProgreso.value = 0;
      simModal.showModal();
      let p = 0;
      clearInterval(simInterval);
      simInterval = setInterval(() => {
        p += 20;
        simProgreso.value = p;
        if (p >= 100) {
          clearInterval(simInterval);
          simModal.close();
          mostrarResultadosSimulacion();
        }
      }, 300);
    } else {
      mostrarResultadosSimulacion();
    }
  });
}

if (simCancelar) {
  simCancelar.addEventListener("click", () => {
    clearInterval(simInterval);
    if (simModal) simModal.close();
  });
}

function mostrarResultadosSimulacion() {
  const vacio = document.getElementById("sim-vacio");
  const comp = document.getElementById("sim-comparativa");
  const estadoTxt = document.getElementById("sim-estado");
  const visor3D = document.getElementById("visor-3d-contenedor");

  // Al completarse la simulación, lo hacemos visible usando flex
  if (visor3D) visor3D.style.display = "flex";

  if (vacio) vacio.hidden = true;
  if (comp) comp.hidden = false;
  if (estadoTxt) estadoTxt.textContent = "Simulación completada con éxito. Escenarios generados en el Gemelo Digital.";

  const setEsc = (n, retraso, desviados, nivel, badgeText, badgeClass) => {
    const elRetraso = document.getElementById(`esc-${n}-retraso`);
    const elDesviados = document.getElementById(`esc-${n}-desviados`);
    const elNivel = document.getElementById(`esc-${n}-nivel`);
    const b = document.getElementById(`esc-${n}-badge`);
    
    if (elRetraso) elRetraso.textContent = retraso;
    if (elDesviados) elDesviados.textContent = desviados;
    if (elNivel) elNivel.textContent = nivel;
    if (b) {
      b.textContent = badgeText;
      b.className = `badge ${badgeClass}`;
    }
  };

  setEsc(1, "+14 min", "3,400 veh/h", "Fluido", "Óptimo", "badge--ok");
  setEsc(2, "+28 min", "5,100 veh/h", "Moderado", "Subóptimo", "badge--warn");
  setEsc(3, "+8 min", "1,800 veh/h", "Excelente", "Óptimo", "badge--ok");

  const impVeh = document.getElementById("imp-vehiculos");
  if (impVeh) {
    impVeh.textContent = `~${Math.floor(Math.random() * 5000 + 10000).toLocaleString("es-PE")} veh`;
  }
}
/* ===== SECCIÓN: REPORTES (Persona 2) ===== */
const tabs = document.querySelectorAll(".tabs [role='tab']");
const tabpanels = document.querySelectorAll(".tabpanel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.setAttribute("aria-selected", "false");
      t.setAttribute("tabindex", "-1");
    });
    tabpanels.forEach((p) => p.hidden = true);

    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");
    const panelId = tab.getAttribute("aria-controls");
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) targetPanel.hidden = false;
  });
});

const anOrden = document.getElementById("an-orden");
if (anOrden) {
  anOrden.addEventListener("change", () => {
    const barsList = document.getElementById("an-barras");
    if (!barsList) return;
    const items = Array.from(barsList.querySelectorAll(".bar"));
    items.sort((a, b) => {
      const valA = parseInt(a.querySelector(".bar__value").textContent, 10);
      const valB = parseInt(b.querySelector(".bar__value").textContent, 10);
      const nameA = a.querySelector(".bar__name").textContent;
      const nameB = b.querySelector(".bar__name").textContent;

      if (anOrden.value === "velocidad-asc") return valA - valB;
      if (anOrden.value === "velocidad-desc") return valB - valA;
      return nameA.localeCompare(nameB);
    });
    items.forEach((item) => barsList.appendChild(item));
  });
}

const expForm = document.getElementById("exp-form");
if (expForm) {
  expForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const esc = document.getElementById("exp-escenario");
    const estado = document.getElementById("exp-estado");
    const err = document.getElementById("exp-escenario-error");
    const field = esc.closest(".field");

    if (!esc.value) {
      field.classList.add("has-error");
      err.textContent = "Selecciona una simulación para reportar.";
      err.hidden = false;
      estado.textContent = "";
      return;
    }
    field.classList.remove("has-error");
    err.hidden = true;

    estado.textContent = "Generando informe técnico... Descarga iniciada con éxito.";
    estado.className = "exp-estado";
  });
}

/* ===== SECCIÓN: ALERTAS Y ASISTENTE (Persona 2) ===== */
const alForm = document.getElementById("al-form");
const alMensaje = document.getElementById("al-mensaje");
const alContador = document.getElementById("al-contador");
const alLista = document.getElementById("al-lista");
const alVacio = document.getElementById("al-vacio");
const alCount = document.getElementById("al-count");

let avisosCount = 0;

if (alMensaje && alContador) {
  alMensaje.addEventListener("input", () => {
    const len = alMensaje.value.length;
    alContador.textContent = len;
  });
}

if (alForm) {
  alForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const tipo = document.getElementById("al-tipo").value;
    const distrito = document.getElementById("al-distrito").value;
    const fecha = document.getElementById("al-fecha").value;
    const hora = document.getElementById("al-hora").value;
    const mensaje = document.getElementById("al-mensaje").value;

    let valid = true;
    if (!tipo || !distrito || !fecha || !hora || !mensaje) valid = false;

    if (!valid) {
      document.getElementById("al-estado").textContent = "Por favor completa todos los campos obligatorios.";
      document.getElementById("al-estado").className = "exp-estado is-error";
      return;
    }

    if (alVacio) alVacio.hidden = true;
    avisosCount++;
    if (alCount) alCount.textContent = `${avisosCount} aviso${avisosCount > 1 ? "s" : ""}`;

    let tipoClase = "al-item";
    if (tipo === "emergencia") tipoClase += " al-item--emergencia";
    else if (tipo === "evento") tipoClase += " al-item--evento";

    const li = document.createElement("li");
    li.className = tipoClase;
    li.innerHTML = `
      <div class="al-item__top">
        <span><strong>${tipo.toUpperCase()}</strong> · ${distrito}</span>
        <span>${fecha} ${hora}</span>
      </div>
      <p class="al-item__msg">${mensaje}</p>
      <p class="al-item__canales">Canales: Notificación push activa</p>
      <button type="button" class="btn btn--small btn--ghost" onclick="this.closest('li').remove();">Eliminar aviso</button>
    `;
    alLista.appendChild(li);

    document.getElementById("al-estado").textContent = "Aviso programado y despachado con éxito.";
    document.getElementById("al-estado").className = "exp-estado";
    alForm.reset();
    if (alContador) alContador.textContent = "0";
  });
}

/* HU-10: Asistente virtual de rutas & Notificaciones push */
const botLog = document.getElementById("bot-log");
const botForm = document.getElementById("bot-form");
const botInput = document.getElementById("bot-input");
const chips = document.querySelectorAll(".chips .chip");

function agregarMensajeBot(texto, quien) {
  if (!botLog) return;
  const div = document.createElement("div");
  div.className = `msg msg--${quien}`;
  div.innerHTML = `<span class="msg__who">${quien === "bot" ? "Asistente" : "Tú"}</span><p>${texto}</p>`;
  botLog.appendChild(div);
  botLog.scrollTop = botLog.scrollHeight;
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const consulta = chip.getAttribute("data-consulta");
    agregarMensajeBot(`¿Qué ruta alterna tomo por ${consulta}?`, "user");
    setTimeout(() => {
      let resp = `Para la zona de ${consulta}, las vías alternas presentan un flujo vehicular fluido. Se recomienda usar corredores paralelos.`;
      if (consulta.includes("Javier Prado")) resp = "Por cierre en Javier Prado Este, toma Av. Arequipa o Vía Expresa Sur (velocidad media 24-46 km/h).";
      agregarMensajeBot(resp, "bot");
    }, 600);
  });
});

if (botForm && botInput) {
  botForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = botInput.value.trim();
    if (!val) return;
    agregarMensajeBot(val, "user");
    botInput.value = "";
    setTimeout(() => {
      agregarMensajeBot("Analizando la red vial de Lima y Callao... El gemelo digital indica rutas estables.", "bot");
    }, 700);
  });
}

// Push notifications
const pushChk = document.getElementById("push-chk");
const pushEstado = document.getElementById("push-estado");
const pushSimular = document.getElementById("push-simular");
const pushLista = document.getElementById("push-lista");
const pushVacio = document.getElementById("push-vacio");

if (pushChk && pushSimular && pushEstado) {
  pushChk.addEventListener("change", (e) => {
    if (e.target.checked) {
      pushEstado.textContent = "Las notificaciones push están activas.";
      pushSimular.disabled = false;
    } else {
      pushEstado.textContent = "Las notificaciones están desactivadas.";
      pushSimular.disabled = true;
    }
  });

  pushSimular.addEventListener("click", () => {
    if (pushVacio) pushVacio.hidden = true;
    const li = document.createElement("li");
    li.className = "push-item";
    li.innerHTML = `
      <div class="push-item__top"><span>Alerta de Tráfico · UrbanTwin</span><span>Ahora</span></div>
      <p>⚠️ Desvío habilitado en Av. Javier Prado por incidente activo. Flujo redirigido.</p>
    `;
    pushLista.prepend(li);
  });
}

/* ===== SECCIÓN: TU APORTE (Persona 2) ===== */
const apInput = document.getElementById("ap-foto");
const apPrev = document.getElementById("ap-foto-prev");
const apDesc = document.getElementById("ap-desc");
const apContador = document.getElementById("ap-contador");

if (apDesc && apContador) {
  apDesc.addEventListener("input", () => {
    apContador.textContent = apDesc.value.length;
  });
}

if (apInput && apPrev) {
  apInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        apPrev.src = evt.target.result;
        apPrev.hidden = false;
      };
      reader.readAsDataURL(file);
    } else {
      apPrev.hidden = true;
      apPrev.src = "";
    }
  });
}

const apUbicacionBtn = document.getElementById("ap-ubicacion");
const apUbicacionTxt = document.getElementById("ap-ubicacion-txt");
if (apUbicacionBtn && apUbicacionTxt) {
  apUbicacionBtn.addEventListener("click", () => {
    apUbicacionTxt.textContent = "Ubicación detectada: San Isidro / Lima (GPS Activo)";
  });
}

const apForm = document.getElementById("ap-form");
const apLista = document.getElementById("ap-lista");
const apVacio = document.getElementById("ap-vacio");
const apCount = document.getElementById("ap-count");
let reportesCount = 0;

if (apForm) {
  apForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const tipo = document.getElementById("ap-tipo").value;
    const via = document.getElementById("ap-via").value;
    const desc = document.getElementById("ap-desc").value;
    const estado = document.getElementById("ap-estado");

    if (!tipo || !via || desc.length < 10) {
      if (estado) {
        estado.textContent = "Por favor completa los campos obligatorios (la descripción requiere mínimo 10 caracteres).";
        estado.className = "exp-estado is-error";
      }
      return;
    }

    if (apVacio) apVacio.hidden = true;
    reportesCount++;
    if (apCount) apCount.textContent = `${reportesCount} reporte${reportesCount > 1 ? "s" : ""}`;

    const li = document.createElement("li");
    li.className = "inc ap-item--revision";
    li.innerHTML = `
      <div class="inc__top"><span>Reporte #${reportesCount}</span><span>En revisión</span></div>
      <p class="inc__title">${tipo.toUpperCase()} · ${via}</p>
      <p class="inc__place">${desc}</p>
      <span class="badge badge--mid">PENDIENTE</span>
    `;
    apLista.appendChild(li);

    if (estado) {
      estado.textContent = "¡Gracias por tu aporte! Tu reporte ha sido enviado a la central.";
      estado.className = "exp-estado";
    }
    apForm.reset();
    if (apPrev) apPrev.hidden = true;
    if (apContador) apContador.textContent = "0";
  });
}

/* HU-12: Validador comunitario de rutas alternas */
const rutaLista = document.getElementById("ruta-lista");
const RUTAS_A_VALIDAR = [
  { id: "r1", nombre: "Av. Arequipa (Cuadras 20-35)", viaRef: "Alterna a Av. Brasil" },
  { id: "r2", nombre: "Vía Expresa Sur (Tramo Miraflores)", viaRef: "Alterna a Javier Prado" },
];

if (rutaLista) {
  rutaLista.innerHTML = RUTAS_A_VALIDAR.map((r) => `
    <li class="ruta" data-ruta="${r.id}">
      <div class="ruta__top">
        <strong>${r.nombre}</strong>
        <span class="badge badge--ok">Activa</span>
      </div>
      <p class="ruta__score">Referencia: ${r.viaRef}</p>
      <fieldset class="rating" aria-label="Calificar fluidez de ${r.nombre}">
        <legend class="field__label">Califica la fluidez:</legend>
        <input type="radio" id="${r.id}-star5" name="${r.id}-rating" value="5"><label for="${r.id}-star5" title="5 estrellas"></label>
        <input type="radio" id="${r.id}-star4" name="${r.id}-rating" value="4"><label for="${r.id}-star4" title="4 estrellas"></label>
        <input type="radio" id="${r.id}-star3" name="${r.id}-rating" value="3"><label for="${r.id}-star3" title="3 estrellas"></label>
        <input type="radio" id="${r.id}-star2" name="${r.id}-rating" value="2"><label for="${r.id}-star2" title="2 estrellas"></label>
        <input type="radio" id="${r.id}-star1" name="${r.id}-rating" value="1"><label for="${r.id}-star1" title="1 estrella"></label>
      </fieldset>
      <p class="ruta__score">Fluidez promedio: <output>4.2</output> / 5</p>
    </li>
  `).join("");
}

/* ===== SECCIÓN: CONTACTO (Persona 2) ===== */
const ctForm = document.getElementById("ct-form");
if (ctForm) {
  ctForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("ct-nombre").value;
    const correo = document.getElementById("ct-correo").value;
    const celular = document.getElementById("ct-celular").value;
    const perfil = document.getElementById("ct-perfil").value;
    const mensaje = document.getElementById("ct-mensaje").value;
    const estado = document.getElementById("ct-estado");

    if (!nombre || !correo || !celular || !perfil || !mensaje || celular.length !== 9 || !celular.startsWith("9")) {
      if (estado) {
        estado.textContent = "Por favor verifica los campos. El celular debe tener 9 dígitos y empezar con 9.";
        estado.className = "exp-estado is-error";
      }
      return;
    }

    if (estado) {
      estado.textContent = "Solicitud enviada con éxito. Nos pondremos en contacto contigo a la brevedad.";
      estado.className = "exp-estado";
    }
    ctForm.reset();
  });
}

document.querySelectorAll("[data-contactar]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const asesor = btn.getAttribute("data-contactar");
    const estadoAsesor = document.getElementById("ct-asesor-estado");
    if (estadoAsesor) {
      estadoAsesor.textContent = `Iniciando chat directo con el asesor (${asesor})...`;
    }
  });
});

document.querySelectorAll("[data-agendar]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const asesor = btn.getAttribute("data-agendar");
    alert(`Abriendo calendario de citas para el asesor (${asesor}).`);
  });
});