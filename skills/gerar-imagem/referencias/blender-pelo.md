# Técnica blender-pelo: animal realista em 3D, com pelo de verdade

Modelo de partida: `modelos/blender-animal-pelo.py` (cachorro de orelhas caídas). Exemplo: `exemplos/cachorro-3d/`.

É a única técnica do plugin que **não usa o navegador**: um script Python monta o animal no Blender, planta
fios de pelo em 3D e o Cycles calcula a luz. Use quando o pedido é um **animal peludo realista** (cachorro,
gato, urso, coelho) e o Blender está instalado. Sem Blender, diga isso e ofereça `canvas2d` como pintura.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/blender.mjs" --diagnostico                 # o Blender existe?
node "${CLAUDE_PLUGIN_ROOT}/scripts/blender.mjs" animal.py teste.png --lado 600 --amostras 40 --filhos 20
node "${CLAUDE_PLUGIN_ROOT}/scripts/blender.mjs" animal.py final.png --lado 1200 --amostras 180 --filhos 40
```

O script devolve uma linha JSON: `ok`, `saida`, `ms`, `gpu`, `diagnostico` (linhas `DIAG` do script, com o
comprimento medido dos fios), `avisos` e `erros`. Teste a 600 px leva perto de um minuto; o final, alguns minutos.

## O limite honesto

O resultado é um **render 3D de qualidade de estúdio**, com pelo, brilho de olho e desfoque de fundo
reais. Mas o corpo é feito de elipsoides unidos, então a anatomia fica simplificada e o animal lê como
**pelúcia muito bem fotografada ou personagem de animação**, não como a foto de um animal de verdade. Diga
isso ao entregar. Foto de animal real continua pedindo um gerador por difusão.

## Como o modelo funciona

1. **Corpo**: uma lista `PARTES` de elipsoides (posição, escala) e `ORELHAS` (com rotação). São unidos, passam
   por um Remesh de voxel (0,04) e por um Smooth de 14 voltas, que arredonda as emendas. Mude o animal
   mexendo nessa lista: focinho mais longo, orelha em pé (elipsoide achatado para cima), bochecha maior.
2. **Grupos de vértices**: `comp` (comprimento do pelo de 0 a 1) e `dens` (onde nasce pelo). Focinho curto,
   orelhas e peito longos, zero em volta dos olhos e do nariz.
3. **Pelo**: sistema de partículas do tipo cabelo, com fios guia e fios filhos interpolados.
4. **Cor do pelo**: Principled Hair BSDF com cor direta, misturada pela **posição do fio** (coordenada de
   objeto): creme perto do focinho e no peito, dourado no crânio, escuro nas orelhas, mais ruído largo e
   variação por fio.
5. **Olhos e nariz**: esferas com verniz (coat) bem liso. O brilho do olho é o reflexo da luz principal.
6. **Luz de três pontos** com luzes de área, câmera de 85 mm com profundidade de campo e fundo emissivo de
   ruído que o desfoque transforma em bokeh.

## Lições que custaram rodadas (não repita)

| Sintoma | Causa | Correção |
|---|---|---|
| Pelo enorme, duro, em raios, cobrindo os olhos | O comprimento do fio **não segue `hair_length`**: ele é a velocidade de emissão vezes mais ou menos 4. Com `normal_factor` 0,55 o fio media 2,3 unidades numa cabeça de raio 1 | Controle o comprimento por `normal_factor` (0,05 dá fio de 0,2). Leia a linha `DIAG` e confira o comprimento médio antes de renderizar |
| Fios retos como arame | Sem ondulação e com aleatoriedade pequena perto do tamanho do fio | `kink = 'WAVE'` com amplitude 0,012 e frequência 2,5; `roughness_endpoint` 0,05; `roughness_2` 0,035; `clump_factor` 0,30; `hair_step` 8 |
| Rosto cinza, "sujo" | A pele por baixo era preta e aparecia entre os fios curtos | Pele da cor do pelo (`couro`), preto só no anel da pálpebra e no nariz. Focinho com `comp` mínimo de 0,24 e 42 mil fios guia |
| Pelo estourado, quase branco | Luzes fortes demais e cor direta clara | Principal 1500 W a 10 unidades, preenchimento 320 W, recorte 2200 W. Dourado `(0.46, 0.215, 0.05)`, creme `(0.70, 0.46, 0.20)` |
| Fundo de uma cor só | Ruído com escala baixa em coordenada gerada (0 a 1) | Escala 7 no ruído do fundo |
| Pelo apontando para dentro no topo da cabeça | `object_align_factor` para baixo maior que `normal_factor` | Mantenha a queda (`object_align_factor`) abaixo de 70% do `normal_factor` |
| Vento ou "juba" | `factor_random` é velocidade aleatória, na mesma escala do `normal_factor` | Use perto de um quarto do `normal_factor` (0,012) |

## Regras

- **Sempre teste pequeno primeiro** (600 px, 40 amostras, 20 filhos), olhe, e só então faça o final.
- **Olhe o PNG e dê nota** como em qualquer técnica. Os critérios extras daqui: o pelo cobre a pele, os fios
  têm comprimento plausível, os olhos estão visíveis e com brilho, nada estourado.
- Nomes de propriedade mudam entre versões do Blender: o modelo aplica cada uma com `try` e imprime `AVISO`
  para as que não existem. Leia os avisos no JSON.
- O modelo foi testado no **Blender 5.3 com GPU OptiX**. Em CPU o render final demora bem mais: baixe as
  amostras para 96.
- Nada de baixar modelo, textura ou HDRI da internet. Tudo é gerado pelo script.
