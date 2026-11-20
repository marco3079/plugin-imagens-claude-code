# Técnica html-css: telas, diagramas, infográficos e cartazes

Modelo de partida: `modelos/html-infografico.html`. Exemplo: `exemplos/infografico/`.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/renderizar.mjs" pagina.html saida.png --largura 1280 --altura 1600
node "${CLAUDE_PLUGIN_ROOT}/scripts/renderizar.mjs" pagina.html cartao.png --seletor ".cartao" --escala 2
```

Use quando o texto é protagonista. O navegador faz tipografia, quebra de linha e alinhamento melhor que
qualquer desenho à mão.

## Página de tamanho fixo

```css
html, body { width: 1280px; height: 1600px; overflow: hidden; }
* { box-sizing: border-box; margin: 0; padding: 0; }
```

- Largura e altura do `body` em px, **iguais** às passadas ao renderizador. Nada de `vw`, `vh` ou rolagem.
- Para imagem mais nítida, mantenha o layout e use `--escala 2`. Não dobre os valores de px na mão.
- Conteúdo que passa da altura é cortado sem aviso: olhe o rodapé no PNG.

## Sistema antes de conteúdo

Declare em `:root` e use só isso:

```css
:root {
  --u: 8px;                                   /* módulo: todo espaço é múltiplo dele */
  --papel: #F4F1EA; --tinta: #16181D; --cinza: #5E6470; --linha: #D8D3C7;
  --acento: #E4572E;                          /* uma cor de acento, usada em menos de 10% da área */
  --fonte: "Segoe UI", system-ui, -apple-system, "Helvetica Neue", "Noto Sans", Arial, sans-serif;
  --mono: "Cascadia Mono", Consolas, "SF Mono", Menlo, "DejaVu Sans Mono", monospace;
}
```

- **Grade**: 12 colunas para página, 4 para cartões. `display: grid` com `gap` em múltiplos de `--u`. Tudo alinha a uma coluna.
- **Escala de tipos** com razão fixa (1,25 ou 1,5). Exemplo usado: 86, 23, 23, 17,5 e 17 px. Não invente tamanho intermediário.
- **Três níveis** de hierarquia e três pesos no máximo (400, 700, 800).
- **Margem externa** generosa: de 6% a 8% da largura. Página que encosta na borda parece rascunho.

## Tipografia

- Título grande: `line-height` de 0,95 a 1,05 e `letter-spacing` de -0,02 a -0,04 em. Corpo: `line-height` de 1,4 a 1,5.
- Linha de texto com 45 a 75 caracteres. Limite com `max-width`.
- Rótulo pequeno em maiúsculas: 13 a 15 px, peso 700, `letter-spacing` de 0,2 em.
- Números em tabela: `font-variant-numeric: tabular-nums` e alinhados à direita.
- Só fontes do sistema. A pilha acima cobre Windows, macOS e Linux. Serifa: `Georgia, "Times New Roman", "Noto Serif", serif`.
- Destaque **uma** palavra ou expressão do título com a cor de acento. Uma.
- Viúva (uma palavra sozinha na última linha de um título): ajuste `max-width` até sumir.

## Componentes

- **Cartão**: fundo branco sobre papel creme, raio de 12 a 16 px, padding de 24 px, sem borda e sem sombra. Ou borda fina, ou sombra, nunca as duas.
- **Destaque**: um cartão invertido (fundo `--tinta`, texto claro) chama atenção sem cor nova. Um por grupo.
- **Tabela**: só linhas horizontais de 1 px, cabeçalho com linha de 2 px. Sem grade completa, sem zebra.
- **Barra de valor**: trilho cinza de 8 px com preenchimento em acento e o número alinhado à direita em mono.
- **Ícones**: SVG embutido, todos na mesma grade (`viewBox="0 0 24 24"`), mesmo traço (1,7), `stroke-linecap: round`, sem preenchimento. Ícone de estilos diferentes na mesma página é o defeito mais visível.
- **Setas e ligações**: bordas tracejadas ou SVG. Em diagrama com muitas ligações, um `<svg>` absoluto por cima da grade, com coordenadas calculadas.
- **Aviso**: fundo do acento a 15% com barra de 6 px na esquerda.

## Diagramas

- Caixas alinhadas numa grade, todas da mesma altura por linha. Fluxo numa direção só (esquerda para direita, ou cima para baixo).
- Ligações retas ou em L, nunca cruzando caixa. Se cruzam, reorganize as caixas.
- No máximo sete caixas por nível. Mais que isso, agrupe.
- Rótulo de ligação no meio da linha, sobre fundo da cor do papel.
- Legenda só se houver mais de uma cor com significado.

## Telas e mockups

- Tamanhos reais: celular 390 x 844, tablet 820 x 1180, desktop 1440 x 900. Renderize com `--escala 2`.
- Moldura do aparelho: retângulo de raio 48 com borda de 10 px `#111`. Ou nenhuma. Moldura detalhada distrai.
- Conteúdo plausível: nomes, valores e datas variados. Nada de "Lorem ipsum" nem de "Texto aqui".
- Estados visíveis: um item selecionado, um botão principal. Tela sem estado parece esqueleto.

## Efeitos que funcionam no renderizador

`filter: blur()`, `backdrop-filter`, `mix-blend-mode`, `clip-path`, `mask-image`, `conic-gradient`,
`box-shadow` e SVG com filtros funcionam. Animações e transições são capturadas no estado inicial: não use.
Fundo com textura: um `<canvas>` atrás do conteúdo, desenhado por script com semente fixa.

## Lista de conferência

- [ ] Todo o texto conferido letra por letra no PNG, com acentos.
- [ ] Nada cortado no rodapé ou na lateral.
- [ ] Sem espaço morto grande (no exemplo, a primeira versão deixou 150 px vazios embaixo de uma tabela: corrigido aumentando a altura das linhas, não inventando conteúdo).
- [ ] Colunas vizinhas terminam na mesma altura.
- [ ] Menor texto com 14 px ou mais **no tamanho de uso**, não no tamanho de render. Infográfico de 1280 px visto a 800 px encolhe tudo em 37%: texto de 15,5 px vira 9,7 px. No exemplo, o texto dos cartões subiu para 17,5 px e o cinza escureceu de `#5E6470` para `#4A4F5A`.
- [ ] Cor com significado único: os nomes em código estavam num azul que não aparecia em mais nada. Viraram preto.
- [ ] Acento em menos de 10% da área.
- [ ] Nenhuma requisição externa (`http`, `@import`, `<link>` de fonte).

## Limites honestos

- O PNG depende das fontes da máquina que renderiza. Em outra máquina o texto pode quebrar em outro lugar.
- Gráfico de dados sério (eixos, escalas, muitos pontos) pede código de gráfico em SVG ou canvas com as contas explícitas. Confira os valores, não só a aparência.
