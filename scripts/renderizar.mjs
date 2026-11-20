#!/usr/bin/env node
// renderizar: transforma uma página .html ou um .svg em PNG usando o navegador da máquina.
import fs from 'node:fs';
import path from 'node:path';
import { Navegador, ErroImagem, lerArgs, numero, principal, infoPng, capturaSimples } from './lib/navegador.mjs';

const AJUDA = `renderizar: página .html ou .svg para PNG, com o Edge, Chrome ou Chromium da máquina.

Uso:
  node renderizar.mjs <entrada.html|entrada.svg> <saida.png> [opções]
  node renderizar.mjs --diagnostico

Opções:
  --largura N        largura da página em px CSS (padrão 1024; em .svg, a do próprio arquivo)
  --altura N         altura da página em px CSS (padrão 1024; em .svg, a do próprio arquivo)
  --escala N         multiplicador de pixels (2 gera o dobro em cada lado). Padrão 1
  --transparente     fundo transparente (a página não pode pintar o fundo)
  --canvas SELETOR   salva os pixels exatos desse <canvas> em vez de fotografar a página
  --seletor SELETOR  recorta a captura na caixa desse elemento
  --espera MS        espera extra depois de a página ficar pronta. Padrão 0
  --limite S         tempo máximo de espera em segundos. Padrão 120
  --gpu MODO         auto (padrão), software (SwiftShader) ou desligada
  --modo simples     reserva sem controle fino: uma chamada com --screenshot
  --tolerar-erros    não falha quando a página lança erro de JavaScript
  --ajuda            mostra este texto

Sinal de pronto: a página que desenha aos poucos declara  window.IMAGEM_PRONTA = false  no começo
e  window.IMAGEM_PRONTA = true  quando termina. Sem essa variável, a captura sai depois do load,
das fontes e de dois quadros.

Navegador: variável IMAGENS_NAVEGADOR (caminho do executável) tem prioridade sobre a busca automática.

Saída: uma linha JSON, por exemplo
  {"ok":true,"saida":"...","largura":1024,"altura":1024,"alfa":false,"ms":900,"console":[],"erros":[]}
Código de saída: 0 certo, 1 erro de uso ou de ambiente, 2 a página lançou erro, 3 falha inesperada.`;

async function diagnostico(gpu) {
  const nav = await Navegador.abrir({ gpu });
  try {
    const versao = await nav.enviar('Browser.getVersion');
    const pg = await nav.novaPagina();
    const webgl = await pg.avaliar(`(()=>{ const r = {};
      for (const t of ['webgl2','webgl']) { const c = document.createElement('canvas'); const gl = c.getContext(t);
        if (!gl) { r[t] = null; continue; }
        const e = gl.getExtension('WEBGL_debug_renderer_info');
        r[t] = { placa: e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'desconhecida', texturaMax: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          floatRender: t === 'webgl2' ? !!gl.getExtension('EXT_color_buffer_float') : !!gl.getExtension('WEBGL_color_buffer_float') }; }
      return r; })()`);
    return { navegador: nav.exe, versao: versao.product, plataforma: process.platform, node: process.version, webgl };
  } finally { await nav.fechar(); }
}

await principal(async () => {
  const { pos, op } = lerArgs(process.argv.slice(2), ['ajuda', 'transparente', 'diagnostico', 'tolerar-erros']);
  if (op.ajuda) { console.log(AJUDA); return; }
  if (op.diagnostico) return diagnostico(op.gpu || "auto");
  if (pos.length !== 2) throw new ErroImagem('Uso: node renderizar.mjs <entrada.html|entrada.svg> <saida.png> [opções]. Veja --ajuda.');
  const [entrada, saida] = pos;
  const ext = path.extname(entrada).toLowerCase();
  if (!['.html', '.htm', '.svg'].includes(ext)) throw new ErroImagem(`Entrada precisa ser .html ou .svg (veio "${ext || 'sem extensão'}")`);
  if (path.extname(saida).toLowerCase() !== '.png') throw new ErroImagem('A saída precisa terminar em .png');
  if (!fs.existsSync(entrada)) throw new ErroImagem(`Arquivo de entrada não encontrado: ${path.resolve(entrada)}`);
  const escala = numero(op.escala, 'escala', 1);
  const limiteS = numero(op.limite, 'limite', 120);
  const esperaMs = op.espera === undefined ? 0 : Number(op.espera);
  let largura = numero(op.largura, 'largura', undefined);
  let altura = numero(op.altura, 'altura', undefined);
  const t0 = Date.now();

  if (op.modo === 'simples') {
    largura ??= 1024; altura ??= 1024;
    const exe = capturaSimples(entrada, saida, { largura, altura, escala, transparente: !!op.transparente, esperaMs: esperaMs || 3000 });
    if (!fs.existsSync(saida)) throw new ErroImagem('O navegador não gravou a imagem no modo simples.');
    const i = infoPng(saida);
    return { saida: i.arquivo, largura: i.largura, altura: i.altura, alfa: i.alfa, ms: Date.now() - t0, modo: 'simples', navegador: exe };
  }
  if (op.modo !== undefined) throw new ErroImagem('--modo só aceita "simples"');

  const nav = await Navegador.abrir({ gpu: op.gpu || 'auto' });
  try {
    const pg = await nav.novaPagina();
    await pg.tamanho(largura || 1024, altura || 1024, escala);
    if (op.transparente) await pg.transparente();
    await pg.abrirArquivo(entrada, { limiteS, esperaMs });

    if (ext === '.svg') {
      // Tamanho natural do SVG quando o usuário não informa, e SVG esticado na página inteira.
      const nat = await pg.avaliar(`(()=>{ const s = document.documentElement; const vb = s.viewBox && s.viewBox.baseVal;
        const w = parseFloat(s.getAttribute('width')) || (vb && vb.width) || 0; const h = parseFloat(s.getAttribute('height')) || (vb && vb.height) || 0;
        return { w, h }; })()`);
      if (!largura && !altura) { largura = nat.w || 1024; altura = nat.h || 1024; }
      else if (!altura) altura = nat.w ? Math.round(largura * nat.h / nat.w) : largura;
      else if (!largura) largura = nat.h ? Math.round(altura * nat.w / nat.h) : altura;
      await pg.tamanho(largura, altura, escala);
      await pg.avaliar(`(()=>{ const s = document.documentElement; s.setAttribute('width','100%'); s.setAttribute('height','100%'); })()`);
      await pg.avaliar(`new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    } else { largura ??= 1024; altura ??= 1024; }

    let esperado = { largura: Math.round(largura * escala), altura: Math.round(altura * escala) };
    if (op.canvas) {
      await pg.salvarCanvas(op.canvas, saida);
      esperado = null;
    } else if (op.seletor) {
      const caixa = await pg.avaliar(`(()=>{ const e = document.querySelector(${JSON.stringify(op.seletor)}); if (!e) return null;
        const r = e.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; })()`);
      if (!caixa || !caixa.width || !caixa.height) throw new ErroImagem(`Nenhum elemento visível para --seletor ${op.seletor}`);
      await pg.capturar(saida, { recorte: caixa });
      esperado = { largura: Math.round(caixa.width * escala), altura: Math.round(caixa.height * escala) };
    } else {
      await pg.capturar(saida);
    }

    const i = infoPng(saida);
    const r = { saida: i.arquivo, largura: i.largura, altura: i.altura, alfa: i.alfa, bytes: i.bytes, ms: Date.now() - t0, console: pg.console, erros: pg.erros };
    if (esperado && (Math.abs(i.largura - esperado.largura) > 1 || Math.abs(i.altura - esperado.altura) > 1)) {
      const e = new ErroImagem(`O PNG saiu com ${i.largura}x${i.altura}, mas o pedido era ${esperado.largura}x${esperado.altura}.`);
      e.dados = r; throw e;
    }
    if (pg.erros.length && !op['tolerar-erros']) {
      const e = new ErroImagem(`A página lançou erro: ${pg.erros[0]}`);
      e.codigo = 2; e.dados = r; throw e;
    }
    return r;
  } finally { await nav.fechar(); }
});
