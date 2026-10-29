# Especificação da funcionalidade: Gerenciar notas pessoais

**Diretório da funcionalidade**: `specs/001-gerenciar-notas`

**Criado em**: 2026-10-27

**Status**: Rascunho

**Entrada**: Aplicação para manter notas pessoais de variados tipos, com imagens, diferentes formas de visualização, busca, fixação e ordenação manual.

## Clarificações

### Sessão 2026-10-28

- Q: Quais tipos de imagem e limites devem ser aceitos ao anexar imagens às notas? → A: JPEG, PNG, WebP e GIF; até 10 MB por imagem; sem limite por nota.
- Q: Como o usuário deve alterar manualmente a posição das notas na coleção? → A: Arrastar e soltar, com alternativa acessível por teclado.
- Q: Se a mesma nota for alterada em duas abas antes de as mudanças serem salvas, como o sistema deve tratar o conflito? → A: Edições exigem salvar ou cancelar; em conflito, avisar e permitir descartar a edição local para carregar a versão salva mais recente ou salvar a edição local como a versão atual.
- Q: Quando deve aparecer o aviso de que a nota está aberta em outra aba? → A: Assim que outra aba abrir a nota para edição.

## Cenários de usuário e testes

### História 1 — Criar e manter notas pessoais (Prioridade: P1)

Como usuário, quero criar, consultar em detalhe, editar e remover minhas notas para registrar e manter informações importantes.

**Por que esta prioridade**: O ciclo de vida das notas é o valor central da aplicação.

**Teste independente**: Criar uma nota com título e, opcionalmente, conteúdo ou cor; abri-la; alterar seus dados; e removê-la, confirmando o resultado em cada etapa.

**Cenários de aceitação**:

1. **Dado** que o usuário está na coleção de notas, **quando** cria uma nota com título válido, **então** a nota é criada com identificador, data de criação, data de atualização e vínculo ao usuário preenchidos automaticamente.
2. **Dado** que uma nota existe, **quando** o usuário a abre, **então** vê suas informações completas, incluindo conteúdo, cor e imagens.
3. **Dado** que uma nota existe, **quando** o usuário altera seus dados, **então** as alterações são salvas e a data de atualização passa a refletir a edição.
4. **Dado** que uma nota existe, **quando** o usuário confirma sua remoção, **então** ela deixa de aparecer na coleção e não pode mais ser aberta.
5. **Dado** que o título está vazio ou contém apenas espaços, **quando** o usuário tenta criar ou salvar a nota, **então** a operação é impedida e o usuário recebe orientação para informar um título.
6. **Dado** que o usuário está editando uma nota, **quando** escolhe cancelar, **então** as alterações ainda não salvas são descartadas.
7. **Dado** que uma nota está aberta para edição em outra aba, **quando** o usuário abre essa nota para editar, **então** é avisado imediatamente e pode descartar sua edição local para carregar a versão salva mais recente ou salvar sua versão como a atual.
8. **Dado** que outra edição da nota foi salva desde que o usuário começou a editá-la, **quando** ele tenta salvar, **então** é avisado do conflito e pode descartar sua edição local para carregar a versão salva mais recente ou salvar sua edição como a versão atual.
9. **Dado** que uma nota tem uma cor de fundo selecionada, **quando** seu texto é exibido, **então** a cor da fonte é branca para fundos escuros e preta para fundos claros.

### História 2 — Ver e percorrer a coleção (Prioridade: P1)

Como usuário, quero ver minhas notas em lista ou grade e carregar mais notas ao percorrer uma coleção grande, para encontrar e acompanhar meus registros com facilidade.

**Por que esta prioridade**: A visualização da coleção é o ponto de acesso às notas e precisa continuar utilizável quando a coleção crescer.

**Teste independente**: Alternar entre lista e grade, conferir os dados resumidos de cada nota e percorrer uma coleção com mais de 100 notas até alcançar o final.

**Cenários de aceitação**:

1. **Dado** que o usuário tem notas, **quando** abre a coleção, **então** vê título, conteúdo textual e imagens, ordenados por atualização mais recente primeiro.
2. **Dado** que o usuário está vendo a coleção, **quando** escolhe lista ou grade, **então** as mesmas notas são apresentadas no formato escolhido.
3. **Dado** que a coleção tem mais de 100 notas, **quando** o usuário chega ao final das notas carregadas, **então** mais notas são apresentadas sem exigir uma ação explícita de paginação.
4. **Dado** que uma nota está na coleção, **quando** o ponteiro passa sobre ela, **então** suas ações de edição, remoção e demais ações disponíveis ficam visíveis; em dispositivos sem ponteiro, essas ações também podem ser acessadas por foco ou toque.

### História 3 — Adicionar imagens às notas (Prioridade: P2)

Como usuário, quero anexar imagens a uma nota e consultá-las junto às demais informações para preservar referências visuais.

**Por que esta prioridade**: Imagens ampliam o uso das notas sem serem necessárias para o registro básico em texto.

**Teste independente**: Anexar uma imagem a uma nota, salvá-la, verificar sua exibição na coleção e nos detalhes e removê-la da nota.

**Cenários de aceitação**:

1. **Dado** que o usuário está criando ou editando uma nota, **quando** adiciona uma imagem JPEG, PNG, WebP ou GIF de até 10 MB, **então** ela fica associada à nota e pode ser vista na coleção e nos detalhes.
2. **Dado** que uma nota contém imagens, **quando** o usuário remove uma imagem e salva a nota, **então** essa imagem deixa de aparecer sem remover as demais informações da nota.

### História 4 — Buscar e organizar notas (Prioridade: P2)

Como usuário, quero buscar por palavras do título ou conteúdo, fixar notas no topo e escolher uma ordem manual para destacar o que é importante.

**Por que esta prioridade**: Busca e organização ajudam o usuário a recuperar rapidamente notas específicas e priorizar as mais relevantes.

**Teste independente**: Buscar termos presentes no título e no conteúdo, fixar e desfixar notas e reorganizar notas manualmente.

**Cenários de aceitação**:

1. **Dado** que há notas cujo título ou conteúdo contém o termo informado, **quando** o usuário busca por esse termo, **então** todas as notas correspondentes de sua coleção são exibidas, inclusive as ainda não carregadas na página.
2. **Dado** que a busca não encontra correspondências, **quando** os resultados são exibidos, **então** o usuário recebe uma indicação clara de que nenhuma nota foi encontrada.
3. **Dado** que uma nota está fixada, **quando** o usuário visualiza a coleção, **então** ela aparece antes das notas não fixadas; ao desfixá-la, deixa de ter essa prioridade.
4. **Dado** que o usuário escolheu a ordenação manual, **quando** arrasta uma nota para outra posição ou a move usando o teclado, **então** a nova ordem é mantida ao voltar à coleção.

### Casos extremos

- Uma nota pode conter apenas o título, sem conteúdo, cor ou imagem.
- A cor da fonte acompanha a cor de fundo: branca em fundos escuros e preta em fundos claros.
- Imagens em formatos não aceitos ou maiores que 10 MB não podem ser anexadas, e o usuário recebe orientação sobre o motivo.
- Conteúdo vazio ou composto somente por espaços é tratado como ausente.
- A busca sem texto mostra a coleção sem filtro.
- A busca considera a coleção completa, não apenas os itens já carregados na tela.
- Se não houver notas, a coleção apresenta um estado vazio compreensível.
- Uma falha ao salvar, remover ou carregar notas deve ser comunicada ao usuário, sem indicar sucesso quando a operação não foi concluída.
- Edições não salvas devem poder ser canceladas. O sistema deve avisar assim que uma nota já aberta para edição em outra aba também for aberta para edição; o usuário deve poder carregar a versão salva mais recente ou salvar sua versão como a atual.
- Se outra versão da nota for salva durante a edição, o sistema deve avisar o usuário e oferecer a mesma escolha entre carregar a versão salva mais recente ou salvar sua versão como a atual.
- A reordenação manual deve ser possível por arrastar e soltar e por uma alternativa acessível por teclado.
- Ao alternar o formato de visualização, aplicar busca ou mudar a ordenação, a coleção deve manter as regras de fixação e ordenação selecionadas.

## Diretrizes de interface

- A interface deve usar Angular Material Design 3 como referência visual.
- Na página principal, a barra superior deve apresentar, da esquerda para a direita, o alternador entre grade e lista, o botão de ordenação e a pesquisa centralizada.
- Abaixo da barra deve aparecer o formulário de criação; em seguida, a coleção deve ser separada em “Notas fixadas” e “Notas livres”.
- Cada nota deve ser exibida em um card com a cor de fundo selecionada ou, se nenhuma tiver sido escolhida, fundo transparente. As imagens devem aparecer acima do título, sem espaçamento interno ao redor delas.
- Ao passar o ponteiro sobre um card, ele deve receber um leve sombreado e exibir as ações de controle. Em dispositivos sem ponteiro, essas ações devem continuar acessíveis por foco ou toque.
- O arraste para reordenar deve poder começar em qualquer área da nota, sem exigir um botão exclusivo.
- Os comandos da interface devem usar ícones que expressem sua intenção, como um lápis para editar.
- O detalhe da nota deve ser aberto em uma modal.

## Requisitos

### Requisitos funcionais

- **RF-001**: O sistema DEVE permitir criar, abrir em detalhe, editar e remover notas pertencentes ao usuário atual.
- **RF-002**: O título DEVE ser obrigatório e não pode conter apenas espaços; conteúdo textual e cor de fundo DEVEM ser opcionais.
- **RF-003**: O sistema DEVE preencher automaticamente um identificador único, a data de criação, a data inicial de atualização igual à data de criação e o vínculo ao usuário atual.
- **RF-004**: O sistema DEVE atualizar a data de atualização quando uma nota for editada e salva.
- **RF-005**: O sistema DEVE permitir adicionar e remover imagens JPEG, PNG, WebP e GIF de uma nota, limitando cada imagem a 10 MB, sem limitar a quantidade de imagens por nota e preservando os demais dados ao alterar suas imagens.
- **RF-006**: O sistema DEVE apresentar a coleção em lista e em grade, permitindo alternar entre esses formatos.
- **RF-007**: A apresentação resumida de cada nota DEVE conter somente título, conteúdo textual e imagens; as ações devem aparecer ao passar o ponteiro sobre a nota e também ser acessíveis por foco ou toque.
- **RF-008**: A ordenação padrão DEVE apresentar primeiro as notas atualizadas mais recentemente.
- **RF-009**: O sistema DEVE permitir buscar palavras no título e no conteúdo textual em todas as notas do usuário, inclusive nas que ainda não foram carregadas visualmente.
- **RF-010**: O sistema DEVE permitir fixar e desfixar notas; notas fixadas DEVEM aparecer antes das não fixadas.
- **RF-011**: O sistema DEVE oferecer ordenação manual por arrastar e soltar, com alternativa acessível por teclado, e manter as posições escolhidas pelo usuário.
- **RF-012**: Quando houver mais de 100 notas, o sistema DEVE carregar a coleção em partes e apresentar mais notas automaticamente à medida que o usuário se aproxima do fim das que já estão visíveis.
- **RF-013**: Dados e resultados apresentados DEVEM ser limitados às notas do usuário atual.
- **RF-014**: O sistema DEVE informar estados vazios e falhas em operações de leitura ou alteração, sem exibir uma operação malsucedida como concluída.
- **RF-015**: O sistema DEVE oferecer ações explícitas para salvar ou cancelar uma edição. Se uma nota já estiver aberta para edição em outra aba, DEVE avisar o usuário assim que ele também a abrir para editar e permitir descartar as alterações locais para carregar a versão salva mais recente ou salvar as alterações locais como a versão atual. Se outra versão for salva durante a edição, o sistema DEVE avisar o usuário e oferecer as mesmas opções.
- **RF-016**: A cor da fonte da nota DEVE se adaptar à cor de fundo selecionada: branca para fundos escuros e preta para fundos claros.

### Entidades principais

- **Nota**: registro pessoal com identificador, título obrigatório, conteúdo textual opcional, cor de fundo opcional, imagens opcionais, datas de criação e atualização, estado de fixação, posição manual e vínculo ao usuário.
- **Usuário**: identidade atual que determina a coleção de notas acessível e o vínculo de cada nota.
- **Imagem da nota**: imagem associada a uma nota, exibida no resumo e na visualização detalhada.

## Critérios de sucesso

### Resultados mensuráveis

- **CS-001**: Em testes de uso, pelo menos 95% dos participantes conseguem criar, localizar, editar e remover uma nota sem ajuda.
- **CS-002**: Em uma coleção de até 1.000 notas, pelo menos 95% das buscas por título ou conteúdo exibem os resultados em até 2 segundos.
- **CS-003**: Com mais de 100 notas, a coleção mostra no máximo 100 notas antes de o usuário percorrer a página e carrega outras automaticamente ao se aproximar do final do conteúdo disponível.
- **CS-004**: Em testes com dois usuários distintos, nenhum usuário consegue visualizar ou alterar notas pertencentes exclusivamente ao outro.
- **CS-005**: Em testes de uso, pelo menos 90% dos participantes conseguem alternar formatos, fixar uma nota e reordenar manualmente uma nota sem ajuda.
- **CS-006**: Em testes de interface nas larguras suportadas, todos os controles e conteúdos permanecem visíveis e operáveis sem recorte ou rolagem horizontal.
- **CS-007**: Todas as ações da interface podem ser identificadas e acionadas por ponteiro, toque e teclado; ações de cards não dependem exclusivamente de hover.

## Pressupostos

- A identidade do usuário atual já está disponível para a aplicação; esta funcionalidade não inclui criar um fluxo novo de autenticação.
- Cada nota pertence a um único usuário; compartilhamento, colaboração e acesso público estão fora do escopo.
- Uma nota pode ter zero ou mais imagens. A remoção de uma nota também remove suas imagens associadas.
- Fixação tem precedência sobre qualquer modo de ordenação: notas fixadas aparecem primeiro. A ordenação selecionada organiza as notas dentro dos grupos fixado e não fixado.
- A ordenação manual é uma opção explícita; a ordenação por data de atualização continua sendo a opção padrão.
- As ações não dependem exclusivamente de passar o ponteiro sobre uma nota, para que também possam ser usadas em telas sensíveis ao toque e por foco.

## Requisitos do sistema de design

### Requisitos

- **DS-001**: A barra superior DEVE seguir a composição registrada em [design-system.md](./design-system.md), com alternador de visualização e ordenação à esquerda e pesquisa centralizada; o formulário de criação DEVE aparecer imediatamente abaixo dela.
- **DS-002**: Os controles de alternância, ordenação e pesquisa DEVEM reutilizar os componentes `button-toggle`, `icon-button` e `form-field` do inventário Angular Material Design 3, conforme a composição registrada em [design-system.md](./design-system.md).
- **DS-003**: Os cards DEVEM compor `MatCard` com os controles iconográficos do Material e a interação de arraste do CDK, conforme [design-system.md](./design-system.md): fundo selecionado ou transparente quando ausente, imagens acima do título sem espaçamento interno ao redor, destaque leve no hover e ações também acessíveis por foco e toque; o arraste DEVE poder iniciar em qualquer área do card.
- **DS-004**: O detalhe da nota DEVE ser apresentado por `MatDialog`, com imagens acima do título e sem espaçamento interno ao redor delas, nome acessível, fechamento por teclado e controle visível, e retorno do foco ao acionador ao fechar.
- **DS-005**: A apresentação DEVE usar os tokens disponíveis no inventário quando aplicáveis e os componentes Material documentados em [design-system.md](./design-system.md). Cores selecionadas pelo usuário para uma nota são conteúdo da nota, não tokens de interface; a ausência dessa cor mantém o fundo transparente. Não DEVEM ser inventados nomes de tokens ou breakpoints inexistentes no inventário.

### Princípios em vigor

Fonte: `default` (`.specify/extensions/design/principles/default.yml`), pois o inventário Angular Material Design 3 não fornece princípios próprios; versão do sistema de design não declarada. Superfícies: interativa, layout, texto, mídia e movimento.

| Princípio | Dimensão | Requisito |
|---|---|---|
| PRIN-SEMANTIC-HTML | Acessibilidade | Elementos e papéis semânticos devem corresponder ao comportamento. |
| PRIN-KEYBOARD | Acessibilidade | Todos os controles devem funcionar somente com teclado. |
| PRIN-FOCUS-VISIBLE | Acessibilidade | O foco deve permanecer visível; o usuário deve poder sair de uma sobreposição e o foco deve retornar ao acionador quando ela for fechada. |
| PRIN-ACCESSIBLE-NAME | Acessibilidade | Cada controle deve ter nome acessível que descreva sua ação, inclusive controles somente com ícone. |
| PRIN-NOT-COLOR-ALONE | Acessibilidade | Nenhum estado ou significado pode ser comunicado somente por cor. |
| PRIN-CONTRAST | Acessibilidade | Texto e elementos não textuais significativos devem manter o contraste exigido em cada tema. |
| PRIN-TARGET-SIZE | Acessibilidade | Alvos de toque devem respeitar o tamanho mínimo definido pelo sistema e ter espaçamento adequado. |
| PRIN-RESPONSIVE | Responsividade | O conteúdo deve refluir sem recorte, truncamento ou rolagem horizontal nas larguras suportadas. |
| PRIN-INPUT-MODALITIES | Interação | Todas as ações devem estar disponíveis por ponteiro, toque e teclado; nenhuma deve depender apenas de hover ou gesto sem alternativa. |
| PRIN-REDUCED-MOTION | Interação | Movimento deve respeitar a preferência de movimento reduzido e nunca ser necessário para concluir uma ação. |
| PRIN-STATE-COVERAGE | Estados | Estados possíveis devem ser definidos, incluindo hover, foco, carregamento, erro e vazio quando aplicáveis. |
| PRIN-STATE-FEEDBACK | Estados | Ações devem fornecer retorno visível e falhas devem explicar o ocorrido e o próximo passo. |
| PRIN-TOKENS | Tokens | Valores de cor, espaçamento, tipografia, forma, elevação e movimento devem usar tokens existentes em vez de literais. |
| PRIN-NO-BESPOKE-PRIMITIVES | Tokens | Primitivos disponíveis devem ser reutilizados; lacunas devem ser documentadas. |

Princípios desabilitados: nenhum. Princípios declarados sem etapa de verificação: nenhum.
