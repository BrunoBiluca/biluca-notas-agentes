# Contrato do sistema de design

**Funcionalidade**: `001-gerenciar-notas`  
**Sistema de design**: Angular Material Design 3  
**Inventário local**: `.design-system/inventory.json`, versão `1.0`  
**Versão de pacote pesquisada**: `@angular/material` `22.2.5`  
**Adaptador**: `static-json`  
**Princípios**: conjunto padrão do projeto, pois o inventário não fornece princípios próprios.

## Vocabulário e fontes

O inventário local lista `toolbar`, `button-toggle`, `icon-button` e `form-field`. A documentação oficial atual também foi consultada porque o inventário não indexa todos os componentes do sistema: [Toolbar](https://material.angular.dev/components/toolbar/overview), [Button toggle](https://material.angular.dev/components/button-toggle/overview), [Buttons](https://material.angular.dev/components/button/overview), [Form field](https://material.angular.dev/components/form-field/overview), [Input](https://material.angular.dev/components/input/overview), [Card](https://material.angular.dev/components/card/overview), [Dialog](https://material.angular.dev/components/dialog/overview), [Icon](https://material.angular.dev/components/icon/overview), [Theming](https://material.angular.dev/guide/theming) e [CDK drag and drop](https://angular.dev/guide/drag-drop).

Tokens encontrados no inventário: `color.primary`, `color.on-primary`, `color.surface`, `color.on-surface`, `color.surface-container`, `color.outline`, `typography.label-large`, `typography.title-medium`, `typography.body-medium`, `shape.corner-none`, `shape.corner-extra-small`, `shape.corner-small`, `shape.corner-medium`, `shape.corner-large`, `shape.corner-full` e `density.default`.

O inventário não fornece tokens de espaçamento, elevação ou movimento, nem nomes de breakpoints. Não serão inventados nomes para essas dimensões. O comportamento responsivo será verificado pelo reflow nas larguras suportadas, sem depender de nomes de breakpoint ausentes.

Ícones serão apresentados por `MatIcon` com SVGs locais registrados; não será carregada uma fonte de ícones remota. A documentação de `MatDialog` descreve contenção de foco enquanto o diálogo está aberto e restauração ao fechar. A modal terá fechamento por Escape e controle visível, para que essa contenção não se torne uma armadilha de teclado.

As decisões `dd-001` a `dd-005`, tomadas em `001-gerenciar-notas`, foram conferidas no ledger com a versão instalada `22.2.5`; todas retornaram `stale: false`.

## Superfícies

### Barra superior e pesquisa

**Resolução**: Compose (componentes)  
**Decisão**: `MatToolbar` contém `MatButtonToggleGroup` para alternar grade/lista, `matIconButton` para ordenação e `MatFormField` com `MatInput` para busca. Os controles de visualização e ordenação ficam à esquerda; a pesquisa fica centralizada.  
**Fonte**: decisão registrada `dd-001`; inventário local para `toolbar`, `button-toggle`, `icon-button` e `form-field`; documentação oficial para os componentes Angular completos. As buscas no adaptador local por “top navigation actions and centered search”, “toolbar” e “grid list switch and order button” não retornaram resultados.  
**Tokens**: `color.surface`, `color.on-surface`, `typography.body-medium` e `shape.corner-full`, quando aplicáveis.  
**Princípios**: PRIN-SEMANTIC-HTML, PRIN-KEYBOARD, PRIN-FOCUS-VISIBLE, PRIN-ACCESSIBLE-NAME, PRIN-TARGET-SIZE, PRIN-RESPONSIVE, PRIN-INPUT-MODALITIES, PRIN-STATE-COVERAGE, PRIN-TOKENS.

**Restrições**: toolbar não determina sozinha o arranjo interno; a composição especifica a ordem dos controles. Estados, nomes acessíveis e foco devem seguir os princípios citados. O inventário não define breakpoint ou comportamento responsivo específico; o layout deve refluir sem perder controles.

#### Aparência do campo de busca

**Resolução**: Compose (componentes)  
**Decisão**: preservar a composição `MatFormField` (`appearance="outline"`) + `MatInput` e adicionar `MatIcon` como prefixo de pesquisa. O campo usa `color.surface-container`, o ícone usa `color.primary`, e o contorno usa `shape.corner-extra-small`; a borda fica ausente em repouso, mas o estado de foco conserva um indicador visível. A altura corresponde à dimensão documentada para `icon-button` e `button-toggle`; o campo permanece centralizado em telas largas e ocupa a linha abaixo dos controles em telas estreitas.
**Fonte**: decisão registrada `dd-008`, complementar à composição de toolbar `dd-001`. As buscas por “search field” e “form field for text entry” não retornaram componentes nomeados no índice; o inventário documenta `form-field` e sua borda de outline. As buscas por padrão “toolbar search input field” e “toolbar text search control” não retornaram padrões.
**Candidatos considerados**:

| Candidato | Fonte | Veredito |
|---|---|---|
| `MatFormField` com `MatInput` | Inventário local e documentação Angular Material | Atende à entrada de texto e à aparência `outline`; recebe configuração visual específica sem substituir o componente. |
| `MatIcon` como prefixo | Documentação Angular Material e ícones SVG registrados localmente | Compõe o ícone de pesquisa à esquerda sem introduzir uma fonte ou primitivo próprio. |
| Padrão de pesquisa da toolbar | Busca no inventário | Nenhum padrão registrado nas duas buscas realizadas. |

**Princípios que se aplicam**: PRIN-SEMANTIC-HTML, PRIN-KEYBOARD, PRIN-FOCUS-VISIBLE, PRIN-ACCESSIBLE-NAME, PRIN-CONTRAST, PRIN-TARGET-SIZE, PRIN-RESPONSIVE, PRIN-INPUT-MODALITIES, PRIN-STATE-COVERAGE, PRIN-STATE-FEEDBACK, PRIN-TOKENS, PRIN-NO-BESPOKE-PRIMITIVES.

**Restrições**: o token `shape.corner-extra-small` corresponde à menor forma disponível e aproxima o arredondamento descrito no pedido, pois o inventário não oferece um token equivalente. A dimensão de altura reutiliza a dimensão publicada dos controles da toolbar porque não há token semântico de altura para o campo. A cor de fundo e a cor do ícone usam tokens existentes. O estado sem borda aplica-se ao repouso, não pode remover foco visível. A busca continua com rótulo acessível e disponível por teclado; erros de consulta continuam apresentados no estado de erro da página. Nas larguras estreitas, a pesquisa reflui para uma linha própria e deve permanecer utilizável.

**Sucesso visual verificável**: o campo conserva `appearance="outline"`, mas não apresenta contorno em repouso; fundo, forma e ícone usam os tokens indicados; em foco o indicador continua perceptível; a altura se alinha aos controles da barra; a busca continua identificada no accessibility tree. O layout largo mantém a centralização e o estreito empilha o campo sem recorte.

### Formulário de criação

**Resolução**: Compose (componentes)  
**Decisão**: `MatFormField` com `MatInput` para entradas e `matIconButton` para ações iconográficas. O formulário fica imediatamente abaixo da barra superior.  
**Fonte**: decisão registrada `dd-002`; documentação oficial de [Form field](https://material.angular.dev/components/form-field/overview) e [Input](https://material.angular.dev/components/input/overview), além dos componentes listados no inventário.  
**Tokens**: `color.outline`, `color.on-surface`, `typography.body-medium` e `shape.corner-small`, quando aplicáveis.  
**Princípios**: PRIN-SEMANTIC-HTML, PRIN-KEYBOARD, PRIN-FOCUS-VISIBLE, PRIN-ACCESSIBLE-NAME, PRIN-CONTRAST, PRIN-TARGET-SIZE, PRIN-RESPONSIVE, PRIN-INPUT-MODALITIES, PRIN-STATE-COVERAGE, PRIN-STATE-FEEDBACK, PRIN-TOKENS.

**Restrições**: validação, foco, estado desabilitado, carregamento e falha devem ser explícitos; mensagens não podem depender somente de cor. Os campos textuais usam `MatFormField`/`MatInput`; seleção de cor e anexação de arquivo usam os controles nativos `input type="color"` e `input type="file"`, com rótulos acessíveis. A remoção de imagem usa ação iconográfica nomeada. O inventário não documenta espaçamento ou breakpoints nem mapeia esses dois tipos de entrada.

### Coleção, cards e reordenação

**Resolução**: Compose (componentes)  
**Decisão**: `MatCard` fornece a estrutura do card, com `mat-card-image` para a imagem em largura completa e `matIconButton` para as ações. A imagem fica antes do título; o card aceita a cor de fundo da nota ou transparência. Estilos da feature fornecem o destaque leve no hover e visibilidade das ações por foco/toque. O CDK aplica arraste ao card inteiro, mantendo alternativa por teclado.
**Fonte da decisão**: `dd-003`.

**Candidatos considerados**:

| Candidato | Fonte | Veredito |
|---|---|---|
| `MatCard` | Componente oficial | Fornece estrutura e imagem em largura completa; não fornece cor de fundo ligada aos dados, ações no hover ou arraste. |
| `matIconButton` | Componente oficial | Fornece controle iconográfico, mas não a estrutura do card. |
| `MatButtonToggleGroup` | Componente oficial | Alterna opções; não apresenta conteúdo de nota. |
| `MatFormField` | Componente oficial | Fornece entrada de dados, não apresentação de nota. |
| Padrão de coleção de notas | Padrão no inventário | As buscas por “notes collection layout” e “pinned notes card collection layout” não retornaram padrão. |
| Card/resumo de nota | Busca final no inventário | Buscas por “note card with images and hover actions”, “note image card drag surface” e “note summary tile with media and actions” não retornaram resultado. |

O `MatCard` não aplica padding no elemento do card; seções internas documentadas podem aplicar espaçamento, portanto a imagem deve usar o recurso de imagem em largura completa ou ficar fora dessas seções. A cor variável, o hover e o início do arraste são comportamentos da aplicação, não propriedades documentadas de `MatCard`.

**Tokens**: `color.surface`, `color.surface-container`, `color.on-surface`, `typography.title-medium`, `typography.body-medium` e `shape.corner-medium`, quando aplicáveis. A cor escolhida pelo usuário pertence aos dados da nota; sem cor escolhida, o fundo permanece transparente.  
**Princípios**: PRIN-SEMANTIC-HTML, PRIN-KEYBOARD, PRIN-FOCUS-VISIBLE, PRIN-ACCESSIBLE-NAME, PRIN-NOT-COLOR-ALONE, PRIN-CONTRAST, PRIN-TARGET-SIZE, PRIN-RESPONSIVE, PRIN-INPUT-MODALITIES, PRIN-REDUCED-MOTION, PRIN-STATE-COVERAGE, PRIN-STATE-FEEDBACK, PRIN-TOKENS, PRIN-NO-BESPOKE-PRIMITIVES.

**Restrições**: hover destaca levemente o card e apresenta ações iconográficas, que também ficam visíveis por foco e disponíveis por toque; o arraste inicia em qualquer área. A confirmação de remoção usa a confirmação nativa do navegador, sem componente de diálogo local. O inventário não oferece token de elevação nem define estados de card; não serão criados nomes de token para esses estilos.

### Detalhe da nota

**Resolução**: Reuse  
**Decisão**: `MatDialog` apresenta o detalhe completo da nota em modal, com imagens antes do título e sem espaçamento interno ao redor delas, título acessível, controle visível de fechamento, fechamento por Escape e restauração do foco ao acionador. A contenção de foco durante a modal é temporária e termina por uma dessas ações.  
**Fonte**: decisão registrada `dd-004`; documentação oficial de [Dialog](https://material.angular.dev/components/dialog/overview); a busca no adaptador local não encontrou `MatDialog` porque o inventário local não o lista.  
**Princípios**: PRIN-SEMANTIC-HTML, PRIN-KEYBOARD, PRIN-FOCUS-VISIBLE, PRIN-ACCESSIBLE-NAME, PRIN-CONTRAST, PRIN-RESPONSIVE, PRIN-INPUT-MODALITIES, PRIN-STATE-COVERAGE, PRIN-STATE-FEEDBACK, PRIN-TOKENS.

**Restrições**: conteúdo reflowa nas larguras suportadas; erros de carregamento/remover são apresentados sem indicar sucesso. O inventário local não documenta o componente nem o comportamento de foco, mas a documentação oficial do sistema cobre essas capacidades.

### Seleção de cor e anexos de imagem

**Resolução**: Compose (controles nativos)  
**Decisão**: `input type="color"` e `input type="file"` nativos capturam dados da nota; ações de remoção usam `matIconButton`. Não será criada uma abstração local para controles que o inventário não fornece.  
**Fonte**: decisão registrada `dd-006`, criada após busca no ledger sem correspondência específica; buscas no inventário por “select color for note background”, “color picker”, “file selection upload images” e “image attachment file picker” não retornaram componentes. Buscas de padrão por “note color selection control”, “color input control pattern”, “image attachment upload flow” e “image upload with file validation” também não retornaram resultados.
**Candidatos considerados**:

| Candidato | Fonte | Veredito |
|---|---|---|
| `MatFormField`/`MatInput` | Inventário e documentação oficial | Adequados aos campos textuais do formulário, mas não fornecem seleção nativa de cor ou arquivo. |
| `matIconButton` | Inventário | Fornece a ação iconográfica de remover, mas não a seleção de cor ou arquivo. |
| Controles nativos do navegador | Plataforma | Fornecem seleção de cor e arquivo sem criar um componente local; compõem a superfície junto aos campos e ações Material existentes. |
| Padrões de seleção de cor/anexo | Inventário | Não há padrão registrado para esses controles. |
**Tokens**: nenhum token de cor de interface para o valor de cor escolhido pelo usuário; tokens de interface aplicáveis seguem a composição do formulário.
**Princípios**: PRIN-SEMANTIC-HTML, PRIN-KEYBOARD, PRIN-FOCUS-VISIBLE, PRIN-ACCESSIBLE-NAME, PRIN-NOT-COLOR-ALONE, PRIN-CONTRAST, PRIN-TARGET-SIZE, PRIN-RESPONSIVE, PRIN-INPUT-MODALITIES, PRIN-STATE-COVERAGE, PRIN-STATE-FEEDBACK, PRIN-TOKENS, PRIN-NO-BESPOKE-PRIMITIVES.

**Restrições**: controles devem ter rótulos acessíveis e estados de validação/erro devem ser comunicados em texto; formatos e limites de imagem seguem RF-005. A cor selecionada é dado da nota, não token de interface. O inventário não mapeia controles nativos de cor ou arquivo.

### Confirmação de remoção

**Resolução**: Reuse (plataforma)  
**Decisão**: usar a confirmação nativa do navegador antes de remover a nota, sem criar um diálogo local.
**Fonte**: decisão registrada `dd-007`; o fluxo de remoção existente usa a confirmação do navegador. As buscas iniciais no ledger e no inventário por “confirmation dialog”, “confirm deletion dialog” e “native confirmation dialog” não encontraram uma decisão ou padrão do sistema.
**Princípios**: PRIN-SEMANTIC-HTML, PRIN-KEYBOARD, PRIN-FOCUS-VISIBLE, PRIN-ACCESSIBLE-NAME, PRIN-RESPONSIVE, PRIN-INPUT-MODALITIES, PRIN-STATE-COVERAGE, PRIN-STATE-FEEDBACK, PRIN-TOKENS.

**Restrições**: a confirmação e o gerenciamento de foco ficam a cargo do navegador; cancelar não altera a nota. Não há tokens de interface aplicáveis à superfície nativa do navegador.

### Estados e mensagens da coleção

**Resolução**: Compose (componentes e conteúdo semântico)  
**Decisão**: mensagens de carregamento, estado vazio, nenhum resultado, erro e conflito são conteúdo textual semântico; `MatFormField`/`MatError` fornece estados de validação de entrada e `matIconButton` fornece ações de recuperação quando aplicável. Nenhum componente de alerta foi encontrado no inventário local.  
**Fonte**: decisão registrada `dd-005`; componentes oficiais de formulário e ícone; buscas no inventário por “empty and error feedback” e “empty state and operation failure message” não retornaram correspondências.  
**Tokens**: `color.on-surface`, `color.primary` e `typography.body-medium`; o significado não depende exclusivamente de cor.  
**Princípios**: PRIN-SEMANTIC-HTML, PRIN-KEYBOARD, PRIN-ACCESSIBLE-NAME, PRIN-NOT-COLOR-ALONE, PRIN-CONTRAST, PRIN-RESPONSIVE, PRIN-INPUT-MODALITIES, PRIN-STATE-COVERAGE, PRIN-STATE-FEEDBACK, PRIN-TOKENS.

## Impacto no sistema de design

O inventário local está incompleto em relação à documentação oficial atual: ele não lista `MatCard`, `MatDialog`, `MatIcon` ou `MatInput`, nem mapeia os controles nativos de cor e arquivo. A pessoa responsável pelo inventário deve sincronizar esses componentes e documentar os breakpoints e tokens de espaçamento/elevação se fizerem parte da base oficial. O plano usa documentação oficial para não tratar componentes disponíveis como lacunas nem criar substitutos locais. A confirmação nativa do navegador permanece fora da tematização Angular Material.

## Validation round 1 — 2026-10-29

Principles source: `default` (version not declared). Surface kinds: interactive, layout, text, media, motion.  
Scan: 7 UI files, 79 raw values, 0 unknown tokens, 6 contract tokens not seen in source files. Tests: 18 unit and 11 browser tests passed; production build passed with a bundle-budget warning.

- [x] DS-F-001 **violation** · DS-003 · Note images used a plain `<img>` without the committed Material `mat-card-image` directive. Fixed in place by importing and applying `MatCardImage`, overriding its image margin to zero, and retaining the full-width image regression test.
- [x] DS-F-002 **violation** · DS-005 · The edit form used bespoke native text fields instead of the committed `MatFormField`/`MatInput` composition. Fixed in place by converting title and content fields to Material form fields and inputs.
- [x] DS-F-003 **violation** · DS-003/DS-005 · Saving a note without a background color could replace transparency with the editor's `#ffffff` color-picker value. Fixed in place with an explicit transparency control and regression coverage for transparent saves and selected colors.
- [x] DS-F-004 **note** · PRIN-TOKENS · The 79 raw values comprise 74 dimensions for layout, spacing, focus, image sizing and breakpoints (the inventory has no applicable spacing, elevation, motion or breakpoint tokens) and 5 color-picker defaults belonging to note data. Numerically matching shape values do not provide spacing tokens; retain these values until the inventory supplies semantically applicable tokens.
- [x] DS-F-005 **note** · DS-005 · The 6 tokens not seen by the source scan are used through the Material theme and component defaults (`color.primary`, `color.on-primary`, `color.surface`, `color.outline`, `shape.corner-full`, and `density.default`); the scan does not include dependency styles. `shape.corner-extra-small` is explicitly used for the card-title focus indicator. No implementation change is needed.

## Validation round 2 — 2026-10-29

Principles source: `default` (version not declared). Surface kinds: interactive, layout, text, media, motion.  
Scan: 7 UI files, 79 raw values, 0 unknown tokens, 6 contract tokens not seen in source files. Tests: 18 unit and 11 browser tests passed.

No findings. The Material image directive and editor form composition are present; transparent colors remain optional through save/reload; browser tests verify image ordering, card actions, responsive reflow, touch targets, modal focus, and reordering. The scan notes remain justified by the documented inventory gaps and Material's dependency-provided theme tokens.

## Verification — 2026-10-29

RFC acceptance criteria: 19 of 19 met.  
Spec requirements: DS-001 through DS-005 satisfied.  
Principles: `default` (version not declared); all applicable principles honored, with none disabled or unenforceable.  
Responsive behavior: no named breakpoints are supplied by the inventory; reflow and no horizontal scrolling were verified at 320 px.  
Tests: 18 unit tests and 11 Chromium browser tests passed. Production build passed with a bundle-budget warning below the configured error limit.

Verdict: the implementation meets its design requirements.

## Verificação do planejamento — 2026-10-29

Gate do sistema de design: aprovado. As sete superfícies têm resolução registrada; as decisões `dd-001` a `dd-005` foram verificadas contra a versão instalada `22.2.5`, e `dd-006`/`dd-007` registram os controles nativos de cor/arquivo e a confirmação de remoção. Os princípios vêm do conjunto padrão do projeto; nenhum está desabilitado ou sem verificação. O inventário não fornece breakpoints nem tokens de espaçamento, elevação ou movimento, e nenhum nome foi inventado. As novas exigências DS-006 e DS-007 correspondem aos controles já presentes; não houve alteração de código nem reexecução de testes nesta etapa de planejamento.
