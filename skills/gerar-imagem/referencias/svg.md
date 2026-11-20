# Técnica svg: logo, ícone, marca e ilustração vetorial

Modelo de partida: `modelos/svg-logo.svg` (prancha de marca completa). Exemplos: `exemplos/logo/` e `exemplos/icone/`.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/renderizar.mjs" logo.svg logo.png                 # tamanho do próprio SVG
node "${CLAUDE_PLUGIN_ROOT}/scripts/renderizar.mjs" icone.svg icone.png --transparente
node "${CLAUDE_PLUGIN_ROOT}/scripts/renderizar.mjs" icone.svg icone-64.png --largura 64 --altura 64
```

O SVG precisa de `xmlns="http://www.w3.org/2000/svg"`, `viewBox` e, de preferência, `width` e `height`.

## Construção

1. **Grade primeiro.** Desenhe numa caixa fixa com o centro em 0,0 (`viewBox="-80 -80 160 160"`). Coordenadas inteiras ou com uma casa decimal. Ícone de app: caixa de 1024, canto com raio de 22,4% (229), desenho dentro de um círculo de raio 330.
2. **Formas de construção.** Monte com círculos, retângulos e arcos, e só então una. Escreva a conta no comentário. A gota do exemplo: círculo de raio 38 em (0,18), ponta em (0,-58), a duas vezes o raio do centro, tangência em (±32.91,-1).
3. **Curvas limpas.** Onde uma curva encontra um arco, a alça de controle fica **alinhada à tangente** do arco naquele ponto. Alça fora da tangente deixa uma quina visível no ombro. Menos pontos é melhor: uma curva de Bézier boa em vez de três ruins.
4. **Um desenho, vários usos.** Ponha o símbolo num `<symbol>` e reutilize com `<use>`. Cores em variáveis CSS (`fill="var(--cor-simbolo, var(--tinta))"`), para as versões de uma cor e negativa serem o mesmo desenho.
5. **Recorte para detalhe interno.** Ondas, listras e brilhos dentro de uma forma: desenhe maiores que a forma e corte com `clipPath`. Deixe o traço sangrar pela borda. Traço que termina dentro da forma com ponta arredondada dá aparência amadora.

## Peso óptico

- **Círculo parece menor que quadrado** do mesmo tamanho: aumente formas redondas e pontudas em 3% a 5% para parecerem do mesmo tamanho.
- **Centro óptico** fica acima do centro geométrico. Forma com ponta para cima (gota, triângulo, seta) desce uns 3% a 5% para parecer centrada.
- **Traço**: um peso só no ícone inteiro, ou dois com razão clara (1 para 2). Em ícones de linha numa grade de 24, traço de 1,5 a 2.
- **Vazio mínimo**: espaço entre duas formas nunca menor que o peso do traço. Abaixo disso entope ao reduzir.
- **Símbolo ao lado de nome**: a altura do símbolo fica entre a altura das maiúsculas e 1,6 vez essa altura. A base do símbolo alinha com a linha de base do texto. O espaço entre os dois é de mais ou menos metade da largura do símbolo. (No exemplo, a primeira versão tinha símbolo pequeno e longe do nome: parecia dois elementos soltos.)

## Versões obrigatórias de um logo

Entregue a prancha com as quatro, como no modelo:

1. **Principal**: símbolo com nome, em cor.
2. **Uma cor**: tudo em preto sobre branco. Se o logo depende de degradê ou de duas cores para ser entendido, o desenho está fraco.
3. **Negativa**: claro sobre a cor da marca.
4. **Reduzida**: **outro desenho**, com menos detalhe e traço mais grosso, testado em 64, 32 e 16 px. No exemplo, duas ondas de traço 6,5 viram uma onda de traço 11, e a 16 px sobra só a gota: abaixo de 20 px a onda virava um borrão.

Duas correções que vieram do crítico independente: o **nome usa a mesma cor do símbolo** (dois escuros parecidos na mesma assinatura leem como erro), e **toda cor da paleta tem um papel visível na marca** (o âmbar estava só na amostra do rodapé, e passou a ser a onda de baixo).

## Texto

- Use `<text>` com pilha de fontes do sistema: `"Segoe UI", "Helvetica Neue", "Noto Sans", Arial, sans-serif`. Para serifa: `Georgia, "Times New Roman", serif`. Para mono: `"Cascadia Mono", Consolas, Menlo, monospace`.
- Ajuste `letter-spacing`: nome grande em minúsculas pede aperto (-0,02 a -0,04 em). Linha pequena em maiúsculas pede abertura (0,2 a 0,3 em).
- **Avise o usuário**: texto vivo muda de fonte de máquina para máquina. Para arquivo final de gráfica, o nome tem de ser convertido em contorno num editor vetorial. Isto o plugin não faz.
- Nunca desenhe letras à mão com `<path>`, a não ser monograma de uma ou duas letras feito de formas geométricas.

## Volume sem perder o vetor (ícones de aplicativo)

Receita do ícone de exemplo, em camadas:

1. Fundo: degradê linear em diagonal com duas cores do mesmo matiz (`#34467F` para `#141B36`).
2. Luz: radial branco a 26% de opacidade no canto superior esquerdo, sumindo antes do centro.
3. Objeto: degradê vertical curto (claro em cima), com `feDropShadow` de deslocamento vertical 26 e desfoque 30, opacidade 0,38.
4. Aro: traço com degradê branco de 85% para 12%, de cima para baixo. É o que dá a borda "de vidro".
5. Detalhe em facetas: cada forma dividida em lado claro e lado escuro, do mesmo lado em todas.

Uma sombra só, numa direção só. Sombra em todas as formas vira sujeira.

## Lista de conferência

- [ ] O símbolo funciona em uma cor, sem degradê.
- [ ] Reduzido a 32 px ainda se reconhece (renderize e olhe).
- [ ] Nenhuma quina onde deveria haver curva contínua (amplie o PNG com `--escala 3`).
- [ ] Margem interna de pelo menos 10% da caixa.
- [ ] Nome conferido letra por letra, com acentos.
- [ ] No máximo três cores, mais o neutro.
- [ ] Arquivo sem `<image>` externa, sem fonte remota.

## Limites honestos

- Marca boa depende de conceito, e conceito pede conversa com o usuário. Gere três conceitos diferentes na primeira folha, não três cores do mesmo.
- Ilustração vetorial complexa (personagem com anatomia, cena com perspectiva) sai pior que formas geométricas. Simplifique o estilo.
