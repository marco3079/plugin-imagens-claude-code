---
nome: Vetor plano moderno
id: vetor-plano-moderno
serve-para: "Ilustração de site, aplicativo, apresentação e documentação"
tecnica: svg
paleta:
  fundo: "#F4F1EA"
  principal: "#2D5BFF"
  apoio: "#12C6A3"
  quente: "#FF7A59"
  escuro: "#1B1F3B"
luz: "Sem luz realista. Volume por um lado claro e um lado escuro de cada forma, sempre do mesmo lado"
textura: "Nenhuma, ou grão de 2% por cima de tudo"
traco: "Sem contorno. Cantos arredondados com raio constante. Formas geométricas simples"
composicao:
  - "Uma cena central com respiro de 15% em volta"
  - "De três a cinco objetos, com sobreposição"
  - "Uma forma grande de fundo (círculo ou mancha) agrupando a cena"
---

# Vetor plano moderno

## Como reconhecer

Formas chapadas de cores vivas sobre fundo claro, sem contorno, com sombras também chapadas e cantos arredondados iguais em tudo.

## Regras

- Cada objeto usa no máximo duas cores da paleta mais o escuro.
- Sombra é a cor do objeto 20% mais escura, em forma recortada, nunca desfoque.
- Raio de canto único (por exemplo 12) na imagem inteira.
- Pessoas, se houver: cabeça em círculo, corpo em formas simples, sem rosto detalhado.

## Código de exemplo

```xml
<!-- Objeto com lado claro e lado escuro por recorte: o gesto do estilo -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#F4F1EA"/>
  <circle cx="200" cy="150" r="110" fill="#E3E8FF"/>
  <clipPath id="vaso"><rect x="150" y="120" width="100" height="110" rx="12"/></clipPath>
  <g clip-path="url(#vaso)">
    <rect x="150" y="120" width="100" height="110" fill="#FF7A59"/>
    <rect x="200" y="120" width="50" height="110" fill="#D95F42"/>   <!-- lado escuro -->
  </g>
  <path d="M200,120 C170,90 160,60 190,40 C205,70 205,95 200,120 Z" fill="#12C6A3"/>
  <path d="M200,120 C230,95 245,70 228,48 C210,72 202,95 200,120 Z" fill="#0E9C80"/>
  <ellipse cx="200" cy="238" rx="78" ry="8" fill="#1B1F3B" opacity="0.12"/>
</svg>
```

## Evitar

- Degradê em objeto
- Contorno preto
- Mais de cinco cores
- Sombra com desfoque
- Detalhe pequeno que some a 200 px
