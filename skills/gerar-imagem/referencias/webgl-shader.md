# Técnica webgl-shader: cena realista por path tracing de SDF

Modelo de partida: `modelos/webgl-raymarch.html` (natureza-morta completa). Exemplo: `exemplos/natureza-morta/`.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/renderizar.mjs" cena.html cena.png --largura 1280 --altura 960 --limite 600
```

É o caminho mais realista que dá para fazer só com código: um fragment shader que, para cada pixel, lança
raios numa cena descrita por funções de distância (SDF), calcula luz direta de uma luz de área e luz
indireta por saltos, e acumula centenas de amostras.

## O limite honesto

Sai convincente: **objetos de forma simples** (frutas, louça, garrafas, bolas, caixas, produtos geométricos)
sobre mesa ou fundo infinito, com materiais de plástico, cerâmica, madeira, metal, vidro e líquido.

Não sai: pessoas, rostos, animais, tecido com dobras, plantas com folhas, cabelo, cenas de rua, qualquer
coisa que precise de malha modelada ou de textura fotográfica. Diga isso antes de começar. O resultado é um
**render**, não uma foto: quem olha com atenção percebe. Nota do exemplo, dada por um crítico independente: 6
(copo sem graça, madeira borrada, pera com brilho de plástico). Chame as coisas pelo que parecem: as esferas roxas
do exemplo foram pedidas como uvas e, soltas e perfeitas, leem como ameixas. Viraram ameixas.

## Estrutura do modelo

| Bloco | O que é | Mexa quando |
|---|---|---|
| `CENA` (JavaScript, no topo) | amostras, saltos, câmera, luz, ambiente, exposição, vinheta, grão | Sempre: é o painel de controle |
| `// CENA` até `// FIM DA CENA` (GLSL) | posições, SDF de cada objeto, `opaco()`, `material()` | Para trocar os objetos |
| `marchar`, `visibilidade`, `caminho` | o traçador | Raramente |
| `MOSTRA` | filtro de vaga-lumes, exposição, ACES, gama, vinheta, grão | Para mudar o acabamento |

A página acumula `CENA.amostras` amostras em textura de ponto flutuante e só então define
`IMAGEM_PRONTA = true`. Numa placa de vídeo dedicada intermediária, 1280 x 960 com 1100 amostras levou 73 segundos. Use
de 80 a 150 amostras nas variações e de 700 a 1200 na final.

## Modelar com SDF

- **Unidade**: 1,0 vale mais ou menos 10 cm. Mesa em `y = 0`. Escreva o tamanho real de cada objeto.
- **Base no chão**: centro em `y` igual à meia altura **real** da forma. Se você achata com `q.y *= 1.06`, a meia altura é `raio / 1.06`. Erro aqui deixa o objeto flutuando (aconteceu com a maçã e a laranja na primeira rodada).
- **Formas úteis**: esfera, cápsula, caixa arredondada, `uniaoSuave(a, b, k)` para fundir (pera: duas esferas com k de 0,30), toro fechado para maçã (`length(vec2(length(q.xz) - 0.15, q.y * 0.88)) - 0.28` dá as duas covas), perfil 2D girado para copo, garrafa e vaso.
- **Proporção**: maçã com raio maior de toro 0,17 e sem alongar saiu achatada como tomate. Compare largura e altura com o objeto real antes de renderizar.
- **Deslocamento de superfície** (poros, casca): só perto da superfície (`if (d < 0.06)`), amplitude abaixo de 1% do raio, e multiplique a distância por 0,8 a 0,9 para o raio não atravessar.
- Função que não é distância exata (afunilada, com `max`): multiplique por 0,85.

## Materiais

`Mat(cor, rugosidade, f0)`, com cor em espaço **linear**.

| Material | cor (linear) | rugosidade | f0 |
|---|---|---|---|
| Fruta encerada | matiz forte, de 0,02 a 0,85 | 0,16 a 0,30 | 0,05 |
| Casca fosca (laranja, pera) | idem | 0,32 a 0,50 | 0,04 |
| Madeira envernizada | `(0.075, 0.036, 0.017)` a `(0.235, 0.125, 0.058)` | 0,22 a 0,47 | 0,045 |
| Parede, papel, gesso | cinzas de 0,08 a 0,6 | 0,9 | 0,02 (sem reflexo) |
| Cerâmica esmaltada | qualquer | 0,08 a 0,15 | 0,05 |
| Vidro | interface: IOR 1,5 e absorção por distância | - | - |
| Água | interface: IOR 1,33 | - | - |

Regras aprendidas:

- **Nada de cor uniforme.** Toda superfície mistura duas ou três cores por `fbm`, mais um detalhe pequeno (pintas, riscas, umbigo). Fruta de uma cor só é bola de plástico.
- **Detalhe pequeno de verdade.** Lenticelas da maçã com frequência 42 pareciam tinta descascada. Com 95 e limiar estreito (`smoothstep(0.86, 0.92, ...)`) ficaram certas.
- **Rugosidade também varia** por ruído. Brilho uniforme denuncia o computador.
- **Madeira**: tábuas ao longo de um eixo, veio por `fbm` distorcido por outro `fbm`, anéis por `sin`, fibras finas, um tom por tábua e junta escura entre elas.

## Luz

- **Uma luz de área grande** (softbox) é o padrão: `luz.meio` de mais ou menos 1,1 por 0,9, a 4 ou 5 unidades da cena, a 45 graus de lado e um pouco acima. Sombra suave sai de graça.
- **Luz alta demais não aparece no vidro.** Superfície vertical reflete para baixo o raio de uma câmera que olha de cima. Para brilho em copo e garrafa, a luz precisa estar mais baixa e lateral (no exemplo: de `y = 3,3` para `y = 2,7`).
- **Preenchimento frio e fraco** pelo `ambiente`: `(0.06, 0.072, 0.095)` em cima e `(0.034, 0.030, 0.026)` embaixo.
- **Luz de recorte**: uma mancha larga no ambiente, atrás e do lado oposto à principal (`CENA.recorte`), solta as bordas do fundo.
- Fundo escuro e quente com objetos coloridos é o caminho mais seguro. Fundo branco expõe todo defeito.

## Câmera

- `fovGraus` de 25 a 35: lente longa, menos distorção, mais cara de fotografia. Acima de 50 parece jogo.
- Câmera pouco acima dos objetos, olhando levemente para baixo.
- `abertura` de 0,02 a 0,05 com `focoEm` no objeto principal. Desfoque no fundo e na frente é metade do realismo.
- Arranjo em triângulo, com sobreposição. Objeto alto atrás, pequenos soltos na frente.

## Armadilhas do traçador (todas aconteceram)

| Sintoma | Causa | Correção |
|---|---|---|
| Faixas onduladas dentro do vidro | Limiar de acerto que cresce com a distância faz o raio parar antes da superfície e "entrar" ainda do lado de fora | Limiar fixo e pequeno para o vidro (`g < 0.0003`) e recuo de 0,002 ao atravessar |
| Faixas na sombra do vidro | Passo fixo na marcha de sombra | Sortear o início (`t = 0.004 + 0.008 * rnd()`) |
| Pontos brancos espalhados | Caminho difuso que depois reflete e acerta a luz: raro e muito forte | Teto de contribuição de 14 antes e 0,45 depois do primeiro salto difuso, sem reflexo em material com rugosidade acima de 0,6, e filtro de pixel isolado na exibição |
| Copo vazio quase invisível | Parede fina e paralela quase não desvia a luz, o que é fisicamente correto | Pôr líquido dentro (três meios: ar, vidro, água) ou engrossar o fundo |
| Sombra dura e preta atrás do vidro | Raio de sombra bloqueado pelo vidro | Na sombra, o vidro só atenua pelo caminho percorrido dentro dele |
| Imagem preta | Erro de compilação do shader | Ler `erros` no JSON do renderizador: traz a linha do GLSL |
| Ruído que não some | Poucas amostras ou luz pequena | Mais amostras. Luz maior. Nunca desfocar a imagem inteira |

## Acabamento (no shader `MOSTRA`)

Ordem: média das amostras, filtro de vaga-lumes, exposição, vinheta, **ACES**, gama 2,2, grão. ACES evita
branco estourado e dá o ombro suave de filme. Grão de 0,015 a 0,02 esconde o resto de ruído e as faixas em
área escura. Vinheta de 0,3 a 0,4.

## Sem placa de vídeo

`--gpu software` usa SwiftShader (funciona, testado), mas é dezenas de vezes mais lento. Reduza para
640 x 480 e 60 amostras para ver a composição, e avise o usuário que a final precisa de placa.

## Lista de conferência

- [ ] Todo objeto encosta na mesa e tem sombra de contato.
- [ ] Nenhuma superfície de cor uniforme.
- [ ] Brilho especular do lado da luz, com a forma da luz.
- [ ] Um plano em foco, o resto suavemente desfocado.
- [ ] Sem pontos brancos soltos, sem faixas.
- [ ] `erros` vazio e `amostras: N` no console.
