---
description: Edita ou restaura uma imagem que já existe, por código, preservando o original
argument-hint: <arquivo da imagem> <o que fazer>
---

Use a skill `gerar-imagem` deste plugin com a técnica `edicao` (leia `referencias/edicao.md`).

O primeiro argumento é o caminho da imagem. O resto é o que fazer com ela. Se faltar o arquivo ou a
instrução, pergunte.

Passos:

1. Abra a imagem com Read e escreva o diagnóstico: o que está errado, em ordem de gravidade. Confira o tamanho com `scripts/info.mjs` se for PNG.
2. Copie o original para `imagens/<nome-curto>/` sem alterar. Nunca sobrescreva o arquivo do usuário.
3. Copie `modelos/edicao.html`, aponte `ENTRADA` para a cópia e monte a lista `OPERACOES` na ordem certa: defeitos, ruído, tom e cor, nitidez por último.
4. Renderize com `--canvas "#tela"`, monte o antes e depois com `scripts/antes-depois.mjs` e **abra os dois com Read**.
5. Dê nota pela rubrica. Em edição, fidelidade é "fez o que foi pedido e só o que foi pedido". Ajuste os parâmetros e repita, até nota 8 ou três rodadas.
6. Entregue a imagem editada, o antes e depois, o arquivo de edição (para novos ajustes) e, em uma linha, o que não deu para recuperar.

Diga com clareza o que esta técnica não faz: inventar área grande que falta, reconstruir rosto, aumentar
resolução de verdade.

Argumentos: $ARGUMENTS
