import fs from 'node:fs';
// Ícone de aplicativo "bússola". Três variações mudam fundo, mostrador e ângulo da agulha.
const V = {
  a: { f1: '#34467F', f2: '#141B36', disco1: '#FBF7EF', disco2: '#E4DCCB', norte1: '#F0623A', norte2: '#C73E1D', sul1: '#3A4878', sul2: '#232C52', marca: '#232C52', ang: 38, nome: 'azul profundo' },
  b: { f1: '#FF8A5B', f2: '#D9376E', disco1: '#FFFDF8', disco2: '#F3E3D3', norte1: '#2B2D5B', norte2: '#17193A', sul1: '#F7B7A3', sul2: '#E88F7E', marca: '#7A2748', ang: 38, nome: 'coral' },
  c: { f1: '#1E2A33', f2: '#0B1014', disco1: '#1F3A44', disco2: '#122329', norte1: '#FFC857', norte2: '#E0A125', sul1: '#5C7C87', sul2: '#3C5660', marca: '#9FC3CE', ang: 38, nome: 'escuro com âmbar' },
};
for (const [k, v] of Object.entries(V)) {
  let marcas = '';
  for (let i = 0; i < 24; i++) {
    const principal = i % 6 === 0, medio = i % 2 === 0;
    const r2 = 268, r1 = principal ? 214 : medio ? 238 : 250, larg = principal ? 14 : medio ? 8 : 5;
    marcas += `<line x1="0" y1="${-r1}" x2="0" y2="${-r2}" stroke="${v.marca}" stroke-width="${larg}" stroke-linecap="round" opacity="${principal ? 0.9 : medio ? 0.55 : 0.32}" transform="rotate(${i * 15})"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <!-- Ícone de aplicativo. Grade: caixa de 1024, margem de 0, canto 22,4% (229). Área segura do desenho: círculo de raio 330. -->
  <defs>
    <linearGradient id="fundo" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${v.f1}"/><stop offset="1" stop-color="${v.f2}"/></linearGradient>
    <radialGradient id="brilho" cx="0.28" cy="0.16" r="0.9"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.26"/><stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <linearGradient id="disco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${v.disco1}"/><stop offset="1" stop-color="${v.disco2}"/></linearGradient>
    <linearGradient id="aro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.85"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0.12"/></linearGradient>
    <filter id="sombra-disco" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="26" stdDeviation="30" flood-color="#000000" flood-opacity="0.38"/></filter>
    <filter id="sombra-agulha" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="11" flood-color="#000000" flood-opacity="0.30"/></filter>
    <clipPath id="forma"><rect width="1024" height="1024" rx="229"/></clipPath>
  </defs>
  <g clip-path="url(#forma)">
    <rect width="1024" height="1024" fill="url(#fundo)"/>
    <rect width="1024" height="1024" fill="url(#brilho)"/>
  </g>
  <g transform="translate(512,512)">
    <circle r="312" fill="url(#disco)" filter="url(#sombra-disco)"/>
    <circle r="305" fill="none" stroke="url(#aro)" stroke-width="14"/>
    ${marcas}
    <g transform="rotate(${v.ang})" filter="url(#sombra-agulha)">
      <!-- Agulha: losango de 4 facetas. Cada metade tem um lado claro e um escuro, o que dá volume sem degradê. -->
      <path d="M0,-236 L58,0 L0,0 Z" fill="${v.norte2}"/><path d="M0,-236 L-58,0 L0,0 Z" fill="${v.norte1}"/>
      <path d="M0,236 L58,0 L0,0 Z" fill="${v.sul2}"/><path d="M0,236 L-58,0 L0,0 Z" fill="${v.sul1}"/>
    </g>
    <circle r="30" fill="${v.disco1}"/><circle r="30" fill="none" stroke="#000000" stroke-opacity="0.18" stroke-width="3"/><circle r="11" fill="${v.marca}"/>
  </g>
</svg>
`;
  fs.writeFileSync(`${k}.svg`, svg);
}
