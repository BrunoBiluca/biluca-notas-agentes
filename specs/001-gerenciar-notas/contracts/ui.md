# Contrato da interface

Este contrato descreve a apresentação e as interações visíveis ao usuário para a especificação em [spec.md](../spec.md). Os componentes e tokens permitidos e as lacunas do inventário estão registrados em [design-system.md](../design-system.md).

## Página principal

1. A barra superior exibe, da esquerda para a direita, o alternador de grade/lista e o controle iconográfico de ordenação; a pesquisa ocupa a região central. O controle alterna entre a ordem por atualização e a ordem manual e anuncia seu modo acessivelmente.
   - O campo de pesquisa mantém `MatFormField` com aparência outline e `MatInput`, adiciona ícone de pesquisa à esquerda em `color.primary`, fundo `color.surface-container` e forma `shape.corner-extra-small`.
   - Em repouso, o contorno não aparece; o estado de foco mantém indicador visível. A altura se alinha à dos controles da toolbar; em viewport estreito, o campo reflui para uma linha própria sem recorte.
2. O formulário de criação aparece imediatamente abaixo da barra.
   - Campos textuais usam `MatFormField`/`MatInput`; cor e anexos usam controles nativos `input type="color"` e `input type="file"` com rótulos acessíveis.
3. A coleção aparece abaixo do formulário, em seções “Notas fixadas” e “Notas livres”, respeitando busca e ordenação.
4. A tela reflowa nas larguras suportadas sem perder conteúdo, cortar controles ou exigir rolagem horizontal.

## Card de nota

- Exibe imagem ou imagens acima do título e sem espaçamento interno ao redor das imagens; em seguida, exibe conteúdo textual quando existente.
- Usa a cor de fundo escolhida na nota ou transparência quando ela não tem cor.
- No hover, recebe destaque leve e mostra ações iconográficas; essas ações também são acessíveis por foco e toque.
- A ação de remover solicita confirmação nativa do navegador; cancelar preserva a nota.
- O arraste para reordenar pode começar em qualquer parte do card. A ordenação manual também dispõe de uma alternativa por teclado.
- Cada ação iconográfica tem nome acessível que descreve sua intenção.

## Detalhe

O detalhe completo de uma nota abre em uma modal. As imagens aparecem acima do título e sem espaçamento interno ao redor delas. O teclado pode operar e fechar a modal por Escape ou pelo controle de fechamento; ao fechar, o foco retorna ao controle que a abriu. Falhas ao carregar ou remover a nota são apresentadas claramente.

## Estados e feedback

A interface diferencia carregamento, coleção vazia, busca sem resultados, erro de operação, validação e conflito de edição. Mensagens descrevem o que ocorreu e, quando aplicável, a próxima ação possível. Nenhum estado depende apenas de cor.
