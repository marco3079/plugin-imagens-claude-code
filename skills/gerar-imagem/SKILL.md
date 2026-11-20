---
name: gerar-imagem
description: Gera, edita e restaura imagens sem gerador externo - o Claude escreve código que desenha (SVG, HTML e CSS, canvas 2D, shader WebGL), renderiza no navegador da máquina, olha o PNG, dá nota e refaz. Use sempre que o usuário pedir para desenhar, gerar, criar ou fazer uma imagem, figura, arte, ilustração, desenho, logo, logotipo, marca, ícone, favicon, capa, banner, cartaz, pôster, thumbnail, papel de parede, mockup de tela, diagrama, fluxograma, infográfico, cena realista ou render de produto, e também para editar, melhorar, recortar, corrigir cor, tirar ruído ou restaurar uma foto ou imagem que já existe. Palavras-chave - imagem, desenhar, gerar imagem, logo, ícone, ilustração, capa, banner, diagrama, infográfico, editar foto, restaurar foto.
---

# gerar-imagem

Você não tem um gerador de imagem. Você gera imagem escrevendo **código que desenha** e fica bom nisso
**olhando o resultado e refazendo**. Esta skill dá o renderizador, a técnica por tipo de imagem e o laço
obrigatório de variar, olhar, dar nota e corrigir.

Pasta do plugin: `${CLAUDE_PLUGIN_ROOT}`. Se a variável não estiver disponível, use a pasta duas acima
deste arquivo (`skills/gerar-imagem/` fica dentro dela).

## O limite honesto (diga ao usuário quando for o caso)

Código não iguala um modelo de difusão em **fotorrealismo de pessoas, rostos, animais e cenas complexas**
(rua, multidão, paisagem fotográfica, roupa, cabelo). Se o pedido for desse tipo, diga isso em uma ou duas
frases **antes de começar** e ofereça o que dá para fazer bem:

- cena renderizada de **objetos e ambientes simples** (produto, natureza-morta, sala vazia), por path tracing;
- **realismo estilizado** ou **ilustração** do mesmo assunto (pessoa em vetor, retrato em recorte de papel);
- **animal peludo realista** (cachorro, gato, urso): modelo 3D com pelo de verdade no Blender, se ele estiver
  instalado (técnica `blender-pelo`). Sai um render de estúdio que lê como pelúcia ou personagem de animação;
- se a pessoa precisa mesmo de foto de gente ou de animal real, indicar que isso pede um gerador por difusão.

Nunca prometa o que não entrega. Nunca chame de "foto" o que é um render.

## Ferramentas

Todos os scripts são Node sem dependências, aceitam `--ajuda`, imprimem **uma linha JSON** e saem com
código diferente de 0 em erro. Precisam de Node 18+ e de Edge, Chrome ou Chromium instalado.

```bash
# página .html ou .svg para PNG
node "${CLAUDE_PLUGIN_ROOT}/scripts/renderizar.mjs" entrada.html saida.png --largura 1280 --altura 960
# várias imagens numa folha rotulada (A, B, C...)
node "${CLAUDE_PLUGIN_ROOT}/scripts/folha-de-contato.mjs" folha.png a.png b.png c.png --rotulos "A: ...,B: ...,C: ..."
# script do Blender para PNG (só na técnica blender-pelo)
node "${CLAUDE_PLUGIN_ROOT}/scripts/blender.mjs" animal.py saida.png --lado 600 --amostras 40 --filhos 20
# duas imagens lado a lado
node "${CLAUDE_PLUGIN_ROOT}/scripts/antes-depois.mjs" antes.png depois.png antes-depois.png
# confere largura e altura sem abrir a imagem
node "${CLAUDE_PLUGIN_ROOT}/scripts/info.mjs" saida.png --espera 1280x960
```

Opções do `renderizar` que você vai usar: `--escala 2` (dobro de pixels), `--transparente`,
`--canvas "#tela"` (salva os pixels exatos de um canvas, do tamanho que ele tiver), `--seletor ".cartao"`
(recorta num elemento), `--limite 600` (segundos, para render demorado), `--gpu software`.

**Sinal de pronto**: página que desenha aos poucos (shader, imagem carregando) começa com
`window.IMAGEM_PRONTA = false` e termina com `window.IMAGEM_PRONTA = true`. O renderizador espera.

**Leia o JSON de saída**: `erros` traz exceções de JavaScript e erros de compilação de shader, `console`
traz o que a página imprimiu. Erro na página faz o script sair com código 2. Corrija antes de olhar a imagem.

Se o script disser que não achou navegador, peça ao usuário para instalar Edge ou Chrome ou definir
`IMAGENS_NAVEGADOR` com o caminho do executável. Rode `renderizar.mjs --diagnostico` para ver o que há.

## Fluxo (siga na ordem)

### 1. Entender o pedido

Se o pedido já diz assunto, uso e estilo, **não pergunte nada**. Se estiver vago, faça uma entrevista rápida
de **no máximo quatro perguntas**, todas de uma vez, com a ferramenta de perguntas disponível (popup ou
cartão de perguntas; nunca em texto solto se houver ferramenta):

1. **Assunto**: o que aparece, e o que é o mais importante.
2. **Uso, formato e tamanho**: onde vai ser usada (ícone de app, capa de vídeo, slide, impressão) e proporção.
3. **Estilo e clima**: ofereça três ou quatro estilos da biblioteca que combinam, com uma frase cada.
4. **O que não pode ter**: cores, elementos, texto, clichês a evitar.

Só pergunte o que muda a imagem. O que faltar, decida você e diga o que decidiu.

Antes de seguir, veja se existe **ficha** (`.claude/imagens/fichas/`) ou **estilo do usuário**
(`.claude/imagens/estilos/`) no projeto que se aplique. Se o pedido cita um personagem, mascote ou marca que
já tem ficha, use a ficha. Detalhes em `referencias/consistencia.md` e `referencias/estilos.md`.

### 2. Escolher a técnica

| O pedido é... | Técnica | Guia | Modelo de partida |
|---|---|---|---|
| Logo, marca, ícone, pictograma, ilustração de formas limpas | `svg` | `referencias/svg.md` | `modelos/svg-logo.svg` |
| Tela, mockup, diagrama, infográfico, cartaz ou capa com muito texto | `html-css` | `referencias/html-css.md` | `modelos/html-infografico.html` |
| Ilustração, paisagem, arte com textura, padrão, pintura digital | `canvas2d` | `referencias/canvas2d.md` | `modelos/canvas-ilustracao.html` |
| "Foto" de objetos, produto, natureza-morta, ambiente simples | `webgl-shader` | `referencias/webgl-shader.md` | `modelos/webgl-raymarch.html` |
| Mexer numa imagem que já existe (corrigir, restaurar, recortar, compor) | `edicao` | `referencias/edicao.md` | `modelos/edicao.html` |
| Animal peludo **realista** (cachorro, gato, urso), com Blender instalado | `blender-pelo` | `referencias/blender-pelo.md` | `modelos/blender-animal-pelo.py` |

Desempates: texto é protagonista, vá de `html-css`. Precisa escalar sem perder (marca), vá de `svg`.
Precisa de textura e irregularidade, vá de `canvas2d`. Precisa de luz e sombra de verdade, vá de
`webgl-shader`. Pediram animal "realista" e `scripts/blender.mjs --diagnostico` acha o Blender, vá de
`blender-pelo` direto: pintar pelo em `canvas2d` gasta três rodadas e fica com cara de pintura. Pode combinar: fundo em canvas com título em HTML por cima, na mesma página.

**Leia o guia da técnica escolhida antes de escrever código**, e `referencias/composicao-cor-luz.md` se
ainda não leu nesta conversa. Comece copiando o modelo, não do zero.

### 3. Escrever a especificação (antes do código)

Escreva no chat, curta e concreta. Sem especificação as variações saem iguais e a nota não tem com o que comparar.

- **Formato**: largura x altura em px, proporção, fundo (opaco ou transparente).
- **Composição**: regra de enquadramento (terços, centro, diagonal, moldura), onde fica cada massa, margens.
- **Ponto focal**: um só. O que o olho vê primeiro, e o que vê em segundo.
- **Paleta**: de três a cinco cores **com hex**, e o papel de cada uma (fundo, principal, apoio, acento).
- **Luz**: de onde vem (por exemplo, alto à esquerda), dura ou suave, temperatura (quente 3000 K, neutra, fria).
- **Materiais e texturas**: do que são as coisas e como isso aparece (grão, verniz, papel, chapado).
- **Tipografia** (se houver texto): o texto exato, a pilha de fontes, pesos e tamanhos.
- **Evitar**: lista do que não pode aparecer, incluindo os defeitos típicos da técnica.

### 4. Gerar de três a quatro variações

Cada variação num arquivo, em `imagens/<nome-curto>/` no projeto do usuário (`v1-a.html`, `v1-b.html`...).
Elas têm de **diferir em algo que importa**: composição, paleta ou luz. Trocar um tom de azul por outro não
é variação. Diga em uma frase o que cada uma testa. Quando só um parâmetro muda, gere as variações a partir
de um arquivo base, mudando o bloco de configuração no topo.

### 5. Renderizar e montar a folha de contato

Renderize todas, confira o JSON (tamanho certo, `erros` vazio) e monte a folha com rótulos que dizem o que
cada variação testa. Em render demorado (`webgl-shader`), faça as variações com poucas amostras e só a final
com muitas.

### 6. Olhar e dar nota (obrigatório)

Abra **a folha e cada PNG** com a ferramenta Read. Dê nota de 0 a 10 por critério, pela rubrica em
`referencias/rubrica.md`: **fidelidade ao pedido, composição, cor e luz, acabamento e defeitos,
legibilidade no tamanho de uso**. Para cada nota abaixo de 8 escreva **o defeito em termos concretos e
corrigíveis** ("a névoa é uma faixa lisa de borda a borda e parece uma barra", não "poderia melhorar").

- Seja duro. Compare com trabalho profissional do mesmo tipo, não com "para código está bom".
- Olhe em tamanho de uso: para ícone e logo, renderize também em 64, 32 e 16 px e olhe.
- Texto dentro da imagem: confira **letra por letra** contra a especificação, incluindo acentos.
- Mostre a tabela de notas ao usuário. Nota sem defeito escrito não vale.

### 7. Refazer

Pegue a melhor (ou as duas melhores) e ataque os defeitos anotados, um por um. Salve como `v2-...`, renderize,
olhe e dê nota de novo. Pare com **nota 8 ou mais em todos os critérios** ou depois de **três rodadas**.

Use o subagente `critico-de-imagem` (olhos independentes, não vê o código) **a partir da segunda rodada**
e **sempre que as suas próprias notas forem todas 8 ou mais**, que é quando você mais erra a favor.
Passe o pedido, a especificação e os caminhos dos PNGs. Se o crítico der nota menor que a sua, vale a dele.

Se depois de três rodadas ainda houver critério abaixo de 8, entregue assim mesmo e **diga qual é o defeito
que ficou**. Não esconda.

### 8. Entregar

- **O arquivo final**, em `imagens/<nome-curto>/` (PNG, e o SVG quando a técnica for `svg`).
- **A folha de contato** das variações.
- **O código-fonte** que gerou a imagem, para o usuário pedir ajustes ("deixa o céu mais roxo").
- **Antes e depois**, se foi edição (`antes-depois.mjs`). O original nunca é sobrescrito.
- A tabela de notas finais e, em uma linha, o que ficou fraco.

Se o resultado define um jeito de desenhar que vai se repetir (um personagem, uma marca, um estilo que o
usuário gostou), ofereça salvar como ficha ou estilo.

## Regras que não se quebram

1. **Nunca entregar sem ter olhado** o PNG com Read. Renderizou de novo, olhe de novo.
2. **Nunca dizer que ficou bom sem nota** pela rubrica.
3. **Texto na imagem é conferido letra por letra**. Erro de grafia derruba a nota de fidelidade para 4.
4. **Saída em `imagens/<nome-curto>/`** no projeto do usuário. Nada fora dali, nada dentro do plugin.
5. **Sem internet**: nenhuma fonte, imagem ou biblioteca remota. Tudo embutido na página.
6. **Nenhum gerador externo** (API de imagem, Canva), a menos que o usuário peça isso com todas as letras. O
   Blender instalado na máquina pode ser usado só pela técnica `blender-pelo`, com script e sem baixar nada.
7. **O original é intocável** em edição: trabalhe em cópia e entregue antes e depois.
8. **Semente fixa** em tudo que usa acaso, para a imagem poder ser refeita igual.

## Referências (leia sob demanda)

| Arquivo | Quando ler |
|---|---|
| `referencias/composicao-cor-luz.md` | Sempre, uma vez por conversa. Enquadramento, cor com hex, luz e os erros típicos de imagem feita por código |
| `referencias/rubrica.md` | No passo 6. O que é nota 4, 6, 8 e 10 em cada critério |
| `referencias/svg.md` | Logo, ícone, marca, vetor |
| `referencias/html-css.md` | Tela, diagrama, infográfico, cartaz |
| `referencias/canvas2d.md` | Ilustração e arte procedural |
| `referencias/webgl-shader.md` | Cena realista por path tracing |
| `referencias/edicao.md` | Editar e restaurar imagem existente |
| `referencias/blender-pelo.md` | Animal realista em 3D com pelo, pelo Blender |
| `referencias/estilos.md` | Escolher, aplicar e salvar estilos |
| `referencias/consistencia.md` | Fichas de personagem e de marca |

Os estilos prontos estão em `${CLAUDE_PLUGIN_ROOT}/estilos/` e os modelos em `${CLAUDE_PLUGIN_ROOT}/modelos/`.
