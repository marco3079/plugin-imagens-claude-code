---
nome: Isométrico
id: isometrico
serve-para: "Diagrama de sistema, cidade, escritório, produto em caixa, infográfico de processo"
tecnica: svg
paleta:
  fundo: "#EEF1F6"
  topo: "#FFFFFF"
  esquerda: "#C9D3E6"
  direita: "#9FB0CF"
  acento: "#FF6B4A"
  escuro: "#27324A"
luz: "Vem de cima e da esquerda: topo mais claro, face esquerda média, face direita mais escura. Sempre"
textura: "Nenhuma. Linhas de detalhe finas na cor escura a 30%"
traco: "Arestas a 30 graus exatos. Sem perspectiva: paralelas continuam paralelas"
composicao:
  - "Tudo apoiado numa grade isométrica comum"
  - "Peças separadas por pelo menos meia célula"
  - "Um objeto em acento, os outros em neutro"
---

# Isométrico

## Como reconhecer

Blocos vistos de cima em diagonal, com três faces de tons fixos e todas as arestas paralelas a três direções.

## Regras

- Projeção: x na tela = (x - y) * cos(30 graus), y na tela = (x + y) * sen(30 graus) - z.
- Os três tons de face são os mesmos em todos os objetos.
- Desenhe de trás para a frente (ordene por x + y) para a sobreposição sair certa.
- Sombra no chão: o contorno da base deslocado, na cor escura a 12%.

## Código de exemplo

```js
// Projeção isométrica e um bloco com as três faces
const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
const iso = (x, y, z) => [(x - y) * C, (x + y) * S - z];
const pts = (lista) => lista.map((p) => iso(...p).join(',')).join(' ');
function bloco(x, y, z, l, p, a, cores = ['#FFFFFF', '#C9D3E6', '#9FB0CF']) {
  const topo = [[x, y, z + a], [x + l, y, z + a], [x + l, y + p, z + a], [x, y + p, z + a]];
  const esq = [[x, y + p, z], [x + l, y + p, z], [x + l, y + p, z + a], [x, y + p, z + a]];
  const dir = [[x + l, y, z], [x + l, y + p, z], [x + l, y + p, z + a], [x + l, y, z + a]];
  return `<polygon points="${pts(esq)}" fill="${cores[1]}"/><polygon points="${pts(dir)}" fill="${cores[2]}"/><polygon points="${pts(topo)}" fill="${cores[0]}"/>`;
}
// uso: document.querySelector('g').innerHTML = bloco(0, 0, 0, 80, 80, 40) + bloco(120, 0, 0, 60, 60, 90);
```

## Evitar

- Perspectiva com ponto de fuga
- Tons de face trocados entre objetos
- Texto inclinado difícil de ler (prefira rótulo reto com linha de chamada)
- Objetos se atravessando
