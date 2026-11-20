// Módulo da ficha "pingo": desenha o personagem sempre igual, mudando só pose, expressão e tamanho.
// Uso numa página:  <script src="pingo.js"></script>  e depois
//   desenharPingo(ctx, { x: 300, y: 500, tamanho: 220, pose: 'acenando', expressao: 'feliz' });
// As cores são as da ficha (pingo.json). Se a ficha mudar, atualize PINGO_PALETA.
const PINGO_PALETA = { corpo: '#1F7A8C', corpoSombra: '#0E4D5C', barriga: '#BFE3E8', olho: '#12343C', brilho: '#FFFFFF', bochecha: '#F08A7B', contorno: '#0B2F38' };

function desenharPingo(ctx, { x, y, tamanho = 200, pose = 'parado', expressao = 'feliz', viradoPara = 'direita' } = {}) {
  const P = PINGO_PALETA, L = tamanho, A = L * 1.25, lado = viradoPara === 'esquerda' ? -1 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = ctx.lineCap = 'round';
  const tr = L * 0.035;

  // sombra no chão
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 0, L * 0.42, L * 0.07, 0, 0, Math.PI * 2); ctx.fill();

  // braços (atrás do corpo): é o que muda com a pose
  const braco = (sx, ang) => {
    ctx.save(); ctx.translate(sx * L * 0.38, -A * 0.38); ctx.rotate(sx * ang);
    ctx.strokeStyle = P.contorno; ctx.lineWidth = L * 0.11 + tr * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sx * L * 0.27, 0); ctx.stroke();
    ctx.strokeStyle = P.corpo; ctx.lineWidth = L * 0.11; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sx * L * 0.27, 0); ctx.stroke();
    ctx.restore();
  };
  const ang = { parado: [0.9, 0.9], acenando: [0.9, -1.0], comemorando: [-1.0, -1.0] }[pose] || [0.9, 0.9];
  braco(-lado, ang[0]); braco(lado, ang[1]);

  // pés
  for (const sx of [-1, 1]) {
    ctx.fillStyle = P.corpoSombra; ctx.strokeStyle = P.contorno; ctx.lineWidth = tr;
    ctx.beginPath(); ctx.ellipse(sx * L * 0.19, -L * 0.035, L * 0.13, L * 0.065, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }

  // corpo: gota (círculo com ponta)
  const r = L * 0.5, cy = -r - L * 0.04, ponta = -A - (pose === 'comemorando' ? L * 0.04 : 0);
  const gota = () => {
    ctx.beginPath(); ctx.moveTo(lado * L * 0.06, ponta);
    ctx.bezierCurveTo(lado * L * 0.06 + L * 0.06, ponta + A * 0.22, r * 0.62, cy - r * 0.95, r * 0.866, cy - r * 0.5);
    ctx.arc(0, cy, r, -Math.PI / 6, Math.PI * 7 / 6, false);
    ctx.bezierCurveTo(-r * 0.62, cy - r * 0.95, lado * L * 0.06 - L * 0.06, ponta + A * 0.22, lado * L * 0.06, ponta); ctx.closePath();
  };
  gota(); ctx.fillStyle = P.corpo; ctx.fill();
  ctx.save(); gota(); ctx.clip();
  ctx.fillStyle = P.corpoSombra; ctx.beginPath(); ctx.ellipse(-lado * L * 0.42, cy + r * 0.2, r * 0.55, r * 1.3, 0, 0, Math.PI * 2); ctx.fill();   // sombra lateral chapada
  ctx.fillStyle = P.barriga; ctx.beginPath(); ctx.ellipse(lado * L * 0.03, cy + r * 0.52, r * 0.56, r * 0.50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  gota(); ctx.strokeStyle = P.contorno; ctx.lineWidth = tr; ctx.stroke();

  // rosto
  const oy = cy - r * 0.10, ox = L * 0.15, ro = L * 0.075, dx = lado * L * 0.03;
  for (const sx of [-1, 1]) {
    const ex = sx * ox + dx;
    ctx.fillStyle = P.bochecha; ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.ellipse(sx * L * 0.27 + dx, oy + L * 0.13, L * 0.06, L * 0.04, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    if (expressao === 'piscando' && sx === lado) {
      ctx.strokeStyle = P.olho; ctx.lineWidth = tr * 1.2; ctx.beginPath(); ctx.arc(ex, oy + ro * 0.2, ro * 0.8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else {
      const k = expressao === 'surpreso' ? 1.25 : 1;
      ctx.fillStyle = P.olho; ctx.beginPath(); ctx.ellipse(ex, oy, ro * k, ro * 1.15 * k, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.brilho; ctx.beginPath(); ctx.arc(ex - ro * 0.3, oy - ro * 0.4, ro * 0.34, 0, Math.PI * 2); ctx.fill();
    }
    if (expressao === 'triste') { ctx.strokeStyle = P.olho; ctx.lineWidth = tr; ctx.beginPath(); ctx.moveTo(ex - sx * ro * 1.3, oy - ro * 2.0); ctx.lineTo(ex + sx * ro * 0.9, oy - ro * 1.5); ctx.stroke(); }
  }
  ctx.strokeStyle = P.olho; ctx.fillStyle = P.olho; ctx.lineWidth = tr * 1.1;
  const by = oy + L * 0.15;
  ctx.beginPath();
  if (expressao === 'surpreso') { ctx.ellipse(dx, by + L * 0.02, L * 0.04, L * 0.055, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (expressao === 'triste') { ctx.arc(dx, by + L * 0.07, L * 0.07, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
  else { ctx.arc(dx, by - L * 0.02, L * 0.08, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
  ctx.restore();
}
if (typeof module !== 'undefined') module.exports = { desenharPingo, PINGO_PALETA };
