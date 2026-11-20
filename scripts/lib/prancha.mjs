// Monta uma prancha (página HTML temporária com imagens e rótulos) e fotografa pelo navegador.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Navegador, ErroImagem, infoPng, escaparHtml } from './navegador.mjs';

export function conferirImagens(arquivos) {
  for (const a of arquivos) if (!fs.existsSync(a)) throw new ErroImagem(`Imagem não encontrada: ${path.resolve(a)}`);
}

const CSS = `
*{box-sizing:border-box}
html,body{margin:0}
body{font:15px/1.3 "Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;padding:24px;width:max-content}
body.escuro{background:#17181b;color:#e9e9ec}
body.claro{background:#f3f2ef;color:#1d1d20}
h1{font-size:20px;font-weight:600;margin:0 0 18px}
.grade{display:grid;gap:20px}
figure{margin:0}
.quadro{display:flex;align-items:center;justify-content:center;
  background:repeating-conic-gradient(#8883 0 25%,#0000 0 50%) 0 0/20px 20px;outline:1px solid #8886}
.quadro img{display:block;max-width:100%;max-height:100%}
figcaption{display:flex;gap:10px;align-items:baseline;margin-top:8px}
figcaption b{font-size:17px}
figcaption span{opacity:.65;font-size:13px;font-variant-numeric:tabular-nums}
`;

// itens: [{ arquivo, rotulo, detalhe }]
export async function fotografarPrancha({ itens, saida, colunas, celulaL, celulaA, titulo, fundo = 'escuro', imagemInteira = false }) {
  if (!['escuro', 'claro'].includes(fundo)) throw new ErroImagem('--fundo aceita escuro ou claro');
  const figuras = itens.map((it) => {
    const estilo = imagemInteira ? '' : ` style="width:${celulaL}px;height:${celulaA}px"`;
    const img = imagemInteira ? `<img src="${pathToFileURL(path.resolve(it.arquivo)).href}" style="height:${celulaA}px;width:auto;max-width:none;max-height:none">`
      : `<img src="${pathToFileURL(path.resolve(it.arquivo)).href}">`;
    return `<figure><div class="quadro"${estilo}>${img}</div><figcaption><b>${escaparHtml(it.rotulo)}</b><span>${escaparHtml(it.detalhe || '')}</span></figcaption></figure>`;
  }).join('\n');
  const coluna = imagemInteira ? 'max-content' : `${celulaL}px`;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}</style></head>
<body class="${fundo}">${titulo ? `<h1>${escaparHtml(titulo)}</h1>` : ''}
<div class="grade" style="grid-template-columns:repeat(${colunas},${coluna})">
${figuras}
</div></body></html>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'imagens-prancha-'));
  const pagina = path.join(tmp, 'prancha.html');
  fs.writeFileSync(pagina, html);
  const nav = await Navegador.abrir({});
  try {
    const pg = await nav.novaPagina();
    await pg.tamanho(1200, 800, 1);
    await pg.abrirArquivo(pagina, { limiteS: 60 });
    const quebradas = await pg.avaliar(`[...document.images].filter(i => !i.naturalWidth).map(i => i.src)`);
    if (quebradas.length) throw new ErroImagem(`O navegador não conseguiu abrir: ${quebradas.join(', ')}`);
    const caixa = await pg.avaliar(`(()=>{ const r = document.body.getBoundingClientRect(); return { w: Math.ceil(r.width), h: Math.ceil(r.height) }; })()`);
    await pg.tamanho(caixa.w, caixa.h, 1);
    await pg.avaliar(`new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    await pg.capturar(saida);
    const i = infoPng(saida);
    return { saida: i.arquivo, largura: i.largura, altura: i.altura, bytes: i.bytes };
  } finally {
    await nav.fechar();
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  }
}

export function detalhePng(arquivo) {
  try { const i = infoPng(arquivo); return `${i.largura}x${i.altura}`; } catch { return ''; }
}
