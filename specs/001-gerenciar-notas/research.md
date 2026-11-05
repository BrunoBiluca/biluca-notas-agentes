# Pesquisa técnica

**Data**: 2026-10-29  
**Funcionalidade**: Gerenciar notas pessoais

## Angular 22

**Decisão**: Adotar Angular 22 estável e alinhar todos os pacotes Angular à major 22.

**Justificativa**: A tabela oficial classifica Angular 22 como versão ativamente suportada, lançada em 3 de junho de 2026, com suporte ativo previsto até junho de 2027 e LTS até junho de 2028. Os requisitos publicados para Angular 22.0.x incluem Node.js `^22.22.3`, `^24.15.0` ou `^26.0.0` e TypeScript `>=6.0.0 <6.1.0`. Isso satisfaz tanto a versão solicitada quanto a restrição de usar a versão estável mais recente no início deste planejamento.

**Alternativas consideradas**: Angular 21 permanece em LTS, mas não satisfaz o requisito explícito Angular 22. Uma versão de pré-lançamento não é necessária.

**Referências**: [versões ativamente suportadas](https://angular.dev/reference/releases#actively-supported-versions); [compatibilidade de versões](https://angular.dev/reference/versions).

## Angular CDK e drag-and-drop

**Decisão**: Usar `@angular/cdk` 22.2.5 para arrastar e soltar e infraestrutura de overlay; usar `@angular/material` 22.2.5 para a interface Material Design 3.

**Justificativa**: Angular Material é uma dependência separada: o CDK instalado no projeto fornece primitivas de interação, não os componentes visuais Material. A versão publicada do Material é compatível com Angular 22 e exige a versão correspondente do CDK. A documentação oficial oferece toolbar, botão de alternância, botão de ícone, campo de formulário com input, card, diálogo e ícone. `MatCard` oferece imagem em largura completa; cor de fundo variável, hover e arraste no card inteiro permanecem comportamentos da aplicação. `MatDialog` fornece comportamento modal e gestão de foco. O CDK oferece `CdkDrag` e `CdkDropList`; soltar não atualiza por si só o modelo, então a aplicação deve persistir a nova ordem e disponibilizar comandos de teclado.

**Alternativas consideradas**: Usar somente CDK e elementos nativos evitaria instalar o pacote visual, mas não atenderia ao pedido explícito de basear a UI no Angular Material Design 3. Arraste HTML nativo evita a dependência CDK, mas não oferece a mesma infraestrutura pronta.

**Justificativa de dependência**: A solicitação explícita do usuário aprova Angular Material como sistema visual; o CDK existente é reutilizado para arraste e sobreposições. O pacote Material será limitado aos controles usados na feature e as versões Angular/Material/CDK permanecerão alinhadas.

**Referências**: [metadados npm do CDK 22.2.5](https://registry.npmjs.org/@angular/cdk/22.2.5); [metadados do Angular Material](https://www.npmjs.com/package/@angular/material); [instalação](https://material.angular.dev/guide/getting-started); [tema M3](https://material.angular.dev/guide/theming); [toolbar](https://material.angular.dev/components/toolbar/overview); [button toggle](https://material.angular.dev/components/button-toggle/overview); [buttons](https://material.angular.dev/components/button/overview); [form field](https://material.angular.dev/components/form-field/overview); [input](https://material.angular.dev/components/input/overview); [card](https://material.angular.dev/components/card/overview); [dialog](https://material.angular.dev/components/dialog/overview); [icon](https://material.angular.dev/components/icon/overview); [guia de drag-and-drop](https://angular.dev/guide/drag-drop).

## Angular Material Design 3 e composição da interface

**Decisão**: Adicionar `@angular/material` 22.2.5, usar o tema Material 3 atual e compor as superfícies da especificação com `MatToolbar`, `MatButtonToggleGroup`, `matIconButton`, `MatFormField`/`MatInput`, `MatCard`, `MatDialog` e `MatIcon`.

**Justificativa**: O usuário escolheu explicitamente Angular Material Design 3. Material não é fornecido por `@angular/cdk`, portanto o pacote separado é necessário. `MatCard` acomoda imagem antes do título e o recurso de imagem em largura completa; o card aceita estilos de fundo da aplicação e ações sobrepostas, enquanto o CDK aplica arraste ao elemento inteiro. `MatDialog` apresenta o detalhe como modal, com título acessível, fechamento por teclado e restauração de foco. O inventário local contém apenas uma parte dos componentes oficiais, então a decisão também é registrada com fontes oficiais em [design-system.md](./design-system.md).

**Ícones e integrações**: `MatIcon` aceita SVGs registrados. Para preservar a restrição de não adicionar integrações externas, ícones serão arquivos SVG locais; a fonte de ícones hospedada externamente não será usada.

**Responsividade**: Material fornece os controles, mas não organiza automaticamente a página de notas em diferentes larguras. A grade, a barra, os cards e a modal devem refluir por estilos responsivos da aplicação. O inventário não lista nomes de breakpoints; nenhum nome será inventado.

**Alternativas consideradas**: Construir os controles manualmente com HTML e CSS reutilizaria apenas CDK e reduziria dependências, mas contrariaria a escolha explícita do sistema Material. `MatCard` e `MatDialog` foram preferidos a implementações locais; estilos específicos limitam-se às necessidades de cor, hover e arraste descritas na especificação.

## Apresentação visual do campo de busca

**Decisão**: Manter a composição existente `MatFormField` + `MatInput` com `appearance="outline"` e adicionar `MatIcon` como prefixo de pesquisa. O fundo usa `color.surface-container`, o ícone `color.primary` e a forma `shape.corner-extra-small`; a dimensão alinha-se aos controles da toolbar. O contorno fica oculto em repouso, mas deve continuar visível como indicador de foco.

**Justificativa**: O sistema fornece os componentes e tokens necessários para atualizar a aparência sem criar um primitivo local nem alterar a lógica de busca. O inventário não oferece token equivalente para o arredondamento pedido nem token de altura para o campo; por isso, usa-se o menor token de forma disponível e a dimensão registrada para os controles da toolbar. Acessibilidade de foco tem precedência sobre a remoção de borda em todos os estados.

**Alternativas consideradas**: Um campo HTML/CSS próprio ou novo pacote de busca duplicaria componentes já disponíveis; manter a borda invisível também em foco removeria o único indicador visual de teclado; criar token ou breakpoint não existente contradiz a fidelidade ao inventário.

**Fontes**: inventário `.design-system/inventory.json` (tokens `color.surface-container`, `color.primary`, `shape.corner-extra-small` e dimensões dos controles `icon-button`/`button-toggle`); decisão existente `dd-001` para a composição da toolbar e decisão complementar `dd-008` para a aparência do campo; documentação Angular Material para Form field, Input e Icon, já referenciada em [design-system.md](./design-system.md).

## NgRx Signals

**Decisão**: Usar SignalStore de `@ngrx/signals` como estado de interface em memória. Os componentes lerão estado reativo e dispararão ações por uma fachada tipada; operações de persistência continuam nos serviços.

**Justificativa**: `@ngrx/signals` 22.0.1 declara `@angular/core: ^22.0.0` como peer dependency. SignalStore combina estado, sinais derivados e métodos em um serviço Angular e permite manter as atualizações explícitas. A coleção pode adotar `withEntities` se a forma normalizada por identificador simplificar a atualização de notas.

**Alternativas consideradas**: Um serviço próprio com Angular Signals reduz dependências e pode atender a um escopo menor, mas não cumpre a decisão solicitada de NgRx Signals. NgRx Store tradicional adicionaria estruturas não necessárias para a aplicação local descrita.

**Justificativa de dependência**: A escolha explícita do usuário aprova `@ngrx/signals`; nenhum outro pacote de estado do NgRx será adicionado.

**Referências**: [metadados npm de `@ngrx/signals` 22.0.1](https://registry.npmjs.org/@ngrx/signals/22.0.1); [guia SignalStore](https://github.com/ngrx/platform/blob/ddd9772e81e2db8a8964fa65f355086118d29dd9/projects/www/src/app/pages/guide/signals/signal-store/index.md); [`withEntities`](https://github.com/ngrx/platform/blob/ddd9772e81e2db8a8964fa65f355086118d29dd9/modules/signals/entities/src/with-entities.ts).

## Interfaces de serviço e tokens tipados

**Decisão**: Definir cada serviço exposto por uma interface TypeScript e um `InjectionToken<Interface>` compartilhado, com provider explícito para sua implementação. Componentes dependerão apenas da interface da fachada de aplicação.

**Justificativa**: Interfaces TypeScript não existem em runtime e não podem ser tokens de injeção. Angular recomenda `InjectionToken<T>` quando o tipo não tem representação em runtime; token fornecido e token injetado precisam ser a mesma instância. Essa separação permite que a implementação de persistência seja substituída sem mudar a UI ou as regras de aplicação.

**Alternativas consideradas**: Injetar uma classe concreta diretamente é mais simples, mas acopla consumidores à classe. Uma classe abstrata pode atuar como token de runtime, porém não corresponde ao contrato de interface solicitado.

**Limite de escopo**: Os contratos criam um ponto de substituição futuro; não significam que uma base remota ou qualquer integração externa será adicionada. A implementação desta funcionalidade continuará exclusivamente local.

**Referências**: [`InjectionToken`](https://angular.dev/api/core/InjectionToken); [definição de providers e tokens](https://angular.dev/guide/di/defining-dependency-providers).

## IndexedDB e imagens

**Decisão**: Persistir notas e metadados no IndexedDB e imagens em `Blob`s em object store separado, referenciados por identificadores. Encapsular abertura, transações e erros nos serviços definidos por interfaces.

**Justificativa**: IndexedDB é assíncrono, transacional e aceita `Blob` pelo structured clone. Separar binários de metadados evita carregar os dados de imagem em operações de leitura de toda a coleção. Na UI, manter referências de imagem em memória e criar object URLs somente quando necessárias, revogando-as ao liberar as imagens.

**Alternativas consideradas**: `localStorage` é síncrono e inadequado para imagens e maiores volumes; a documentação de Web Storage descreve limite total de 10 MiB por origem. OPFS pode ser considerado se surgir necessidade de operações especializadas com arquivos, mas adicionaria complexidade sem requisito atual.

**Riscos e tratamento**: A quota depende do navegador. Escritas podem falhar com `QuotaExceededError`; erros de leitura e gravação devem ser expostos à UI como falhas, nunca como sucesso. `navigator.storage.estimate()` é estimativa e `navigator.storage.persist()` pode ser negado. A aplicação não deve prometer que os dados locais equivalem a backup permanente. A exclusão de nota e de suas imagens deve ocorrer de forma transacional.

**Referências**: [tipos do structured clone](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types); [`IDBObjectStore.put()`](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/put); [boas práticas IndexedDB para estado](https://web.dev/articles/indexeddb-best-practices-app-state); [quotas e eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria); [`StorageManager.persist()`](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist).

## Edições e coordenação entre abas

**Decisão**: Usar `BroadcastChannel` por meio de serviço tipado para avisos de edição aberta e de nota alterada. Armazenar uma revisão monotônica da nota; ao salvar, comparar a revisão esperada e gravar em uma transação IndexedDB atômica. Em conflito, oferecer recarregar a versão atual ou sobrescrever explicitamente usando a revisão corrente.

**Justificativa**: Cada aba tem seu próprio estado em memória; transações IndexedDB não atualizam automaticamente os SignalStores das outras abas. `BroadcastChannel` comunica eventos entre contextos da mesma origem, e a revisão no próprio banco é a autoridade para detectar gravações concorrentes, inclusive quando uma notificação não é recebida. Uma transação que verifica revisão e grava evita a janela de corrida entre verificação e escrita.

**Comportamento**: Ao abrir uma edição, a aba anuncia que está editando a nota e consulta sessões ativas; uma sessão existente aciona o aviso imediato especificado. Cancelar ou salvar encerra a sessão. As notificações são informativas, não um bloqueio: o usuário ainda escolhe carregar o estado salvo ou sobrescrever, conforme a especificação. As sessões só existem enquanto as abas estiverem ativas; após qualquer anúncio, a revisão persistida continua sendo a verificação de conflito.

**Alternativas consideradas**: Uma trava que impedisse a segunda edição contraria a escolha explícita do usuário de permitir sobrescrita. Confiar apenas em notificações não detecta eventos perdidos nem garante exclusão mútua. `BroadcastChannel` não será usado como armazenamento.

**Referências**: [`IDBTransaction`](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction); [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API); [evento `blocked` ao abrir IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/blocked_event).

## Vitest

**Decisão**: Usar Vitest via Angular CLI e executar testes com `ng test`.

**Justificativa**: A documentação atual do Angular descreve Vitest na configuração padrão de novos projetos CLI, com `ng test`; `vitest` e `jsdom` são dependências da configuração. Testes unitários devem cobrir regras e serviços por seus contratos substituíveis. Cenários que dependem do IndexedDB ou da comunicação real entre abas devem ser complementados por testes em modo navegador.

**Alternativas consideradas**: Karma continua documentado, mas não é a escolha padrão atual do CLI para projetos novos. A migração existente de Karma para Vitest é descrita como experimental; este projeto novo pode iniciar diretamente com Vitest.

**Referências**: [guia oficial de testes](https://angular.dev/guide/testing); [testes de serviços](https://angular.dev/guide/testing/services); [migração para Vitest](https://angular.dev/guide/testing/migrating-to-vitest).
