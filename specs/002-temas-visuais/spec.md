# Especificação da funcionalidade: Temas visuais

**Diretório da funcionalidade**: `specs/002-temas-visuais`

**Branch da funcionalidade**: não criada nesta etapa

**Criado em**: 2026-11-05

**Status**: Rascunho

**Entrada**: Adicionar temas claro, escuro e definido pelo sistema, selecionáveis por um botão de ícone à direita da barra de navegação superior, com menu suspenso. Temas de terceiros estão fora do escopo. Todas as funcionalidades existentes devem ser mantidas e as notas devem continuar visíveis.

## Cenários de usuário e testes

### História 1 — Escolher a aparência da aplicação (Prioridade: P1)

Como usuário, quero escolher entre os temas claro, escuro e definido pelo sistema para usar a aplicação com a aparência mais confortável para mim.

**Por que esta prioridade**: A seleção dos temas é o valor principal da funcionalidade e deve estar disponível de forma fácil de encontrar.

**Teste independente**: Abrir o menu de tema, selecionar cada opção e confirmar que a aparência geral da aplicação corresponde à escolha.

**Cenários de aceitação**:

1. **Dado** que o usuário está em qualquer página com a barra de navegação superior, **quando** aciona o botão de ícone de tema à direita da barra, **então** um menu suspenso apresenta as opções claro, escuro e definido pelo sistema.
2. **Dado** que o menu de tema está aberto, **quando** o usuário seleciona claro ou escuro, **então** a aparência da aplicação muda para a opção escolhida.
3. **Dado** que o menu de tema está aberto, **quando** o usuário seleciona definido pelo sistema, **então** a aparência acompanha o tema claro ou escuro configurado no dispositivo.
4. **Dado** que o usuário escolheu um tema, **quando** fecha e reabre a aplicação, **então** a última opção escolhida permanece aplicada, inclusive quando selecionou “Definido pelo sistema”.
5. **Dado** que o usuário navega pelo menu usando teclado, **quando** abre o botão, percorre as opções e confirma uma delas, **então** consegue selecionar o tema sem usar ponteiro.

### História 2 — Manter notas legíveis e as funções disponíveis (Prioridade: P1)

Como usuário, quero continuar vendo e usando minhas notas em qualquer tema para que a mudança de aparência não prejudique meu trabalho.

**Por que esta prioridade**: A mudança visual não pode comprometer o conteúdo nem as capacidades existentes da aplicação.

**Teste independente**: Verificar notas sem cor própria e notas com cada cor de fundo disponível nos três modos de tema, além de executar os fluxos existentes de consulta e edição.

**Cenários de aceitação**:

1. **Dado** que há notas com e sem cor de fundo própria, **quando** o usuário aplica qualquer tema, **então** títulos, conteúdo, imagens e controles permanecem visíveis.
2. **Dado** que uma nota tem uma cor de fundo escolhida pelo usuário, **quando** o tema da aplicação muda, **então** a cor da nota é preservada e seu texto permanece legível.
3. **Dado** que o usuário está em qualquer tema, **quando** cria, consulta, edita, remove, busca, fixa, ordena ou alterna a visualização de notas, **então** essas operações continuam disponíveis e produzem os mesmos resultados funcionais.
4. **Dado** que o sistema operacional muda entre os modos claro e escuro enquanto o modo definido pelo sistema está ativo, **quando** a aplicação atualiza sua aparência, **então** a preferência acompanha o novo modo sem alterar dados das notas.

### Casos extremos

- Se o dispositivo não informar uma preferência de aparência, o modo definido pelo sistema usa o tema claro.
- Uma nota cuja cor de fundo própria não combine com o tema da aplicação mantém sua cor e continua com contraste suficiente para leitura.
- A abertura, fechamento e seleção do menu devem funcionar com ponteiro, toque e teclado.
- A troca de tema não pode apagar, alterar ou redefinir notas e suas preferências visuais próprias.
- Se a preferência escolhida não puder ser restaurada ao reabrir a aplicação, o usuário deve ser informado e uma opção padrão válida deve ser aplicada sem impedir o uso das notas.

## Requisitos

### Requisitos funcionais

- **RF-001**: A barra de navegação superior DEVE apresentar, no lado direito, um botão de ícone que abre um menu suspenso de tema.
- **RF-002**: O menu DEVE oferecer as opções tema claro, tema escuro e tema definido pelo sistema, identificadas de forma compreensível.
- **RF-003**: Ao selecionar o tema claro ou escuro, o sistema DEVE aplicar a opção selecionada à aparência geral da aplicação.
- **RF-004**: Ao selecionar o tema definido pelo sistema, o sistema DEVE acompanhar a preferência de aparência do dispositivo e usar o tema claro quando essa preferência não estiver disponível.
- **RF-005**: O sistema DEVE manter a última opção de tema escolhida pelo usuário — claro, escuro ou “Definido pelo sistema” — após fechar e reabrir a aplicação, aplicando essa opção novamente ao iniciar.
- **RF-006**: O menu e suas opções DEVEM ser operáveis por ponteiro, toque e teclado, com estado selecionado perceptível e nomes compreensíveis para tecnologias assistivas.
- **RF-007**: Em todos os temas, títulos, conteúdo, imagens e controles das notas DEVEM permanecer visíveis e legíveis, incluindo notas com cor de fundo própria.
- **RF-008**: A mudança de tema NÃO DEVE substituir nem alterar as cores de fundo próprias das notas.
- **RF-009**: Todas as funcionalidades existentes de notas DEVEM permanecer disponíveis e conservar seus resultados funcionais em cada tema.
- **RF-010**: A funcionalidade DEVE limitar-se aos temas claro, escuro e definido pelo sistema; temas de terceiros não fazem parte do escopo.

### Entidades principais

- **Preferência de tema**: escolha do usuário entre tema claro, tema escuro e tema definido pelo sistema, incluindo a opção efetiva exibida quando o sistema determina a aparência.
- **Nota**: registro existente que mantém seus dados e sua cor de fundo própria independentemente da preferência de tema da aplicação.

## Critérios de sucesso

### Resultados mensuráveis

- **CS-001**: Em testes de aceitação, 100% das três opções de tema podem ser alcançadas e selecionadas pelo menu da barra superior.
- **CS-002**: Em testes com a preferência do dispositivo configurada em claro e escuro, o modo definido pelo sistema apresenta a aparência correspondente em ambos os casos; sem preferência disponível, apresenta a aparência clara.
- **CS-003**: Em testes de fechamento e reabertura da aplicação, 100% das últimas opções escolhidas — incluindo “Definido pelo sistema” — são restauradas e aplicadas.
- **CS-004**: Em testes com notas sem cor própria e com cada cor de fundo existente, 100% dos títulos, conteúdos, imagens e controles permanecem visíveis e legíveis nos três modos.
- **CS-005**: Todos os fluxos existentes de criação, consulta, edição, remoção, busca, fixação, ordenação e visualização de notas concluem com os mesmos resultados nos três modos.
- **CS-006**: Em testes de acessibilidade, o menu e a seleção de tema podem ser concluídos integralmente por teclado e têm nomes e estados compreensíveis por tecnologia assistiva.
- **CS-008**: Em validações nos temas claro e escuro, 100% dos textos e controles nas superfícies padrão da aplicação atendem aos critérios de contraste da paleta do sistema de design.

## Pressupostos

- O modo definido pelo sistema é o tema padrão para usuários sem preferência previamente escolhida.
- Uma preferência explícita do usuário prevalece sobre a preferência do dispositivo até que o usuário selecione novamente o modo definido pelo sistema.
- A aplicação mantém a opção escolhida pelo usuário, não apenas a aparência efetiva atual; assim, “Definido pelo sistema” permanece ativo e pode refletir mudanças futuras na preferência do dispositivo.
- A preferência de tema pertence ao ambiente de uso atual e não altera as notas nem seus dados.
- A aplicação possui uma barra de navegação superior comum às páginas onde o seletor de tema deve estar disponível.
- O design deve permitir avaliar a inclusão de outros temas no futuro, sem incluí-los nesta entrega.

## Requisitos do sistema de design

**Sistema de design**: Angular Material M3, versão 22.2.5.
**Superfícies identificadas**: controle de tema na barra superior; menu de opções; superfícies padrão de leitura, edição e operação das notas nos temas claro e escuro.
**Pontos de quebra**: o inventário do sistema não define pontos de quebra nomeados; a interface deve permanecer utilizável sem recorte em viewports estreitas.
**Famílias de tokens em uso**: `color.*`, `typography.*`, `shape.*`.

### Requisitos

- **DS-001**: O controle de tema DEVE compor a `MatToolbar` existente com um `MatIconButton` como acionador e um `MatMenu` contendo `MatMenuItem` para cada opção; não DEVE criar um menu local quando os componentes do sistema de design atendem ao fluxo.
- **DS-002**: As superfícies padrão DEVEM usar os tokens semânticos do sistema, incluindo `color.surface`, `color.on-surface`, `color.surface-container`, `color.primary`, `color.on-primary` e `color.outline`, cujos valores cobrem os modos claro e escuro.
- **DS-003**: A opção de tema atualmente selecionada DEVE ser identificável por texto no item do menu, sem depender somente da cor; itens do menu não DEVEM depender de papéis de seleção não suportados pelo componente.
- **DS-004**: A aplicação DEVE aplicar o esquema de cores claro, escuro ou claro/escuro do sistema à raiz visual, preservando a cor de fundo própria de cada nota e as regras existentes de legibilidade.
- **DS-005**: O controle e as superfícies da aplicação DEVEM permanecer acessíveis e sem recorte em viewports estreitas; não devem ser inventados nomes de pontos de quebra que não constem do inventário.

### Princípios em vigor

**Fonte**: `default` — o inventário não publica princípios próprios; aplicam-se os princípios padrão da extensão de design.
**Versão**: nenhuma declarada para os princípios.
**Tipos de superfície**: interativa, layout, texto, movimento.

| Princípio | Dimensão | Requisito |
|---|---|---|
| PRIN-SEMANTIC-HTML | Acessibilidade | Elementos e papéis semânticos correspondem ao comportamento. |
| PRIN-KEYBOARD | Acessibilidade | Todo controle interativo é operável somente por teclado. |
| PRIN-FOCUS-VISIBLE | Acessibilidade | O foco permanece visível e retorna ao acionador após fechar o menu. |
| PRIN-ACCESSIBLE-NAME | Acessibilidade | Cada controle tem nome acessível; o botão de ícone tem alternativa textual. |
| PRIN-NOT-COLOR-ALONE | Acessibilidade | A opção ativa é indicada também por texto. |
| PRIN-CONTRAST | Acessibilidade | Texto e elementos não textuais significativos atendem ao contraste do sistema em cada tema. |
| PRIN-TARGET-SIZE | Acessibilidade | O alvo de toque atende ao tamanho mínimo documentado pelo sistema. |
| PRIN-RESPONSIVE | Responsividade | O conteúdo reflowa sem recorte; o inventário não publica breakpoints nomeados. |
| PRIN-INPUT-MODALITIES | Interação | Todas as ações são alcançáveis por ponteiro, toque e teclado. |
| PRIN-REDUCED-MOTION | Interação | A animação do menu respeita a preferência por movimento reduzido. |
| PRIN-STATE-COVERAGE | Estados | Estados aplicáveis do acionador e do menu são definidos. |
| PRIN-STATE-FEEDBACK | Estados | A seleção produz feedback visível e falhas são comunicadas. |
| PRIN-TOKENS | Tokens | Cores, tipografia, forma e movimento usam tokens quando disponíveis. |
| PRIN-NO-BESPOKE-PRIMITIVES | Tokens | Primitivas fornecidas pelo sistema não são reconstruídas localmente. |

**Desativados para este projeto**: nenhum.
**Declarados, mas não aplicáveis**: nenhum.

### Dimensões

| Dimensão | Requisito | Coberto por |
|---|---|---|
| Estados | Acionador habilitado, foco visível, menu aberto/fechado, opção atual e erro de persistência | PRIN-STATE-COVERAGE; PRIN-STATE-FEEDBACK |
| Responsividade | Manter acionador e conteúdo sem recorte em viewports estreitas; sem breakpoints nomeados no inventário | DS-005; PRIN-RESPONSIVE |
| Acessibilidade | Nome do acionador, navegação por teclado, foco restaurado e estado atual textual | DS-003; PRIN-SEMANTIC-HTML; PRIN-KEYBOARD; PRIN-FOCUS-VISIBLE; PRIN-ACCESSIBLE-NAME |
| Tokens | Usar esquema semântico claro/escuro registrado e evitar valores de cor avulsos | DS-002; PRIN-TOKENS |
| Interação | Menu operável por todas as modalidades e compatível com movimento reduzido | DS-001; PRIN-INPUT-MODALITIES; PRIN-REDUCED-MOTION |

### Superfícies

As decisões e evidências por superfície estão registradas em [design-system.md](./design-system.md).
