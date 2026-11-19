/* Dariana & Erick · 13.02.2027 */
(function () {
  "use strict";

  const CONFIG = {
    novios: "Dariana y Erick",
    // Misa 3:00 p.m. hora de Mérida (UTC-6, sin horario de verano)
    fecha: new Date("2027-02-13T15:00:00-06:00"),
    fin: new Date("2027-02-14T03:00:00-06:00"),
    pasesDefault: 2,
    maxPases: 8,
    hashtag: "#DarianayErick2027",
    // Subir este número cada vez que se reemplace una foto con el mismo nombre
    imgVersion: "6",
    // A dónde se envían las confirmaciones (n8n -> Google Sheets)
    endpointRsvp: "https://n8n.quikia.mx/webhook/rsvp-dariana-erick",
    storageRsvp: "dye27_rsvp",
    storageWishes: "dye27_wishes",
    mapas: {
      ceremonia: "https://maps.google.com/maps?q=Rector%C3%ADa%20El%20Jes%C3%BAs%20Tercera%20Orden%2C%20M%C3%A9rida&z=16&output=embed",
      recepcion: "https://maps.google.com/maps?q=Hacienda%20Xuku%2C%20Sey%C3%A9%2C%20Yucat%C3%A1n&z=14&output=embed"
    },
    galeria: [
      "g-01", "g-02", "g-03", "g-04", "g-05", "g-06", "g-07", "g-08", "g-09"
    ],
    deseosDemo: []
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    }
  };

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2800);
  }

  /* ---------- Invitado personalizado: ?invitado=Familia%20López&pases=4 ---------- */
  const params = new URLSearchParams(location.search);
  const invitado = (params.get("invitado") || params.get("para") || "").trim().slice(0, 60);
  const pasesParam = parseInt(params.get("pases"), 10);
  const pases = Number.isFinite(pasesParam) && pasesParam > 0 ? Math.min(pasesParam, CONFIG.maxPases) : CONFIG.pasesDefault;

  if (invitado) {
    $("#introGuest").textContent = invitado;
    const banner = $("#guestBanner");
    banner.textContent = `${invitado}, esta invitación es para ti`;
    banner.hidden = false;
    $("#rsvpName").value = invitado;
  }
  $("#passesInfo").innerHTML = `Hemos reservado <strong>${pases}</strong> ${pases === 1 ? "lugar" : "lugares"} en tu honor.`;
  const guestCount = $("#guestCount");
  for (let i = 1; i <= pases; i++) {
    const o = document.createElement("option");
    o.value = i; o.textContent = `${i} ${i === 1 ? "persona" : "personas"}`;
    if (i === pases) o.selected = true;
    guestCount.appendChild(o);
  }

  /* ---------- Intro (sobre) ---------- */
  const intro = $("#intro");
  let alreadyOpened = false;
  try { alreadyOpened = sessionStorage.getItem("dye27_open") === "1"; } catch (e) { alreadyOpened = false; }
  function openInvite() {
    intro.classList.add("is-open");
    document.body.classList.remove("is-locked");
    try { sessionStorage.setItem("dye27_open", "1"); } catch (e) { /* modo privado: solo no se recuerda */ }
    setTimeout(() => { intro.hidden = true; }, 950);
  }
  if (alreadyOpened) {
    intro.hidden = true;
    document.body.classList.remove("is-locked");
  } else {
    $("#openInvite").addEventListener("click", openInvite);
    intro.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openInvite(); });
  }

  /* ---------- Cuenta regresiva ---------- */
  const cd = {
    d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]')
  };
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  function tick() {
    const now = new Date();
    let diff = CONFIG.fecha - now;
    if (diff <= 0) {
      const box = $("#countdown");
      box.innerHTML = now < CONFIG.fin
        ? '<p class="hero__date">¡Hoy es el gran día!</p>'
        : '<p class="hero__date">¡Recién casados! Gracias por celebrar con nosotros</p>';
      return false;
    }
    const s = Math.floor(diff / 1000);
    cd.d.textContent = pad(Math.floor(s / 86400), 3);
    cd.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cd.m.textContent = pad(Math.floor((s % 3600) / 60));
    cd.s.textContent = pad(s % 60);
    return true;
  }
  if (tick()) {
    const cdTimer = setInterval(() => { if (!tick()) clearInterval(cdTimer); }, 1000);
  }

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const navToggle = $("#navToggle");
  const fab = $("#fab");
  const rsvpSection = $("#rsvp");
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-solid", y > window.innerHeight * 0.75);
    const r = rsvpSection.getBoundingClientRect();
    const inRsvp = r.top < window.innerHeight && r.bottom > 0;
    fab.classList.toggle("is-visible", y > window.innerHeight && !inRsvp);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-menu", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => {
    navToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-menu");
    document.body.style.overflow = "";
  }));

  /* ---------- Aparición al hacer scroll ---------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Mapas ---------- */
  const mapFrame = $("#mapFrame");
  const mapPanel = $("#mapPanel");
  function showMap(key, scroll) {
    if (!CONFIG.mapas[key]) return;
    mapFrame.src = CONFIG.mapas[key];
    mapFrame.title = key === "ceremonia" ? "Mapa de la ceremonia" : "Mapa de la recepción";
    $$(".map-panel__tabs button").forEach((b) => b.classList.toggle("is-active", b.dataset.map === key));
    if (scroll) mapPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $$(".map-panel__tabs button").forEach((b) => b.addEventListener("click", () => showMap(b.dataset.map, false)));
  $$(".event-card [data-map]").forEach((b) => b.addEventListener("click", () => showMap(b.dataset.map, true)));

  /* ---------- Calendario ---------- */
  const toICSDate = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const evTitle = "Boda de Dariana y Erick";
  const evPlace = "Rectoría El Jesús Tercera Orden, Calle 60 x 59-A, Centro, Mérida, Yuc.";
  const evDesc = "Misa 3:00 p.m. en la Rectoría El Jesús Tercera Orden, Mérida. Recepción 6:45 p.m. en la Hacienda Xuku, Seyé. Info: https://darianayerick.com";
  $("#gcalLink").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(evTitle) +
    "&dates=" + toICSDate(CONFIG.fecha) + "/" + toICSDate(CONFIG.fin) +
    "&details=" + encodeURIComponent(evDesc) +
    "&location=" + encodeURIComponent(evPlace);
  $("#icsBtn").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DarianayErick//Boda//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:boda-dariana-erick-20270213@darianayerick.com",
      "DTSTAMP:" + toICSDate(new Date()),
      "DTSTART:" + toICSDate(CONFIG.fecha),
      "DTEND:" + toICSDate(CONFIG.fin),
      "SUMMARY:" + evTitle,
      "LOCATION:" + evPlace.replace(/,/g, "\\,"),
      "DESCRIPTION:" + evDesc.replace(/,/g, "\\,"),
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Mañana es la boda de Dariana y Erick", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "boda-dariana-erick.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast("Evento descargado para tu calendario");
  });

  /* ---------- Copiar ---------- */
  async function copyText(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(okMsg);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      toast(ok ? okMsg : "No se pudo copiar, cópialo manualmente");
    }
  }
  $$("[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const el = document.getElementById(b.dataset.copy);
    copyText(el.textContent.replace(/\s/g, ""), "Número de cuenta copiado");
  }));
  $$("[data-copy-text]").forEach((b) => b.addEventListener("click", () => copyText(b.dataset.copyText, "Hashtag copiado")));
  $$("[data-demo]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    toast("Enlace de ejemplo: aquí irá el link real");
  }));

  /* ---------- Galería + lightbox ---------- */
  const masonry = $("#masonry");
  CONFIG.galeria.forEach((name, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Ver foto ${i + 1}`);
    b.className = `g-${i + 1}`;
    b.innerHTML = `<img src="img/${name}.webp?v=${CONFIG.imgVersion}" alt="Dariana y Erick, foto ${i + 1} de su save the date y su civil" loading="lazy">`;
    b.addEventListener("click", () => openLightbox(i));
    masonry.appendChild(b);
  });

  const lb = $("#lightbox");
  const lbImg = $("img", lb);
  const lbCount = $(".lightbox__count", lb);
  let lbIndex = 0;
  function renderLightbox() {
    lbImg.src = `img/${CONFIG.galeria[lbIndex]}.webp?v=${CONFIG.imgVersion}`;
    lbImg.alt = `Foto ${lbIndex + 1} de ${CONFIG.galeria.length}`;
    lbCount.textContent = `${lbIndex + 1} / ${CONFIG.galeria.length}`;
  }
  function openLightbox(i) {
    lbIndex = i; renderLightbox();
    lb.hidden = false; document.body.style.overflow = "hidden";
  }
  function closeLightbox() { lb.hidden = true; document.body.style.overflow = ""; }
  function step(d) { lbIndex = (lbIndex + d + CONFIG.galeria.length) % CONFIG.galeria.length; renderLightbox(); }
  $(".lightbox__close", lb).addEventListener("click", closeLightbox);
  $(".lightbox__prev", lb).addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
  $(".lightbox__next", lb).addEventListener("click", (e) => { e.stopPropagation(); step(1); });
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ---------- RSVP ---------- */
  function enviarRsvp(data) {
    if (!CONFIG.endpointRsvp) return Promise.resolve(false);
    // Se manda como formulario para evitar el preflight de CORS
    const cuerpo = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) => cuerpo.append(k, v == null ? "" : String(v)));
    return fetch(CONFIG.endpointRsvp, { method: "POST", body: cuerpo, keepalive: true })
      .then((r) => r.ok)
      .catch(() => false);
  }

  function marcarEnviado(data, ok) {
    data.enviado = ok;
    store.set(CONFIG.storageRsvp, data);
  }

  const form = $("#rsvpForm");
  const attendFields = $("#attendFields");
  const formError = $("#formError");
  const done = $("#rsvpDone");

  const nombresWrap = $("#nombresWrap");
  const nombresCaja = $("#nombresInvitados");

  function pintarNombres() {
    if (!nombresCaja) return;
    const total = Number(guestCount.value || 1);
    const previos = $$("input", nombresCaja).map((i) => i.value);
    nombresCaja.innerHTML = "";
    for (let i = 1; i <= total; i++) {
      const fila = document.createElement("label");
      fila.className = "nombres__fila";
      const etiqueta = document.createElement("span");
      etiqueta.textContent = i;
      const campo = document.createElement("input");
      campo.type = "text";
      campo.name = "invitado_" + i;
      campo.placeholder = i === 1 ? "Nombre de quien confirma" : "Nombre del invitado " + i;
      campo.autocomplete = "off";
      if (previos[i - 1]) campo.value = previos[i - 1];
      fila.append(etiqueta, campo);
      nombresCaja.appendChild(fila);
    }
    nombresWrap.hidden = total < 1;
  }

  guestCount.addEventListener("change", pintarNombres);
  pintarNombres();

  function syncAttend() {
    const v = form.asistencia.value;
    attendFields.classList.toggle("is-off", v === "no");
  }
  $("#rsvpName").addEventListener("input", (e) => {
    const primero = $("input[name='invitado_1']", nombresCaja);
    if (primero && !primero.dataset.tocado) primero.value = e.target.value;
  });
  nombresCaja.addEventListener("input", (e) => { e.target.dataset.tocado = "1"; });

  $$('input[name="asistencia"]', form).forEach((r) => r.addEventListener("change", () => {
    syncAttend();
    r.closest(".field").classList.remove("is-invalid");
    formError.hidden = true;
  }));

  function showDone(data) {
    const yes = data.asistencia === "si";
    const corto = /^(familia|fam\.|sr\.|sra\.|srita\.)$/i.test(data.nombre.split(" ")[0]) ? data.nombre : data.nombre.split(" ")[0];
    $("#doneTitle").textContent = yes ? `¡Gracias, ${corto}!` : "Gracias por avisarnos";
    $("#doneText").textContent = yes
      ? `Confirmaste ${data.asistentes} ${Number(data.asistentes) === 1 ? "lugar" : "lugares"}. Nos vemos el 13 de febrero.`
      : "Te vamos a extrañar. Gracias por tomarte el tiempo de responder, te mandamos un abrazo.";
    const msg = yes
      ? `Hola, soy ${data.nombre}. Confirmo mi asistencia a la boda de Dariana y Erick con ${data.asistentes} ${Number(data.asistentes) === 1 ? "persona" : "personas"}. ${CONFIG.hashtag}`
      : `Hola, soy ${data.nombre}. Lamentablemente no podré asistir a la boda de Dariana y Erick. ¡Muchas felicidades!`;
    $("#waLink").href = "https://wa.me/?text=" + encodeURIComponent(msg);
    form.hidden = true;
    done.hidden = false;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formError.hidden = true;
    $$(".field", form).forEach((f) => f.classList.remove("is-invalid"));
    const nameInput = form.nombre;
    const errors = [];
    if (nameInput.value.trim().length < 3) {
      nameInput.closest(".field").classList.add("is-invalid");
      errors.push("tu nombre");
    }
    if (!form.asistencia.value) {
      $('input[name="asistencia"]', form).closest(".field").classList.add("is-invalid");
      errors.push("si nos acompañas");
    }
    if (errors.length) {
      formError.textContent = "Por favor indícanos " + errors.join(" y ") + ".";
      formError.hidden = false;
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    data.nombre = data.nombre.trim();
    const nombres = $$("input", nombresCaja).map((i) => i.value.trim()).filter(Boolean);
    data.acompanantes = data.asistencia === "si" ? nombres.join(", ") : "";
    $$("input", nombresCaja).forEach((i) => { delete data[i.name]; });
    data.invitado = invitado || null;
    data.pases = pases;
    data.fecha_respuesta = new Date().toISOString();
    store.set(CONFIG.storageRsvp, data);
    enviarRsvp(data).then((ok) => {
      marcarEnviado(data, ok);
      if (!ok) toast("No pudimos guardar tu respuesta, avísanos por WhatsApp");
    });
    showDone(data);
    done.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  $("#rsvpEdit").addEventListener("click", () => {
    done.hidden = true;
    form.hidden = false;
  });

  const savedRsvp = store.get(CONFIG.storageRsvp, null);
  if (savedRsvp && savedRsvp.nombre) {
    Object.entries(savedRsvp).forEach(([k, v]) => {
      const el = form.elements[k];
      if (!el) return;
      if (el instanceof RadioNodeList) {
        $$(`input[name="${k}"]`, form).forEach((r) => { r.checked = r.value === v; });
      } else {
        el.value = v;
      }
    });
    syncAttend();
    showDone(savedRsvp);
    if (savedRsvp.enviado === false) {
      enviarRsvp(savedRsvp).then((ok) => { if (ok) marcarEnviado(savedRsvp, true); });
    }
  }

  /* ---------- Buenos deseos ---------- */
  const wall = $("#wishWall");
  const wishForm = $("#wishForm");
  function wishNode(w, isNew) {
    const art = document.createElement("article");
    art.className = "wish" + (isNew ? " is-new" : "");
    const p = document.createElement("p"); p.textContent = w.texto;
    const f = document.createElement("footer"); f.textContent = w.autor;
    art.append(p, f);
    return art;
  }
  const wishEmpty = $("#wishEmpty");
  const userWishes = store.get(CONFIG.storageWishes, []);
  [...userWishes].reverse().concat(CONFIG.deseosDemo).forEach((w) => wall.appendChild(wishNode(w, false)));
  function syncWishEmpty() { if (wishEmpty) wishEmpty.hidden = wall.children.length > 0; }
  syncWishEmpty();
  wishForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const autor = wishForm.autor.value.trim();
    const texto = wishForm.texto.value.trim();
    if (!autor || !texto) { toast("Escribe tu nombre y tu mensaje"); return; }
    const w = { autor, texto };
    userWishes.push(w);
    store.set(CONFIG.storageWishes, userWishes);
    wall.prepend(wishNode(w, true));
    syncWishEmpty();
    wishForm.reset();
    toast("¡Gracias por tus buenos deseos!");
  });
})();
