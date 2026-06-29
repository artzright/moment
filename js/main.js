/* ============================================================
   MOMENTS — premium interactions
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero background video: don't autoplay under reduced-motion (poster shows) ---------- */
  (function () {
    const hv = document.querySelector(".hero__bg");
    if (hv && reduceMotion) { hv.removeAttribute("autoplay"); hv.pause(); }
  })();

  /* ---------- Preloader ---------- */
  const loader = document.getElementById("loader");
  const loaderCount = document.getElementById("loaderCount");
  const hero = document.querySelector(".hero");
  document.body.classList.add("is-loading");

  function finishLoad() {
    document.body.classList.remove("is-loading");
    loader.classList.add("is-done");
    if (hero) hero.classList.add("is-in");
    const title = document.querySelector(".hero__title.is-split");
    if (title) requestAnimationFrame(() => title.classList.add("is-in"));
  }

  if (reduceMotion) {
    loaderCount.textContent = "100";
    finishLoad();
  } else {
    let n = 0;
    const tick = setInterval(() => {
      n += Math.floor(Math.random() * 9) + 3;
      if (n >= 100) { n = 100; clearInterval(tick); setTimeout(finishLoad, 450); }
      loaderCount.textContent = n;
    }, 90);
    // safety fallback
    window.addEventListener("load", () => { if (n < 100) { clearInterval(tick); loaderCount.textContent = "100"; setTimeout(finishLoad, 300); } });
    setTimeout(() => { clearInterval(tick); loaderCount.textContent = "100"; finishLoad(); }, 3500);
  }

  /* ---------- Split hero title into animated words ---------- */
  const title = document.querySelector("[data-split]");
  if (title && !reduceMotion) {
    const words = title.textContent.trim().split(/\s+/);
    title.innerHTML = words
      .map((w, i) => `<span class="word"><span style="transition-delay:${0.25 + i * 0.08}s">${w}</span></span>`)
      .join(" ");
    title.classList.add("is-split");
  }

  /* ---------- Sticky nav + scroll progress ---------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) nav.classList.remove("is-open");
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const galleryItems = document.querySelectorAll(".gallery__item");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || "";
        const dur = 1600; const start = performance.now();
        function step(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Parallax (hero + tagged elements) ---------- */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  if (!reduceMotion && parallaxEls.length) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        parallaxEls.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const rect = el.getBoundingClientRect();
          const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });

    /* ---------- Card 3D tilt ---------- */
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Swipeable card carousels ---------- */
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector(".carousel__track");
    if (!track) return;
    const prev = root.querySelector(".carousel__arrow--prev");
    const next = root.querySelector(".carousel__arrow--next");
    const bar  = root.querySelector(".carousel__progress span");

    const cards = () => Array.from(track.children).filter((c) => c.offsetParent !== null);

    function step() {
      const c = cards()[0];
      const cs = getComputedStyle(track);
      const gap = parseFloat(cs.columnGap || cs.gap) || 24;
      return c ? c.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    }
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left:  step(), behavior: "smooth" }));

    function update() {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = null, bestD = Infinity;
      cards().forEach((c) => {
        const cc = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cc - center);
        if (d < bestD) { bestD = d; best = c; }
        c.classList.remove("is-active");
      });
      if (best) best.classList.add("is-active");
      const max = track.scrollWidth - track.clientWidth;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(track.scrollLeft / max, 1) : 0) + ")";
      if (prev) prev.classList.toggle("is-disabled", track.scrollLeft <= 2);
      if (next) next.classList.toggle("is-disabled", track.scrollLeft >= max - 2);
    }
    let raf = null;
    track.addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => { raf = null; update(); }); }, { passive: true });
    window.addEventListener("resize", update);

    // drag-to-scroll for mouse/trackpad; touch devices use native swipe
    let down = false, startX = 0, startScroll = 0, moved = 0;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      down = true; startX = e.clientX; startScroll = track.scrollLeft; moved = 0;
      track.classList.add("is-grabbing");
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > moved) moved = Math.abs(dx);
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", () => { if (down) { down = false; track.classList.remove("is-grabbing"); update(); } });
    // a real drag shouldn't trigger the card's click (e.g. open the lightbox)
    track.addEventListener("click", (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);

    track.__carousel = { update };
    requestAnimationFrame(update);
    window.addEventListener("load", update);
  });

  /* ---------- Gallery filters ---------- */
  const galleryTrack = document.getElementById("gallery");
  const filterBtns = document.querySelectorAll(".filters__btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      galleryItems.forEach((it) => {
        const show = f === "all" || it.dataset.cat === f;
        it.classList.toggle("is-hidden", !show);
      });
      if (galleryTrack) {
        galleryTrack.scrollTo({ left: 0, behavior: "smooth" });
        if (galleryTrack.__carousel) requestAnimationFrame(galleryTrack.__carousel.update);
      }
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  let current = 0;
  const visibleItems = () => Array.from(galleryItems).filter((it) => !it.classList.contains("is-hidden"));

  function openLb(index) {
    const list = visibleItems();
    current = (index + list.length) % list.length;
    const img = list[current].querySelector("img");
    lbImg.src = img.src; lbImg.alt = img.alt;
    lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  galleryItems.forEach((it) => {
    it.addEventListener("click", () => { const list = visibleItems(); openLb(list.indexOf(it)); });
  });
  lbClose.addEventListener("click", closeLb);
  lbPrev.addEventListener("click", () => openLb(current - 1));
  lbNext.addEventListener("click", () => openLb(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") openLb(current + 1);
    if (e.key === "ArrowLeft") openLb(current - 1);
  });

  /* ---------- Films: click to load embed ---------- */
  document.querySelectorAll(".film").forEach((film) => {
    film.addEventListener("click", () => {
      const url = film.dataset.video;
      if (!url) { alert("Add your film's embed URL to the data-video attribute in index.html."); return; }
      const thumb = film.querySelector(".film__thumb");
      const ifr = document.createElement("iframe");
      ifr.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "autoplay=1";
      ifr.setAttribute("allow", "autoplay; fullscreen; encrypted-media");
      ifr.setAttribute("allowfullscreen", "");
      thumb.textContent = "";
      thumb.appendChild(ifr);
    });
  });

  /* ---------- Reels: play inside the site — uploaded video OR Instagram embed ---------- */
  const ICON_MUTED = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l5 6m0-6l-5 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  const ICON_SOUND = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.6a4.2 4.2 0 010 6.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M18.7 6a7.2 7.2 0 010 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  function setupVideoReel(reel, src) {
    const cover = reel.querySelector(".reel__media img");
    const v = document.createElement("video");
    v.src = src; v.loop = true; v.muted = true; v.defaultMuted = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
    v.setAttribute("preload", "metadata");
    if (cover) v.poster = cover.getAttribute("src");
    reel.appendChild(v);
    reel.classList.add("is-playing");

    // mute / unmute toggle
    const mute = document.createElement("button");
    mute.type = "button"; mute.className = "reel__mute is-muted"; mute.innerHTML = ICON_MUTED;
    mute.setAttribute("aria-label", "Unmute");
    reel.appendChild(mute);
    function setMuted(state) {
      v.muted = state;
      mute.classList.toggle("is-muted", state);
      mute.innerHTML = state ? ICON_MUTED : ICON_SOUND;
      mute.setAttribute("aria-label", state ? "Unmute" : "Mute");
    }
    mute.addEventListener("click", (e) => { e.stopPropagation(); setMuted(!v.muted); if (v.paused) v.play().catch(function () {}); });
    // tapping the reel itself also toggles sound
    reel.addEventListener("click", () => { setMuted(!v.muted); if (v.paused) v.play().catch(function () {}); });

    if (reduceMotion) { v.controls = true; return; }
    // autoplay (muted) only while the reel is in view; pause when it scrolls away
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((ents) => {
        ents.forEach((en) => { if (en.isIntersecting) v.play().catch(function () {}); else v.pause(); });
      }, { threshold: 0.4 });
      io.observe(reel);
    } else { v.play().catch(function () {}); }
  }

  document.querySelectorAll(".reel").forEach((reel) => {
    const video = (reel.dataset.video || "").trim();
    const insta = (reel.dataset.insta || "").trim();

    // (A) uploaded / direct video — autoplays muted, with a mute toggle
    if (video) { setupVideoReel(reel, video); return; }

    // (B) Instagram link — click to load the embed in-place
    reel.addEventListener("click", () => {
      if (reel.classList.contains("is-playing")) return;
      if (insta) {
        const m = insta.match(/instagram\.com\/(reel|reels|p|tv)\/([^\/?#]+)/i);
        const type = m ? (m[1] === "reels" ? "reel" : m[1]) : "reel";
        const code = m ? m[2] : insta;
        const iframe = document.createElement("iframe");
        iframe.src = "https://www.instagram.com/" + type + "/" + code + "/embed";
        iframe.setAttribute("allow", "autoplay; encrypted-media; clipboard-write; picture-in-picture");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("scrolling", "no");
        iframe.loading = "lazy";
        reel.appendChild(iframe);
        reel.classList.add("is-playing");
        return;
      }
      alert("Add your reel to this card in index.html:\n• Upload an .mp4 to assets/videos/ and set data-video=\"assets/videos/yourreel.mp4\", OR\n• Paste an Instagram link into data-insta.");
    });
  });

  /* ---------- Testimonials slider ---------- */
  const testiItems = document.querySelectorAll(".testi__item");
  const dotsWrap = document.getElementById("testiDots");
  let ti = 0, timer;
  testiItems.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", "Testimonial " + (i + 1));
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => { goTo(i); resetTimer(); });
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll("button");
  function goTo(i) {
    testiItems[ti].classList.remove("is-active");
    dots[ti].classList.remove("is-active");
    ti = i;
    testiItems[ti].classList.add("is-active");
    dots[ti].classList.add("is-active");
  }
  function next() { goTo((ti + 1) % testiItems.length); }
  function resetTimer() { clearInterval(timer); timer = setInterval(next, 6000); }
  if (testiItems.length > 1) resetTimer();

  /* ---------- Multi-date popup calendar ---------- */
  (function () {
    const input = document.getElementById("date");
    const pop = document.getElementById("datepicker");
    if (!input || !pop) return;
    const monthEl = document.getElementById("dpMonth");
    const grid = document.getElementById("dpGrid");
    const selected = new Set();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const view = new Date(today.getFullYear(), today.getMonth(), 1);
    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const WD = ["Su","Mo","Tu","We","Th","Fr","Sa"];

    const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    function label(key) { const p = key.split("-"); const d = new Date(+p[0], +p[1] - 1, +p[2]); return d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) + " " + d.getFullYear(); }
    function sync() { input.value = Array.from(selected).sort().map(label).join(",  "); }

    function render() {
      monthEl.textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
      grid.innerHTML = "";
      WD.forEach((w) => { const e = document.createElement("span"); e.className = "datepicker__wd"; e.textContent = w; grid.appendChild(e); });
      const startDow = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
      const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (let i = 0; i < startDow; i++) { const e = document.createElement("span"); e.className = "datepicker__day is-empty"; grid.appendChild(e); }
      for (let d = 1; d <= days; d++) {
        const date = new Date(view.getFullYear(), view.getMonth(), d);
        const key = iso(date);
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "datepicker__day"; btn.textContent = d;
        if (date < today) { btn.disabled = true; btn.classList.add("is-disabled"); }
        if (selected.has(key)) btn.classList.add("is-sel");
        btn.addEventListener("click", () => {
          if (selected.has(key)) selected.delete(key); else selected.add(key);
          btn.classList.toggle("is-sel"); sync();
        });
        grid.appendChild(btn);
      }
    }
    const open = () => { pop.hidden = false; render(); };
    const close = () => { pop.hidden = true; };
    // open on click/focus; close only via outside-click or Done (avoids focus+click closing it instantly)
    input.addEventListener("click", open);
    input.addEventListener("focus", open);
    pop.querySelector("[data-dp-prev]").addEventListener("click", () => { view.setMonth(view.getMonth() - 1); render(); });
    pop.querySelector("[data-dp-next]").addEventListener("click", () => { view.setMonth(view.getMonth() + 1); render(); });
    document.getElementById("dpClear").addEventListener("click", () => { selected.clear(); sync(); render(); });
    document.getElementById("dpDone").addEventListener("click", close);
    document.addEventListener("click", (e) => { if (!pop.hidden && !pop.contains(e.target) && e.target !== input) close(); });
  })();

  /* ---------- Package select: grey when empty (matches input placeholders) + pre-fill from cards ---------- */
  const pkgSelect = document.getElementById("package");
  if (pkgSelect) {
    const syncPkg = () => pkgSelect.classList.toggle("is-empty", pkgSelect.value === "");
    syncPkg();
    pkgSelect.addEventListener("change", syncPkg);
    document.querySelectorAll("[data-package]").forEach((el) => {
      el.addEventListener("click", () => { pkgSelect.value = el.dataset.package; syncPkg(); });
    });
  }

  /* ---------- Enquiry form ---------- */
  const form = document.getElementById("enquiryForm");
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    // Sends the enquiry to Moments' WhatsApp with everything pre-filled — visitor just taps Send.
    const data = new FormData(form);
    const text =
      "New Wedding Enquiry — Moments\n\n" +
      "Names: " + (data.get("name") || "") +
      "\nEmail: " + (data.get("email") || "") +
      "\nPackage: " + (data.get("package") || "Not sure yet") +
      "\nDate(s): " + (data.get("date") || "Not specified") +
      "\nVenue: " + (data.get("venue") || "Not specified") +
      "\n\nMessage: " + (data.get("message") || "—");
    const url = "https://wa.me/917991807672?text=" + encodeURIComponent(text);
    const win = window.open(url, "_blank");
    if (win) { win.opener = null; } else { window.location.href = url; } // sever opener + fallback
    note.hidden = false;
    note.textContent = "Thank you! WhatsApp is opening with your enquiry — just hit send. 💬";
    form.reset();
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
