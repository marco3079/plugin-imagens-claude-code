---
nome: Gravura em linha
id: gravura-linha
serve-para: "Selo, rótulo, emblema, ilustração clássica em uma cor"
tecnica: svg
paleta:
  papel: "#F5EFE0"
  tinta: "#1F2A30"
  apoio: "#B8860B"
luz: "De um lado só. O escuro é feito de linhas mais juntas ou mais grossas, nunca de cinza"
textura: "A própria hachura: linhas paralelas que seguem a forma"
traco: "Linha de uma cor, pontas arredondadas. Espessura varia com a sombra"
composicao:
  - "Assunto central dentro de uma moldura (círculo, escudo, faixa)"
  - "Simetria permitida: é emblema"
  - "Texto em arco acompanhando a moldura"
---

# Gravura em linha

## Como reconhecer

Tudo em uma cor de tinta sobre papel, com sombreado feito de linhas paralelas que engrossam e se aproximam no lado escuro.

## Regras

- Uma cor de tinta. A segunda cor, se houver, só em faixa ou detalhe chapado.
- Hachura numa direção por superfície, recortada pela forma com clipPath.
- Espessura mínima de 0,8 no tamanho de uso, senão entope.
- Texto em arco com textPath e espaçamento largo.

## Código de exemplo

```js
// Hachura que escurece para um lado: linhas paralelas com espessura crescente, recortadas pela forma
function hachura(svg, idRecorte, x0, y0, larg, alt, passos = 26) {
  const NS = 'http://www.w3.org/2000/svg', g = document.createElementNS(NS, 'g');
  g.setAttribute('clip-path', `url(#${idRecorte})`); g.setAttribute('stroke', '#1F2A30'); g.setAttribute('stroke-linecap', 'round');
  for (let i = 0; i <= passos; i++) {
    const t = i / passos, y = y0 + t * alt, l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', x0); l.setAttribute('x2', x0 + larg); l.setAttribute('y1', y); l.setAttribute('y2', y + larg * 0.25);
    l.setAttribute('stroke-width', (0.6 + 2.6 * t * t).toFixed(2));        // mais grossa no lado da sombra
    g.appendChild(l);
  }
  svg.appendChild(g);
}
```

## Evitar

- Cinza ou degradê
- Hachura em direções aleatórias
- Linha fina demais para o tamanho de uso
- Preenchimento chapado grande (quebra o estilo)
