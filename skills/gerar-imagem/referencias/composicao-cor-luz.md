# Composição, cor e luz

O que separa imagem profissional de imagem "feita por código". Leia uma vez por conversa.

## 1. Enquadramento

Escolha **uma** regra e escreva na especificação.

| Regra | Como aplicar | Serve para |
|---|---|---|
| Terços | Ponto focal num cruzamento das linhas a 1/3 e 2/3. Horizonte em 1/3 ou 2/3, nunca no meio | Paisagem, cena, capa |
| Centro com respiro | Objeto no centro óptico (uns 3% acima do centro geométrico), margem de 12% a 20% | Logo, ícone, produto |
| Diagonal | Massas ao longo de uma diagonal, com um contrapeso pequeno no canto oposto | Ação, cartaz |
| Triângulo | Três massas de alturas diferentes formando triângulo, a mais alta atrás | Natureza-morta, grupo |
| Moldura | Elementos escuros numa borda (árvore, parede) fechando o olhar no assunto | Paisagem, cena |
| Grade | Colunas e módulo fixos, tudo alinhado a eles | Infográfico, tela, cartaz |

Regras que valem sempre:

- **Um ponto focal.** É o maior contraste da imagem (claro contra escuro, cor contra cinza, nítido contra desfocado). Se dois lugares disputam, apague um.
- **Margem.** Nada importante a menos de 6% da borda. Objeto encostado ou cortado por acidente na borda é o defeito de composição mais comum.
- **Número ímpar** de elementos repetidos (3, 5) e **tamanhos diferentes**: grande, médio, pequeno. Três coisas do mesmo tamanho em fila é "simetria morta".
- **Sobreposição dá profundidade.** Deixe um objeto cobrir parte do outro. Tudo separado, lado a lado, fica chapado.
- **Peso equilibrado, não espelhado.** Massa grande de um lado pede massa pequena ou detalhe claro do outro (na ilustração de exemplo: árvores altas à esquerda, sol e juncos à direita).
- **Três planos**: frente escura ou desfocada, meio com o assunto, fundo claro e sem detalhe.

## 2. Hierarquia

- No máximo **três níveis** de importância. Em texto: título, subtítulo, corpo. Razão entre níveis de pelo menos 1,5 (86 px, 23 px, 17,5 px no infográfico de exemplo).
- O que é igual em importância é igual em tamanho, peso e cor. Variação sem motivo é ruído.
- Espaço em branco é hierarquia: o que tem mais espaço em volta é mais importante.

## 3. Cor

Regra 60, 30, 10: uma cor dominante (60%), uma de apoio (30%), um acento (10%). O acento é o ponto focal.

Harmonias prontas (fundo, principal, apoio, acento):

| Nome | Hex | Clima |
|---|---|---|
| Análoga fria | `#F6F3EC` `#0E4D5C` `#1F7A8C` `#E9A23B` | Calma, limpa, confiável |
| Complementar quente | `#F4F1EA` `#16181D` `#5E6470` `#E4572E` | Editorial, direta |
| Entardecer | `#1D2B53` `#C96F6B` `#F4A261` `#FFD9A0` | Nostálgica, cinematográfica |
| Noite | `#050B1F` `#17335C` `#6FA3A8` `#FFC864` | Silêncio, mistério |
| Terra | `#F2E8D5` `#7A4B2A` `#B5651D` `#2F5D50` | Artesanal, orgânica |
| Neon | `#0B0B1A` `#FF2E88` `#21E6C1` `#F8F32B` | Noturna, elétrica |
| Pastel | `#FFF8F0` `#F6BD60` `#84A59D` `#F28482` | Leve, infantil |
| Mono com acento | `#FFFFFF` `#111111` `#8A8A8A` `#0057FF` | Técnica, suíça |

Regras:

- **Nunca preto puro nem branco puro em área grande.** Use `#16181D` e `#F4F1EA`. Preto puro só em traço fino.
- **Sombra não é a cor mais preto.** Sombra puxa para a cor complementar da luz: luz quente, sombra azulada ou violeta. Na natureza-morta, o preenchimento é `(0.06, 0.072, 0.095)` azulado contra o softbox `(1.0, 0.86, 0.70)`.
- **Saturação mora nos meios-tons.** Claros e escuros são menos saturados. Tudo saturado igual parece brinquedo.
- **Limite a paleta.** Mais de cinco matizes numa imagem precisa de justificativa. Varie valor (claro e escuro) dentro do mesmo matiz.
- **Perspectiva aérea**: o que está longe é mais claro, menos saturado e puxado para a cor do céu. Cada plano de serra da ilustração mistura mais névoa que o anterior.
- **Contraste de texto**: pelo menos 4,5 para 1 em texto pequeno. Cinza `#4A4F5A` sobre `#F4F1EA` passa com folga. Cinza claro sobre branco não.
- **Cores de shader são lineares.** O hex da tela não é o valor do material: laranja na tela `#F28C28` é albedo perto de `(0.82, 0.25, 0.02)`. Albedo nunca acima de 0,85 nem abaixo de 0,02.

## 4. Luz

Decida a luz **antes** de desenhar e mantenha em tudo: sombras, brilhos e degradês apontam para o mesmo lugar.

| Esquema | Montagem | Efeito |
|---|---|---|
| Janela lateral | Luz grande e suave a 45 graus de lado, um pouco acima. Preenchimento fraco do lado oposto | Natural, volume, o padrão para objetos |
| Três pontos | Principal a 45 graus, preenchimento com 1/4 da força do outro lado, recorte por trás | Destaca do fundo, retrato e produto |
| Contraluz | Fonte atrás do assunto. Silhuetas, halo, raios | Drama, entardecer |
| Alta e difusa | Luz de cima, enorme, quase sem sombra | Catálogo, limpo |
| Rasante | Luz baixa e de lado | Revela textura, sombras compridas |

Regras:

- **Sombra suave vem de fonte grande.** Em shader, luz de área amostrada de verdade. Em 2D, sombra com desfoque que cresce com a distância do objeto ao chão.
- **Sombra de contato.** Todo objeto apoiado tem uma linha escura e fina onde toca a superfície. Sem ela, flutua. (Na primeira rodada da natureza-morta a maçã estava 11 mm acima da mesa e parecia colada por cima.)
- **Temperatura**: principal quente com preenchimento frio, ou o contrário. As duas da mesma cor achatam.
- **Brilho especular** tem a forma da fonte: softbox dá retângulo, sol dá ponto. Fica no lado da luz, nunca no centro do objeto.
- **Luz de recorte** fina e fria por trás solta um objeto escuro de um fundo escuro.
- Em ilustração chapada, a "luz" é um lado claro e um lado escuro de cada forma, sempre do mesmo lado (as facetas da agulha do ícone de exemplo).

## 5. Erros típicos de imagem gerada por código, e a correção

| Defeito | Como aparece | Correção |
|---|---|---|
| Degradê chapado | Fundo com degradê linear de duas cores, liso, "cara de slide" | Três a cinco paradas de cor, mais um radial claro fora do centro, mais grão de 1% a 3% |
| Faixas no degradê | Degraus visíveis em área lisa e escura | Grão ou pontilhado antes de gravar em 8 bits |
| Simetria morta | Tudo centrado, espelhado, espaçado igual | Tirar do centro, variar tamanhos, quebrar a repetição com ruído de baixa frequência |
| Repetição de cerca | Árvores, estrelas ou pontos a intervalo regular | Agrupar: densidade guiada por ruído, com vazios entre os grupos |
| Sem textura | Superfícies lisas como plástico | Grão de papel, variação de cor por ruído dentro de cada forma, rugosidade variável |
| Textura com direção | Grão esticado numa direção parece chuva ou risco de scanner | Ruído quase isotrópico, amplitude baixa (testado: fibras verticais longas estragaram o céu) |
| Faixa lisa de efeito | Névoa, brilho ou sombra como retângulo de borda a borda vira uma barra | Montar com dezenas de manchas de tamanhos e opacidades diferentes |
| Borda serrilhada | Degraus em diagonais e curvas | Renderizar com `--escala 2`, tremor por amostra no shader, nunca `image-rendering: pixelated` fora de pixel art |
| Objeto flutuando | Falta de sombra de contato, ou a base não encosta | Conferir a conta da base (centro menos raio = chão) e escurecer o contato |
| Proporção errada | Maçã achatada como tomate, cabeça grande demais | Medir contra referência mental: escrever largura e altura de cada objeto na especificação |
| Detalhe do tamanho errado | Pintas grandes como tinta descascada, poros gigantes | Detalhe de superfície tem de 1/50 a 1/200 do objeto. Aumente a frequência do ruído |
| Tudo nítido | Sem profundidade | Desfocar um plano (lente fina no shader, `filter: blur` em camada no canvas) |
| Contorno de desenho animado sem querer | Luz de borda forte em tudo | Luz de contorno só nos planos distantes, ou só do lado da luz |
| Texto errado | Letra trocada, acento faltando, texto cortado | Texto vivo (HTML ou SVG `<text>`), nunca desenhado à mão, e conferência letra por letra |
| Ícone ilegível pequeno | Detalhe some a 32 px | Versão reduzida é outro desenho: menos elementos e traço mais grosso |
| Pontos brancos soltos | Vaga-lumes em path tracing | Limitar a contribuição depois do primeiro salto difuso e filtrar pixel isolado na exibição |
