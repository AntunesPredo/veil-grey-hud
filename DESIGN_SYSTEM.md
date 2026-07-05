# Veil Grey - Design System & Padrões Estéticos

Este documento define os padrões visuais, estilos arquiteturais e componentes base extraídos do painel "SYS.VITALS" para garantir consistência e uma experiência "premium" por toda a plataforma.

A estética geral é **Retro-Futurista / Cyberpunk Terminal Medical**, combinando fontes monoespaçadas, alto contraste (neon sobre preto), bordas ríspidas (zero arredondamento) e layouts baseados em "Widgets" tecnológicos e industriais.

## 1. Princípios Fundamentais
*   **Zero Border-Radius**: Todos os componentes, modais, inputs e botões utilizam `rounded-none`. A estética é industrial e digital.
*   **Cores de Tema Estritas**: Apenas as variáveis de tema globais devem ser utilizadas.
*   **Tipografia Analítica**: Muito uso de letras maiúsculas (`uppercase`), espaçamento largo (`tracking-widest`) em rótulos, e números largos (`font-black tracking-tighter`) em valores.
*   **Efeitos de "Glow" (Brilho)**: Estados ativos (hover, focus, estados críticos) utilizam sombras e brilhos neon que acompanham a cor do elemento.
*   **Micro-interações**: Elementos temporários ou críticos "pulsam" (`animate-pulse`), e transições de tamanho utilizam `framer-motion` para fluidez mecânica.

## 2. Paleta de Cores e Tokens
O sistema baseia-se em CSS variables para garantir flexibilidade e coesão.

*   `var(--theme-background)`: Fundo padrão, geralmente preto ou cinza muito escuro.
*   `var(--theme-border)`: Bordas de inatividade, linhas guia (guidelines) e grids desativados.
*   `var(--theme-accent)`: Cor principal (frequentemente turquesa/ciano). Usada para títulos, componentes primários e HP/Energia estáveis.
*   `var(--theme-success)`: Verde neon. Usado para adições temporárias, buffs, cura e status "CHEIO".
*   `var(--theme-warning)`: Laranja neon. Usado para status perigosos, instabilidade e avisos.
*   `var(--theme-danger)`: Vermelho neon. Usado para erros, status críticos, trauma e insanidade.

## 3. Tipografia
As fontes devem dar a sensação de um terminal da DOS ou equipamento médico high-tech.
*   **Valores Numéricos Grandes**: `text-6xl` a `text-7xl`, `font-black`, `font-mono`, `tracking-tighter`, `leading-none`.
*   **Títulos de Widgets/Secções**: `font-bold`, `tracking-[0.2em]` a `tracking-[0.3em]`, `uppercase`, `text-xs` a `text-xl`. Frequentemente precedidos de `SYS.` ou entre colchetes `[ TEXTO ]`.
*   **Labels Menores (Micro-copy)**: `text-[9px]` a `text-[11px]`, `font-mono`, `uppercase`, `opacity-70`. Ex: `MAX_CAPACITY`, `BLADE_01`.

## 4. Componentes Base (UI Padrão)

### 4.1 Buttons (Botões)
Botões nunca têm bordas arredondadas e sempre possuem bordas explícitas de `2px`.
*   **Padrão (Primary)**: Texto e borda `var(--theme-accent)`. No `:hover`, o fundo preenche com a cor e o texto fica preto (`hover:bg-[var(--theme-accent)] hover:text-black`), recebendo um `shadow-[0_0_10px_var(--theme-accent)]`.
*   **Variantes (Success, Danger, Warning)**: Possuem `bg-[var(--cor)]/10` fixo por padrão. No `:hover`, o fundo se torna opaco e o texto fica branco.
*   **Texto Interno**: Sempre `font-bold uppercase tracking-widest`.
*   **Uso com Ícones**: Se um ícone for adicionado, usar botões menores (`size="sm"`) mantendo as margens simétricas.

### 4.2 Checkboxes
Não se usa o input checkbox nativo do HTML.
*   **Estrutura**: Um losango (quadrado rotacionado em 45 graus com `rotate-45`).
*   **Inativo**: `border-2` e `bg-black`.
*   **Ativo**: Preenchimento total com a cor ativa + sombra (`shadow-[0_0_8px_var(--theme-accent)]`) + quadrado interno vazado centralizado para dar o efeito tecnológico.
*   **Texto**: Ao lado da caixa, em `text-[10px]`, `font-bold`, `uppercase`, `tracking-widest`.

### 4.3 Inputs
*   Fundo usa a cor do tema, texto possui cor vibrante.
*   Borda `2px` com `opacity-50` quando inativo.
*   Estado de `:focus` com `bg-[var(--theme-accent)]/10`, bordas sólidas e sem outline nativo (`outline-none`).

### 4.4 Modificadores Numéricos (Steppers)
*   **MultiNumberStepper (Ex: HP)**: Agrupamento em contêiner `bg-black/40` com borda e divisórias visíveis (`divide-x-2`). Uso de botões miniatura (ex: `-10`, `-1`) que mudam de cor no hover, preservando o modelo sem arredondamento.

## 5. Padrões de Layout (Containers)

### 5.1 WidgetBlade (Módulos de Painel)
Usado para envelopar sessões grandes (como *Sistema de Suporte à Vida*).
*   **Header**: Barra superior colorida (`bg-[var(--theme-accent)]` ou perigo) contendo o título em caixa alta, e um número identificador (ex: `BLADE_01`).
*   **Body**: Bordas laterais grossas `border-2`. Fundo opaco.
*   **Espaçamento**: Interior geralmente com `p-5` e divisões (`gap-6`).

### 5.2 Chassis Bio-Mecânico (BioClusterChassis)
Usado para encapsular dados densos (ex: HP Hexagonal).
*   Caixas estilo "HUD", decoradas com marcadores de canto (pequenos bordas absolutas formadas por `border-t-2 border-l-2`).
*   Fundos sutis listrados ou quadriculados usando `linear-gradient` para textura (ex: `background-size: 15px 15px` com opacidade 10%).

## 6. Efeitos Visuais & Animações

*   **Valores Temporários/Buffs**: Sempre exibidos piscando levemente (`animate-pulse`) ou em verde (`var(--theme-success)`).
*   **Progress Bars (Barras de progresso)**:
    *   Sempre utilizam `<motion.div>` do Framer Motion para transição suave quando o valor é alterado (`transition={{ duration: 0.8, ease: "easeOut" }}`).
    *   Possuem "glow" na ponta ou ao longo da barra usando `box-shadow`.
*   **Gráficos Complexos (SVG)**:
    *   **SVGs** são usados para simular visores médicos e medidores não convencionais (ex: Medidor de Insanidade em arco, favos hexagonais de HP).
    *   Glow dinâmico em paths SVG via `filter="url(#glow)"` nativo.
    *   Uso extensivo de `strokeDasharray` para simular linhas de mira e retículos.
    *   Texturas "Líquidas" e fluxos (ex: `SustenanceWidget`) são feitos com keyframes e CSS gradients listrados para dar efeito de movimento a fluidos ou dados passando por "cabos".

## 7. Responsividade e Uso Mobile
Como usabilidade mobile é prioritária:
*   **Flex-direction Flexível**: Agrupamentos de itens mudam de `flex-row` no Desktop para `flex-col` no Mobile para evitar colapso. (ex: Cabeçalho de vida: `flex-col md:flex-row`).
*   **Simplificação de Elementos Complexos**:
    *   No Componente de Sustento (Tubulações), os caminhos dos "cabos" têm renderizações próprias `md:hidden` para mobile, garantindo que ocupem o espaço certo em telas verticais estreitas.
    *   Uso de sanfonas (accordions) manuais ou `framer-motion` animando `height: "auto" / 0` para esconder e mostrar clusters visuais massivos em telas muito pequenas (ex: Botão "EXPANDIR MATRIZ").
*   **Layout Fluido**: Utiliza-se `ResizeObserver` para adaptar a contagem de colunas dinamicamente dentro de grids complexos (ex: Hexágonos de Vida adaptando o `gridTemplateColumns`).

## Resumo: Regra de Ouro para Novos Componentes
1. É quadrado? (Use `rounded-none` e `border-2`).
2. Tem texto? (Use caixa alta, `font-mono`, e aumente o espaçamento das letras).
3. Responde a interação? (Mude a cor de fundo, adicione sombra "glow" na borda e garanta que o contraste de texto permaneça alto).
4. Mostra mudança de estado? (Anime a transição com Framer Motion e considere um `animate-pulse` para estados críticos).
