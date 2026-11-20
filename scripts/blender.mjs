#!/usr/bin/env node
// Roda um script Python do Blender em segundo plano e devolve UMA linha JSON.
// Uso: node blender.mjs modelo.py saida.png [--lado 1200] [--amostras 200] [--filhos 45] [--limite 900]
//      node blender.mjs --diagnostico
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const sair = (obj, codigo = 0) => { console.log(JSON.stringify(obj)); process.exit(codigo); };
if (args.includes('--ajuda') || args.includes('--help')) {
  console.log(`Roda um script do Blender sem janela e devolve uma linha JSON.

  node blender.mjs modelo.py saida.png [opções]
  node blender.mjs --diagnostico         mostra onde procurou o Blender

Opções:
  --lado N       lado da imagem em px (padrão 1200)
  --amostras N   amostras do Cycles (padrão 200; use 40 em teste)
  --filhos N     fios filhos por fio guia (padrão 45; use 20 em teste)
  --limite S     segundos até desistir (padrão 900)

O script recebe, depois de "--": saida.png lado amostras filhos.
Defina IMAGENS_BLENDER com o caminho do executável se ele não for encontrado.`);
  process.exit(0);
}

function candidatos() {
  const c = [];
  if (process.env.IMAGENS_BLENDER) c.push(process.env.IMAGENS_BLENDER);
  if (process.platform === 'win32') {
    for (const base of [process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter(Boolean)) {
      const bf = path.join(base, 'Blender Foundation');
      try { for (const d of fs.readdirSync(bf).sort().reverse()) c.push(path.join(bf, d, 'blender.exe')); } catch {}
      c.push(path.join(base, 'Steam', 'steamapps', 'common', 'Blender', 'blender.exe'));
    }
  } else if (process.platform === 'darwin') {
    c.push('/Applications/Blender.app/Contents/MacOS/Blender');
    if (process.env.HOME) c.push(path.join(process.env.HOME, 'Library/Application Support/Steam/steamapps/common/Blender/Blender.app/Contents/MacOS/Blender'));
  } else {
    c.push('/usr/bin/blender', '/usr/local/bin/blender', '/snap/bin/blender');
    if (process.env.HOME) c.push(path.join(process.env.HOME, '.steam/steam/steamapps/common/Blender/blender'));
  }
  return c;
}
function acharBlender() {
  const tentados = candidatos();
  for (const p of tentados) { try { if (fs.statSync(p).isFile()) return { exe: p, tentados }; } catch {} }
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['blender'], { encoding: 'utf8' });
  const linha = (r.stdout || '').split(/\r?\n/).find((l) => l.trim());
  if (r.status === 0 && linha) return { exe: linha.trim(), tentados };
  return { exe: null, tentados };
}

const achado = acharBlender();
if (args.includes('--diagnostico')) sair({ ok: !!achado.exe, blender: achado.exe, tentados: achado.tentados });
if (!achado.exe) sair({ ok: false, erro: 'Blender não encontrado. Instale o Blender ou defina IMAGENS_BLENDER com o caminho do executável.', tentados: achado.tentados }, 3);

const opc = (nome, padrao) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : padrao; };
const soltos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (soltos.length < 2) sair({ ok: false, erro: 'Informe o script .py e o PNG de saída. Veja --ajuda.' }, 1);
const script = path.resolve(soltos[0]);
const saida = path.resolve(soltos[1]).replace(/\\/g, '/');
if (!fs.existsSync(script)) sair({ ok: false, erro: 'Script não encontrado: ' + script }, 1);
const lado = String(parseInt(opc('--lado', '1200'), 10) || 1200);
const amostras = String(parseInt(opc('--amostras', '200'), 10) || 200);
const filhos = String(parseInt(opc('--filhos', '45'), 10) || 45);
const limite = (parseInt(opc('--limite', '900'), 10) || 900) * 1000;

const inicio = Date.now();
try { fs.rmSync(saida, { force: true }); } catch {}
const p = spawn(achado.exe, ['--background', '--python-exit-code', '1', '--python', script, '--', saida, lado, amostras, filhos], { stdio: ['ignore', 'pipe', 'pipe'] });
let texto = '';
p.stdout.on('data', (d) => { texto += d; });
p.stderr.on('data', (d) => { texto += d; });
const relogio = setTimeout(() => { p.kill(); sair({ ok: false, erro: `Passou do limite de ${limite / 1000} s`, blender: achado.exe }, 4); }, limite);
p.on('close', (codigo) => {
  clearTimeout(relogio);
  const linhas = texto.split(/\r?\n/);
  const pegar = (re) => linhas.filter((l) => re.test(l)).map((l) => l.trim().slice(0, 300));
  const erros = pegar(/Traceback|Error:|^\s*File ".*", line|Exception/).filter((l) => !/HIPEW|HIP dynamic/.test(l));
  const existe = fs.existsSync(saida);
  const ok = codigo === 0 && existe;
  sair({
    ok, saida: existe ? saida : null, blender: achado.exe, ms: Date.now() - inicio,
    lado: Number(lado), amostras: Number(amostras),
    diagnostico: pegar(/^DIAG /), avisos: pegar(/^AVISO /), gpu: pegar(/^GPU:/)[0] || 'CPU',
    erros: ok ? [] : erros.slice(-12),
  }, ok ? 0 : 2);
});
