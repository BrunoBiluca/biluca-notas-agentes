# Tarefas: Temas visuais

**Entrada**: Documentos de design em `specs/002-temas-visuais/`

**Pré-requisitos**: `plan.md`, `spec.md`, `research.md`, `data-model.md` e `contracts/`

**Testes**: Incluídos porque a constituição exige testes Vitest para regras de negócio e a especificação define critérios de aceitação verificáveis por navegador.

**Organização**: Tarefas agrupadas por história de usuário; as histórias estão em ordem de prioridade e dependência.

## Formato

- **[P]**: tarefa paralelizável, sem dependência de tarefa incompleta que edite os mesmos arquivos.
- **[USn]**: história de usuário correspondente à especificação.
- Todos os caminhos são relativos à raiz do repositório.

## Fase 1: Preparação

**Objetivo**: Preparar o pipeline global de estilos para gerar os esquemas claro e escuro com Sass.

- [X] T001 Migrar as regras globais existentes de `src/styles.css` para `src/styles.scss`, atualizar a entrada de estilos em `angular.json` e preservar as regras globais e de movimento reduzido existentes.

## Fase 2: Fundação compartilhada

**Objetivo**: Definir o modelo, contrato, persistência, inicialização e aplicação global do tema, necessários para as duas histórias.

- [X] T002 [P] Definir `ThemeMode` como `light | dark | system`, a chave `biluca-notas-agentes.theme-preference` e a validação dos três valores em `src/app/core/theme/theme-preference.model.ts`.
- [X] T003 [P] Definir a interface tipada do serviço e seu token de injeção, expondo sinais somente de leitura para modo e erro de persistência, em `src/app/core/theme/theme-preference.contract.ts`.
- [X] T004 Criar testes Vitest em `src/app/core/theme/theme-preference.service.spec.ts` para valor ausente e válido, valor inválido, cada modo, restauração, falhas de leitura/gravação e modo de sistema; confirmar que falham antes da implementação.
- [X] T005 Implementar o serviço baseado em `@ngrx/signals` em `src/app/core/theme/theme-preference.service.ts`: restaurar e gravar somente `light`, `dark` ou `system`, aplicar a escolha imediatamente, usar `system` como fallback, manter a escolha em memória em falha e expor o erro sem sucesso simulado.
- [X] T006 Inicializar o serviço antes da primeira renderização e registrar o ícone SVG local `contrast` em `src/app/app.config.ts`; criar o recurso SVG correspondente em `public/icons/contrast.svg`.
- [X] T007 Exibir no shell da aplicação uma mensagem global e acessível para falhas de persistência, ligada ao contrato do serviço, em `src/app/app.component.ts`.
- [X] T008 Gerar com Angular Material M3 e a paleta Azure existente os tokens semânticos claro/escuro em `src/styles.scss`; definir o esquema global como `light`, `dark` ou `light dark` sem alterar as cores de fundo próprias das notas.

**Checkpoint**: O serviço restaura e aplica um modo válido antes da renderização; falhas de armazenamento são informadas e não bloqueiam a aplicação.

## Fase 3: História 1 — Escolher a aparência da aplicação (Prioridade: P1) — MVP

**Objetivo**: Permitir escolher claro, escuro ou definido pelo sistema no menu da barra superior e manter a opção escolhida após reabrir a aplicação.

**Teste independente**: Abrir o menu, selecionar as três opções, verificar o esquema efetivo, a seleção textual, a operação por teclado e a restauração das opções após recarregar, inclusive `system`.

### Testes da História 1

- [X] T009 [P] [US1] Criar testes Playwright em `tests/browser/theme-preference.spec.ts` para presença e nome acessível do acionador, três opções, indicação textual da opção atual, aplicação de claro/escuro, acompanhamento de claro/escuro do sistema, persistência após recarga, navegação por teclado e mensagem acessível quando `localStorage` falhar.

### Implementação da História 1

- [X] T010 [US1] Implementar na barra existente de `src/app/features/notes/pages/notes-page.component.ts` o botão de ícone à direita e o `MatMenu` com opções “Claro”, “Escuro” e “Definido pelo sistema”; ligar as opções ao serviço por interface/token, indicar a atual também por texto e preservar o layout em viewport estreita.

**Checkpoint**: A História 1 pode ser validada independentemente pelos testes de serviço e navegador, incluindo seleção, modo do sistema, persistência e acessibilidade.

## Fase 4: História 2 — Manter notas legíveis e as funções disponíveis (Prioridade: P1)

**Objetivo**: Manter conteúdo, imagens, controles e cores próprias das notas legíveis e conservar todos os fluxos existentes nos três modos.

**Dependência**: Requer a História 1 para aplicar e selecionar os esquemas que serão verificados.

**Teste independente**: Com notas sem cor própria e com cores próprias, alternar entre claro, escuro e sistema; verificar legibilidade, preservação dos dados visuais e os fluxos de criação, consulta, edição, remoção, busca, fixação, ordenação e visualização.

### Testes da História 2

- [X] T011 [P] [US2] Criar testes Playwright em `tests/browser/theme-notes-compatibility.spec.ts` cobrindo notas sem cor e com cores próprias nos três modos, preservação das cores após alternar/recarregar e os fluxos de notas definidos em `RF-009`.

### Implementação da História 2

- [X] T012 [US2] Corrigir, se os testes de contraste ou legibilidade identificarem regressões, a apresentação de títulos, conteúdo, imagens e controles nos componentes `src/app/features/notes/ui/note-card.component.ts`, `src/app/features/notes/ui/note-images.component.ts`, `src/app/features/notes/pages/note-detail.page.ts` e `src/app/features/notes/pages/note-editor.page.ts`; preservar os valores de cor de fundo e os dados das notas.

**Checkpoint**: Notas com e sem cor própria permanecem legíveis e todos os fluxos existentes concluem com os mesmos resultados nos três modos.

## Fase 5: Acabamento e validação transversal

**Objetivo**: Executar a validação completa, corrigir regressões e manter o guia de validação alinhado ao resultado.

- [X] T013 Executar os comandos e roteiros de `specs/002-temas-visuais/quickstart.md`, corrigir falhas nos arquivos de implementação/teste correspondentes e registrar no próprio guia os resultados reais da validação.
- [X] T014 Verificar nos temas claro e escuro os pares de texto/fundo e os controles/indicadores visuais das superfícies padrão conforme os limites WCAG 2.2 AA definidos em `specs/002-temas-visuais/quickstart.md` e registrar tema, componente/estado, cores, razão e resultado em `specs/002-temas-visuais/quickstart.md`.

---

## Dependências e ordem de execução

### Dependências entre fases

- **Preparação (Fase 1)**: independente; habilita a configuração Sass necessária à fundação.
- **Fundação (Fase 2)**: depende de T001 para os estilos; T002 e T003 podem começar em paralelo. T004 depende de T002/T003; T005 depende de T002/T003/T004; T006 e T007 dependem do contrato e do serviço; T008 depende de T001.
- **História 1 (Fase 3)**: depende da fundação concluída; T009 pode ser escrito em paralelo com T010, pois os arquivos são distintos.
- **História 2 (Fase 4)**: depende da História 1 aplicada; T011 valida a experiência completa e T012 corrige somente regressões identificadas.
- **Acabamento (Fase 5)**: depende das duas histórias desejadas; T013 executa a validação de ponta a ponta e T014 registra a verificação de contraste CS-008.

### Dependências entre histórias

- **US1 (P1)**: começa após a fundação; não depende de outra história.
- **US2 (P1)**: depende de US1 para alternar os temas e verificar as notas em cada esquema.

### Oportunidades de paralelismo

- T002 e T003 editam arquivos distintos e podem ser feitas em paralelo.
- Após T001–T005, T006, T007 e T008 podem ser feitas em paralelo, pois afetam arquivos distintos.
- Após a fundação, T009 e T010 podem ser desenvolvidas em paralelo; validar T009 depois da integração.
- T011 e a investigação inicial de compatibilidade da História 2 podem começar em paralelo após US1; alterações nos componentes de nota só devem ser feitas quando os testes apontarem uma necessidade.

### Exemplo de paralelismo: História 1

```text
T009: criar testes de navegador em tests/browser/theme-preference.spec.ts
T010: implementar o menu em src/app/features/notes/pages/notes-page.component.ts
```

Os dois trabalhos usam arquivos distintos; a validação conjunta ocorre depois que ambos terminarem.

### Exemplo de paralelismo: fundação

```text
T002: definir o modelo em src/app/core/theme/theme-preference.model.ts
T003: definir a interface/token em src/app/core/theme/theme-preference.contract.ts
T008: gerar os estilos Sass em src/styles.scss (após T001)
```

## Estratégia de implementação

### MVP

1. Concluir a preparação e a fundação.
2. Concluir a História 1 e validar seleção, modo do sistema, acessibilidade e persistência.
3. A História 1 é o incremento demonstrável mínimo; a funcionalidade só deve ser considerada pronta para liberação depois de concluir a História 2, que valida a legibilidade e a preservação das operações de notas.

### Entrega incremental

1. Preparação e fundação: serviço testado e esquema global inicializado.
2. História 1: seletor completo e preferência persistente.
3. História 2: regressões de legibilidade e funcionalidades verificadas/corrigidas.
4. Acabamento: executar as validações automatizadas e manuais descritas no guia.

## Notas

- Toda tarefa está em formato de checklist, com ID sequencial e caminho de arquivo.
- [P] indica apenas tarefas em arquivos distintos sem dependência pendente.
- A preferência de tema em `localStorage` é a exceção delimitada e documentada no plano; os dados de notas continuam no IndexedDB.
- Não adicionar dependências, temas de terceiros ou alterações de esquema das notas.
