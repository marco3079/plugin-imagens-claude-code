---
nome: Cartaz minimalista suíço
id: cartaz-suico
serve-para: "Cartaz tipográfico, capa de relatório, divulgação de evento, slide de título"
tecnica: html-css
paleta:
  papel: "#F2F0EB"
  preto: "#111111"
  cinza: "#8A8A8A"
  acento: "#E30613"
luz: "Não se aplica"
textura: "Nenhuma. Papel liso"
traco: "Tipografia sem serifa pesada, alinhada à esquerda numa grade rígida. Uma forma geométrica grande"
composicao:
  - "Grade de colunas visível no alinhamento de tudo"
  - "Assimetria: massa de texto num canto, vazio no oposto"
  - "Contraste de escala extremo: título enorme, informação pequena"
---

# Cartaz minimalista suíço

## Como reconhecer

Muito espaço vazio, um título enorme sem serifa alinhado à esquerda, texto pequeno em colunas e uma única cor de acento em forma geométrica.

## Regras

- Uma família de fonte, dois pesos (400 e 800).
- Tudo alinhado à esquerda, nada centralizado.
- Duas escalas de texto com razão de pelo menos 6 para 1.
- Uma forma (círculo, barra, diagonal) em acento, sangrando pela borda.

## Código de exemplo

```html
<body style="width:1000px;height:1414px;margin:0;background:#F2F0EB;position:relative;overflow:hidden;
             font-family:'Helvetica Neue','Segoe UI',Arial,sans-serif;color:#111">
  <div style="position:absolute;right:-180px;top:-140px;width:720px;height:720px;border-radius:50%;background:#E30613"></div>
  <h1 style="position:absolute;left:70px;bottom:300px;margin:0;font-size:190px;line-height:.88;font-weight:800;letter-spacing:-.045em">
    forma<br>e função</h1>
  <div style="position:absolute;left:70px;bottom:80px;display:grid;grid-template-columns:repeat(3,260px);gap:30px;font-size:19px;line-height:1.4">
    <p style="margin:0"><b>Exposição</b><br>12 de maio a 30 de junho</p>
    <p style="margin:0"><b>Local</b><br>Galeria Central, sala 2</p>
    <p style="margin:0;color:#8A8A8A">Entrada gratuita<br>de terça a domingo</p>
  </div>
</body>
```

## Evitar

- Texto centralizado
- Mais de uma cor além de preto e cinza
- Fonte decorativa
- Ilustração figurativa
- Sombra ou degradê
