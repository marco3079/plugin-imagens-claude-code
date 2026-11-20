# Consistência: fichas de personagem e de marca

Problema: pedir "o mesmo mascote" em cinco imagens e receber cinco mascotes diferentes. Solução: a figura
deixa de ser redesenhada e passa a ser **uma função de código** com parâmetros. A ficha guarda a função e
as regras. Como é código, a figura sai idêntica todas as vezes.

Exemplo completo: `${CLAUDE_PLUGIN_ROOT}/modelos/ficha-exemplo/` (`pingo.json`, `pingo.js`,
`demonstracao.html`). Resultado em `exemplos/ficha/pingo-poses.png`.

## Onde ficam

No projeto do usuário:

```
.claude/imagens/fichas/
  pingo.json        a ficha: descrição, paleta, proporções, parâmetros, regras
  pingo.js          o módulo: a função que desenha
  pingo-previa.png  prancha com as poses, para conferir de relance
```

Antes de qualquer imagem, liste essa pasta. Se o pedido cita um nome que tem ficha, **use a ficha**. Não redesenhe.

## Formato da ficha (`<nome>.json`)

```json
{
  "nome": "pingo",
  "tipo": "personagem",
  "descricao": "Mascote em forma de gota, simpático e simples...",
  "modulo": "pingo.js",
  "funcao": "desenharPingo",
  "tecnica": "canvas2d",
  "paleta": { "corpo": "#1F7A8C", "corpoSombra": "#0E4D5C", "barriga": "#BFE3E8", "contorno": "#0B2F38" },
  "proporcoes": { "caixa": "1 de largura por 1,25 de altura, origem no centro da base" },
  "parametros": {
    "x": "centro da base, em px", "y": "base, em px", "tamanho": "largura do corpo em px",
    "pose": ["parado", "acenando", "comemorando"],
    "expressao": ["feliz", "surpreso", "piscando", "triste"],
    "viradoPara": ["direita", "esquerda"]
  },
  "regras": ["Nunca mudar as cores da paleta...", "Tamanho mínimo de 48 px de largura."],
  "naoFazer": ["Contorno preto puro", "Degradê no corpo"],
  "previa": "pingo-previa.png"
}
```

| Campo | Para quê |
|---|---|
| `nome` | Como o usuário chama a figura. É o nome do arquivo |
| `tipo` | `personagem` ou `marca` |
| `descricao` | Uma ou duas frases para reconhecer a figura sem abrir o código |
| `modulo`, `funcao` | O arquivo e a função que desenham |
| `tecnica` | `canvas2d` ou `svg` |
| `paleta` | Cores com nome de papel. O módulo usa exatamente estas |
| `proporcoes` | A caixa, a origem e as medidas que definem a figura |
| `parametros` | O que pode variar e os valores aceitos |
| `regras`, `naoFazer` | O que mantém a figura reconhecível |
| `previa` | Prancha de conferência |

## O módulo

**Personagem (canvas2d)**: um arquivo `.js` com uma função global, carregado com `<script src>`.

```js
function desenharPingo(ctx, { x, y, tamanho = 200, pose = 'parado', expressao = 'feliz', viradoPara = 'direita' } = {}) {
  ctx.save();
  ctx.translate(x, y);          // origem no centro da base: fácil de apoiar no chão de qualquer cena
  const L = tamanho;            // TODA medida é múltiplo de L. Nenhum número em px solto
  // ... sombra, braços (mudam com a pose), pés, corpo, rosto (muda com a expressão)
  ctx.restore();
}
```

Regras do módulo:

- **Tudo proporcional a `tamanho`**, inclusive o contorno. Assim a figura é a mesma a 60 ou a 600 px.
- **Origem no ponto de apoio** (centro da base), para a cena só dizer onde a figura pisa.
- **Só os parâmetros variam.** Pose mexe em membros, expressão mexe em olhos e boca. Corpo, cores e proporções são constantes.
- `save` e `restore` em volta, para não vazar estado para a cena.
- Paleta numa constante no topo, igual à da ficha.
- Valor de parâmetro desconhecido cai no padrão, não quebra.

**Marca (svg)**: um arquivo `.svg` só com `<defs>` e `<symbol>` (símbolo, símbolo reduzido, assinatura
horizontal), como em `modelos/svg-logo.svg`. Para usar, **copie os `<symbol>` para dentro do novo arquivo**
e chame com `<use href="#simbolo" x y width height>`. (Referência a `<symbol>` de outro arquivo não é
confiável em `file://`.) Em página HTML, cole o SVG embutido. A ficha de marca traz também:

```json
{
  "tipo": "marca",
  "modulo": "nascente.svg",
  "simbolos": { "simbolo": "uso geral, acima de 48 px", "simbolo-reduzido": "de 16 a 48 px" },
  "paleta": { "tinta": "#0E4D5C", "apoio": "#1F7A8C", "papel": "#F6F3EC", "acento": "#E9A23B" },
  "tipografia": { "nome": "peso 600, espaçamento -0,035 em", "pilha": "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif" },
  "areaDeProtecao": "meia largura do símbolo em toda a volta",
  "tamanhoMinimo": "símbolo com 16 px, assinatura com 120 px de largura",
  "regras": ["Sobre foto, usar só a versão negativa com fundo escurecido", "Nunca girar, esticar ou trocar as cores"]
}
```

## Criar uma ficha

1. Gere a figura pelo fluxo normal (variações, nota, refazer) até o usuário aprovar.
2. Reescreva o desenho aprovado como **função parametrizada**: troque números soltos por múltiplos de `tamanho`, separe o que varia do que é fixo.
3. Escreva o `.json`.
4. Gere a **prancha de conferência**: a figura em todas as poses e expressões, em três tamanhos, numa página só (copie `demonstracao.html`). Renderize e **olhe**: é aqui que aparecem os defeitos de parametrização (no exemplo, a ponta da gota quebrava ao virar o personagem para a esquerda, porque só uma das alças da curva seguia o lado).
5. Salve os três arquivos em `.claude/imagens/fichas/` e diga ao usuário como pedir ("use a ficha pingo").

## Usar uma ficha numa imagem nova

1. Leia o `.json` (regras, parâmetros, tamanho mínimo).
2. Copie o módulo para a pasta da imagem (`imagens/<nome-curto>/`) e carregue com `<script src="pingo.js">`. Copiar deixa a pasta da imagem independente.
3. Desenhe a cena e chame a função. Não altere o módulo para "encaixar" na cena: mude a cena.
4. A paleta da cena parte da paleta da ficha.
5. Na nota de fidelidade, compare a figura com a prévia da ficha.

Se o pedido precisa de pose ou expressão que a ficha não tem, **acrescente o parâmetro ao módulo da ficha**
(e atualize o `.json` e a prévia), em vez de redesenhar na cena. A ficha melhora com o uso.

## Limites honestos

- Funciona para figura **estilizada**: formas simples, poucas cores, poses discretas. É o caso de mascote, avatar, logo e ícone.
- Personagem em pose livre, de qualquer ângulo, com perspectiva: não. Cada vista nova é um desenho novo. Combine com o usuário um conjunto fechado de poses e vistas.
- Em `webgl-shader`, a "ficha" é o bloco de SDF e material do objeto (copie as funções `sdAlgo` e o trecho de `material`). Funciona bem para produto.
