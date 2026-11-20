# Técnica canvas2d: ilustração e arte procedural

Modelo de partida: `modelos/canvas-ilustracao.html` (paisagem em camadas). Exemplo: `exemplos/ilustracao/`.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/renderizar.mjs" arte.html arte.png --largura 1536 --altura 1024 --canvas "#tela"
```

`--canvas "#tela"` grava os pixels exatos do canvas. O canvas pega o tamanho da página
(`tela.width = innerWidth`), então `--largura` e `--altura` definem o tamanho da imagem.

## As quatro bases

1. **Semente fixa.** Nunca `Math.random()`. Use o `acaso(semente)` do modelo (mulberry32). Mesma semente, mesma imagem. Variação de composição: troque a semente.
2. **Unidade proporcional.** `const U = Math.min(W, H) / 1000` e todo tamanho em múltiplos de `U`. A imagem escala sem mudar o desenho.
3. **Ruído coerente.** `ruido2(x, y)` e `fbm(x, y, oitavas)` do modelo. Tudo que precisa parecer natural (crista de serra, densidade de árvores, mancha de cor) sai de ruído, não de `acaso` puro. Acaso puro dá chiado. Ruído dá forma.
4. **Camadas do fundo para a frente**, cada uma numa função: céu, astros, nuvens, planos distantes, planos próximos, água, primeiro plano, detalhes, acabamento.

## Receitas

**Céu**: degradê vertical com **quatro ou cinco** paradas, não duas. Halo do astro em três radiais sobrepostos (largo e fraco, médio, estreito e forte).

**Nuvens e névoa**: feixes de elipses muito achatadas com radial de opacidade 0,05 a 0,17, em `globalCompositeOperation = 'screen'` para clarear. Dezenas de manchas de tamanhos diferentes. Nunca um retângulo com degradê: vira barra (aconteceu na primeira rodada do exemplo). E manchas espalhadas por igual de borda a borda **também** viram barra (segunda rodada): agrupe em três ou quatro bancos separados, com falhas entre eles.

**Planos de montanha**: para cada plano `i`, a crista é `base - amplitude * fbm(x * frequência + deslocamento)`. De longe para perto: frequência sobe, cor escurece e satura, mistura com névoa cai. Corpo com degradê vertical que termina na cor da névoa. Cumes definidos: multiplique o ruído por `pow(abs(sin(...)), 1.5)`.

**Vegetação em grupos**: a densidade vem de `ruido2(x / escala) > limiar`, com passo pequeno onde é denso e passo grande onde é vazio. Altura de cada árvore variando de 0,55 a 1,25 da base. Intervalo regular parece cerca.

**Água**: copie o que está acima espelhado (`translate`, `scale(1, -1)`, `drawImage` do próprio canvas) com `filter = 'blur(2px)'`, escureça com degradê para baixo, risque com traços horizontais curtos que alongam para perto. Caminho de luz sob o astro: 90 traços curtos claros, numa coluna que alarga para perto.

**Pincelada**: traço com `lineCap = 'round'`, largura variando ao longo do caminho (desenhe em segmentos curtos), opacidade de 0,2 a 0,6 e três a cinco passadas levemente deslocadas com tons vizinhos.

**Aquarela**: forma preenchida com opacidade 0,15, repetida de seis a dez vezes com os vértices deslocados por ruído. A borda acumula e escurece sozinha.

**Sombra projetada**: `shadowBlur` e `shadowOffsetY` no contexto, ou elipse escura com radial. Desfoque cresce com a altura do objeto.

**Textura de papel e grão** (sempre por último, em pixels):

```js
const img = g.getImageData(0, 0, W, H), d = img.data;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 4;
  const trama = fbm(x / (3.2 * U), y / (4.2 * U), 3) - 0.47;   // quase sem direção
  const grao = h2(x, y) - 0.5;
  const k = (trama * 0.9 + grao * 0.8) * 0.055 * 255;
  d[i] += k; d[i + 1] += k; d[i + 2] += k * 0.9;
}
g.putImageData(img, 0, 0);
```

Trama esticada num eixo (testado com 2,2 por 9) parece chuva em cima da imagem. Mantenha as duas escalas
próximas e a força entre 0,03 e 0,06.

**Vinheta**: escureça os cantos de 20% a 35% com queda suave. Junto com o grão, é o que tira a cara de "vetor liso".

## Composição em ilustração

- Horizonte em 1/3 ou 2/3. No exemplo, a água começa em 70% da altura.
- Astro num terço, nunca no centro. Parcialmente coberto por uma serra fica melhor que solto no céu.
- **Moldura de um lado só**: árvores altas na esquerda, contrapeso pequeno na direita (juncos).
- **Ponto de interesse humano**: uma cabana com janela acesa, um barco, uma figura. Pequeno, e é o segundo ponto mais claro da imagem.
- Primeiro plano em silhueta escura dá profundidade na hora.
- Aves, estrelas e folhas: grupo pequeno, ímpar, perto de um terço. Sete aves num V aberto, não quarenta espalhadas.

## Formas orgânicas

- Curvas: `quadraticCurveTo` e `bezierCurveTo` com pontos deslocados por ruído. Polígono reto com `lineTo` só para o que é reto.
- Contorno de crista: passo de 2 px. Passo maior deixa facetas.
- Silhueta de árvore, casa, pessoa: desenhe **uma** função parametrizada e chame várias vezes com variação de tamanho e proporção.
- Árvore grande em silhueta: a saia desce até quase o chão (tronco visível de no máximo 3% da altura). Com 8% de tronco fino, os pinheiros do exemplo pareciam ter pernas.
- O ponto de interesse humano precisa de tamanho: cabana com menos de 5% da largura da imagem some. No exemplo subiu de 58 para 92 unidades.
- Personagem que se repete entre imagens: é caso de ficha (`referencias/consistencia.md`).

## Desempenho

- Laço por pixel com `fbm` em 1536 x 1024 leva de 1 a 3 segundos. Tudo bem.
- Milhares de `createRadialGradient` também. Dezenas de milhares, não: pré-renderize a mancha num canvas pequeno e use `drawImage`.
- `filter = 'blur()'` em canvas é rápido e funciona no renderizador.

## Lista de conferência

- [ ] Semente fixa e `IMAGEM_PRONTA` definida.
- [ ] Nenhuma faixa ou barra lisa de borda a borda.
- [ ] Nenhuma repetição regular visível.
- [ ] Planos distantes mais claros e menos saturados que os próximos.
- [ ] Grão presente, sem direção, discreto.
- [ ] Um ponto focal, fora do centro.

## Limites honestos

- Sai bem: paisagem em camadas, padrões, abstratos, cenas em silhueta, estilos chapados com textura.
- Sai mal: anatomia, rostos expressivos, perspectiva complexa, desenho de observação. Para figura humana, estilize ao máximo (formas simples, sem rosto detalhado) e avise o usuário.
