#!/usr/bin/env node
// info: lê largura e altura de um ou mais PNG direto do cabeçalho, sem abrir navegador.
import { ErroImagem, lerArgs, principal, infoPng } from './lib/navegador.mjs';

const AJUDA = `info: mostra largura, altura, canal alfa e tamanho em bytes de arquivos PNG.

Uso:
  node info.mjs <arquivo.png> [outro.png ...] [--espera LxA]

Opções:
  --espera LxA   falha se algum arquivo não tiver exatamente esse tamanho (exemplo: 1024x1024)
  --ajuda        mostra este texto

Saída: uma linha JSON, por exemplo
  {"ok":true,"imagens":[{"arquivo":"...","largura":1024,"altura":1024,"bits":8,"alfa":false,"bytes":51234}]}
Código de saída: 0 certo, 1 arquivo inválido ou tamanho diferente do esperado.`;

await principal(async () => {
  const { pos, op } = lerArgs(process.argv.slice(2), ['ajuda']);
  if (op.ajuda) { console.log(AJUDA); return; }
  if (!pos.length) throw new ErroImagem('Uso: node info.mjs <arquivo.png> [outro.png ...]. Veja --ajuda.');
  const imagens = pos.map(infoPng);
  if (op.espera) {
    const m = /^(\d+)x(\d+)$/i.exec(op.espera);
    if (!m) throw new ErroImagem('--espera usa o formato LARGURAxALTURA, por exemplo 1024x1024');
    const ruins = imagens.filter((i) => i.largura !== +m[1] || i.altura !== +m[2]);
    if (ruins.length) {
      const e = new ErroImagem(`Tamanho diferente de ${op.espera}: ${ruins.map((i) => `${i.arquivo} (${i.largura}x${i.altura})`).join(', ')}`);
      e.dados = { imagens }; throw e;
    }
  }
  return { imagens };
});
