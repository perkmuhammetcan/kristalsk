/* ====== AYARLAR: kendi bilgilerinizle değiştirin ====== */
const CONFIG = {
  // WhatsApp numarası: ülke koduyla, boşluksuz ve + olmadan yazın. Örn. 905321234567
  whatsapp: "905526262536",
  social: {
    instagram: "https://www.instagram.com/kristal_36sk/",   // örn. https://www.instagram.com/kristalsk
    youtube: "#"      // örn. https://www.youtube.com/@kristalsk
  },
  mapQuery: "Kafkas Üniversitesi Prof. Dr. Necati Kaya Spor Salonu, Kars"
};

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // WhatsApp ve sosyal bağlantılar
  const waDigits = String(CONFIG.whatsapp).replace(/\D/g, "");
  const waReady = waDigits.length >= 11;
  const waUrl = text => "https://wa.me/" + waDigits + (text ? "?text=" + encodeURIComponent(text) : "");
  const waPretty = (() => {
    const m = waDigits.match(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (m) return "+90 " + m[1] + " " + m[2] + " " + m[3] + " " + m[4];
    return waReady ? "+" + waDigits : "+90 552 626 25 36";
  })();
  CONFIG.social.whatsapp = waReady ? waUrl("Merhaba, Kristal SK voleybol kursu hakkında bilgi almak istiyorum.") : "#";
  document.querySelectorAll(".js-wa-number").forEach(el => el.textContent = waPretty);
  document.querySelectorAll(".js-wa-link").forEach(a => {
    if (waReady) a.href = CONFIG.social.whatsapp;
    else a.addEventListener("click", e => e.preventDefault());
  });
  document.querySelectorAll("[data-social]").forEach(a => {
    const url = CONFIG.social[a.dataset.social];
    if (url && url !== "#") { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
    else a.addEventListener("click", e => e.preventDefault());
  });
  document.getElementById("year").textContent = new Date().getFullYear();

  // Mobil menü
  const header = document.querySelector(".site-header");
  const menuBtn = document.getElementById("menuBtn");
  menuBtn.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  });
  document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => {
    header.classList.remove("menu-open"); menuBtn.setAttribute("aria-expanded", "false");
  }));

  // Aktif menü bağlantısı
  const links = [...document.querySelectorAll(".nav a")];
  const sections = links.map(l => document.querySelector(l.getAttribute("href")));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => s && io.observe(s));
  }

  // Söz: kelime kelime belirme animasyonu
  const q = document.getElementById("quoteText");
  if (!reduceMotion) {
    let i = 0;
    const wrapWords = node => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement("span");
            s.className = "word"; s.textContent = part; s.style.animationDelay = (0.15 + i++ * 0.09) + "s";
            frag.appendChild(s);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) wrapWords(ch);
      });
    };
    wrapWords(q);
  }

  // Kristal kar taneleri (canvas)
  const cv = document.getElementById("snow");
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, flakes = [], raf = null, mx = 0;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(Math.min(90, W / 16));
    flakes = Array.from({ length: n }, () => makeFlake(true));
    if (reduceMotion) draw();
  }
  function makeFlake(anywhere) {
    const z = Math.random();
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : -12,
      r: 1.2 + z * 4.2, z, vy: 0.15 + z * 0.55, vx: (Math.random() - 0.5) * 0.2,
      a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.01,
      hex: Math.random() < 0.35, o: 0.15 + z * 0.45
    };
  }
  function hexPath(x, y, r, a) {
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const t = a + k * Math.PI / 3;
      ctx.lineTo(x + Math.cos(t) * r, y + Math.sin(t) * r);
    }
    ctx.closePath();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const f of flakes) {
      const px = f.x + mx * f.z * 18;
      if (f.hex) {
        hexPath(px, f.y, f.r * 1.6, f.a);
        ctx.strokeStyle = `rgba(191, 227, 243, ${f.o})`; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = `rgba(127, 192, 221, ${f.o * 0.25})`; ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(px, f.y, f.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 234, 242, ${f.o})`; ctx.fill();
      }
    }
  }
  function tick() {
    for (let k = 0; k < flakes.length; k++) {
      const f = flakes[k];
      f.y += f.vy; f.x += f.vx + Math.sin((f.y + k) * 0.01) * 0.15; f.a += f.va;
      if (f.y > H + 12) flakes[k] = makeFlake(false);
    }
    draw();
    raf = requestAnimationFrame(tick);
  }
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", e => { mx = (e.clientX / window.innerWidth - 0.5); });
  resize();
  if (!reduceMotion) {
    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  // Google Maps: site kendi alan adında açıldığında harita yüklenir
  let embedded = true;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }
  if (!embedded) {
    const iframe = document.createElement("iframe");
    iframe.src = "https://maps.google.com/maps?q=" + encodeURIComponent(CONFIG.mapQuery) + "&z=16&hl=tr&output=embed";
    iframe.title = "Kristal SK antrenman salonu konumu";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.allowFullscreen = true;
    iframe.addEventListener("load", () => { document.getElementById("mapFallback").style.display = "none"; });
    document.getElementById("map").appendChild(iframe);
  }

  // Yaş seçenekleri
  const ageSel = document.getElementById("f-age");
  for (let a = 6; a <= 17; a++) { const o = document.createElement("option"); o.value = a; o.textContent = a + " yaş"; ageSel.appendChild(o); }

  // İletişim formu → WhatsApp
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const get = id => document.getElementById(id);
    const checks = [
      ["f-name", v => v.trim().length > 1],
      ["f-message", v => v.trim().length > 3]
    ];
    let ok = true, firstBad = null;
    checks.forEach(([id, fn]) => {
      const el = get(id), good = fn(el.value);
      el.closest(".field").classList.toggle("invalid", !good);
      if (!good) { ok = false; firstBad = firstBad || el; }
    });
    if (!ok) { firstBad.focus(); return; }

    const name = get("f-name").value.trim();
    const age = get("f-age").value;
    const text = [
      "Merhaba Kristal SK,",
      "",
      "*Konu:* " + get("f-subject").value,
      "*Ad Soyad:* " + name,
      age ? "*Öğrencinin yaşı:* " + age : "",
      "",
      get("f-message").value.trim()
    ].filter((l, i, arr) => l !== "" || (arr[i - 1] !== "" && i > 0)).join("\n");

    status.innerHTML = "";
    status.classList.add("show");
    if (!waReady) {
      status.textContent = "WhatsApp numarası henüz eklenmedi. Lütfen daha sonra tekrar deneyin.";
      return;
    }
    const url = waUrl(text);
    const p = document.createElement("div");
    p.textContent = "WhatsApp mesajınızla birlikte açılıyor. Açılmadıysa aşağıdaki butona dokunun, ardından WhatsApp'ta gönder tuşuna basın.";
    const a = document.createElement("a");
    a.className = "btn btn-wa"; a.href = url; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "WhatsApp'ı aç";
    status.append(p, a);

    try {
      const w = window.open(url, "_blank");
      if (w) w.opener = null;
    } catch (err) { /* açılamazsa yukarıdaki buton kullanılır */ }
  });
  form.querySelectorAll("input, textarea").forEach(el => el.addEventListener("input", () => el.closest(".field").classList.remove("invalid")));
})();
