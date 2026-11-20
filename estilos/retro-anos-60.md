---
nome: Retrô anos 60
id: retro-anos-60
serve-para: "Cartaz, capa de disco, embalagem, convite de festa"
tecnica: svg
paleta:
  fundo: "#F3E3C3"
  laranja: "#E4572E"
  mostarda: "#E9A23B"
  turquesa: "#2A9D8F"
  marrom: "#3D2B1F"
luz: "Nenhuma. Tudo chapado, como serigrafia"
textura: "Grão de impressão e leve desalinhamento entre as cores (fora de registro)"
traco: "Formas orgânicas arredondadas, raios de sol, arcos concêntricos, estrelas de quatro pontas"
composicao:
  - "Simetria central ou raios saindo de um ponto"
  - "Faixas e arcos concêntricos em três cores"
  - "Texto grande, redondo e pesado, integrado às formas"
---

# Retrô anos 60

## Como reconhecer

Paleta quente de laranja, mostarda e turquesa sobre creme, com raios, arcos concêntricos e formas de bumerangue, tudo chapado e com grão de papel.

## Regras

- Quatro cores mais o creme, sem preto: o escuro é marrom.
- Arcos concêntricos com faixas da mesma largura.
- Raios em número par, alternando duas cores.
- Cores sobrepostas com mistura multiplicada e deslocadas 2 px, imitando impressão.

## Código de exemplo

```xml
<!-- Sol de arcos concêntricos com raios alternados -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-200 -200 400 400">
  <rect x="-200" y="-200" width="400" height="400" fill="#F3E3C3"/>
  <g id="raios"></g>
  <circle r="110" fill="#E4572E"/><circle r="82" fill="#E9A23B"/><circle r="54" fill="#2A9D8F"/><circle r="26" fill="#F3E3C3"/>
  <script>
    const g = document.getElementById('raios');
    for (let i = 0; i < 24; i++) {
      const a0 = (i / 24) * 2 * Math.PI, a1 = ((i + 1) / 24) * 2 * Math.PI, R = 320;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M0,0 L${R * Math.cos(a0)},${R * Math.sin(a0)} L${R * Math.cos(a1)},${R * Math.sin(a1)} Z`);
      p.setAttribute('fill', i % 2 ? '#E9A23B' : '#F3E3C3'); p.setAttribute('opacity', '0.55');
      g.appendChild(p);
    }
  </script>
</svg>
```

## Evitar

- Degradê suave
- Azul frio ou cinza neutro
- Fonte fina e moderna
- Sombra realista
