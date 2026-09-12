/* Dariana & Erick · 13.02.2027 */
(function () {
  "use strict";

  const CONFIG = {
    novios: "Dariana y Erick",
    // Ceremonia 5:00 p.m. hora de Mérida (UTC-6, sin horario de verano)
    fecha: new Date("2027-02-13T17:00:00-06:00"),
    fin: new Date("2027-02-14T03:00:00-06:00"),
    pasesDefault: 2,
    maxPases: 8,
    hashtag: "#DarianayErick2027",
    // Subir este número cada vez que se reemplace una foto con el mismo nombre
    imgVersion: "3",
    storageRsvp: "dye27_rsvp",
    storageWishes: "dye27_wishes",
    mapas: {
      ceremonia: "https://maps.google.com/maps?q=Iglesia%20de%20Santa%20Ana%2C%20M%C3%A9rida%2C%20Yucat%C3%A1n&z=16&output=embed",
      recepcion: "https://maps.google.com/maps?q=Hacienda%20Xcanat%C3%BAn%2C%20M%C3%A9rida%2C%20Yucat%C3%A1n&z=14&output=embed"
    },
    galeria: [
      "foto-beso-manos", "foto-abrazo", "foto-propuesta", "foto-perrito",
      "foto-beso-mejilla", "foto-trio", "foto-sillas"
    ],
    deseosDemo: [
      { autor: "Sofía Rangel", texto: "¡Desde aquella jamaica derramada supe que esto iba en serio! Los amo, que su vida juntos sea igual de divertida." },
      { autor: "Tía Laura", texto: "Que Dios bendiga su hogar y nunca les falte paciencia, risas y café en la mañana." },
      { autor: "Rafa Navarro", texto: "Primo, por fin alguien que te aguanta. Dariana, bienvenida oficialmente a la familia. ¡Nos vemos en la pista!" },
      { autor: "Familia Garza Treviño", texto: "Qué alegría verlos cumplir este sueño. Ahí estaremos con todo y zapatos de baile." },
      { autor: "Camila Estrada", texto: "Ocho años viéndolos crecer juntos. Son la prueba de que el amor bonito sí existe." },
      { autor: "Pablo Guerra", texto: "Erick, recuerda: la esposa siempre tiene la razón. Y Bombón también. Felicidades, hermano." }
    ]
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
  const evPlace = "Iglesia de Santa Ana, Calle 60 x 45 y 47, Centro, Mérida, Yuc.";
  const evDesc = "Ceremonia 5:00 p.m. en la Iglesia de Santa Ana. Recepción 6:45 p.m. en Hacienda Xcanatún. Info: https://darianayerick.automatizeishon.com";
  $("#gcalLink").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(evTitle) +
    "&dates=" + toICSDate(CONFIG.fecha) + "/" + toICSDate(CONFIG.fin) +
    "&details=" + encodeURIComponent(evDesc) +
    "&location=" + encodeURIComponent(evPlace);
  $("#icsBtn").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DarianayErick//Boda//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:boda-dariana-erick-20270213@darianayerick.automatizeishon.com",
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
    copyText(el.textContent.replace(/\s/g, ""), "CLABE copiada");
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
    b.innerHTML = `<img src="img/${name}.webp?v=${CONFIG.imgVersion}" alt="Dariana y Erick, foto ${i + 1}" loading="lazy">`;
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
  const form = $("#rsvpForm");
  const attendFields = $("#attendFields");
  const formError = $("#formError");
  const done = $("#rsvpDone");

  function syncAttend() {
    const v = form.asistencia.value;
    attendFields.classList.toggle("is-off", v === "no");
  }
  $$('input[name="asistencia"]', form).forEach((r) => r.addEventListener("change", () => {
    syncAttend();
    r.closest(".field").classList.remove("is-invalid");
    formError.hidden = true;
  }));

  function showDone(data) {
    const yes = data.asistencia === "si";
    $("#doneTitle").textContent = yes ? `¡Gracias, ${data.nombre.split(" ")[0]}!` : "Gracias por avisarnos";
    $("#doneText").textContent = yes
      ? `Confirmaste ${data.asistentes} ${Number(data.asistentes) === 1 ? "lugar" : "lugares"}. Nos vemos el 13 de febrero en Mérida.`
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
    data.invitado = invitado || null;
    data.pases = pases;
    data.fecha_respuesta = new Date().toISOString();
    if (!store.set(CONFIG.storageRsvp, data)) {
      // Sin almacenamiento local la confirmación igual se muestra; el aviso real va por WhatsApp.
      toast("Respuesta registrada en esta sesión");
    }
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
  const userWishes = store.get(CONFIG.storageWishes, []);
  [...userWishes].reverse().concat(CONFIG.deseosDemo).forEach((w) => wall.appendChild(wishNode(w, false)));
  wishForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const autor = wishForm.autor.value.trim();
    const texto = wishForm.texto.value.trim();
    if (!autor || !texto) { toast("Escribe tu nombre y tu mensaje"); return; }
    const w = { autor, texto };
    userWishes.push(w);
    store.set(CONFIG.storageWishes, userWishes);
    wall.prepend(wishNode(w, true));
    wishForm.reset();
    toast("¡Gracias por tus buenos deseos!");
  });
})();
