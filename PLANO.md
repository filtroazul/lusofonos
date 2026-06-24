# PLANO — Landpage v2 (REINÍCIO DE RUMO)

> Documento de planejamento. **Nada de código ainda** — primeiro fechar o plano aqui.
> Última atualização: 2026-06-22.

---

## 0. Por que estamos refazendo (o feedback da Cerejinha)

A v1 virou uma **peça cinematográfica** (tela fixa, vídeo de fundo, texto passando, navegação por slides). O feedback foi claro:

- *"Não parece vídeo de site da tela rolando, parece só um vídeo com plano de fundo."*
- *"Eu achei que tu tinha entendido que era copiar o site e fazer animações, de quando fosse 'rolando pra baixo' fosse aparecendo animações 3D com texto."*
- *"As tipografias e cores das tipografias não passam profissionalismo de um site."*
- Faltou **ponto de interrogação** numa frase.

**Conclusão:** o alvo é uma **LANDING PAGE DE ROLAGEM ANIMADA** (um site de verdade), não um vídeo. Ao rolar pra baixo, cada seção entra com **animações 3D + texto**. Visual **profissional**. Estrutura inspirada no site real (premioslusofonossaude.com) + texto/cores que ela definiu.

---

## 1. Referências que o usuário mandou

- **`referencia.mp4` (site de café):** premium/clean. Tem um **objeto 3D central** (xícara) com **elementos flutuando ao redor** (grãos, gelo, fumaça), fundo em gradiente, tipografia elegante. → É a vibe do **hero 3D + flutuantes**.
- **`referencia2.mp4` (Quest / Stranger Things):** **A REFERÊNCIA PRINCIPAL DE FORMATO.** Landing page **escura que ROLA**:
  - **cabeçalho fixo** (logo + menu + botão de ação),
  - **indicador de seção na lateral direita** que acende conforme rola,
  - cada seção = tela cheia, com **elemento 3D central dramático** + título grande + blocos de texto + botão,
  - tudo escuro com **glow** de cor.

**Modelo final = formato da referencia2 + elementos 3D flutuantes da referencia1 + paleta/textos dos Prémios Lusófonos.**

---

## 2. ELEMENTOS 3D — o coração do projeto (a Cerejinha bate muito nisso)

A estrela do site são os **elementos 3D**. Vamos usar **IMAGENS + VÍDEOS combinados** pra fazer hero, parallax e movimento 3D bem-feitos:

### 2a. IMAGENS 3D (PNG com fundo transparente) — geradas no Grok / ChatGPT
- **Herói de cada seção:** 1 objeto 3D principal (ex: cacho de cápsulas de vidro, esfera cromada, mãos, troféu/estatueta do prêmio).
- **Elementos soltos:** cápsulas, esferas, grãos/pílulas, estrelas, nós de luz — peças avulsas pra **flutuarem** ao redor do herói.
- **Como animo (código):** flutuação suave (sobe/desce), rotação leve, **parallax por camadas no scroll** (fundo, meio, herói, primeiro plano em velocidades diferentes), **tilt no mouse** (objeto inclina seguindo o cursor), brilho/escala ao entrar na tela.
- **Vantagem:** leve (PC fraco agradece), nitidez total, controle fino do movimento, cara de site.

### 2b. VÍDEOS (loops curtos) — geram o que imagem não dá
- Movimentos vivos: **partículas/poeira luminosa**, **líquido/tinta** escorrendo, **brilho pulsando**, **objeto 3D girando de verdade**, **transições entre seções**.
- Usados como **camada de acento/fundo** em pontos-chave (não a página inteira). Fundo preto + `mix-blend:screen`, OU vídeo com transparência (se der).
- Ex: no hero, vídeo do objeto girando ATRÁS + PNGs flutuando POR CIMA com parallax.

### 2c. Combinação típica por seção (a montar)
- Camada 1 (fundo): gradiente/“nebulosa” + vídeo de partículas sutil.
- Camada 2 (herói): imagem 3D nítida (ou vídeo do objeto) — flutua/gira/parallax.
- Camada 3 (frente): PNGs soltos flutuando + glow.
- Texto: entra revelando (não digitação exagerada; algo mais “site” e elegante).

> **AÇÃO DO USUÁRIO:** vai gerar **mais imagens de elementos** (e alguns vídeos) no Grok/ChatGPT conforme a gente fechar cada seção. A lista exata sai na Seção 6, seção por seção.

---

## 3. Arquitetura técnica (o motor novo)

- **Documento que ROLA** (scroll normal vertical), não mais slide-deck de tela fixa.
- **Cabeçalho fixo** (logo símbolo + menu de seções + botão "Inscrever projeto"). Some/encolhe sutil ao rolar.
- **Indicador de seção** na lateral (estilo referencia2) que acende a seção atual e desliza.
- **Seções full-height** (≈100vh cada), empilhadas. Possível **scroll-snap** suave (avaliar).
- **Animações disparadas no scroll:** `IntersectionObserver` (revelar quando entra) + progresso de scroll por seção (parallax/flutuação dirigidos pela posição).
- **Reaproveita:** a paleta, os textos, e dá pra reciclar alguns vídeos hero1–5 como acentos onde couber.
- **Performance (PC i5 3ªger, 8GB, sem GPU):** priorizar **PNG + CSS transform** (parallax/flutuação) em vez de vídeo pesado; vídeos só onde valer; `will-change` com parcimônia; nada de `backdrop-filter:blur`.

---

## 4. Visual — tipografia e cores PROFISSIONAIS

### Cores (de `cores.png`, fixas)
| Cor | Hex |
|---|---|
| Índigo profundo | `#180066` |
| Roxo/Magenta | `#730394` |
| Lavanda | `#8367DF` |
| Laranja vibrante | `#FF7300` (ação) |
| Cinza arroxeado | `#4A3F4D` |
Fundo escuro (`#050308`/`#0c0716`), texto claro. Glow nas cores.

### Tipografia — DECIDIDO: Opção B
- **Títulos/display: `Clash Display`** (Fontshare, grátis — link `api.fontshare.com`). Personalidade editorial/premium, cara de site de prêmio de design. (A v1 usava Space Grotesk = o que a esposa achou "sem profissionalismo" → trocar.)
- **Corpo: `Inter`** (Google Fonts) — legibilidade neutra.
- **Fallback se quiser tudo no Google Fonts (sem Fontshare):** `Sora` + `Inter`.
- ⚠️ Banir serifas finas “tell de IA” (Cormorant/Instrument/Fraunces — já rejeitadas).
- Hierarquia clara, bom espaçamento, números/datas com peso.

---

## 5. Estrutura de seções (ESQUELETO — a confirmar)

**DECIDIDO: ESQUELETO ENXUTO (5 seções):**
1. **Topo / Hero** — manchete + subtítulo + CTA "Inscrever projeto" + herói 3D central.
2. **A categoria** (sobre).
3. **Por que existe** (o coração — frases dela).
4. **Calendário 2026.**
5. **Rodapé / Contactos.**

(Categorias/Júri/Regulamento ficam só como links no cabeçalho/rodapé, não viram seções.)

---

## 6. Assets por seção (preencher um a um, conforme planejarmos)

> Vamos descer seção por seção. Pra cada uma: herói 3D, elementos flutuantes, vídeo(s) de acento, texto exato, tipografia, animação de scroll. O usuário gera os assets no Grok/ChatGPT.

- **Seção 1 — Hero:** _(a detalhar — próximo passo)_
- **Seção 2 — A categoria:** _(a detalhar)_
- **Seção 3 — Por que existe:** _(a detalhar)_
- **Seção 4 — Calendário:** _(a detalhar)_
- **Seção 5 — Rodapé:** _(a detalhar)_

---

## 6b. PRODUÇÃO DE IMAGENS — prompts prontos (começar por aqui)

**Ferramentas:** imagem transparente → **ChatGPT** (pede PNG transparente); vídeo de movimento → **Grok** (depois, a partir da imagem).
**Fluxo de ouro:** gera a IMAGEM primeiro → faz o VÍDEO a partir dela (image-to-video) pra tudo combinar.

### Trecho-base (colar no FIM de TODO prompt de imagem)
```
...glossy translucent glass and chrome material with liquid light inside, color
palette: deep indigo #180066, royal purple #730394, lavender #8367DF and a warm
orange #FF7300 glowing accent, soft cinematic studio lighting, subtle reflections,
isolated on a fully transparent background, PNG, centered with margin, full object
visible, ultra high resolution, photorealistic premium surreal 3D render.
```

### A) KIT DE ELEMENTOS (prioridade — flutuam em TODAS as seções)
**DECIDIDO: MISTURA** — poucas cápsulas (saúde, on-brief) + esferas/gotas/faíscas abstratas (ar criativo). Gerar ~6–8 peças isoladas. Nomes: `el-capsula1.png`, `el-esfera1/2.png`, `el-gota1/2.png`, `el-faisca1.png`…
- **Cápsula de vidro** (só 1–2 — lembra saúde):
  `A single floating 3D pharmaceutical capsule (oblong two-part pill) made of translucent glass with glowing liquid light inside, [trecho-base]`
- **Esfera glossy** (2):
  `A single floating 3D sphere, half mirror-chrome half translucent glass with swirling liquid light inside, [trecho-base]`
- **Gota / blob de vidro líquido** (abstrato, 2):
  `A single floating abstract liquid-glass droplet / blob with smooth organic curves and glowing liquid light inside, [trecho-base]`
- **Faísca / nó de luz** (1–2):
  `A small glowing orb / spark of light with a bright core and soft halo, [trecho-base]`

### B) OBJETO HERÓI (centro do Hero — escolher 1)
- **🥇 Troféu da logo em 3D:**
  `A 3D creativity-award trophy: a stylized human figure with both arms raised holding an arc of small stars above the head, on a small pedestal, [trecho-base]`
- **🥈 Cacho de cápsulas + esferas:**
  `A floating cluster of glossy translucent glass capsules and chrome spheres of different sizes, elegantly arranged, [trecho-base]`

### C) (Opcional) Fundo / nebulosa — NÃO precisa ser transparente
`A dark abstract nebula, deep black background with soft subtle glowing clouds of indigo, purple and a hint of orange, cinematic, ultra high resolution.`
(Dá pra fazer por CSS também; só gerar se quiser textura extra.)

### Regras
- Sempre **PNG transparente** (menos a nebulosa).
- **Mesmo ângulo de luz** em tudo; **1 objeto por imagem**.
- Salvar na pasta `landpage/` com nomes claros.
- Reaproveitar **hero1–5 antigos** como vídeos de partículas/acento (fundo preto + `mix-blend:screen`).

---

## 7. Correções pontuais já anotadas
- Faltou **ponto de interrogação** numa frase (confirmar qual — provável "Por que esta premiação existe**?**").
- Tipografia/cores → profissionais (Seção 4).

---

## 8. Decisões
- ✅ **Seções:** enxuto, 5 (Seção 5).
- ✅ **Tipografia:** Clash Display (títulos) + Inter (corpo).
- ✅ **Assets:** imagens (PNG transparente, ChatGPT) + vídeos (Grok, image-to-video a partir do PNG). Prompts na Seção 6b.
- ⬜ **Objeto herói do Hero:** troféu da logo 🥇 vs cápsulas/esferas 🥈.
- ⬜ **Manchete do Hero:** poética ("Entre pessoas.") vs institucional (nome + 2026).
- ⬜ **Snap de scroll** sim/não.

---

## 9. Status
- v1 (slide-deck cinematográfico) está em `index.html` e no GitHub (`filtroazul/lusofonos`). Fica como **backup/registro** enquanto construímos a v2.
- Próximo passo do planejamento: **fechar a lista de seções (Seção 5)**, depois descer pro Hero.
