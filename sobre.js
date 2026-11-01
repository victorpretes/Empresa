/* ==========================================================================
   ZenIoT — sobre.js
   Escalona a animação de entrada dos cards de fundadores e das etapas.
   ========================================================================== */
(function () {
  "use strict";
  try {
    document.querySelectorAll(".team .reveal, .steps .reveal").forEach(function (el, i) {
      el.style.setProperty("--delay", (i % 4) * 0.08 + "s");
    });
  } catch (err) { console.error("[ZenIoT] sobre:", err); }
})();
