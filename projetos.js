/* ==========================================================================
   ZenIoT — projetos.js
   Renderiza a galeria, aplica filtros por categoria e controla o modal de detalhes.
   Dados em js/projetos-data.js
   ========================================================================== */
(function () {
  "use strict";

  var Z = window.ZenProjects;
  var grid = document.getElementById("project-grid");
  if (!Z || !grid) return;

  var filtersHost = document.getElementById("project-filters");
  var statusEl = document.getElementById("filter-status");
  var modal = document.getElementById("project-modal");
  var modalBody = document.getElementById("modal-body");
  var lastTrigger = null;
  var activeCat = "todos";

  /* ---------- Render inicial ---------- */
  function render() {
    if (!Z.list.length) {
      grid.outerHTML = Z.emptyHtml();
      if (filtersHost) filtersHost.hidden = true;
      return false;
    }
    grid.innerHTML = Z.list.map(function (p) { return Z.cardHtml(p); }).join("");
    return true;
  }

  function renderFilters() {
    if (!filtersHost) return;
    var used = {};
    Z.list.forEach(function (p) { used[p.category] = true; });
    // Mostra apenas categorias que possuem projetos (mais "Todos")
    var cats = Z.categories.filter(function (c) { return c.id === "todos" || used[c.id]; });
    filtersHost.innerHTML = cats.map(function (c) {
      return '<button type="button" class="filter-btn" data-filter="' + c.id + '" aria-pressed="' + (c.id === activeCat) + '">' + Z.esc(c.label) + "</button>";
    }).join("");
  }

  /* ---------- Filtros ---------- */
  function applyFilter(cat) {
    activeCat = cat;
    var cards = grid.querySelectorAll(".project-card");
    var shown = 0;

    cards.forEach(function (card) {
      var match = cat === "todos" || card.dataset.category === cat;
      if (match) {
        shown++;
        if (card.hidden) {
          card.hidden = false;
          card.classList.add("is-hiding");
          requestAnimationFrame(function () { requestAnimationFrame(function () { card.classList.remove("is-hiding"); }); });
        }
      } else if (!card.hidden) {
        card.classList.add("is-hiding");
        setTimeout(function () { if (card.classList.contains("is-hiding")) card.hidden = true; }, 300);
      }
    });

    filtersHost.querySelectorAll(".filter-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.filter === cat));
    });
    if (statusEl) statusEl.textContent = shown + (shown === 1 ? " projeto exibido" : " projetos exibidos") + (cat === "todos" ? "" : " em " + Z.catLabel(cat));
  }

  /* ---------- Modal de detalhes ---------- */
  function findProject(id) { return Z.list.filter(function (p) { return p.id === id; })[0]; }

  function openProject(id, trigger) {
    var p = findProject(id);
    if (!p || !modal) return;
    lastTrigger = trigger || null;
    var li = function (arr) { return (arr || []).map(function (x) { return "<li>" + Z.esc(x) + "</li>"; }).join(""); };
    var gallery = [p.image].concat(p.gallery || []).slice(0, 4).map(function (src) {
      return '<img src="' + Z.esc(src) + '" alt="Imagem ilustrativa do projeto ' + Z.esc(p.title) + '" loading="lazy" width="800" height="500">';
    }).join("");

    modalBody.innerHTML =
      '<div class="modal__hero"><img src="' + Z.esc(p.image) + '" alt="Imagem de capa do projeto ' + Z.esc(p.title) + '" width="800" height="350"></div>' +
      '<div class="modal__content">' +
      '<span class="project-card__cat">' + Z.esc(Z.catLabel(p.category)) + "</span>" +
      '<h2 id="modal-title">' + Z.esc(p.title) + "</h2>" +
      (p.demo ? '<span class="badge badge--cyan">Demonstração conceitual</span>' : "") +
      '<p class="muted" style="margin-top:14px">' + Z.esc(p.summary) + "</p>" +
      '<div class="modal__grid">' +
      "<div><h3>Problema</h3><p>" + Z.esc(p.problem || "—") + "</p></div>" +
      "<div><h3>Solução</h3><p>" + Z.esc(p.solution || "—") + "</p></div>" +
      "<div><h3>Recursos</h3><ul>" + li(p.features) + "</ul></div>" +
      "<div><h3>Tecnologias</h3><ul>" + li(p.tech) + "</ul></div></div>" +
      '<div class="modal__gallery">' + gallery + "</div>" +
      (p.demo ? '<p class="modal__note">Este é um exemplo conceitual criado para demonstração. Não representa um cliente atendido nem um resultado real.</p>' : "") +
      '<p style="margin-top:26px"><a class="btn btn--primary btn--sm" href="orcamento.html">Quero um projeto como este</a></p></div>';

    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    document.body.style.overflow = "hidden";
    var s = modal.querySelector(".modal__scroll"); if (s) s.scrollTop = 0;
  }

  function closeModal() {
    if (modal.open) modal.close();
  }

  if (modal) {
    modal.addEventListener("close", function () {
      document.body.style.overflow = "";
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
      // remove ?projeto= da URL sem recarregar
      try { if (location.search.indexOf("projeto=") > -1) history.replaceState(null, "", location.pathname); } catch (e) { /* ignora */ }
    });
    // Clique no fundo (fora da caixa) fecha
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    modal.querySelector("[data-close-modal]").addEventListener("click", closeModal);
  }

  /* ---------- Eventos ---------- */
  function bind() {
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-open-project]");
      if (btn) openProject(btn.dataset.openProject, btn);
    });
    filtersHost.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (b) applyFilter(b.dataset.filter);
    });
  }

  function init() {
    try {
      if (!render()) return;
      renderFilters();
      bind();
      applyFilter("todos");
      var id = new URLSearchParams(location.search).get("projeto");
      if (id) openProject(id, null);
    } catch (err) { console.error("[ZenIoT] projetos:", err); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
