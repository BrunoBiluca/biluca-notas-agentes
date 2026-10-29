# Contratos de serviços

Estes contratos são internos à aplicação; não definem uma API remota. Cada serviço usado por outra unidade deve expor uma interface e um `InjectionToken<T>` compartilhado. A implementação concreta é registrada por provider; consumidores não devem injetar classes concretas. Os componentes dependem somente da fachada de aplicação e limitam-se à interação com o usuário.

As interfaces abaixo descrevem os comportamentos e formatos obrigatórios; são contratos de design, não implementação. Os identificadores de código permanecem em inglês conforme a constituição.

## Fachada da aplicação

Token: `NOTES_APPLICATION`

Interface: `NotesApplication`

- Expõe a coleção atual como sinal somente leitura, além do estado de carregamento e de erros apresentáveis.
- Expõe os filtros de busca, modo de visualização e modo de ordenação necessários à interface.
- `loadNextPage()`: carrega a próxima página automaticamente quando houver itens; não duplica registros já carregados.
- `search(query)`: busca em toda a coleção do usuário, não apenas nas páginas já visíveis.
- `create(input)`: valida o título, cria a nota e informa sucesso somente após persistência concluída.
- `beginEdit(noteId)`: retorna o rascunho e a revisão base; verifica e reporta imediatamente uma edição ativa em outra aba.
- `saveEdit(draft, resolution)`: salva a revisão atual ou aplica a escolha explícita de sobrescrita; retorna conflito sem perder o rascunho quando a revisão diverge.
- `cancelEdit(noteId)`: descarta o rascunho e encerra sua sessão.
- `delete(noteId)`: remove a nota e imagens associadas; propaga falhas.
- `setPinned(noteId, pinned)`: atualiza a fixação.
- `reorder(noteId, targetIndex)`: atualiza e persiste a posição manual, tanto para ações do CDK como para alternativa por teclado.
- `setViewMode(mode)` e `setSortMode(mode)`: atualizam o estado da coleção sem ignorar fixação nem o modo de ordenação selecionado.

Resultados assíncronos devem distinguir sucesso, conflito e falha; não converter falhas de persistência em sucesso.

## Provedor de usuário atual

Token: `CURRENT_USER_PROVIDER`

Interface: `CurrentUserProvider`

- Expõe o `id` do usuário atual como valor reativo ou consulta assíncrona.
- Não cria fluxo de autenticação nesta funcionalidade.
- As implementações de leitura e escrita devem usar o mesmo ID para escopar a coleção.

## Repositório de notas

Token: `NOTE_REPOSITORY`

Interface: `NoteRepository`

- Consulta notas exclusivamente por `ownerId`, com ordenação e paginação.
- Pesquisa por título e conteúdo em todo o conjunto do `ownerId`, sem limitar a pesquisa aos registros carregados pela UI.
- Lê a nota individual com validação conjunta de `ownerId` e `id`.
- Cria e remove notas; exclusão inclui as imagens na mesma transação lógica.
- Atualiza uma nota comparando a revisão esperada na mesma transação de escrita. Retorna conflito com a revisão atual, sem gravar, se divergir.
- Persiste nova ordem manual sem alterar a data de atualização do conteúdo.

## Repositório de imagens

Token: `NOTE_IMAGE_REPOSITORY`

Interface: `NoteImageRepository`

- Valida tipo MIME e tamanho máximo de 10 MB (10.000.000 bytes) antes da persistência.
- Armazena e recupera `Blob`s por ID e confere a associação à nota e ao usuário.
- Remove imagem individual ou todas as imagens de uma nota.
- Não impõe limite de quantidade; propaga erros de quota e de IndexedDB.

## Coordenador de edição entre abas

Token: `EDITING_SESSION_COORDINATOR`

Interface: `EditingSessionCoordinator`

- Anuncia início e fim de edição de uma nota e permite consultar sessões ativas.
- Notifica outras abas quando uma revisão for salva.
- Identifica mensagens pela origem da aba para ignorar o próprio evento.
- Não é mecanismo de bloqueio nem autoridade de versão; `NoteRepository` valida a revisão no IndexedDB.

## Implementações e dependências

- Implementação inicial: serviços de IndexedDB e `BroadcastChannel` locais ao navegador.
- A troca de implementação ocorre no provider, sem alterar componentes ou regras de aplicação.
- Não implementar integração externa nesta funcionalidade.
- Todas as regras de negócio pertencem à fachada/serviços e têm testes unitários Vitest usando os contratos para fornecer substitutos.
