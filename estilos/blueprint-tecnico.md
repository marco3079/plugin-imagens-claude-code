---
nome: Blueprint técnico
id: blueprint-tecnico
serve-para: "Planta, esquema, vista explodida, documentação de produto, capa técnica"
tecnica: svg
paleta:
  fundo: "#0F3B66"
  grade: "#1D4F82"
  linha: "#EAF2FB"
  cota: "#8FC1EE"
  destaque: "#FFD166"
luz: "Não se aplica"
textura: "Grade fina de 10 em 10 unidades com linha mais forte a cada 50. Leve vinheta"
traco: "Linha branca de espessura constante. Três pesos: contorno 2, detalhe 1, cota e grade 0,5. Tracejado para o que está oculto"
composicao:
  - "Vistas alinhadas entre si (frontal, lateral, superior)"
  - "Cotas fora do desenho, com linhas de chamada"
  - "Carimbo de título no canto inferior direito"
---

# Blueprint técnico

## Como reconhecer

Linhas brancas finas sobre azul, com grade ao fundo, cotas com setas, letras em maiúsculas monoespaçadas e um carimbo de título.

## Regras

- Texto sempre em maiúsculas, monoespaçado, de 10 a 12 unidades.
- Cotas com linha fina, setas nas pontas e o número no meio, sobre o fundo.
- Eixos de simetria em traço e ponto.
- Um único destaque em amarelo, para a peça ou a medida que importa.

## Código de exemplo

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Consolas, Menlo, monospace" font-size="11">
  <defs>
    <pattern id="g10" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10,0H0V10" fill="none" stroke="#1D4F82" stroke-width=".5"/></pattern>
    <pattern id="g50" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="url(#g10)"/><path d="M50,0H0V50" fill="none" stroke="#1D4F82" stroke-width="1.2"/></pattern>
    <marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 Z" fill="#8FC1EE"/></marker>
  </defs>
  <rect width="600" height="400" fill="#0F3B66"/><rect width="600" height="400" fill="url(#g50)"/>
  <rect x="150" y="110" width="300" height="160" rx="14" fill="none" stroke="#EAF2FB" stroke-width="2"/>
  <circle cx="300" cy="190" r="46" fill="none" stroke="#FFD166" stroke-width="2"/>
  <path d="M300,120 V260 M230,190 H370" stroke="#EAF2FB" stroke-width=".6" stroke-dasharray="12 3 2 3"/>
  <path d="M150,300 H450" stroke="#8FC1EE" stroke-width=".6" marker-start="url(#seta)" marker-end="url(#seta)"/>
  <path d="M150,275 V308 M450,275 V308" stroke="#8FC1EE" stroke-width=".5"/>
  <rect x="278" y="292" width="44" height="16" fill="#0F3B66"/><text x="300" y="304" fill="#EAF2FB" text-anchor="middle">300 MM</text>
</svg>
```

## Evitar

- Preenchimento sólido nas peças
- Texto em minúsculas ou com serifa
- Cotas por cima do desenho
- Mais de uma cor de destaque
