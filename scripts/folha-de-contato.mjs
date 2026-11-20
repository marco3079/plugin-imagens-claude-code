#!/usr/bin/env node
// folha-de-contato: junta várias imagens numa folha rotulada, para comparar variações de uma vez.
import path from 'node:path';
import { ErroImagem, lerArgs, numero, principal } from './lib/navegador.mjs';
import { conferirImagens, fotografarPrancha, detalhePng } from './lib/prancha.mjs';

const AJUDA = `folha-de-contato: junta N imagens numa folha com rótulos (A, B, C...).

Uso:
  node folha-de-contato.mjs <saida.png> <img1> <img2> [img3 ...] [opções]

Opções:
  --colunas N      colunas da grade (padrão: 2 até 4 imagens, 3 até 9, depois 4)
  --celula PX      lado maior de cada célula em px (padrão 512)
  --rotulos LISTA  rótulos separados por vírgula (padrão: A, B, C... mais o nome do arquivo)
  --titulo TEXTO   título no alto da folha
  --fundo COR      escuro (padrão) ou claro
  --ajuda          mostra este texto

As células seguem a proporção da primeira imagem. Fundo transparente aparece como xadrez.
Saída: uma linha JSON com saida, largura, altura e a lista de itens.
Código de saída: 0 certo, diferente de 0 em erro.`;

await principal(async () => {
  const { pos, op } = lerArgs(process.argv.slice(2), ['ajuda']);
  if (op.ajuda) { console.log(AJUDA); return; }
  if (pos.length < 2) throw new ErroImagem('Uso: node folha-de-contato.mjs <saida.png> <img1> [img2 ...]. Veja --ajuda.');
  const [saida, ...imagens] = pos;
  if (path.extname(saida).toLowerCase() !== '.png') throw new ErroImagem('A saída precisa terminar em .png');
  conferirImagens(imagens);
  const n = imagens.length;
  const colunas = Math.round(numero(op.colunas, 'colunas', n <= 4 ? Math.min(n, 2) : n <= 9 ? 3 : 4));
  const lado = numero(op.celula, 'celula', 512);
  let prop = 1;
  const d0 = /^(\d+)x(\d+)$/.exec(detalhePng(imagens[0]));
  if (d0) prop = +d0[1] / +d0[2];
  const celulaL = Math.round(prop >= 1 ? lado : lado * prop);
  const celulaA = Math.round(prop >= 1 ? lado / prop : lado);
  const dados = op.rotulos ? op.rotulos.split(',').map((s) => s.trim()) : [];
  const itens = imagens.map((arquivo, i) => ({
    arquivo,
    rotulo: dados[i] || String.fromCharCode(65 + (i % 26)),
    detalhe: [dados[i] ? '' : path.basename(arquivo), detalhePng(arquivo)].filter(Boolean).join('  '),
  }));
  const r = await fotografarPrancha({ itens, saida, colunas, celulaL, celulaA, titulo: op.titulo, fundo: op.fundo || 'escuro' });
  return { ...r, itens: itens.map((i) => ({ rotulo: i.rotulo, arquivo: path.resolve(i.arquivo) })) };
});
