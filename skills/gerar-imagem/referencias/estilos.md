# Biblioteca de estilos

Um estilo é uma receita visual reutilizável: paleta, luz, textura, traço, regras de composição e um trecho
de código que mostra o gesto característico. Aplicar um estilo é obedecer a essas seis coisas.

## Onde ficam e quem ganha

1. **Estilos do usuário**: `.claude/imagens/estilos/*.md` no projeto dele. **Têm prioridade.**
2. **Estilos do plugin**: `${CLAUDE_PLUGIN_ROOT}/estilos/*.md`.

Se houver dois com o mesmo nome, vale o do usuário. Liste as duas pastas antes de oferecer estilos.

## Estilos do plugin

| Arquivo | Estilo | Técnica | Serve para |
|---|---|---|---|
| `vetor-plano-moderno.md` | Vetor plano moderno | svg | Ilustração de site, app e apresentação |
| `isometrico.md` | Isométrico | svg | Diagramas de sistema, cidades, produtos em caixa |
| `aquarela.md` | Aquarela | canvas2d | Paisagem, botânica, convite, capa suave |
| `tinta-e-papel.md` | Tinta e papel | canvas2d | Editorial, selo, ilustração de livro em uma cor |
| `retro-anos-60.md` | Retrô anos 60 | svg ou canvas2d | Cartaz, capa de disco, embalagem |
| `cartaz-suico.md` | Cartaz minimalista suíço | html-css | Cartaz tipográfico, capa de relatório, evento |
| `neon-noturno.md` | Neon noturno | canvas2d | Capa de vídeo, jogos, música eletrônica |
| `render-de-estudio.md` | Render de produto em estúdio | webgl-shader | Produto, natureza-morta, objeto em destaque |
| `blueprint-tecnico.md` | Blueprint técnico | svg | Planta, esquema, vista explodida, documentação |
| `pixel-art.md` | Pixel art | canvas2d | Jogos, avatares, ícones retrô |
| `recorte-de-papel.md` | Recorte de papel em camadas | canvas2d ou svg | Capa, paisagem, cena infantil |
| `gravura-linha.md` | Gravura em linha | svg | Selo, rótulo, ilustração clássica em uma cor |

## Formato de um estilo

Markdown com cabeçalho YAML:

```markdown
---
nome: Aquarela
id: aquarela
serve-para: Paisagem, botânica, convite, capa suave
tecnica: canvas2d
paleta:
  papel: "#FBF7EE"
  principal: "#3E6B89"
  apoio: "#8FB8A8"
  quente: "#E8A87C"
  escuro: "#2B3A4A"
luz: Difusa, sem sombra projetada. O claro é o papel aparecendo
textura: Papel de grão médio, borda de mancha mais escura, pigmento granulado
traco: Sem contorno. Formas por mancha. Detalhes finos em poucas pinceladas escuras
composicao:
  - Deixar de 30% a 40% do papel em branco
  - Formas abertas, que se dissolvem numa borda
---

## Como reconhecer
...
## Regras
...
## Código de exemplo
...
## Evitar
...
```

Campos obrigatórios: `nome`, `id`, `serve-para`, `tecnica`, `paleta` (hex com papel de cada cor), `luz`,
`textura`, `traco`, `composicao`. Corpo com as quatro seções.

## Escolher

- Na entrevista, ofereça **três ou quatro** estilos que combinam com o uso, cada um com uma frase. Não despeje a lista inteira.
- Se o pedido já tem um estilo implícito ("logo", "foto de produto"), não pergunte: use o estilo que casa e diga qual.
- A técnica do estilo manda. Se o usuário quer "aquarela" de um diagrama, faça o diagrama em `html-css` com a paleta e a textura do estilo aplicadas num canvas de fundo.

## Aplicar

1. Leia o arquivo do estilo inteiro.
2. Copie a paleta para a especificação (passo 3 do fluxo), com os hex.
3. Use o código de exemplo como ponto de partida do gesto (a mancha, o traço, a sombra).
4. Na nota, o critério de fidelidade inclui "parece o estilo pedido?". Confira contra a seção "Como reconhecer".
5. A seção "Evitar" do estilo entra na lista "evitar" da especificação.

Misturar dois estilos: escolha um para forma e traço e pegue só a paleta do outro. Misturar tudo dá um
terceiro estilo sem caráter.

## Salvar um estilo do usuário

Quando o usuário aprova uma imagem e quer "mais nesse estilo", ou descreve um estilo próprio:

1. Extraia da imagem aprovada: paleta real (os hex do código), luz, textura, traço e as três ou quatro decisões de composição que definem o jeito.
2. Escreva o arquivo no formato acima em `.claude/imagens/estilos/<id>.md`, com `id` em minúsculas e hífens.
3. No código de exemplo, ponha o trecho real que produz o gesto mais característico, de 10 a 30 linhas, funcionando sozinho.
4. Guarde uma miniatura em `.claude/imagens/estilos/<id>.png` (a imagem aprovada reduzida a 512 px) e cite no corpo.
5. Confirme com o usuário o nome e uma frase de descrição.

Estilo da marca do usuário (cores e tipografia da empresa) também é um estilo: salve com as cores oficiais
e a regra de uso de cada uma.

## Mostrar um estilo

Para o usuário ver antes de escolher, gere uma amostra pequena (800 x 600) com um assunto neutro (uma
paisagem simples ou três objetos) no estilo, pelo fluxo normal mas com uma variação só.
