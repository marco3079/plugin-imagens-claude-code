---
nome: Pixel art
id: pixel-art
serve-para: "Jogos, avatares, ícones retrô, cenas pequenas"
tecnica: canvas2d
paleta:
  escuro: "#1A1C2C"
  roxo: "#5D275D"
  vermelho: "#B13E53"
  laranja: "#EF7D57"
  amarelo: "#FFCD75"
  verde: "#38B764"
  azul: "#3B5DC9"
  claro: "#F4F4F4"
luz: "De cima e da esquerda. Cada material tem três tons: luz, base e sombra, em degraus"
textura: "Pontilhado ordenado (xadrez) na transição entre dois tons, usado com economia"
traco: "Contorno de 1 pixel na cor mais escura do próprio objeto. Curvas em degraus regulares"
composicao:
  - "Grade pequena de verdade: de 16 x 16 a 128 x 128 pixels lógicos"
  - "Silhueta legível em uma cor só"
  - "Cada pixel colocado tem função"
---

# Pixel art

## Como reconhecer

Poucos pixels grandes e nítidos, paleta fechada de até 16 cores, contornos de um pixel e sombreado em degraus.

## Regras

- Desenhe num canvas pequeno e amplie por múltiplo inteiro (8 ou 16 vezes) com imageSmoothingEnabled = false.
- Paleta fixa: nenhuma cor fora dela.
- Nada de antisserrilhado, degradê ou rotação que não seja de 90 graus.
- Descreva o sprite como matriz de caracteres, um caractere por cor: fica legível e fácil de corrigir.

## Código de exemplo

```js
// Sprite como matriz de caracteres, ampliado sem suavização
const CORES = { '.': null, 'k': '#1A1C2C', 'r': '#B13E53', 'o': '#EF7D57', 'y': '#FFCD75', 'w': '#F4F4F4' };
const CORACAO = ['.kk..kk.', 'kwokkrrk', 'koyrrrrk', 'krrrrrrk', '.krrrrk.', '..krrk..', '...kk...'];
function sprite(g, linhas, x0, y0) {
  linhas.forEach((linha, y) => [...linha].forEach((c, x) => { if (CORES[c]) { g.fillStyle = CORES[c]; g.fillRect(x0 + x, y0 + y, 1, 1); } }));
}
const pequeno = Object.assign(document.createElement('canvas'), { width: 64, height: 64 });
sprite(pequeno.getContext('2d'), CORACAO, 28, 28);
const tela = document.getElementById('tela'), g = tela.getContext('2d');   // tela com 1024 x 1024
g.imageSmoothingEnabled = false;
g.drawImage(pequeno, 0, 0, tela.width, tela.height);
```

## Evitar

- Ampliar por fator não inteiro
- Pixels de tamanhos diferentes na mesma imagem
- Degradê suave
- Contorno preto puro em tudo
- Renderizar com --escala fracionária
