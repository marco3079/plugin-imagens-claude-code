// Biblioteca comum dos scripts: acha o navegador, controla por CDP em pipe e lê PNG.
// Sem dependências npm. Node 18+.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export class ErroImagem extends Error {}

// ---------------------------------------------------------------- argumentos
export function lerArgs(argv, booleanas = []) {
  const pos = [];
  const op = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [chave, embutido] = a.slice(2).split(/=(.*)/s);
      if (booleanas.includes(chave)) op[chave] = true;
      else if (embutido !== undefined) op[chave] = embutido;
      else if (i + 1 < argv.length) op[chave] = argv[++i];
      else throw new ErroImagem(`Falta o valor de --${chave}`);
    } else pos.push(a);
  }
  return { pos, op };
}

export function numero(v, nome, padrao) {
  if (v === undefined) return padrao;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new ErroImagem(`--${nome} precisa ser um número maior que zero (veio "${v}")`);
  return n;
}

// Roda a função principal de um script: imprime uma linha JSON e define o código de saída.
export async function principal(fn) {
  try {
    const r = await fn();
    if (r !== undefined) console.log(JSON.stringify({ ok: true, ...r }));
  } catch (e) {
    const conhecido = e instanceof ErroImagem;
    console.log(JSON.stringify({ ok: false, erro: conhecido ? e.message : String(e && e.stack || e), ...(e.dados || {}) }));
    process.exitCode = conhecido ? (e.codigo || 1) : 3;
  }
}

// ---------------------------------------------------------------- PNG
export function infoPng(arquivo) {
  let fd;
  try { fd = fs.openSync(arquivo, 'r'); } catch { throw new ErroImagem(`Arquivo não encontrado: ${arquivo}`); }
  const b = Buffer.alloc(33);
  const lidos = fs.readSync(fd, b, 0, 33, 0);
  const bytes = fs.fstatSync(fd).size;
  fs.closeSync(fd);
  const assinatura = '89504e470d0a1a0a';
  if (lidos < 33 || b.subarray(0, 8).toString('hex') !== assinatura || b.subarray(12, 16).toString('latin1') !== 'IHDR') {
    throw new ErroImagem(`Não é um PNG válido: ${arquivo}`);
  }
  const tipo = b[25];
  return {
    arquivo: path.resolve(arquivo),
    largura: b.readUInt32BE(16),
    altura: b.readUInt32BE(20),
    bits: b[24],
    alfa: tipo === 4 || tipo === 6,
    bytes,
  };
}

// ---------------------------------------------------------------- navegador
const NOMES_LINUX = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge', 'microsoft-edge-stable', 'brave-browser'];

function candidatos() {
  const c = [];
  if (process.platform === 'win32') {
    const bases = [process.env['PROGRAMFILES(X86)'], process.env.PROGRAMFILES, process.env.LOCALAPPDATA].filter(Boolean);
    const rel = ['Microsoft\\Edge\\Application\\msedge.exe', 'Google\\Chrome\\Application\\chrome.exe', 'Chromium\\Application\\chrome.exe', 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'];
    for (const r of rel) for (const b of bases) c.push(path.join(b, r));
  } else if (process.platform === 'darwin') {
    for (const raiz of ['/Applications', path.join(os.homedir(), 'Applications')]) {
      c.push(`${raiz}/Google Chrome.app/Contents/MacOS/Google Chrome`, `${raiz}/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`, `${raiz}/Chromium.app/Contents/MacOS/Chromium`, `${raiz}/Brave Browser.app/Contents/MacOS/Brave Browser`);
    }
  } else {
    const dirs = (process.env.PATH || '').split(':').filter(Boolean).concat(['/snap/bin', '/usr/bin', '/usr/local/bin', '/opt/google/chrome', '/opt/microsoft/msedge']);
    for (const n of NOMES_LINUX) for (const d of dirs) c.push(path.join(d, n));
  }
  return c;
}

export function acharNavegador() {
  const env = process.env.IMAGENS_NAVEGADOR;
  if (env) {
    if (fs.existsSync(env)) return env;
    throw new ErroImagem(`IMAGENS_NAVEGADOR aponta para um arquivo que não existe: ${env}`);
  }
  for (const c of candidatos()) if (fs.existsSync(c)) return c;
  throw new ErroImagem(
    'Nenhum navegador encontrado. Instale o Microsoft Edge, o Google Chrome ou o Chromium, ' +
    'ou defina a variável IMAGENS_NAVEGADOR com o caminho completo do executável.'
  );
}

export function argsNavegador({ gpu = 'auto', perfil }) {
  const a = [
    '--headless=new',
    '--remote-debugging-pipe',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-component-update',
    '--mute-audio',
    '--force-color-profile=srgb',
    // Sem isto, uma página file:// não lê pixels de imagem local (canvas "tainted").
    '--allow-file-access-from-files',
    // Sem isto, o navegador pausa requestAnimationFrame e timers de página sem janela.
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    `--user-data-dir=${perfil}`,
  ];
  if (gpu === 'software') a.push('--use-angle=swiftshader', '--enable-unsafe-swiftshader');
  else if (gpu === 'desligada') a.push('--disable-gpu');
  else if (gpu !== 'auto') throw new ErroImagem(`--gpu aceita auto, software ou desligada (veio "${gpu}")`);
  const semSandbox = process.env.IMAGENS_SEM_SANDBOX === '1' || (process.platform === 'linux' && process.getuid && process.getuid() === 0);
  if (semSandbox) a.push('--no-sandbox');
  a.push('about:blank');
  return a;
}

// Sessão de navegador controlada pelo protocolo DevTools sobre pipe (descritores 3 e 4).
export class Navegador {
  static async abrir({ gpu = 'auto' } = {}) {
    const n = new Navegador();
    n.exe = acharNavegador();
    n.perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'imagens-perfil-'));
    n.proc = spawn(n.exe, argsNavegador({ gpu, perfil: n.perfil }), { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'], windowsHide: true });
    n.id = 0;
    n.pendentes = new Map();
    n.ouvintes = [];
    n.morto = null;
    let buf = Buffer.alloc(0);
    n.proc.stdio[4].on('data', (d) => {
      buf = buf.length ? Buffer.concat([buf, d]) : d;
      let i;
      while ((i = buf.indexOf(0)) >= 0) {
        let m;
        try { m = JSON.parse(buf.subarray(0, i).toString('utf8')); } catch { m = null; }
        buf = buf.subarray(i + 1);
        if (!m) continue;
        if (m.id && n.pendentes.has(m.id)) {
          const { ok, falha, metodo } = n.pendentes.get(m.id);
          n.pendentes.delete(m.id);
          if (m.error) falha(new ErroImagem(`Navegador recusou ${metodo}: ${m.error.message}`));
          else ok(m.result);
        } else if (m.method) for (const o of n.ouvintes) o(m);
      }
    });
    const morrer = (motivo) => {
      if (n.morto) return;
      n.morto = motivo;
      for (const { falha } of n.pendentes.values()) falha(new ErroImagem(motivo));
      n.pendentes.clear();
    };
    n.proc.on('error', (e) => morrer(`Não foi possível iniciar o navegador (${n.exe}): ${e.message}`));
    n.proc.on('exit', (c) => morrer(`O navegador fechou antes da hora (código ${c}).`));
    n.proc.stdio[3].on('error', () => {});
    return n;
  }

  enviar(metodo, params = {}, sessionId) {
    if (this.morto) return Promise.reject(new ErroImagem(this.morto));
    return new Promise((ok, falha) => {
      const id = ++this.id;
      this.pendentes.set(id, { ok, falha, metodo });
      this.proc.stdio[3].write(JSON.stringify({ id, method: metodo, params, sessionId }) + '\0');
    });
  }

  async novaPagina() {
    const { targetId } = await this.enviar('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await this.enviar('Target.attachToTarget', { targetId, flatten: true });
    const pg = new Pagina(this, sessionId);
    await pg.cmd('Page.enable');
    await pg.cmd('Runtime.enable');
    return pg;
  }

  async fechar() {
    try { await Promise.race([this.enviar('Browser.close'), dormir(1500)]); } catch {}
    await Promise.race([new Promise((r) => this.proc.once('exit', r)), dormir(2500)]);
    if (this.proc.exitCode === null) { try { this.proc.kill(); } catch {} }
    for (let i = 0; i < 6; i++) {
      try { fs.rmSync(this.perfil, { recursive: true, force: true }); break; } catch { await dormir(250); }
    }
  }
}

export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const cortar = (s, n = 400) => (s.length > n ? s.slice(0, n) + '…' : s);

export class Pagina {
  constructor(nav, sessionId) {
    this.nav = nav;
    this.sessionId = sessionId;
    this.console = [];
    this.erros = [];
    this.carregou = false;
    nav.ouvintes.push((m) => {
      if (m.sessionId !== sessionId) return;
      if (m.method === 'Page.loadEventFired') this.carregou = true;
      else if (m.method === 'Runtime.consoleAPICalled') {
        const txt = m.params.args.map((a) => (a.value !== undefined ? String(a.value) : a.description || a.type)).join(' ');
        if (m.params.type === 'error') this.erros.push(cortar(txt));
        else if (this.console.length < 30) this.console.push(cortar(`${m.params.type}: ${txt}`));
      } else if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        const desc = (d.exception && (d.exception.description || d.exception.value)) || d.text;
        this.erros.push(cortar(`${desc} (linha ${d.lineNumber + 1})`));
      }
    });
  }

  cmd(metodo, params = {}) { return this.nav.enviar(metodo, params, this.sessionId); }

  async avaliar(expressao) {
    const r = await this.cmd('Runtime.evaluate', { expression: expressao, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new ErroImagem(`Erro ao avaliar na página: ${(d.exception && d.exception.description) || d.text}`);
    }
    return r.result.value;
  }

  async tamanho(largura, altura, escala = 1) {
    await this.cmd('Emulation.setDeviceMetricsOverride', { width: Math.round(largura), height: Math.round(altura), deviceScaleFactor: escala, mobile: false });
  }

  async transparente() {
    await this.cmd('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  }

  // Abre um arquivo local e espera a página ficar pronta.
  // Contrato: se a página declarar window.IMAGEM_PRONTA = false, espera até virar true.
  // Se não declarar, considera pronta depois do load, das fontes e de dois quadros.
  async abrirArquivo(arquivo, { limiteS = 120, esperaMs = 0 } = {}) {
    const abs = path.resolve(arquivo);
    if (!fs.existsSync(abs)) throw new ErroImagem(`Arquivo de entrada não encontrado: ${abs}`);
    this.carregou = false;
    const nav = await this.cmd('Page.navigate', { url: pathToFileURL(abs).href });
    if (nav.errorText) throw new ErroImagem(`O navegador não abriu ${abs}: ${nav.errorText}`);
    const fim = Date.now() + limiteS * 1000;
    const estourou = (oque) => {
      const e = new ErroImagem(`Tempo esgotado (${limiteS} s) esperando ${oque}. Aumente --limite ou confira se a página define window.IMAGEM_PRONTA = true ao terminar.`);
      e.dados = { console: this.console, erros: this.erros };
      return e;
    };
    while (!this.carregou) {
      if (Date.now() > fim) throw estourou('o carregamento da página');
      await dormir(25);
    }
    await this.avaliar(`(async()=>{ if (document.fonts && document.fonts.ready) await document.fonts.ready;
      await Promise.all([...document.images].map(i => i.decode ? i.decode().catch(()=>{}) : 0)); })()`);
    for (;;) {
      const estado = await this.avaliar(`(()=>{ const p = window.IMAGEM_PRONTA; return p === undefined ? (document.title === 'pronto' ? 'sim' : 'livre') : (p ? 'sim' : 'nao'); })()`);
      if (estado !== 'nao') break;
      if (Date.now() > fim) throw estourou('window.IMAGEM_PRONTA virar true');
      await dormir(40);
    }
    if (esperaMs > 0) await dormir(esperaMs);
    // Dois quadros com limite de tempo: garante que o que foi desenhado chegou à tela.
    await this.avaliar(`new Promise(r => { const t = setTimeout(r, 400); requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(t); r(); })); })`);
  }

  async capturar(saida, { recorte } = {}) {
    const p = { format: 'png', captureBeyondViewport: false };
    if (recorte) p.clip = { ...recorte, scale: 1 };
    const { data } = await this.cmd('Page.captureScreenshot', p);
    fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
    fs.writeFileSync(saida, Buffer.from(data, 'base64'));
  }

  // Salva os pixels exatos de um <canvas> (sem passar pela captura de tela).
  async salvarCanvas(seletor, saida) {
    const url = await this.avaliar(`(()=>{ const c = document.querySelector(${JSON.stringify(seletor)});
      if (!c || !c.toDataURL) return 'ERRO: nenhum canvas em ' + ${JSON.stringify(seletor)};
      try { return c.toDataURL('image/png'); } catch (e) { return 'ERRO: ' + e.message; } })()`);
    if (!url.startsWith('data:image/png;base64,')) throw new ErroImagem(`Não foi possível ler o canvas: ${url}`);
    fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
    fs.writeFileSync(saida, Buffer.from(url.slice(22), 'base64'));
  }
}

// Modo de reserva, sem CDP: uma chamada do navegador com --screenshot.
// Não espera window.IMAGEM_PRONTA; requestAnimationFrame quase não roda. Serve para página estática.
export function capturaSimples(entrada, saida, { largura, altura, escala = 1, transparente = false, esperaMs = 3000 }) {
  const exe = acharNavegador();
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'imagens-perfil-'));
  const a = ['--headless=new', '--hide-scrollbars', '--no-first-run', '--allow-file-access-from-files', '--force-color-profile=srgb',
    `--user-data-dir=${perfil}`, `--window-size=${largura},${altura}`, `--force-device-scale-factor=${escala}`,
    `--virtual-time-budget=${esperaMs}`, `--screenshot=${path.resolve(saida)}`];
  if (transparente) a.push('--default-background-color=00000000');
  a.push(pathToFileURL(path.resolve(entrada)).href);
  const r = spawnSync(exe, a, { stdio: 'ignore', timeout: 120000, windowsHide: true });
  try { fs.rmSync(perfil, { recursive: true, force: true }); } catch {}
  if (r.error) throw new ErroImagem(`Falha ao rodar o navegador: ${r.error.message}`);
  return exe;
}

export function escaparHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
