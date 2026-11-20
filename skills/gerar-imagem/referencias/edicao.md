# Técnica edicao: editar e restaurar uma imagem que já existe

Modelo de partida: `modelos/edicao.html`. Exemplo: `exemplos/restauracao/`.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/renderizar.mjs" edicao.html saida.png --canvas "#tela" --limite 300
node "${CLAUDE_PLUGIN_ROOT}/scripts/antes-depois.mjs" original.png saida.png antes-depois.png
```

A página carrega a imagem, converte para ponto flutuante, aplica a lista `OPERACOES` declarada no topo e
deixa o resultado no canvas. `--canvas "#tela"` grava no tamanho da imagem, qualquer que seja.

## Regras

1. **O original não é tocado.** Copie para `imagens/<nome>/original.<ext>` e trabalhe a partir da cópia. A saída tem outro nome.
2. **Olhe o original primeiro** com Read e escreva o diagnóstico: o que está errado, em ordem de gravidade.
3. **Entregue antes e depois** lado a lado, sempre.
4. **Menos é mais.** Cada operação destrói um pouco. Use a menor força que resolve.

## Imagem local e canvas "tainted"

Numa página `file://`, ler pixels de outra imagem local (`getImageData`, `toDataURL`) lança `SecurityError`:
o navegador trata cada arquivo como origem diferente e marca o canvas como contaminado. Testado: sem opção
nenhuma dá erro. Com `--allow-file-access-from-files` funciona. O `renderizar.mjs` já abre o navegador com
essa opção, então basta `ENTRADA = 'foto.png'` com caminho relativo à página. Se abrir a página à mão no
navegador, ela não vai funcionar: é esperado.

Formatos de entrada: tudo que o navegador abre (PNG, JPEG, WebP, GIF, BMP, AVIF). Saída sempre PNG.

## Operações do modelo

| `op` | Parâmetros | O que faz |
|---|---|---|
| `defeitos` | `limiar`, `raio`, `engordar` | Acha riscos e poeira (pixel que foge da mediana da vizinhança) e reconstrói de fora para dentro |
| `ruido` | `raio`, `luma`, `croma`, `cromaPre` | Filtro bilateral separado em brilho e cor |
| `niveis` | `corte`, `porCanal`, `pontoBranco`, `pontoPreto` | Leva o mais escuro a preto e o mais claro a branco. `porCanal` corrige dominante |
| `balanco` | `ponto` ou média, `forca` | Balanço de branco por um ponto neutro ou pelo "mundo cinza" |
| `saturacao` | `valor` | Multiplica a distância de cada cor ao seu cinza |
| `curva` | `contraste`, `gama` | Contraste em S e gama |
| `nitidez` | `raio`, `quanto`, `limiar` | Máscara de desfoque no brilho |
| `recortar` | `x`, `y`, `largura`, `altura` | Recorte |

Com `MASCARA = 'mascara.png'` (branco onde há defeito), `defeitos` reconstrói só a área marcada: é o
jeito de remover um objeto pequeno ou um rasgo que a detecção automática não pega. A máscara você mesmo
gera, com uma página que desenha formas brancas sobre preto no tamanho da foto.

Para operação que falta (girar, redimensionar, compor duas imagens, texto por cima), acrescente uma função
em `OPS` seguindo o padrão: recebe `im` com `{ w, h, r, g, b }` em `Float32Array` de 0 a 1 e altera no lugar.
Composição e texto também saem direto com `drawImage` e `fillText` no canvas final.

## A ordem importa

**Defeitos, depois ruído, depois tom e cor, nitidez por último.**

- Níveis antes dos riscos: os riscos brancos viram o "ponto mais claro" e a correção de cor sai errada.
- Nitidez antes do ruído: afia o ruído.
- Saturação antes do ruído de cor: multiplica as manchas coloridas.

## O que foi aprendido restaurando o exemplo

Foto fabricada: desbotada (45% da saturação), véu amarelo, pretos levantados, ruído gaussiano de desvio 13,
16 riscos e 90 pontos de poeira. Resultado: de 14,74 dB para 24,70 dB de PSNR contra o original.

- **Dominante trocada por outra.** Esticar cada canal pelo próprio histograma, ou pegar 1% dos pixels mais claros como "branco", deixou a foto azulada: entre os mais claros estava a laranja iluminada, e ela virou a referência de branco. Correção: `corte: 0.001` (só os realces de fato brancos) e estatística tirada de uma cópia desfocada. Se o ponto mais claro da foto for colorido, passe `pontoBranco: [x, y]` de algo que deveria ser branco.
- **Ruído de cor em manchas.** O bilateral sozinho deixou manchas verdes e roxas na parede escura, que a saturação multiplicou. Correção: `cromaPre: 2.0` (desfoque curto da cor antes), `raio: 6` e `croma: 0.14` para a cor não vazar nas bordas.
- **Poeira grande escapa.** Mediana de 7 x 7 (`raio: 3`) não vê ponto de 6 px de diâmetro: metade da janela é o próprio ponto. Com `raio: 5` pegou. Custa tempo (uns 40 segundos em 1280 x 960).
- **Saturação é chute.** Não dá para medir o quanto uma foto desbotou. O valor (1,9 no exemplo) foi escolhido olhando. Diga isso ao usuário.
- **Textura fina não volta.** Os poros da laranja saíram amaciados e a foto ficou com um ar de pintura. Ruído forte e detalhe fino ocupam as mesmas frequências: tirar um leva o outro. Um crítico independente deu 5 em acabamento por isso.
- **Meça, não confie no olho.** Baixar o contraste e a saturação "para ficar mais natural" derrubou o PSNR de 24,6 para 22,9 dB. Com a referência disponível, a medida decide.
- **O branco verdadeiro pode ser quente.** O realce mais claro do original era levemente amarelado. Levá-lo a branco neutro esfriou a parede marrom. Sem referência não há como saber: avise o usuário e ofereça uma versão mais quente.

## Receitas

| Problema | Operações |
|---|---|
| Foto antiga desbotada e amarelada | `niveis` com `porCanal`, `saturacao` de 1,3 a 2,0, `curva` com contraste 0,1 |
| Riscos e poeira | `defeitos` com `limiar` de 0,12 a 0,18 e `raio` de 3 a 5 |
| Granulada de celular à noite | `ruido` com `luma` 0,06, `croma` 0,15 e `cromaPre` 1,5 |
| Lavada, sem contraste | `niveis` sem `porCanal`, `curva` com contraste 0,15 |
| Dominante de luz artificial | `balanco` com `ponto` em algo branco ou cinza |
| Escura | `curva` com `gama` de 0,7 a 0,85, depois `niveis` |
| Levemente fora de foco | `nitidez` com `raio` 1,5 a 2,5 e `quanto` 0,8 |

## Avaliar uma edição

Use a rubrica com estas leituras: fidelidade é "fez o que foi pedido e **só** o que foi pedido";
acabamento é "sem halo, sem mancha, sem pele de plástico, sem borda de recorte visível". Amplie uma região
de detalhe (`--seletor` não serve aqui: recorte com a operação `recortar` e olhe) e compare com o original.
Se você tem a versão sem defeito (teste), `REFERENCIA` imprime o PSNR antes e depois no console.

## Limites honestos

- **Não inventa o que não está na foto.** Rosto rasgado, área grande faltando, pessoa a remover de uma cena complexa: a reconstrução por difusão dos vizinhos serve para riscos e manchas de até uns 10 px de largura. Acima disso vira borrão. Isso pede ferramenta de preenchimento generativo.
- **Não aumenta resolução de verdade.** Ampliar é interpolar.
- **Não coloriza** foto preto e branco com fidelidade. Dá para tingir por regiões com máscara, e fica com cara de tingido.
- **Rosto**: redução de ruído forte deixa pele de plástico. Em retrato use `luma` de no máximo 0,04.
