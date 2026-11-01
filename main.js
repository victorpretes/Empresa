/* ==========================================================================
   ZenIoT — main.js
   Funcionalidades compartilhadas: menu hambúrguer, cabeçalho, ano do rodapé,
   animações de entrada e projetos em destaque (home).
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Menu hambúrguer ---------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav]");
    if (!toggle || !nav) return;

    function isOpen() { return toggle.getAttribute("aria-expanded") === "true"; }

    function setOpen(open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      nav.classList.toggle("is-open", open);
      if (!open && returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () { setOpen(!isOpen()); });

    // Fecha ao clicar em um link do menu
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    // Fecha ao clicar fora
    document.addEventListener("click", function (e) {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    // Fecha com Escape (devolvendo o foco ao botão)
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) setOpen(false, true);
    });

    // Se a tela crescer para desktop, restaura o estado padrão
    var mq = window.matchMedia("(min-width: 960px)");
    var onChange = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------- Cabeçalho: estilo ao rolar ---------- */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;
    var update = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Ano atual no rodapé ---------- */
  function initYear() {
    var els = document.querySelectorAll("[data-year]");
    var y = String(new Date().getFullYear());
    els.forEach(function (el) { el.textContent = y; });
  }

  /* ---------- Animações de entrada (IntersectionObserver) ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return; // conteúdo permanece visível

    document.documentElement.classList.add("reveal-ready");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Projetos em destaque (home) ---------- */
  function initFeatured() {
    var host = document.getElementById("featured-projects");
    if (!host) return;
    var Z = window.ZenProjects;
    if (!Z || !Array.isArray(Z.list) || !Z.list.length) {
      host.innerHTML = Z ? Z.emptyHtml() : "";
      return;
    }
    var featured = Z.list.filter(function (p) { return p.featured; }).slice(0, 3);
    if (!featured.length) featured = Z.list.slice(0, 3);
    host.innerHTML = featured.map(function (p, i) { return Z.cardHtml(p, { asLink: true, delay: i * 0.08 }); }).join("");
    // Os cards criados aqui recebem a animação de entrada em initReveal(), executado depois.
  }

  function safe(fn) { try { fn(); } catch (err) { console.error("[ZenIoT]", err); } }

  function init() {
    safe(initNav);
    safe(initHeader);
    safe(initYear);
    safe(initFeatured);
    safe(initReveal);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
