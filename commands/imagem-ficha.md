---
description: Cria ou usa uma ficha de consistência (personagem ou marca que reaparece igual em várias imagens)
argument-hint: [listar | criar <nome> <descrição> | usar <nome> <cena>]
---

Trabalhe com fichas de consistência da skill `gerar-imagem` (leia `referencias/consistencia.md`). O
exemplo completo está em `${CLAUDE_PLUGIN_ROOT}/modelos/ficha-exemplo/`.

As fichas ficam em `.claude/imagens/fichas/` no projeto do usuário: `<nome>.json` (a ficha), o módulo de
código (`<nome>.js` para personagem em canvas, `<nome>.svg` para marca) e `<nome>-previa.png`.

Conforme o argumento:

- **sem argumento ou `listar`**: liste as fichas do projeto com nome, tipo, descrição e parâmetros aceitos. Se não houver nenhuma, explique em três linhas o que é uma ficha e ofereça criar.
- **`criar <nome> <descrição>`**:
  1. Gere a figura pelo fluxo normal da skill (variações, olhar, nota, refazer) até a pessoa aprovar.
  2. Reescreva o desenho aprovado como função parametrizada (tudo proporcional a `tamanho`, origem no ponto de apoio, só pose e expressão variam) ou, para marca, como `<symbol>` com cores em variáveis.
  3. Escreva o `.json` com descrição, paleta, proporções, parâmetros, regras e o que não fazer.
  4. Gere a prancha de conferência com todas as poses e expressões em três tamanhos, renderize e **olhe**: é onde aparecem os defeitos de parametrização. Corrija.
  5. Salve os três arquivos e diga como pedir depois.
- **`usar <nome> <cena>`**: leia a ficha, copie o módulo para `imagens/<nome-curto>/`, desenhe a cena pedida chamando a função da ficha sem alterá-la, e siga o fluxo normal. Na nota de fidelidade, compare a figura com a prévia da ficha. Se a cena pede pose ou expressão que a ficha não tem, acrescente o parâmetro ao módulo da ficha e atualize o `.json` e a prévia.

Diga o limite quando couber: ficha funciona para figura estilizada com um conjunto fechado de poses, não
para personagem em pose livre vista de qualquer ângulo.

Argumentos: $ARGUMENTS
