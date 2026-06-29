/* ============================================================
   MOMENTS — premium interactions
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    // staggered gallery
    const gio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const idx = Array.prototype.indexOf.call(galleryItems, en.target);
          en.target.style.transitionDelay = (idx % 3) * 0.08 + "s";
          en.target.classList.add("is-in");
          gio.unobserve(en.target);
        }
      });
    }, { threshold: 0.08 });
    galleryItems.forEach((el) => gio.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
    galleryItems.forEach((el) => el.classList.add("is-in"));
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

  /* ---------- Gallery filters ---------- */
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
      thumb.innerHTML = '<iframe src="' + url + '?autoplay=1" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>';
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

  /* ---------- Enquiry form (front-end demo) ---------- */
  const form = document.getElementById("enquiryForm");
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    // SWAP: wire this to your email service / Formspree / backend.
    const data = new FormData(form);
    const body = encodeURIComponent(
      "Names: " + data.get("name") +
      "\nEmail: " + data.get("email") +
      "\nDate(s): " + data.get("date") +
      "\nVenue: " + data.get("venue") +
      "\n\n" + data.get("message")
    );
    window.location.href =
      "mailto:hello@moments.studio?subject=" +
      encodeURIComponent("Wedding Enquiry — " + data.get("name")) + "&body=" + body;
    note.hidden = false;
    note.textContent = "Thank you! Your email app should open — or reach us on WhatsApp.";
    form.reset();
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
