# ZenIoT — Site institucional

Site estático em **HTML5, CSS3 e JavaScript puro** (sem frameworks, sem etapa de build). HTML, CSS e JS ficam em arquivos separados.

## Estrutura

```
ZenIoT/
├── index.html · sobre.html · servicos.html · projetos.html · orcamento.html
├── robots.txt
├── css/   style.css (global) · home.css · sobre.css · servicos.css · projetos.css · orcamento.css
├── js/    main.js (menu, rodapé, animações) · projetos-data.js (DADOS dos projetos)
│          projetos.js · orcamento.js · sobre.js · servicos.js
└── assets/ images/ (capas SVG dos projetos conceituais) · icons/ (logo, favicon, ícones) · fonts/
```

## Como executar localmente

Opção 1 — dê duplo clique em `index.html` (funciona direto no navegador).
Opção 2 — servidor local (recomendado, simula a hospedagem real):

```bash
cd ZenIoT
python3 -m http.server 8000     # depois abra http://localhost:8000
```

A fonte Inter é carregada do Google Fonts; sem internet, o site usa a fonte do sistema. Para uso 100% offline, baixe a Inter, salve em `assets/fonts/` e declare com `@font-face` no início de `css/style.css`.

## Personalizar os 7 fundadores

Abra `sobre.html`, seção "Os sete fundadores". Em cada `<article class="card founder">`:

1. Troque "Nome do fundador N" pelo nome real.
2. Troque "Área de atuação" pelo cargo/área.
3. Troque o texto de "Breve apresentação profissional".
4. Foto: salve a imagem em `assets/images/` e substitua o `<img class="placeholder-icon" ...>` por
   `<img src="assets/images/fundador-1.jpg" alt="Foto de NOME" width="112" height="112">`.

Faça o mesmo ajuste na seção "Nossa história" (texto provisório) e remova os selos "provisório".

## Cadastrar projetos reais

Edite **apenas** `js/projetos-data.js`. Copie um bloco da lista `PROJECTS`, ajuste os campos (título, categoria, resumo, tecnologias, problema, solução, recursos, imagens em `assets/images/`) e **remova `demo: true`**. Apague os exemplos conceituais quando tiver projetos reais. Se a lista ficar vazia, o site exibe "Nosso portfólio está sendo preparado". Categorias: `sites`, `sistemas`, `design`, `automacoes`, `outros`. `featured: true` define os 3 destaques da home.

## Configurar os serviços

Os serviços estão em `servicos.html` (8 cards) e, resumidos, em `index.html` (4 cards) e no rodapé. Para remover um serviço que a empresa ainda não oferece, apague o `<article>` correspondente (e o link no rodapé/home, se existir). Os botões "Solicitar orçamento" já pré-selecionam o serviço no formulário via `orcamento.html?servico=...`.

## Conectar o formulário de orçamento (envio real)

O JavaScript do navegador sozinho não armazena nem encaminha dados. O formulário envia um `POST` JSON com `fetch()` para o endereço configurado em `js/orcamento.js`:

```js
var CONFIG = { ENDPOINT_URL: "", ... }   // ← coloque a URL aqui
```

- **Enquanto `ENDPOINT_URL` estiver vazio**, o site avisa que o envio ainda precisa ser conectado e **não** mostra sucesso.
- A mensagem de sucesso só aparece quando o servidor responde com status 2xx.
- Opções: serviço de formulários (ex.: Formspree, Web3Forms, Getform — crie o formulário no serviço e cole a URL pública), ou API própria (ex.: função serverless que grava em banco, envia e-mail ou cria um card no CRM).
- **Nunca** coloque chaves secretas no frontend; use somente URLs públicas de recebimento.
- Campos enviados: empresa, responsavel, email, telefone, site, servico, projeto, descricao, objetivos, publico, funcionalidades, prazo, investimento, consentimento_lgpd, consentimento_em, pagina e `_gotcha` (honeypot).
- Proteções incluídas: campo-armadilha (honeypot), tempo mínimo de preenchimento, intervalo entre envios, bloqueio de duplo clique. Para proteção mais forte, adicione CAPTCHA/Turnstile e valide também no servidor.
- Se o serviço escolhido exigir outros nomes de campos ou outro cabeçalho, ajuste `buildPayload()` e `sendToServer()`.

## Pendências antes de publicar

- Preencher o aviso de privacidade (controlador, CNPJ, contato, retenção) em `orcamento.html` e revisá-lo com assessoria jurídica.
- Adicionar contato e redes sociais oficiais no rodapé (há um comentário indicando o local, repetido nas 5 páginas).
- Substituir textos provisórios (história, fundadores) e os projetos conceituais.
- Criar `sitemap.xml` e ajustar `robots.txt` com o domínio real; incluir `<link rel="canonical">` nas páginas.
