---
nome: Neon noturno
id: neon-noturno
serve-para: "Capa de vídeo, jogos, música eletrônica, evento noturno"
tecnica: canvas2d
paleta:
  fundo: "#0B0B1A"
  violeta: "#3A1C71"
  rosa: "#FF2E88"
  ciano: "#21E6C1"
  amarelo: "#F8F32B"
luz: "As próprias formas emitem luz. Halo largo em volta de cada tubo e reflexo no chão molhado"
textura: "Névoa leve, grão de 3%, linhas de varredura opcionais"
traco: "Tubos de espessura constante com pontas arredondadas, núcleo quase branco e halo colorido"
composicao:
  - "Fundo muito escuro ocupando 70% ou mais"
  - "Horizonte baixo com grade em perspectiva ou chão refletindo"
  - "Duas cores de luz opostas (rosa e ciano), uma de cada lado"
---

# Neon noturno

## Como reconhecer

Linhas luminosas rosa e ciano com halo sobre fundo quase preto arroxeado, reflexos no chão e uma névoa que espalha a luz.

## Regras

- Cada tubo tem três passadas: halo largo, halo médio e núcleo claro.
- Soma de luz: globalCompositeOperation "lighter" para os halos.
- O fundo nunca é preto puro: azul arroxeado muito escuro com degradê para violeta no horizonte.
- Reflexo: a cena espelhada, esticada na vertical, com 35% de opacidade e desfoque.

## Código de exemplo

```js
// Tubo de neon: halo largo, halo médio e núcleo quase branco
function neon(g, caminho, cor, esp = 6) {
  g.save(); g.lineCap = g.lineJoin = 'round'; g.globalCompositeOperation = 'lighter';
  for (const [larg, desfoque, alfa] of [[esp * 5, esp * 6, 0.25], [esp * 2.2, esp * 2.5, 0.55]]) {
    g.shadowColor = cor; g.shadowBlur = desfoque; g.strokeStyle = cor; g.globalAlpha = alfa; g.lineWidth = larg;
    g.stroke(caminho);
  }
  g.shadowBlur = 0; g.globalAlpha = 1; g.strokeStyle = '#FFF4FB'; g.lineWidth = esp * 0.55;
  g.stroke(caminho);
  g.restore();
}
// uso: const c = new Path2D('M100,300 L300,100 L500,300'); neon(g, c, '#FF2E88');
```

## Evitar

- Fundo cinza ou preto puro
- Neon sem halo (vira linha colorida)
- Mais de três cores de luz
- Texto fino
