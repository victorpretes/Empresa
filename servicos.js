/* ==========================================================================
   ZenIoT — servicos.js
   Realça o card de serviço aberto via âncora (ex.: servicos.html#automacao)
   e escalona a animação de entrada.
   ========================================================================== */
(function () {
  "use strict";
  try {
    document.querySelectorAll(".service-full").forEach(function (el, i) {
      el.style.setProperty("--delay", (i % 2) * 0.08 + "s");
    });
    // Ao chegar por âncora, move o foco para o título do serviço (ajuda leitores de tela)
    if (location.hash) {
      var target = document.querySelector(location.hash);
      var h = target && target.querySelector("h3");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
  } catch (err) { console.error("[ZenIoT] servicos:", err); }
})();
