---
nome: Aquarela
id: aquarela
serve-para: "Paisagem, botânica, convite, capa suave, ilustração infantil"
tecnica: canvas2d
paleta:
  papel: "#FBF7EE"
  principal: "#3E6B89"
  apoio: "#8FB8A8"
  quente: "#E8A87C"
  escuro: "#2B3A4A"
luz: "Difusa, sem sombra projetada. O claro é o papel aparecendo"
textura: "Papel de grão médio. Borda de cada mancha mais escura que o miolo. Pigmento granulado"
traco: "Sem contorno. Formas por mancha. Detalhes finos em poucas pinceladas escuras por cima"
composicao:
  - "Deixar de 30% a 40% do papel em branco"
  - "Formas abertas, que se dissolvem numa borda"
  - "Do claro para o escuro: fundo aguado, primeiro plano concentrado"
---

# Aquarela

## Como reconhecer

Manchas translúcidas com borda irregular e mais escura, cores que se misturam onde se tocam e muito papel branco à mostra.

## Regras

- Cada forma é a mesma mancha repetida de seis a dez vezes com opacidade baixa e vértices tremidos.
- Cores vizinhas se sobrepõem um pouco: a mistura acontece na sobreposição.
- O branco é reserva de papel, nunca tinta branca.
- No máximo quatro pigmentos, misturados entre si.

## Código de exemplo

```js
// Mancha de aquarela: camadas translúcidas com a borda tremida. A borda escurece sozinha.
function mancha(g, pontos, cor, R, ruido2) {
  g.fillStyle = cor;                       // por exemplo 'rgba(62,107,137,0.10)'
  for (let camada = 0; camada < 8; camada++) {
    g.beginPath();
    pontos.forEach(([x, y], i) => {
      const t = 14 * (ruido2(x * 0.02 + camada, y * 0.02) - 0.5) + 5 * (R() - 0.5);
      const px = x + t, py = y + t * 0.8;
      const [nx, ny] = pontos[(i + 1) % pontos.length];
      i ? g.quadraticCurveTo(px, py, (px + nx) / 2, (py + ny) / 2) : g.moveTo(px, py);
    });
    g.closePath(); g.fill();
  }
}
```

## Evitar

- Contorno em toda forma
- Preencher o papel inteiro
- Cor opaca e uniforme
- Preto puro: o escuro é a mistura de azul com marrom
