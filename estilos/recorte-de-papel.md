---
nome: Recorte de papel em camadas
id: recorte-de-papel
serve-para: "Capa, paisagem, cena infantil, cartão"
tecnica: canvas2d
paleta:
  fundo: "#FCEFD9"
  camada-1: "#F6C28B"
  camada-2: "#E58F65"
  camada-3: "#B5546B"
  camada-4: "#5B3A6B"
  frente: "#2A2140"
luz: "De cima. Cada camada projeta sombra suave e curta na de trás"
textura: "Fibra de papel fina em cada camada, com um tom levemente diferente por folha"
traco: "Sem contorno. Bordas de recorte suaves e onduladas, como tesoura"
composicao:
  - "De quatro a sete camadas, da mais clara atrás para a mais escura na frente (ou o contrário)"
  - "Cada camada cobre parte da anterior e abre uma janela para o fundo"
  - "Um elemento pequeno no fundo (sol, lua, casa) como ponto focal"
---

# Recorte de papel em camadas

## Como reconhecer

Folhas de papel coloridas empilhadas, cada uma com sua sombra na de trás, formando profundidade em degraus.

## Regras

- Sombra de cada camada: deslocamento de 6 a 10 px para baixo, desfoque de 12 a 18 px, opacidade de 0,25 a 0,35.
- A sombra é da camada inteira, não de objetos soltos.
- Tons em progressão de um só matiz ou de dois vizinhos.
- Borda por curva suave de ruído de baixa frequência, sem serrilha.

## Código de exemplo

```js
// Uma camada de papel com sombra na camada de trás
function camada(g, W, H, cor, base, amp, freq, fbm, fase) {
  g.save();
  g.shadowColor = 'rgba(30,15,40,0.32)'; g.shadowBlur = 16; g.shadowOffsetY = 8;
  g.fillStyle = cor; g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 4) g.lineTo(x, base - amp * fbm(x / W * freq + fase, fase, 3));
  g.lineTo(W, H); g.closePath(); g.fill();
  g.restore();
}
// uso: de trás para a frente
// ['#F6C28B', '#E58F65', '#B5546B', '#5B3A6B', '#2A2140'].forEach((c, i) => camada(g, W, H, c, H * (0.45 + 0.11 * i), H * 0.16, 2 + i, fbm, i * 7.3));
```

## Evitar

- Camadas sem sombra (vira vetor plano)
- Sombra dura ou longa
- Detalhe fino desenhado em cima do papel
- Mais de dois matizes
