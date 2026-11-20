---
nome: Render de produto em estúdio
id: render-de-estudio
serve-para: "Produto, natureza-morta, objeto em destaque, capa de catálogo"
tecnica: webgl-shader
paleta:
  fundo: "#2B2622"
  superficie: "#5A3A22"
  luz-principal: "#FFDBB3"
  preenchimento: "#101318"
  acento: "a cor do produto"
luz: "Softbox grande a 45 graus de lado e pouco acima, quente. Preenchimento frio com um quarto da força. Luz de recorte por trás"
textura: "Materiais com variação de cor e de rugosidade por ruído. Grão de filme de 1,5% a 2%"
traco: "Não há traço. Formas por luz e sombra"
composicao:
  - "Objeto principal fora do centro, em foco, com um ou dois objetos de apoio"
  - "Arranjo em triângulo com sobreposição"
  - "Fundo escuro e sem detalhe, mesa ocupando o terço de baixo"
---

# Render de produto em estúdio

## Como reconhecer

Objetos sobre uma superfície, com sombra suave de uma luz grande, brilho especular retangular, fundo desfocado e escuro.

## Regras

- Lente longa: campo de visão de 25 a 35 graus.
- Profundidade de campo rasa, foco no objeto principal.
- Toda superfície mistura pelo menos duas cores por ruído.
- Tom final por ACES, vinheta de 0,35 e grão.

## Código de exemplo

```js
// Painel de controle do modelo webgl-raymarch.html para este estilo
const CENA = {
  amostras: 700, saltos: 12, semente: 7,
  camera: { pos: [0.55, 1.55, 4.6], alvo: [0.02, 0.50, 0.0], fovGraus: 30, abertura: 0.035, focoEm: [0.25, 0.45, 0.4] },
  luz: { pos: [-3.8, 2.7, 1.1], alvo: [0.0, 0.3, 0.0], meio: [1.15, 0.9], cor: [1.0, 0.86, 0.70], forca: 26 },
  ambiente: { cima: [0.060, 0.072, 0.095], baixo: [0.034, 0.030, 0.026] },   // preenchimento frio
  recorte: { dir: [0.75, 0.45, -0.5], cor: [0.55, 0.65, 0.9], forca: 2.2 },  // luz de recorte
  exposicao: 1.0, vinheta: 0.35, grao: 0.018,
};
```

## Evitar

- Fundo branco puro (expõe todo defeito)
- Luz pequena e dura
- Tudo em foco
- Material de cor uniforme
- Chamar o resultado de foto
