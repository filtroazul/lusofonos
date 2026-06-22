# PROJETO — Landpage "Prémios Lusófonos da Criatividade em Saúde · 2026"

> **Para a próxima sessão / outra conta Claude:** este arquivo é o handoff completo.
> Foi gerado a partir da memória da conta anterior (a memória NÃO transfere entre contas).
> Leia tudo antes de mexer. Última atualização: **2026-06-22**.

---

## 0. TL;DR — onde paramos

A landpage está **funcionando** (`landpage/index.html`). Virou uma **animação amarrada ao scroll** (scroll-scrubbing estilo Apple): um vídeo de formas 3D glossy roda no fundo dirigido pela posição do scroll, e os textos das 5 seções entram por cima, sincronizados.

**Atualização 2026-06-22 (sessão 2) — implementado:**
- **Digitação letra-por-letra dirigida pelo scroll** (não mais texto estático): `splitChars()` quebra cada `.type` em `.word`>`.ch`; `updateTyped()` revela letras conforme a posição do scroll, no MESMO RAF do scrub → background e texto sincronizados por construção.
- ⚠️ Letras dentro de `.grad` usam `.gch` (`display:inline`, sem wrapper) porque `background-clip:text` não atravessa `inline-block` — senão o gradiente fica invisível.
- **Glow "Photoshop"** nas letras (`@keyframes chIn` flash + text-shadow) e glow base reforçado nas headlines.
- **Translucidez no meio** (pedido da esposa, que aceitou o fundo preto): `.plate::before` virou painel fosco (`backdrop-filter:blur`) + elemento `.core-veil` (radial luminoso central).
- **Autoplay refeito:** `cineEase()` agora é cruzeiro de velocidade constante (não easeInOut que rastejava). `CINE_MS=46000` (era 58000). Lerp do scrub 0.12→**0.16**.

**Atualização 2026-06-22 (sessão 3) — pinned + digitação sequencial + som:**
- **Cenas viraram PINNED (sticky):** cada `.scene` é só altura de scroll; um `.pin` (sticky) segura o conteúdo na tela enquanto o texto digita. Alturas: hero 300vh, sobre 320vh, porque 520vh, cal 260vh, rodapé 230vh.
- **Digitação SEQUENCIAL (uma frase por vez):** `updateTyped()` agrupa por cena e dá a cada linha uma fatia da timeline de scroll (`chars+HOLD`, HOLD=24 = pausa pra ler). Abre VAZIO no topo; rola → escreve eyebrow, depois headline, depois sub… um por um. **Não-rushado: dar mais altura à cena = digitação mais lenta, SEM mexer na velocidade do vídeo de fundo (que é fração do scroll).**
- **Som de digitação:** Web Audio sintetizado (sem arquivos). Tecla **M** liga/desliga. AudioContext resume no 1º gesto.
- **Hero h1 "Entre pessoas."** agora é gradiente (lavanda→magenta→laranja) + glow. **Removida** a linha "Prémios Lusófonos… Edição 2026" (`.tag`) do hero.
- ⚠️ Bug corrigido: `splitChars` não detectava `.grad` quando ele era o próprio elemento raiz (hero h1) → gradiente ficava invisível. Fix: inicializar `inGrad` com `root.classList.contains('grad')`.
- **Controles:** Espaço (autoplay) · M (som) · H (HUD) · Home (topo).

**Atualização 2026-06-22 (sessão 4) — PERFORMANCE (PC fraco: i5 3ª ger, 8GB, SEM GPU):**
- Scrubbing engasgava (decode H.264 no CPU + blur). Otimizado:
- **Removido TODO `backdrop-filter:blur`** (painel, nav, hint) → fundos translúcidos sólidos. Mantém a "translucidez no meio", sem o blur (maior ganho sem GPU).
- **Render só quando muda** (flag `needsWork`, idle = 0 CPU); canvas desenha só no `'seeked'`; menos seeks (`SEEK_EPS=0.033`); **DPR=1** + canvas limitado a 1152px; glows menores; grain sem blend.
- ⚠️ **NÃO baixar resolução do vídeo:** tentei `sequence-low.mp4` (640px) e o usuário ODIOU ("ficou horrível"). REVERTIDO pro `sequence.mp4` full (1264×720), arquivo low deletado. `CANVAS_CAP=1280` = nítido. Nitidez do fundo é inegociável (vai ser gravado).
- Loader anti-trava (canplay OU loadeddata OU timeout 4500ms).

**Pendente / próximos ajustes:**
1. Usuário testar a fluidez no PC dele agora (com vídeo full + otimizações de código). Se AINDA engasgar: trocar scrubbing de vídeo por **sequência de imagens** pré-extraídas (full-res, sem decode no scroll, cache LRU pra não estourar 8GB) — NÃO baixar resolução de novo.
2. Calibrar pacing: alturas das cenas + `HOLD` (24) + `CINE_MS` (46000). (Velocidade do vídeo JÁ aprovada — pacing da escrita se ajusta pela altura das cenas.)
3. Usuário vai gerar +clipes de vídeo pra compor mais o scroll-scrubbing.
4. Hero CTA aparece no scroll 0 com texto vazio — avaliar.
5. Legibilidade do calendário sobre as pílulas em movimento.
6. Decidir se mantém ou descarta `index-capsulas-backup.html`.

---

## 1. O que é o projeto

Uma **landing page cinematográfica** (dark, surrealista, artística) que será **gravada em vídeo** (~1min30 a 2min) e usada pela **esposa do usuário** como peça de apresentação num **trabalho/concurso que ela está concorrendo**.

- **Base de referência:** releitura do site real `https://www.premioslusofonossaude.com/`. Clonar a vibe visual/estrutura, mas usar o **texto reescrito pela esposa** (Seção 5 deste doc) como conteúdo oficial.
- **NÃO confundir** com `teste-main/teste-main/` (demo AIOTI de 8 cenas) — é projeto SEPARADO, só "ideia do que ele fez antes". A landpage é a pasta `landpage/`.

### Onde tudo mora
- **Pasta da landpage:** `C:\Users\Iagho\Downloads\teste-main\landpage\`
- **Como rodar:** abrir `index.html` direto no navegador. **Sem build, sem servidor.**
- **Controles:** **Espaço** = passagem automática (~58s, pra gravar) · **H** = oculta HUD · **Home** = volta ao topo.

---

## 2. Arquitetura atual — SCROLL-SCRUBBING (a versão LIVE)

A landpage é uma **animação dirigida pelo scroll**: o usuário rola → o vídeo avança/retrocede (`video.currentTime` ligado à posição de scroll). As formas 3D começam juntas e vão se desvinculando conforme rola. No modo automático (Espaço) faz a passagem sozinho pra gravar.

### Mecânica
- Vídeo `position:fixed` full-screen + `mix-blend-mode:screen` (fundo PRETO do clipe some, só a forma glossy aparece).
- Scroll → calcula target time; loop RAF faz **lerp** suave (`current += (target-current)*0.12`) — é isso que deixa liso.
- Textos das 5 seções entram por cima via IntersectionObserver (`.copy.in`).
- Tem nav, barra de progresso, plate-scrim atrás do texto p/ legibilidade, autoplay (Espaço, ~58s), H oculta HUD.

### ⚠️ RENDER VIA CANVAS (fix crítico do "ficou estático")
Setar `video.currentTime` num `<video>` pausado **NÃO repinta o frame** em vários navegadores (funcionava no Chrome-CDP/agent-browser, mas no navegador do usuário ficava estático).
**Fix aplicado:** `<video>` escondido + `<canvas id="scrubCanvas">` visível; a cada RAF faz `cx.drawImage(video, ...)` (cover) — repinta sempre, cross-browser. `mix-blend-mode:screen` vai no canvas. **Se mudar de abordagem, lembrar disso.**

### `index.html` é auto-contido
CSS e JS estão **inline** no `index.html`. Usa `sequence.mp4`. A versão antiga (section-based, cápsulas procedurais que usava `style.css`/`app.js`) virou `index-capsulas-backup.html`.

---

## 3. Os vídeos (gerados no Grok pelo usuário)

O usuário gera os assets 3D ele mesmo no **Grok / Grok Imagine** (prefere isso a WebGL pela qualidade de material — iridescência/cromo). Eu dou os prompts/specs, ele gera, eu encaixo. Grok faz **máx 10s por clipe**.

### Convenção de arquivos
- `hero1.mp4`, `hero2.mp4`, … = **clipes crus do Grok**, encadeados.
- **Encadeamento:** pega o ÚLTIMO FRAME do clipe N (`heroN_lastframe.png`) → usa como imagem-base no Grok → gera clipe N+1 (continuação). Repete.
- `sequence.mp4` = **master** = todos os clipes concatenados + re-encodados com keyframe em todo frame. **É esse que o site usa.**
- `hero1-lightbg-backup.mp4` = chrome de fundo CLARO antigo (**NÃO usar** — fundo claro estoura no `mix-blend-mode:screen`). Backup só por segurança.
- `hero.mp4` = metaball rainbow ANTIGO (não usado no fluxo final).

### Progresso: 4 clipes prontos = 40s
Todos 1264×720, 24fps, ~10s. `sequence.mp4` = **40s**, all-keyframe. Narrativa:
- **hero1** — blob iridescente caótico (rainbow).
- **hero2** — separa em pílulas roxas/violeta com acento laranja (caos→ordem, paleta da marca).
- **hero3** — esferas+pílulas orbitando um centro, glow surgindo, depois se distanciam (não reagrupam).
- **hero4** — formas dividem pros 2 lados em COLUNAS (esq./dir.) com CENTRO VAZIO; recoloridas laranja+azul+cinza, roxo removido. → emoldura o texto/CTA no meio.
- `hero4_lastframe.png` pronto pro clipe 5 (se houver).

### Texto cravado em cada momento do vídeo
- hero1 (caos) → Hero "Entre pessoas." + CTAs
- hero2 (pílulas separando) → Sobre a categoria (2 colunas)
- hero3 (órbita+glow) → Por que existe / manifesto (Cormorant)
- hero3→hero4 → Calendário (timeline 5 marcos)
- hero4 (colunas laterais, centro vazio) → Rodapé: "Inscreve os teus projetos" + CTA + footer

### Prompts do Grok (pra regerar/continuar)
- **Regra de ouro:** sempre terminar o prompt com `...pure black background, studio lighting, seamless, cinematic, slow`. Fundo claro quebra o `screen`. Pedir "no abrupt cut / no snap back" no fim, pra emendar.
- **hero2** — blob iridescente se separa em pílulas; iridescência calma resolve na paleta (roxo+indigo, lavanda no vidro, 1 acento laranja); "less rainbow".
- **hero3** — esferas misturadas com pílulas, movimento circular orbitando um centro, bem dissipadas/longe; um glow EMERGE e cresce; laranja mais aparente; no fim as formas se DISTANCIAM.
- **hero4** — formas dividem pros 2 lados em COLUNAS (esq./dir.), CENTRO vazio pra texto; recolorir laranja+azul+cinza, tirar o roxo; movimento mais dinâmico; formas ficando um pouco MENORES.
- **hero5 (próximo, se houver):** base = `hero4_lastframe.png`.

### ffmpeg (instalado nesta máquina, NÃO no PATH)
Caminho cheio:
```
C:\Users\Iagho\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe
```
- **Extrair último frame:**
  `ffmpeg -y -sseof -0.1 -i heroN.mp4 -update 1 -frames:v 1 -q:v 1 heroN_lastframe.png`
- **Concatenar:** criar `list.txt` com `file 'hero1.mp4'` etc., depois
  `ffmpeg -f concat -safe 0 -i list.txt -c copy concat_raw.mp4` (se mesmos params) OU re-encode.
- **Master all-keyframe (scrub liso):**
  `ffmpeg -y -i concat_raw.mp4 -an -c:v libx264 -crf 20 -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart sequence.mp4`
  (clipe de 10s → ~10MB)

---

## 4. Design spec

### Paleta (de `cores.png`, hex exatos)
| Cor | Hex | Uso |
|---|---|---|
| Índigo profundo | `#180066` | fundo / gradientes radiais |
| Roxo/Magenta | `#730394` | gradientes, destaques |
| Lavanda | `#8367DF` | acentos, datas, links |
| Laranja vibrante | `#FF7300` | **cor de ação** (CTAs, highlights) — ÚNICO acento quente |
| Cinza escuro arroxeado | `#4A3F4D` | neutros |

Variáveis de fundo: `--bg:#050308`, `--bg-2:#0c0716`, texto `--ink:#ECE8F6`, `--ink-dim:#A89FC4`, `--ink-faint:#6E6588`.

**Pedido recorrente do usuário:** fugir do rainbow RGB; roxo/azul dominante com laranja; ao longo da sequência ir tirando o roxo e trazendo laranja+azul+cinza.

### Fontes (Google Fonts)
- **Display/headlines:** `Space Grotesk` (700)
- **Acentos poéticos:** `Cormorant Garamond` itálico — pras frases emocionais.
  ⚠️ NÃO usar `Instrument Serif` nem `Fraunces` (banidas por serem "tell" de IA).
- **Corpo:** `Inter`

### Brief da esposa/usuário
1. Predominância **ESCURA** (dark mode forte).
2. Elementos 3D surreais = **cápsulas/pílulas farmacêuticas + esferas de vidro/cromo glossy** (estética do site original, levada pro dark). NÃO é rainbow metaball.
3. Animação de **"formas que ABREM a seção"** ao entrar na seção de saúde (Seção 3 "Por que existe").
4. Texto/símbolos parecendo **SAIR pra fora** da tela (efeito 3D pop-out).
5. Nível "edição MASTER" — surrealista, caprichado.

### ⚠️ Imagens são REFERÊNCIA, não conteúdo
`3d.jpg`, `3d2.jpg`, `3d3.jpg`, `3d.png`, `img1.png`, `cores.png` = **só referência** que a esposa mandou. **NUNCA colocar como `<img>` literal no site** (erro já cometido e desfeito). O `index.html` LIVE não as usa.

---

## 5. CONTEÚDO OFICIAL — texto da esposa (usar SEMPRE este, não o do site original)

### Seção 1 — Hero
- **Manchete:** "Entre pessoas."
- **Subtítulo:** "A saúde acontece entre pessoas."
- **Tagline:** "Prémios Lusófonos da Criatividade em Saúde · Edição 2026"
- **CTAs:** `[Inscrever projeto]` (primário) + `[Conhecer a categoria]` (secundário, âncora p/ Seção 2)

### Seção 2 — Sobre a categoria
- **Título:** "Uma premiação dedicada à criatividade em saúde."
- **Corpo:**
  > Os Prémios Lusófonos da Criatividade em Saúde são um festival internacional, sediado em Portugal, dedicado a reconhecer os melhores projetos de criatividade, comunicação e inovação na área da saúde nos países de língua oficial portuguesa.
  >
  > Criados com a ambição de valorizar a excelência num dos sectores com maior impacto na vida das pessoas, os prémios distinguem o trabalho desenvolvido por agências, profissionais, marcas, instituições, produtoras, estúdios e organizações que contribuem para transformar a comunicação em saúde no espaço lusófono.

### Seção 3 — Por que existe (o CORAÇÃO conceitual)
- **Título:** "Por que esta premiação existe."
- **Corpo:**
  > Hoje, falar de saúde é compreender comportamentos, alegrias, prazeres e dores. Em um mundo onde nosso aprendizado começa no digital, é essencial lembrar que o toque humano faz parte dessa equação.
  >
  > Acharam surreal a criatividade falar a língua da saúde?
  > Surreal seria ela não falar.
  > Porque antes de ser dado, diagnóstico, tecnologia, saúde é relação.
  > A saúde acontece entre pessoas.
  > E criatividade é o jeito de transformar essa relação.
  > Entre pessoas. É onde a saúde acontece.

### Seção 4 — Calendário 2026 (linha do tempo)
| Marco | Data |
|---|---|
| Abertura das inscrições | 15 de junho |
| Early bird — desconto de 25% | 15 a 26 de junho |
| Early bird — desconto de 10% | 26 de junho a 24 de julho |
| Encerramento das inscrições | 25 de setembro |
| Cerimónia de entrega | 28 de outubro |

### Seção 5 — Rodapé
- **CTA:** "Inscreve os teus projetos"
- **Logos:** Prémios Lusófonos da Criatividade em Saúde (esq.) + Lisbon Awards Group (dir.)
- **Links:** Categorias e subcategorias · Regulamento · Júri · Contactos
- **Redes:** Instagram · Facebook · LinkedIn · TikTok
- **Contacto (do site original):** Paulo Santos · paulosantos@lisbonawardsfestival.com · +351 931 714 621 · Rua Seara Nova 5, Palácio Rosa, 1250-002 Lisboa
- **Aviso:** "© 2026 Prémios Lusófonos da Criatividade. Todos os direitos reservados."

> ⚠️ O site ORIGINAL usa headline diferente ("SURREAL / É A CRIATIVIDADE NA SAÚDE FALAR A MESMA LÍNGUA"). A esposa **reescreveu**. Usar SEMPRE o texto acima.

---

## 6. Inventário de arquivos da pasta `landpage/`

| Arquivo | O que é |
|---|---|
| `index.html` | **LIVE** — fluxo scroll-scrub final, auto-contido (CSS/JS inline), usa `sequence.mp4` |
| `sequence.mp4` | **Master** — 4 clipes concatenados (40s), all-keyframe. É o que o site usa |
| `hero1.mp4`…`hero4.mp4` | Clipes individuais do Grok |
| `hero1_lastframe.png`…`hero4_lastframe.png` | Últimos frames (base p/ gerar próximo clipe no Grok) |
| `index-capsulas-backup.html` | Versão anterior (seções + cápsulas procedurais CSS). Usa `style.css`/`app.js`. Backup |
| `style.css`, `app.js` | Servem só ao backup acima |
| `hero1-lightbg-backup.mp4` | Chrome de fundo claro descartado (NÃO usar) |
| `hero.mp4` | Metaball rainbow antigo (não usado) |
| `3d.jpg`, `3d2.jpg`, `3d3.jpg`, `3d.png`, `img1.png`, `cores.png` | **Só REFERÊNCIA** (não usar como conteúdo) |

---

## 7. Usuário & estilo de trabalho

- **Idioma:** Português (BR). Responder em PT-BR, tom informal/parceiro.
- **Contexto:** constrói a landpage PARA A ESPOSA (concurso dela). Ela definiu conteúdo, cores e estética.
- **Gera os assets 3D ele mesmo** no Grok. Eu dou prompts/specs, ele gera. Trabalha em **paralelo** (ele gera enquanto eu codo com placeholders).
- **Quer respostas detalhadas e "mastigadas"** (passo a passo). Gosta que eu **mostre o resultado** (screenshots) e **recomende** uma opção em vez de só listar.
- **Email:** iot@aiotisolucoes.com.br (empresa AIOTI — IoT/solar; projeto separado).

---

## 8. Ferramentas instaladas nesta máquina (referência)

- **agent-browser** (Vercel v0.27.0), global. Correções de comandos reais:
  - Screenshot full-page: `--full` ou `-f` (NÃO `--full-page`). Path posicional.
  - NÃO existe `extract-text` → usar `agent-browser eval "document.body.innerText"`.
  - Scroll p/ elemento: `agent-browser eval "document.getElementById('id').scrollIntoView()"`.
  - Esperar: `agent-browser wait 1500` (ms) ou `--load networkidle`.
  - Fechar: `agent-browser close --all`.
  - Loop útil: `open <url>` → `wait` → `eval scrollIntoView` → `screenshot` → repetir.
- **ffmpeg** via winget (caminho cheio na Seção 3).
- **Skills globais** em `~/.claude/skills/`: impeccable + 13 taste skills (`gpt-taste`, `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`, `imagegen-frontend-web`, etc.). Só carregam em sessões NOVAS.

---

## 9. Próximo passo concreto

Perguntar ao usuário **quais são os ajustes finos** que ele queria. Ou abrir `index.html` (via agent-browser, screenshot seção por seção) pra revisar e propor os ajustes. Os candidatos estão no TL;DR (Seção 0).
