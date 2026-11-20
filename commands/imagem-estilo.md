---
description: Lista, mostra ou salva estilos de imagem (do plugin e do projeto)
argument-hint: [listar | mostrar <estilo> | salvar <nome>]
---

Trabalhe com a biblioteca de estilos da skill `gerar-imagem` (leia `referencias/estilos.md`).

Os estilos ficam em dois lugares: `.claude/imagens/estilos/*.md` no projeto do usuário (têm prioridade) e
`${CLAUDE_PLUGIN_ROOT}/estilos/*.md` no plugin.

Conforme o argumento:

- **sem argumento ou `listar`**: liste as duas pastas e mostre uma tabela com nome, técnica e para que serve, lendo o cabeçalho de cada arquivo. Marque quais são do usuário.
- **`mostrar <estilo>`**: leia o arquivo do estilo, resuma paleta (com os hex), luz, textura, traço e regras, e ofereça gerar uma amostra de 800 x 600 com um assunto neutro. Se a pessoa aceitar, gere pelo fluxo da skill com uma variação só, olhando e dando nota.
- **`salvar <nome>`**: crie um estilo do usuário em `.claude/imagens/estilos/<id>.md`, no formato descrito em `referencias/estilos.md`. Se houver uma imagem aprovada nesta conversa, extraia dela a paleta real, a luz, a textura, o traço e as decisões de composição, e use um trecho real do código como exemplo. Se não houver, pergunte (num único conjunto de perguntas) para que serve, quais cores, que luz e textura, e o que evitar. Confirme o nome e a descrição antes de gravar.

Nunca altere os estilos dentro da pasta do plugin. Para mudar um estilo do plugin, salve uma cópia com o
mesmo `id` na pasta do projeto: ela passa a valer no lugar da original.

Argumentos: $ARGUMENTS
