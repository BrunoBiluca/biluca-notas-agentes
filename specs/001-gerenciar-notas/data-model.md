# Modelo de dados

Este modelo define os registros persistidos e os estados temporários necessários para os requisitos de [spec.md](./spec.md). Todas as consultas e mutações de registros persistidos são limitadas ao usuário atual.

## Entidades persistidas

### Usuário atual

Identidade já fornecida à aplicação; autenticação não faz parte desta funcionalidade.

| Campo | Tipo | Regras |
|---|---|---|
| `id` | string | Obrigatório; identificador estável recebido do provedor de identidade da aplicação. |

O identificador do usuário é usado como escopo de coleção e como `ownerId` de cada nota. Não se persiste uma cópia independente do perfil do usuário.

### Nota

| Campo | Tipo | Regras |
|---|---|---|
| `id` | string | Obrigatório; identificador único gerado na criação. |
| `ownerId` | string | Obrigatório; ID do usuário atual. Imutável durante a vida da nota. |
| `title` | string | Obrigatório; aparado e não vazio após aparar espaços. |
| `content` | string opcional | Conteúdo somente com espaços é normalizado como ausente. |
| `backgroundColor` | string opcional | Cor de fundo selecionada pelo usuário. A cor da fonte é derivada para exibição: branca em fundos escuros e preta em fundos claros; não é um campo persistido independente. |
| `createdAt` | data/hora | Obrigatória; atribuída na criação e imutável. |
| `updatedAt` | data/hora | Obrigatória; começa igual a `createdAt`; atualizada ao salvar alterações da nota. |
| `pinned` | booleano | Obrigatório; inicia como `false`. |
| `manualOrder` | número inteiro | Posição da nota na ordem manual dentro do grupo de fixação; persistida ao reordenar. |
| `revision` | inteiro positivo | Começa em 1 e incrementa em cada gravação; usado para detecção atômica de conflito. |
| `imageIds` | lista de IDs | Referências para imagens associadas; pode estar vazia. |

**Índices requeridos**: `ownerId`; chave composta por `ownerId` e `id`; e chaves que permitam percorrer a coleção do usuário por fixação e ordenação escolhida. A busca textual percorre todos os registros do usuário antes de aplicar paginação, pois a coleção alvo inclui até 1.000 notas.

**Regras de coleção**:

- Notas fixadas precedem as não fixadas em todos os modos.
- A cor da fonte exibida é branca em fundos escuros e preta em fundos claros; ela é derivada da cor de fundo da nota e não é persistida separadamente.
- No modo padrão, cada grupo é ordenado por `updatedAt` decrescente.
- No modo manual, cada grupo é ordenado por `manualOrder` crescente; empates devem ser resolvidos por `id` para resultado determinístico.
- A reordenação altera `manualOrder`, sem modificar `updatedAt`, pois não é uma edição do conteúdo da nota.
- Busca sem termo retorna a coleção sem filtro; busca com termo considera título e conteúdo de todas as notas do usuário antes da paginação.
- A paginação visual carrega lotes de até 100 notas. Os resultados da busca não ficam limitados ao lote já carregado.
- Ao salvar edição, `revision` incrementa e `updatedAt` passa a refletir a gravação.

### Imagem da nota

| Campo | Tipo | Regras |
|---|---|---|
| `id` | string | Obrigatório; identificador único da imagem. |
| `noteId` | string | Obrigatório; nota proprietária da imagem. |
| `ownerId` | string | Obrigatório; deve ser igual ao `ownerId` da nota. |
| `mimeType` | string | Um de `image/jpeg`, `image/png`, `image/webp` ou `image/gif`. |
| `sizeBytes` | inteiro | Maior que zero e menor ou igual a 10 MB (10.000.000 bytes; megabyte decimal). |
| `blob` | Blob | Binário aceito pelo IndexedDB; armazenado em object store separado. |
| `createdAt` | data/hora | Obrigatória; definida ao anexar. |

Não há limite de quantidade de imagens por nota. A quota real do browser pode limitar o armazenamento e deve resultar em erro explícito, não em descarte silencioso. Remover uma nota remove suas imagens atomicamente; remover uma imagem não altera outros campos da nota.

## Estado transitório de edição

### Rascunho de edição

Não é um registro persistido até a confirmação explícita de salvar.

| Campo | Tipo | Regras |
|---|---|---|
| `noteId` | string | Nota que está sendo editada. |
| `baseRevision` | inteiro positivo | Revisão carregada ao iniciar a edição. |
| `draft` | dados editáveis da nota | Cópia isolada dos campos editáveis e da lista de imagens; cancelar descarta a cópia. |
| `tabId` | string | Identificador transitório da aba, não persistido na nota. |

### Sessão de edição entre abas

Mensagem transitória de `BroadcastChannel`; não é autoridade de persistência nem bloqueio de escrita.

| Campo | Tipo | Regras |
|---|---|---|
| `type` | enum | Anúncio, consulta, resposta de sessão ativa, alteração salva ou encerramento da edição. |
| `noteId` | string | Nota relacionada ao evento. |
| `tabId` | string | Origem da mensagem. |
| `revision` | inteiro opcional | Revisão persistida observada após salvar, quando aplicável. |

Uma revisão divergente na transação do IndexedDB define o conflito, ainda que uma notificação entre abas tenha sido perdida. Para continuar, o usuário escolhe recarregar e descartar o rascunho ou salvar explicitamente o rascunho sobre a versão atual.

## Ciclo de vida e validação

1. Criar nota: validar título aparado, atribuir ID, usuário, datas, `pinned = false`, posição manual e `revision = 1`.
2. Editar: abrir rascunho sobre uma revisão persistida; não escrever automaticamente.
3. Salvar: validar título e imagens; comparar `baseRevision` com a revisão atual e gravar nota e alterações de imagens numa transação. No sucesso, incrementar revisão e atualizar `updatedAt`.
4. Conflito: preservar o rascunho até o usuário escolher recarregar ou sobrescrever explicitamente.
5. Cancelar: descartar alterações do rascunho e encerrar a sessão de edição.
6. Excluir: remover a nota e imagens associadas em uma operação transacional.
