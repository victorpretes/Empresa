/* ==========================================================================
   ZenIoT — orcamento.js
   Validação, contador de caracteres, proteções básicas e ENVIO REAL via fetch().

   >>> CONFIGURAÇÃO DO ENDPOINT — edite apenas o objeto CONFIG abaixo <<<
   Enquanto ENDPOINT_URL estiver vazio, o formulário NÃO simula sucesso:
   ele avisa que o envio ainda precisa ser conectado ao sistema de recebimento.
   Nunca coloque chaves secretas ou senhas aqui: este arquivo é público.
   ========================================================================== */
(function () {
  "use strict";

  var CONFIG = {
    // Exemplos: "https://formspree.io/f/SEU_ID"  |  "https://api.seudominio.com.br/orcamentos"
    ENDPOINT_URL: "",
    METHOD: "POST",
    TIMEOUT_MS: 15000,        // tempo máximo de espera pela resposta
    MIN_FILL_TIME_MS: 4000,   // envios mais rápidos que isso são tratados como robô
    COOLDOWN_MS: 60000,       // intervalo mínimo entre envios do mesmo navegador
    DESCRIPTION_MIN: 30,
    DESCRIPTION_MAX: 3000
  };

  var form = document.getElementById("quote-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");
  var submitLabel = submitBtn.querySelector(".btn__label");
  var counter = document.getElementById("desc-counter");
  var desc = document.getElementById("descricao");
  var openedAt = Date.now();
  var sending = false;
  var STORE_KEY = "zeniot:lastQuoteAt";

  /* ---------- Regras de validação (por campo) ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var rules = {
    empresa: { required: true, min: 2, msg: "Informe o nome da empresa." },
    responsavel: { required: true, min: 3, msg: "Informe o nome do responsável." },
    email: { required: true, email: true, msg: "Informe um e-mail válido, como nome@empresa.com.br." },
    telefone: { phone: true, msg: "Informe um telefone válido com DDD ou deixe em branco." },
    site: { url: true, msg: "Informe um endereço válido (ex.: https://www.suaempresa.com.br) ou deixe em branco." },
    servico: { required: true, msg: "Selecione o tipo de serviço desejado." },
    projeto: { required: true, min: 3, msg: "Dê um título ou nome ao projeto." },
    descricao: { required: true, min: CONFIG.DESCRIPTION_MIN, msg: "Descreva sua necessidade com pelo menos " + CONFIG.DESCRIPTION_MIN + " caracteres." },
    objetivos: { required: true, min: 5, msg: "Conte quais são os principais objetivos do projeto." },
    funcionalidades: { required: true, min: 5, msg: "Liste as funcionalidades desejadas." },
    prazo: { required: true, msg: "Selecione o prazo pretendido." },
    consentimento: { checkbox: true, msg: "Para enviar, é necessário aceitar o tratamento dos dados." }
  };

  function validateField(name) {
    var r = rules[name];
    var el = form.elements[name];
    if (!r || !el) return true;
    var wrap = el.closest(".field") || el.closest(".consent-field");
    var val = el.type === "checkbox" ? el.checked : String(el.value || "").trim();
    var ok = true;

    if (r.checkbox) ok = !!val;
    else if (r.required && !val) ok = false;
    else if (val) {
      if (r.min && val.length < r.min) ok = false;
      if (r.email && !EMAIL_RE.test(val)) ok = false;
      if (r.phone && !/^[+()\-\s\d]{8,20}$/.test(val)) ok = false;
      if (r.url && !isUrl(val)) ok = false;
    }

    var err = wrap && wrap.querySelector(".error-msg");
    if (wrap) {
      wrap.classList.toggle("is-invalid", !ok);
      wrap.classList.toggle("is-valid", ok && !!val && !r.checkbox);
    }
    if (err) err.textContent = ok ? "" : r.msg;
    el.setAttribute("aria-invalid", String(!ok));
    return ok;
  }

  function isUrl(v) {
    try { var u = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v); return /\./.test(u.hostname); } catch (e) { return false; }
  }

  /* ---------- Contador de caracteres ---------- */
  function updateCounter() {
    var n = desc.value.length;
    counter.textContent = n + " / " + CONFIG.DESCRIPTION_MAX;
    counter.classList.toggle("is-near", n > CONFIG.DESCRIPTION_MAX * 0.9);
  }
  desc.maxLength = CONFIG.DESCRIPTION_MAX;
  desc.addEventListener("input", updateCounter);
  updateCounter();

  /* ---------- Validação ao sair do campo / ao digitar após erro ---------- */
  Object.keys(rules).forEach(function (name) {
    var el = form.elements[name];
    if (!el) return;
    el.addEventListener("blur", function () { validateField(name); });
    var evt = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, function () {
      var wrap = el.closest(".field") || el.closest(".consent-field");
      if (wrap && wrap.classList.contains("is-invalid")) validateField(name);
    });
  });

  /* ---------- Pré-seleção do serviço via ?servico=... ---------- */
  try {
    var pre = new URLSearchParams(location.search).get("servico");
    var sel = form.elements.servico;
    if (pre && sel && Array.prototype.some.call(sel.options, function (o) { return o.value === pre; })) sel.value = pre;
  } catch (e) { /* ignora */ }

  /* ---------- Status ---------- */
  function showStatus(type, title, text) {
    statusEl.className = "status status--" + type + " is-shown";
    statusEl.innerHTML = "";
    var s = document.createElement("strong"); s.textContent = title;
    var p = document.createElement("span"); p.textContent = text;
    statusEl.appendChild(s); statusEl.appendChild(p);
    statusEl.setAttribute("role", type === "success" ? "status" : "alert");
    statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    statusEl.focus({ preventScroll: true });
  }
  function clearStatus() { statusEl.className = "status"; statusEl.textContent = ""; }

  function setLoading(on) {
    sending = on;
    submitBtn.disabled = on;
    submitBtn.setAttribute("aria-busy", String(on));
    submitBtn.classList.toggle("is-loading", on);
    submitLabel.textContent = on ? "Enviando..." : "Solicitar meu orçamento";
  }

  /* ---------- Proteções básicas ---------- */
  function onCooldown() {
    try {
      var last = Number(localStorage.getItem(STORE_KEY) || 0);
      return last && Date.now() - last < CONFIG.COOLDOWN_MS;
    } catch (e) { return false; }
  }
  function markSent() { try { localStorage.setItem(STORE_KEY, String(Date.now())); } catch (e) { /* ignora */ } }

  /* ---------- Montagem do payload (sem dados sensíveis além do formulário) ---------- */
  function buildPayload() {
    var d = {};
    ["empresa", "responsavel", "email", "telefone", "site", "servico", "projeto", "descricao", "objetivos", "publico", "funcionalidades", "prazo", "investimento"]
      .forEach(function (k) { d[k] = String(form.elements[k].value || "").trim(); });
    d.servico_rotulo = form.elements.servico.selectedOptions[0] ? form.elements.servico.selectedOptions[0].text : "";
    d.consentimento_lgpd = true;
    d.consentimento_em = new Date().toISOString();
    d.pagina = location.href;
    d._gotcha = form.elements.contato_alternativo.value; // honeypot (deve ir vazio)
    return d;
  }

  /* ---------- Envio via fetch() ---------- */
  function sendToServer(payload) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, CONFIG.TIMEOUT_MS) : null;
    return fetch(CONFIG.ENDPOINT_URL, {
      method: CONFIG.METHOD,
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      if (!res.ok) {
        var e = new Error("HTTP " + res.status); e.http = res.status; throw e;
      }
      return res;
    }, function (err) { if (timer) clearTimeout(timer); throw err; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    clearStatus();

    // 1) Validação de todos os campos
    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
    });
    if (firstInvalid) {
      showStatus("error", "Revise o formulário", "Alguns campos precisam de atenção. Corrija os itens destacados e envie novamente.");
      firstInvalid.focus();
      return;
    }

    // 2) Proteções contra envios automatizados
    if (form.elements.contato_alternativo.value) return; // honeypot preenchido: ignora silenciosamente
    if (Date.now() - openedAt < CONFIG.MIN_FILL_TIME_MS) {
      showStatus("warn", "Só um instante", "Parece que o formulário foi enviado muito rápido. Confira os dados e tente novamente.");
      return;
    }
    if (onCooldown()) {
      showStatus("warn", "Aguarde um pouco", "Já recebemos um envio deste navegador há instantes. Tente novamente em alguns minutos.");
      return;
    }

    // 3) Backend ainda não configurado: NÃO simular sucesso
    if (!CONFIG.ENDPOINT_URL) {
      showStatus("warn", "Envio ainda não conectado",
        "O envio deste formulário ainda precisa ser conectado ao sistema de recebimento da empresa. Sua solicitação NÃO foi enviada. Seus dados continuam preenchidos aqui.");
      return;
    }

    // 4) Envio real
    setLoading(true);
    sendToServer(buildPayload()).then(function () {
      markSent();
      form.reset();
      updateCounter();
      form.querySelectorAll(".is-valid, .is-invalid").forEach(function (n) { n.classList.remove("is-valid", "is-invalid"); });
      showStatus("success", "Solicitação recebida!", "Obrigado! Recebemos o seu pedido de orçamento e a nossa equipe entrará em contato pelo e-mail informado.");
    }).catch(function (err) {
      var msg;
      if (err && err.name === "AbortError") msg = "O servidor demorou demais para responder. Tente novamente em instantes.";
      else if (err && err.http) msg = "O servidor não confirmou o recebimento (código " + err.http + "). Sua solicitação não foi enviada; tente novamente mais tarde.";
      else msg = "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente. Sua solicitação não foi enviada.";
      showStatus("error", "Não foi possível enviar", msg);
    }).then(function () { setLoading(false); });
  });
})();
