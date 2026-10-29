# Plano de implementação: Gerenciar notas pessoais

**Branch**: `001-gerenciar-notas` | **Data**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da funcionalidade em `specs/001-gerenciar-notas/spec.md`

## Resumo

Aplicação Angular local para criar, consultar, editar, remover, buscar e organizar notas pessoais com imagens. A interface usará Angular Material Design 3: componentes oficiais para toolbar, entradas, cards, ícones e modal; Angular CDK cuidará da reordenação por arrastar e soltar; `@ngrx/signals` manterá o estado em memória; serviços definidos por interfaces e tokens tipados de injeção separarão os componentes da lógica e da persistência; IndexedDB armazenará notas e imagens; e Vitest e Playwright cobrirão regras de negócio e fluxos reais no navegador. A aplicação não adicionará integrações externas.

## Contexto técnico

**Linguagem/versão**: TypeScript compatível com Angular 22; Angular 22 estável e em suporte ativo na data do plano.

**Dependências principais**: Angular 22; `@angular/material` 22.2.5 para os componentes Angular Material Design 3; Angular CDK 22.2.5 para drag-and-drop e infraestrutura de sobreposição; `@ngrx/signals` 22.x para estado em memória; Angular Signal Forms para formulários; Vitest pelo Angular CLI; Playwright para validações de navegador já aprovadas. As versões dos pacotes Angular devem permanecer alinhadas na major 22.

**Persistência**: IndexedDB nativo do navegador Chrome. Notas e metadados serão registros indexados por usuário; os binários de imagem serão `Blob`s em object store separado, associados por identificador. A interface de persistência ficará atrás de contratos de serviço.

**Testes**: Vitest com `ng test`; testes unitários de regras de negócio e serviços com dependências substituíveis. Usar testes em navegador para validar integrações que dependam de APIs reais do browser, como IndexedDB e coordenação entre abas.

**Plataforma alvo**: Aplicação web local, executada no Google Chrome moderno, sem servidor nem integração externa no escopo.

**Tipo de projeto**: Aplicação web Angular de página única.

**Metas de desempenho**: Busca em uma coleção de até 1.000 notas em até 2 segundos; exibir no máximo 100 notas inicialmente e carregar lotes seguintes automaticamente ao se aproximar do fim da lista visível.

**Restrições**: O usuário atual já é fornecido pela aplicação; todos os acessos devem ser limitados ao seu identificador. Cada imagem aceita deve ser JPEG, PNG, WebP ou GIF e ter até 10 MB. O armazenamento do navegador pode ser limitado ou removido, e falhas devem ser comunicadas sem sucesso fictício. Edições exigem salvar ou cancelar; conflitos entre abas permitem recarregar a versão mais recente ou sobrescrevê-la explicitamente. A composição, os tokens e as lacunas visuais seguem [design-system.md](./design-system.md); não serão inventados tokens nem nomes de breakpoints ausentes no inventário.

**Escala/escopo**: Notas pessoais, até pelo menos 1.000 itens para busca e paginação; quantidade de imagens por nota sem limite funcional, sujeita à quota real do navegador. Sem autenticação nova, compartilhamento, sincronização remota ou outros serviços externos.

## Verificação da constituição

*Gate: aprovado antes da pesquisa. Reavaliado após o desenho.*

| Princípio/restrição | Verificação |
|---|---|
| Estado Angular com `@ngrx/signals` | Atendido: SignalStore será a fonte do estado em memória; a persistência continua nos serviços. |
| Interface de serviço e token tipado para injeção | Atendido: cada serviço exposto terá contrato por interface e `InjectionToken` próprio; componentes dependerão do contrato da fachada, não da implementação. |
| Regras de negócio testadas com Vitest | Atendido: validações, ordenação, fixação, pesquisa e tratamento de conflito terão testes unitários. |
| Persistência local em IndexedDB, sem integração externa | Atendido: IndexedDB será o único armazenamento persistente; os contratos permitem substituição futura, sem implementar ou conectar integração externa. |
| Dependências justificadas e aprovadas | Atendido: Angular Material foi solicitado explicitamente como base da interface; CDK e NgRx Signals também foram escolhidos explicitamente. [research.md](./research.md) registra justificativas e alternativas. Playwright foi escolhido para validar APIs reais do navegador e sua inclusão em T002 foi aprovada pelo usuário ao solicitar o registro desta justificativa no plano. Angular Material e CDK serão alinhados em 22.2.5; os demais pacotes Angular/NgRx permanecem alinhados à major 22. A camada IndexedDB usará APIs nativas, sem wrapper adicional. Vitest é a escolha requerida e suportada pelo Angular CLI. |
| Angular estável mais recente no início da implementação | Atendido: a pesquisa de 2026-10-28 confirma Angular 22 estável, em suporte ativo e como major atual; o alvo explícito Angular 22 é compatível. |
| Angular Signal Forms | Atendido: telas de criação e edição usarão `@angular/forms/signals`; outras abordagens de formulário não serão introduzidas. |
| Sistema de design e acessibilidade | Atendido: [design-system.md](./design-system.md) registra a composição Material 3, os tokens disponíveis, os estados e as restrições de acessibilidade. A documentação oficial confirma os componentes que faltam no inventário local; o inventário precisa ser sincronizado e não fornece tokens de espaçamento, elevação ou movimento nem nomes de breakpoint. |
| Idioma | Atendido: documentação em português; identificadores e código da aplicação em inglês. |

**Resultado do gate**: sem violações ou esclarecimentos pendentes.

## Plano da interface

A página principal será reorganizada para colocar alternância de grade/lista e ordenação à esquerda da pesquisa centralizada, o formulário de criação logo abaixo da barra e, em seguida, as seções de notas fixadas e livres. Os controles e a modal usarão componentes oficiais Material 3; o card comporá `MatCard` com estilos específicos de fundo/hover e a interação de arraste do CDK. O arraste iniciará em qualquer área do card e continuará acessível por teclado. As ações usarão ícones locais com nomes acessíveis e serão apresentadas em hover, foco e toque. O contrato verificável está em [contracts/ui.md](./contracts/ui.md).

## Estrutura do projeto

### Documentação da funcionalidade

```text
specs/001-gerenciar-notas/
├── plan.md
├── research.md
├── data-model.md
├── design-system.md
├── quickstart.md
├── contracts/
│   ├── servicos.md
│   └── ui.md
└── tasks.md
```

### Código-fonte (raiz do repositório)

```text
src/
├── app/
│   ├── core/
│   │   ├── identity/
│   │   └── persistence/
│   └── features/
│       └── notes/
│           ├── data-access/
│           ├── domain/
│           ├── pages/
│           └── ui/
└── main.ts

tests/
└── browser/
```

Os testes unitários Vitest ficarão co-localizados com as unidades testadas (`*.spec.ts`); `tests/browser/` conterá apenas cenários que precisem de navegador real. A divisão de `notes` separa contratos e regras de domínio, acesso a dados e interface; componentes e páginas ficam limitados à interação com o usuário.

**Decisão de estrutura**: aplicação Angular única, com feature de notas e camada central para identidade e persistência. A separação é suficiente para manter componentes sem lógica de negócio nem acesso direto ao IndexedDB, sem criar um backend que está fora do escopo. A interface Material e os estilos de interação específicos da feature permanecem nas páginas e unidades de UI da feature; não será criado um novo componente genérico de card ou modal.

## Complexidade

Não há violações da constituição a justificar. A dependência Material atende à escolha explícita do usuário; ajustes específicos de card e hover serão estilos da feature sobre componentes oficiais, não novos primitivos. O padrão de serviços por interface e tokens de DI evita acoplamento da UI e da aplicação a IndexedDB; não será introduzido um backend ou um framework adicional de persistência.
