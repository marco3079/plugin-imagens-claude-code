#!/usr/bin/env node
// antes-depois: coloca duas imagens lado a lado (ou uma sobre a outra) com rótulos.
import path from 'node:path';
import { ErroImagem, lerArgs, numero, principal } from './lib/navegador.mjs';
import { conferirImagens, fotografarPrancha, detalhePng } from './lib/prancha.mjs';

const AJUDA = `antes-depois: duas imagens lado a lado, na mesma altura, com rótulos.

Uso:
  node antes-depois.mjs <antes> <depois> <saida.png> [opções]

Opções:
  --rotulos LISTA  dois rótulos separados por vírgula (padrão: Antes,Depois)
  --altura PX      altura de cada imagem na prancha (padrão 768)
  --vertical       empilha em vez de pôr lado a lado
  --titulo TEXTO   título no alto
  --fundo COR      escuro (padrão) ou claro
  --ajuda          mostra este texto

Aceita qualquer formato que o navegador abre (png, jpg, webp, gif, svg).
Saída: uma linha JSON com saida, largura e altura.
Código de saída: 0 certo, diferente de 0 em erro.`;

await principal(async () => {
  const { pos, op } = lerArgs(process.argv.slice(2), ['ajuda', 'vertical']);
  if (op.ajuda) { console.log(AJUDA); return; }
  if (pos.length !== 3) throw new ErroImagem('Uso: node antes-depois.mjs <antes> <depois> <saida.png>. Veja --ajuda.');
  const [antes, depois, saida] = pos;
  if (path.extname(saida).toLowerCase() !== '.png') throw new ErroImagem('A saída precisa terminar em .png');
  conferirImagens([antes, depois]);
  const rot = (op.rotulos || 'Antes,Depois').split(',').map((s) => s.trim());
  if (rot.length !== 2) throw new ErroImagem('--rotulos precisa de exatamente dois nomes separados por vírgula');
  const altura = Math.round(numero(op.altura, 'altura', 768));
  const itens = [antes, depois].map((arquivo, i) => ({ arquivo, rotulo: rot[i], detalhe: detalhePng(arquivo) }));
  return fotografarPrancha({ itens, saida, colunas: op.vertical ? 1 : 2, celulaA: altura, titulo: op.titulo, fundo: op.fundo || 'escuro', imagemInteira: true });
});
