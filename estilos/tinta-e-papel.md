---
nome: Tinta e papel
id: tinta-e-papel
serve-para: "Editorial, selo, ilustração de livro, cartaz em uma cor"
tecnica: canvas2d
paleta:
  papel: "#F1EADB"
  tinta: "#1A1A1E"
  aguada: "#6E6A66"
  carimbo: "#B4332A"
luz: "Não há. O volume vem de hachura e de áreas de preto chapado"
textura: "Papel com fibra. Tinta falhada nas bordas (pincel seco)"
traco: "Linha de espessura variável, grossa na pressão e fina na saída. Hachura em uma direção só"
composicao:
  - "Grande área de papel vazio"
  - "Assunto fora do centro"
  - "Um único elemento em vermelho (carimbo, sol, detalhe)"
---

# Tinta e papel

## Como reconhecer

Traço preto de espessura viva sobre papel creme, com manchas de preto chapado, hachura econômica e um toque vermelho.

## Regras

- Só três valores: papel, aguada cinza e preto.
- Linha desenhada em segmentos curtos, com a largura mudando ao longo do caminho.
- Preto chapado em pelo menos uma área grande, para dar peso.
- O vermelho aparece uma vez e ocupa menos de 3% da imagem.

## Código de exemplo

```js
// Traço de pincel com pressão: largura muda ao longo do caminho e falha no fim
function pincelada(g, pontos, largura, R) {
  g.strokeStyle = '#1A1A1E'; g.lineCap = 'round';
  for (let i = 1; i < pontos.length; i++) {
    const t = i / (pontos.length - 1);
    const pressao = Math.sin(Math.PI * Math.pow(t, 0.7));          // entra fino, engorda, sai fino
    if (t > 0.8 && R() < (t - 0.8) * 3) continue;                    // pincel seco: falha no final
    g.lineWidth = Math.max(0.6, largura * pressao * (0.85 + 0.3 * R()));
    g.beginPath(); g.moveTo(...pontos[i - 1]); g.lineTo(...pontos[i]); g.stroke();
  }
}
```

## Evitar

- Linha de espessura constante
- Cinzas em degradê
- Hachura cruzada em tudo
- Mais de uma cor de destaque
