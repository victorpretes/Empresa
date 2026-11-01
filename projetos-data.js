/* ==========================================================================
   ZenIoT — projetos-data.js
   ÚNICO lugar para cadastrar projetos. Usado pela home e por projetos.html.

   COMO CADASTRAR UM PROJETO REAL:
   1. Copie um bloco { ... } da lista abaixo.
   2. Troque os textos, a categoria e as imagens (coloque os arquivos em assets/images/).
   3. Remova a linha  demo: true  (ela exibe o selo "Demonstração conceitual").
   4. Para apagar os exemplos conceituais, basta excluir os blocos com demo: true.
   Se a lista ficar vazia, o site mostra a mensagem "portfólio em preparação".

   CATEGORIAS aceitas (campo category): sites | sistemas | design | automacoes | outros
   ========================================================================== */
(function () {
  "use strict";

  var CATEGORIES = [
    { id: "todos", label: "Todos" },
    { id: "sites", label: "Sites" },
    { id: "sistemas", label: "Sistemas" },
    { id: "design", label: "Design" },
    { id: "automacoes", label: "Automações" },
    { id: "outros", label: "Outros" }
  ];

  var PROJECTS = [
    {
      id: "site-clinica",
      title: "Site para clínica de saúde",
      category: "sites",
      demo: true,
      featured: true,
      summary: "Conceito de site institucional com agendamento de consultas e apresentação de especialidades.",
      tech: ["HTML", "CSS", "JavaScript"],
      problem: "Conceito: negócios de saúde costumam ter informações dispersas e dificuldade para receber pedidos de agendamento online.",
      solution: "Um site claro e responsivo, com páginas de especialidades, equipe e um formulário de pedido de agendamento.",
      features: ["Layout responsivo", "Formulário de agendamento", "Páginas de especialidades", "Boas práticas de acessibilidade"],
      image: "assets/images/projeto-clinica.svg",
      gallery: ["assets/images/projeto-clinica-b.svg"]
    },
    {
      id: "painel-estoque",
      title: "Painel de gestão de estoque",
      category: "sistemas",
      demo: true,
      featured: true,
      summary: "Conceito de sistema web para acompanhar entradas, saídas e níveis de estoque em tempo real.",
      tech: ["JavaScript", "API REST", "Banco de dados"],
      problem: "Conceito: controles manuais em planilhas dificultam enxergar rapidamente o que está faltando ou sobrando.",
      solution: "Um painel com indicadores, alertas de nível mínimo e histórico de movimentações.",
      features: ["Indicadores visuais", "Alertas de estoque mínimo", "Histórico de movimentações", "Exportação de relatórios"],
      image: "assets/images/projeto-estoque.svg",
      gallery: ["assets/images/projeto-estoque-b.svg"]
    },
    {
      id: "identidade-cafe",
      title: "Identidade visual para cafeteria",
      category: "design",
      demo: true,
      featured: true,
      summary: "Conceito de marca com logotipo, paleta de cores e aplicações para embalagens e redes sociais.",
      tech: ["Figma", "Design de marca"],
      problem: "Conceito: pequenos negócios precisam de uma marca coerente para se destacar e ser lembrados.",
      solution: "Um sistema de identidade com símbolo, cores, tipografia e exemplos de aplicação.",
      features: ["Logotipo e variações", "Paleta de cores", "Tipografia", "Guia básico de uso da marca"],
      image: "assets/images/projeto-cafe.svg",
      gallery: ["assets/images/projeto-cafe-b.svg"]
    },
    {
      id: "fluxo-atendimento",
      title: "Automação de atendimento",
      category: "automacoes",
      demo: true,
      summary: "Conceito de fluxo que organiza solicitações recebidas e as encaminha à pessoa responsável.",
      tech: ["Integrações via API", "Webhooks", "JavaScript"],
      problem: "Conceito: pedidos chegam por vários canais e exigem triagem manual repetitiva.",
      solution: "Um fluxo automatizado que centraliza solicitações, classifica por tipo e notifica a equipe.",
      features: ["Centralização de solicitações", "Classificação por tipo", "Notificações para a equipe", "Registro de histórico"],
      image: "assets/images/projeto-atendimento.svg",
      gallery: ["assets/images/projeto-atendimento-b.svg"]
    },
    {
      id: "monitor-sensores",
      title: "Monitoramento de sensores IoT",
      category: "outros",
      demo: true,
      summary: "Conceito de painel para visualizar leituras de sensores, como temperatura e umidade, em um só lugar.",
      tech: ["IoT", "MQTT", "JavaScript"],
      problem: "Conceito: dados de sensores espalhados dificultam acompanhar condições de um ambiente.",
      solution: "Um painel que reúne leituras, mostra gráficos e sinaliza valores fora do esperado.",
      features: ["Leituras em um só painel", "Gráficos de histórico", "Alertas configuráveis", "Cadastro de dispositivos"],
      image: "assets/images/projeto-sensores.svg",
      gallery: ["assets/images/projeto-sensores-b.svg"]
    },
    {
      id: "loja-moda",
      title: "Loja virtual de moda",
      category: "sites",
      demo: true,
      summary: "Conceito de vitrine online com catálogo, filtros de produtos e página de produto.",
      tech: ["HTML", "CSS", "JavaScript"],
      problem: "Conceito: lojas pequenas precisam apresentar o catálogo de forma atraente em qualquer dispositivo.",
      solution: "Uma vitrine responsiva com filtros, página de detalhes do produto e chamada para contato.",
      features: ["Catálogo com filtros", "Página de produto", "Layout responsivo", "Carregamento otimizado de imagens"],
      image: "assets/images/projeto-moda.svg",
      gallery: ["assets/images/projeto-moda-b.svg"]
    }
  ];

  /* ---------- Utilitários de renderização (não precisa editar) ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function catLabel(id) {
    var c = CATEGORIES.filter(function (x) { return x.id === id; })[0];
    return c ? c.label : "Outros";
  }

  /* asLink=true → botão vira link para projetos.html?projeto=ID (usado na home) */
  function cardHtml(p, opts) {
    opts = opts || {};
    var cta = opts.asLink
      ? '<a class="btn btn--ghost btn--sm" href="projetos.html?projeto=' + encodeURIComponent(p.id) + '">Ver detalhes <span class="btn__arrow" aria-hidden="true">→</span></a>'
      : '<button type="button" class="btn btn--ghost btn--sm" data-open-project="' + esc(p.id) + '">Ver detalhes <span class="btn__arrow" aria-hidden="true">→</span></button>';
    var tags = (p.tech || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    // Animação de entrada só na home (a galeria usa a transição do filtro)
    return '<article class="project-card' + (opts.asLink ? " reveal" : "") + '" data-category="' + esc(p.category) + '"' +
      (opts.delay ? ' style="--delay:' + opts.delay + 's"' : "") + ">" +
      '<div class="project-card__media"><img src="' + esc(p.image) + '" alt="Ilustração do projeto ' + esc(p.title) + '" width="800" height="500" loading="lazy">' +
      (p.demo ? '<span class="badge badge--cyan">Demonstração conceitual</span>' : "") + "</div>" +
      '<div class="project-card__body"><span class="project-card__cat">' + esc(catLabel(p.category)) + "</span>" +
      "<h3>" + esc(p.title) + "</h3><p>" + esc(p.summary) + "</p>" +
      (tags ? '<ul class="tags" aria-label="Tecnologias">' + tags + "</ul>" : "") + cta + "</div></article>";
  }

  function emptyHtml() {
    return '<div class="empty-state"><h3>Nosso portfólio está sendo preparado</h3>' +
      "<p>Em breve, os projetos desenvolvidos pela ZenIoT serão apresentados aqui. Enquanto isso, conte para nós o que você precisa.</p>" +
      '<p style="margin-top:20px"><a class="btn btn--primary btn--sm" href="orcamento.html">Solicitar orçamento</a></p></div>';
  }

  window.ZenProjects = { list: PROJECTS, categories: CATEGORIES, esc: esc, catLabel: catLabel, cardHtml: cardHtml, emptyHtml: emptyHtml };
})();
