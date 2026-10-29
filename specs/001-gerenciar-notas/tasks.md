---
description: 'Tarefas para implementar o gerenciamento de notas pessoais'
---

# Tarefas: Gerenciar notas pessoais

**Entrada**: Documentos de design em `/specs/001-gerenciar-notas/`

**Pré-requisitos**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/servicos.md`, `contracts/ui.md`, `design-system.md`, `quickstart.md`

**Testes**: Incluídos porque a constituição exige testes unitários Vitest para regras de negócio e o plano prevê testes de navegador para IndexedDB, coordenação entre abas e interações reais da UI.

**Organização**: Tarefas agrupadas por história. Os itens foram concluídos e validados conforme os critérios independentes de cada fase.

## Fase 1: Setup

**Objetivo**: Preparar o workspace Angular, testes e sistema visual Material 3.

- [x] T001 Criar workspace Angular 22, bootstrap em `src/main.ts`, rotas em `src/app/app.routes.ts`, configuração em `angular.json` e TypeScript em `tsconfig.json`
- [x] T002 Adicionar `@angular/cdk`, `@ngrx/signals`, Vitest e `@playwright/test` em `package.json`; configurar `playwright.config.ts` e `tests/browser/`
- [x] T003 Adicionar `@angular/material@22.2.5` compatível com CDK 22.2.5 e configurar tema Angular Material 3 sem tema legado em `package.json` e `src/styles.css`
- [x] T004 Registrar SVGs locais para visualização em grade/lista, ordenação, fixar, editar, mover, excluir, fechar modal e adicionar/remover imagem em `src/app/app.config.ts` e `public/icons/`, sem carregar fonte ou recurso remoto

## Fase 2: Fundacional

**Objetivo**: Estabelecer identidade, contratos, persistência e estado que bloqueiam as histórias.

- [x] T005 Definir `Note` e `NoteImage` em `src/app/features/notes/domain/note.model.ts`: `id` único; `ownerId` igual ao usuário atual e imutável; título aparado e não vazio; conteúdo opcional e normalizado se somente espaços; cor de fundo opcional; datas de criação/atualização; fixação inicialmente falsa; `manualOrder` inteiro; revisão positiva iniciada em 1; e lista de imagens; cada imagem deve usar MIME JPEG, PNG, WebP ou GIF e tamanho maior que zero e menor ou igual a 10.000.000 bytes
- [x] T006 Definir `CurrentUserProvider` e `CURRENT_USER_PROVIDER` em `src/app/core/identity/current-user.provider.ts` e `src/app/app.config.ts`, sem criar autenticação
- [x] T007 Implementar IndexedDB e índices por usuário, fixação e ordenação, com store separado para blobs, em `src/app/core/persistence/notes-database.ts`
- [x] T008 Definir interfaces e tokens de `NotesApplication`, `NoteRepository`, `NoteImageRepository` e `EditingSessionCoordinator` em `src/app/features/notes/data-access/service-contracts.ts`, conforme `specs/001-gerenciar-notas/contracts/servicos.md`
- [x] T009 Criar estado-base da feature com `@ngrx/signals`, coleção, carregamento, erros e filtros em `src/app/features/notes/data-access/notes.store.ts`

## Fase 3: História 1 — Criar e manter notas pessoais (Prioridade: P1)

**Objetivo**: Criar, abrir em detalhe, editar, salvar, cancelar e remover notas próprias, usando o formulário de criação na página principal e detalhe em modal.

**Teste independente**: Criar nota pela página principal; abrir seu detalhe em modal; editar e salvar; cancelar outra edição; remover; e confirmar validação, isolamento, datas, retorno de foco e resolução de conflito entre abas.

### Testes da História 1

- [x] T010 [P] [US1] Testar título obrigatório aparado, conteúdo em branco, valores iniciais e cor de fonte derivada em `src/app/features/notes/domain/note.factory.spec.ts`
- [x] T011 [P] [US1] Testar criação, detalhe, edição, cancelamento, remoção, isolamento e falhas da fachada em `src/app/features/notes/data-access/notes-application.lifecycle.spec.ts`
- [x] T012 [P] [US1] Testar aviso entre abas, conflito por revisão, recarregamento e sobrescrita explícita em `tests/browser/note-edit-conflicts.spec.ts`
- [x] T013 [P] [US1] Criar teste Playwright para criação pelo formulário da página principal e abertura/fechamento do detalhe em modal, incluindo Escape, rótulo acessível e restauração de foco, em `tests/browser/notes-ui-lifecycle.spec.ts`

### Implementação da História 1

- [x] T014 [US1] Implementar fábrica de notas com título aparado obrigatório, conteúdo em branco normalizado, valores iniciais e cor de fonte derivada em `src/app/features/notes/domain/note.factory.ts`
- [x] T015 [US1] Implementar operações CRUD escopadas por `ownerId`, atualização atômica por revisão e exclusão transacional de imagens em `src/app/features/notes/data-access/note.repository.ts`
- [x] T016 [US1] Implementar coordenação de edição entre abas com `BroadcastChannel`, notificações de revisão e encerramento de sessão em `src/app/features/notes/data-access/editing-session.coordinator.ts`
- [x] T017 [US1] Implementar fachada com ciclo de vida, rascunho, salvar/cancelar, conflitos e propagação de erros em `src/app/features/notes/data-access/notes-application.service.ts`
- [x] T018 [US1] Implementar páginas de criação/edição com Angular Signal Forms e ações explícitas de salvar/cancelar em `src/app/features/notes/pages/note-editor.page.ts`; manter rotas em `src/app/app.routes.ts`
- [x] T019 [US1] Substituir a navegação de detalhe por `MatDialog`, com título acessível, fechamento por Escape e controle visível, imagens antes do título e retorno do foco ao acionador em `src/app/features/notes/pages/note-detail.page.ts`, `src/app/features/notes/pages/notes-page.component.ts` e `src/app/app.routes.ts`
- [x] T020 [US1] Adicionar formulário compacto de criação à página principal com título obrigatório, conteúdo e cor opcionais, `MatFormField`, `MatInput`, Angular Signal Forms, validação e retorno visível de sucesso/erro em `src/app/features/notes/pages/notes-page.component.ts`

## Fase 4: História 2 — Ver e percorrer a coleção (Prioridade: P1)

**Objetivo**: Apresentar notas em grade ou lista, com agrupamento fixadas/livres, ações acessíveis e carregamento incremental.

**Teste independente**: Com pelo menos 105 notas, verificar toolbar, alternância grade/lista, ordem dos controles, seções fixadas/livres, resumos, ações por foco/toque e carregamento de mais itens próximo ao fim.

### Testes da História 2

- [x] T021 [P] [US2] Testar apresentação da coleção, alternância, carregamento sem duplicatas e estado vazio com dependências substitutas em `src/app/features/notes/data-access/notes-collection.spec.ts`
- [x] T022 [P] [US2] Testar mais de 100 registros, limite inicial, carregamento próximo ao fim, resumos e ações em `tests/browser/notes-collection.spec.ts`
- [x] T023 [P] [US2] Estender o teste de navegador para validar toolbar Material, pesquisa centralizada, formulário abaixo da barra, seções “Notas fixadas” e “Notas livres”, layout reflow e ações visíveis por hover/foco/toque em `tests/browser/notes-collection.spec.ts`

### Implementação da História 2

- [x] T024 [US2] Implementar consulta paginada escopada por usuário, lotes de até 100, precedência de fixação e ordenação padrão em `src/app/features/notes/data-access/note.repository.ts`
- [x] T025 [US2] Implementar carregamento incremental, estados vazio/erro e seleção reativa de visualização em `src/app/features/notes/data-access/notes.store.ts` e `src/app/features/notes/data-access/notes-application.service.ts`
- [x] T026 [US2] Reorganizar a página principal com `MatToolbar`, alternador `MatButtonToggleGroup`, botão iconográfico de ordenação e busca centralizada em `MatFormField`/`MatInput`; manter seções “Notas fixadas” e “Notas livres” e reflow sem recorte em `src/app/features/notes/pages/notes-page.component.ts`
- [x] T027 [US2] Reestruturar cada resumo como `MatCard`, renderizando imagens antes do título e sem espaçamento interno ao redor, fundo selecionado ou transparente, hover leve e ações iconográficas acessíveis por foco/toque em `src/app/features/notes/ui/note-card.component.ts` e `src/app/features/notes/ui/note-images.component.ts`
- [x] T028 [US2] Remover o botão exclusivo de arraste e aplicar CDK Drag ao card inteiro, mantendo as ações operáveis e a alternativa de reordenação por teclado em `src/app/features/notes/pages/notes-page.component.ts` e `src/app/features/notes/ui/note-card.component.ts`

## Fase 5: História 3 — Adicionar imagens às notas (Prioridade: P2)

**Objetivo**: Anexar, exibir e remover imagens permitidas sem perder os demais dados da nota.

**Teste independente**: Anexar JPEG, PNG, WebP e GIF de até 10.000.000 bytes; confirmar as imagens acima do título na coleção e no detalhe modal; remover uma imagem e confirmar que os outros dados permanecem.

### Testes da História 3

- [x] T029 [P] [US3] Testar MIME permitido, limite inclusivo de 10.000.000 bytes e rejeição de arquivos inválidos em `src/app/features/notes/domain/note-image-validation.spec.ts`
- [x] T030 [P] [US3] Testar anexar, persistir, exibir e remover imagem no navegador em `tests/browser/note-images.spec.ts`
- [x] T031 [P] [US3] Validar no navegador anexar imagem durante criação/edição e que imagens precedem o título sem padding no card e no detalhe modal em `tests/browser/note-images.spec.ts`

### Implementação da História 3

- [x] T032 [US3] Implementar validação dos formatos JPEG, PNG, WebP e GIF e limite de 10.000.000 bytes em `src/app/features/notes/domain/note-image-validation.ts`
- [x] T033 [US3] Implementar persistência e leitura de blobs, associação a nota/usuário e propagação de falhas de quota em `src/app/features/notes/data-access/note-image.repository.ts`
- [x] T034 [US3] Integrar anexos e remoções ao rascunho e ao salvamento da fachada em `src/app/features/notes/data-access/notes-application.service.ts`
- [x] T035 [US3] Implementar seleção, validação, pré-visualização e remoção de imagens no editor e exibição em `src/app/features/notes/ui/note-images.component.ts`
- [x] T036 [US3] Ajustar a composição de imagens para `MatCard` e `MatDialog`, com imagem antes do título e sem espaçamento interno ao redor; conectar o seletor de imagens ao formulário principal de criação e manter pré-visualização/remoção na edição em `src/app/features/notes/ui/note-images.component.ts`, `src/app/features/notes/ui/note-card.component.ts`, `src/app/features/notes/pages/note-detail.page.ts` e `src/app/features/notes/pages/notes-page.component.ts`

## Fase 6: História 4 — Buscar e organizar notas (Prioridade: P2)

**Objetivo**: Buscar em toda a coleção, fixar notas e escolher ordem manual, preservando as modalidades acessíveis.

**Teste independente**: Buscar título e conteúdo, confirmar resultados fora da página carregada, fixar/desafixar e alternar ordem recente/manual; mover notas por arraste em qualquer área e por teclado, recarregar e confirmar a ordem persistida.

### Testes da História 4

- [x] T037 [P] [US4] Testar busca completa, resultado vazio, precedência de fixação e ordenação manual em `src/app/features/notes/data-access/notes-search-organization.spec.ts`
- [x] T038 [P] [US4] Testar busca em até 2 segundos com 1.000 notas, fixação, reordenação por CDK/teclado e persistência após recarga em `tests/browser/notes-search-organization.spec.ts`
- [x] T039 [P] [US4] Estender os testes de navegador para confirmar os ícones e nomes acessíveis de fixar/desafixar, ordenar, mover, editar e remover, além da operação das ações por teclado em `tests/browser/notes-search-organization.spec.ts`

### Implementação da História 4

- [x] T040 [US4] Implementar busca em título/conteúdo para todo o `ownerId`, fixação prioritária, ordenação recente/manual e persistência de posição em `src/app/features/notes/data-access/note.repository.ts`
- [x] T041 [US4] Implementar modos de ordenação, busca, fixação e reordenação na store e fachada em `src/app/features/notes/data-access/notes.store.ts` e `src/app/features/notes/data-access/notes-application.service.ts`
- [x] T042 [US4] Exibir a ordenação como botão iconográfico com nome acessível e estado anunciado; substituir os rótulos textuais das ações do card por ícones Material com nomes acessíveis em `src/app/features/notes/pages/notes-page.component.ts` e `src/app/features/notes/ui/note-card.component.ts`
- [x] T043 [US4] Manter ações de mover para cima/baixo como alternativa por teclado ao arraste, com estados desabilitados e retorno de falha perceptível em `src/app/features/notes/ui/note-card.component.ts`

## Fase 7: Polimento e validação transversal

**Objetivo**: Validar o contrato da interface e atualizar o guia executável.

- [x] T044 Atualizar os cenários de Material 3, modal, foco, imagens, hover/toque/teclado e reflow em `specs/001-gerenciar-notas/quickstart.md`
- [x] T045 Executar testes Vitest, build Angular e cenários Playwright de UI; corrigir falhas e registrar os comandos/resultados em `specs/001-gerenciar-notas/quickstart.md`

## Dependências e ordem de execução

### Dependências das fases

- **Setup (Fase 1)**: T003 e T004 devem concluir antes da integração Material; T001 e T002 já estão concluídas.
- **Fundacional (Fase 2)**: T005–T009 estão concluídas e precedem todas as histórias.
- **US1 (Fase 3)**: T019 e T020 dependem do provider Material de T003–T004 e da fachada já existente.
- **US2 (Fase 4)**: T026–T028 dependem do Material de T003–T004; T028 depende da estrutura de card de T027.
- **US3 (Fase 5)**: T036 depende da composição de card/modal de T019 e T027; a persistência de imagens já está implementada.
- **US4 (Fase 6)**: T042 depende dos controles da toolbar em T026 e da composição do card em T027; T043 depende do CDK em T028.
- **Polimento (Fase 7)**: T044–T045 dependem das mudanças de UI em todas as histórias.

### Dependências entre histórias

- **US1 (P1)**: criação, detalhe, edição e remoção; independente da busca e ordenação avançadas.
- **US2 (P1)**: coleção e toolbar; depende das notas e operações de US1 para o fluxo completo de criação/detalhe.
- **US3 (P2)**: imagens; usa a coleção de US2 e o detalhe modal de US1 para validar apresentação.
- **US4 (P2)**: organização; usa a toolbar de US2 e as ações do card.

### Oportunidades de paralelismo

- T003 e T004 são sequenciais porque T004 usa o registro de ícones habilitado pela dependência.
- Em US1, T013 pode ser implementada/testada independentemente de T019–T020; T019 e T020 podem avançar em paralelo após T003–T004, desde que os arquivos compartilhados sejam coordenados.
- Em US2, T023 pode ser escrito em paralelo com T026; T027 pode ser feito em paralelo com T026 após setup Material; T028 depende de T027.
- Em US3, T031 pode ser escrito em paralelo com T036; persistência/validação existente não bloqueia a tarefa visual.
- Em US4, T039 pode ser escrito em paralelo com T042–T043; T043 depende da ativação de arraste em T028.
- As histórias US1 e US2 envolvem a página principal e devem ser integradas em sequência para evitar conflitos em `notes-page.component.ts`.

## Estratégia de implementação

### MVP

Entregar **US1 + US2**, ambas P1, incluindo criação na página principal, detalhe em modal e coleção responsiva; sem a coleção e os controles de navegação, o ciclo de vida da nota não fica utilizável.

### Entrega incremental

1. Adicionar Material 3 e registrar ícones SVG locais.
2. Concluir US1: formulário de criação principal, modal de detalhe e foco acessível.
3. Concluir US2: toolbar, seções, cards com imagens e arraste em qualquer área.
4. Concluir US3: imagens no card/detalhe, sem espaçamento interno ao redor.
5. Concluir US4: ícones de organização, busca e alternativas por teclado.
6. Executar cenários do quickstart, Vitest, build e Playwright.

## Critérios independentes de teste por história

- **US1**: criar pelo formulário principal, abrir modal, editar/salvar, cancelar e remover; validar foco restaurado, título obrigatório, isolamento e conflitos entre abas.
- **US2**: conferir toolbar e busca centralizada, formulário abaixo, seções fixadas/livres, lista/grade, ações disponíveis por hover/foco/toque e carregamento de mais de 100 notas sem recorte responsivo.
- **US3**: aceitar JPEG/PNG/WebP/GIF de até 10.000.000 bytes, rejeitar arquivo inválido, exibir imagens antes do título sem padding no card e modal, e remover imagem sem alterar outros campos.
- **US4**: buscar coleção completa de 1.000 notas em até 2 segundos, fixar antes das livres, alternar ordenação, mover por arraste a partir de qualquer área e por teclado, mantendo ordem após recarga.

## Resumo da geração

- **Total**: 45 tarefas (45 concluídas, 0 pendentes).
- **US1**: 11 tarefas; todas concluídas.
- **US2**: 8 tarefas; todas concluídas.
- **US3**: 8 tarefas; todas concluídas.
- **US4**: 7 tarefas; todas concluídas.
- **Oportunidades paralelas**: T013 e tarefas independentes de UI após setup; T023/T026; T027/T026; T031/T036; T039/T042–T043.
- **MVP entregue**: US1 + US2 (P1), incluindo a nova apresentação Material da página principal; US3 e US4 também foram concluídas.
- **Formato**: todas as tarefas usam checkbox, ID sequencial, rótulos de paralelismo/história quando aplicáveis e caminhos de arquivos.
