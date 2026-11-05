# Validação: Temas visuais

## Pré-requisitos

- Node.js e npm compatíveis com o projeto.
- Dependências instaladas com `npm ci`.
- Para testes de navegador, Chromium instalado; se necessário, execute `npm run test:browser:install`.

## Verificações automatizadas

Na raiz do repositório:

```powershell
npm test -- --watch=false
npm run build
npm run test:browser -- --workers=4
```

Resultados esperados:

- Vitest passa cobrindo restauração, validação, seleção, preferências do sistema e erros de persistência.
- A compilação Angular conclui sem erros de Sass, tokens, templates ou tipos.
- Playwright passa cobrindo o menu, seleção, persistência entre recargas, acompanhamento do sistema, mensagens de erro e legibilidade das notas.

O Playwright inicia a aplicação por meio da configuração existente em `playwright.config.ts`.

### Resultados da execução

Validado em 2026-11-05:

- `npm test -- --watch=false`: 28 testes passaram em 7 arquivos.
- `npm run test:browser -- --workers=4`: 19 testes passaram; inclui persistência, navegação por teclado, acompanhamento do sistema, movimento reduzido, legibilidade, contraste e menu operável por toque em viewport de 320 px.
- `npm run build`: compilação concluída. Permanece o aviso de orçamento já configurado para o bundle inicial (805,92 kB frente ao limite de 500 kB).
- `git diff --check`: passou.
- A execução Playwright com os 16 workers padrão falhou no teste preexistente `note-edit-conflicts.spec.ts`, que não recebeu o aviso de edição em outra aba dentro do prazo; o teste isolado e a suíte completa com quatro workers passaram. Nenhuma alteração de produção foi feita para mascarar essa falha de concorrência.

Os roteiros manuais abaixo não foram executados com leitor de tela ou dispositivo físico; os fluxos correspondentes foram exercitados pelos testes automatizados indicados.

## Roteiros manuais

1. **Modo claro**: selecionar “Claro”, confirmar que a aplicação e os componentes Material ficam claros, recarregar e verificar que o modo continua selecionado.
2. **Modo escuro**: selecionar “Escuro”, verificar textos, controles e conteúdo das notas, recarregar e confirmar a restauração.
3. **Modo do sistema**: selecionar “Definido pelo sistema”, simular/configurar a preferência do navegador primeiro como clara e depois como escura. Confirmar ambas as aparências sem que a opção selecionada mude; recarregar e confirmar que `system` foi restaurado.
4. **Notas**: em cada modo, verificar notas sem cor própria e notas com cores próprias; consultar, criar, editar, buscar, fixar, ordenar, alternar a visualização e remover notas.
5. **Teclado e leitores de tela**: abrir o seletor pelo teclado, percorrer e confirmar uma opção, fechar e confirmar a restauração do foco; verificar o nome do botão, o texto da opção atual e o anúncio de falha de persistência.
6. **Armazenamento indisponível**: impedir acesso ou gravação em `localStorage`, selecionar um tema e confirmar que ele se aplica apenas à sessão atual, que uma mensagem acessível informa a falha e que a aplicação de notas continua utilizável.
7. **Contraste (CS-008)**: validar as superfícies padrão da aplicação nos temas claro e escuro, incluindo barra, menu, formulários, cartões e mensagens, nos estados normal, foco, selecionado e erro. Para cada par de texto/fundo e cada controle ou indicador visual relevante, obter as cores renderizadas no navegador (por exemplo, em Computed Styles) e calcular a razão com uma ferramenta de contraste WCAG 2.2 AA. Exigir pelo menos 4,5:1 para texto normal, 3:1 para texto grande e 3:1 para controles e indicadores visuais ativos. Componentes inativos/desabilitados são exceção dos critérios de contraste WCAG; ainda assim, verificar que permanecem perceptíveis. Registrar tema, componente/estado, cores, razão calculada e resultado; CS-008 passa somente se 100% dos pares aplicáveis verificados cumprirem o limite. Cores próprias das notas continuam cobertas pelo CS-004.

### Registro de contraste CS-008

Verificação automatizada em Chromium com cores CSS computadas, paleta Angular Material Azure e superfícies efetivamente renderizadas. Razões arredondadas a duas casas decimais; limites: 4,5:1 para texto e 3:1 para foco/controles/indicadores.

| Par (estado) | Mínimo | Claro: primeiro plano / fundo → razão | Escuro: primeiro plano / fundo → razão |
|---|---:|---|---|
| Cabeçalho da página (texto) | 4,5 | `rgb(26,27,31)` / `rgb(239,237,240)` → 14,78 | `rgb(227,226,230)` / `rgb(31,32,34)` → 12,65 |
| Rótulo de busca (texto) | 4,5 | `rgb(0,92,187)` / `rgb(239,237,240)` → 5,55 | `rgb(224,226,236)` / `rgb(31,32,34)` → 12,62 |
| Campo de busca (texto) | 4,5 | `rgb(26,27,31)` / `rgb(239,237,240)` → 14,78 | `rgb(227,226,230)` / `rgb(31,32,34)` → 12,65 |
| Ícone do seletor na barra | 3 | `rgb(68,71,78)` / `rgb(239,237,240)` → 7,99 | `rgb(224,226,236)` / `rgb(31,32,34)` → 12,62 |
| Item do menu (texto) | 4,5 | `rgb(26,27,31)` / `rgb(239,237,240)` → 14,78 | `rgb(227,226,230)` / `rgb(31,32,34)` → 12,65 |
| Indicador textual do tema atual | 4,5 | `rgb(68,71,78)` / `rgb(239,237,240)` → 7,99 | `rgb(224,226,236)` / `rgb(31,32,34)` → 12,62 |
| Foco no campo de busca | 3 | `rgb(0,92,187)` / `rgb(239,237,240)` → 5,55 | `rgb(171,199,255)` / `rgb(31,32,34)` → 9,58 |
| Título de nota sem cor própria | 4,5 | `rgb(26,27,31)` / `rgb(239,237,240)` → 14,78 | `rgb(227,226,230)` / `rgb(31,32,34)` → 12,65 |
| Conteúdo de nota sem cor própria | 4,5 | `rgb(26,27,31)` / `rgb(239,237,240)` → 14,78 | `rgb(227,226,230)` / `rgb(31,32,34)` → 12,65 |
| Ação de nota sem cor própria | 3 | `rgb(26,27,31)` / `rgb(239,237,240)` → 14,78 | `rgb(227,226,230)` / `rgb(31,32,34)` → 12,65 |
| Mensagem de erro de persistência | 4,5 | `rgb(147,0,10)` / `rgb(255,218,214)` → 7,24 | `rgb(255,218,214)` / `rgb(147,0,10)` → 7,24 |
| `on-surface` sobre `surface` | 4,5 | `rgb(26,27,31)` / `rgb(250,249,253)` → 16,41 | `rgb(227,226,230)` / `rgb(18,19,22)` → 14,41 |
| `on-surface` sobre `surface-container` | 4,5 | `rgb(26,27,31)` / `rgb(239,237,240)` → 14,78 | `rgb(227,226,230)` / `rgb(31,32,34)` → 12,65 |
| `on-surface-variant` sobre `surface` | 4,5 | `rgb(68,71,78)` / `rgb(250,249,253)` → 8,88 | `rgb(224,226,236)` / `rgb(18,19,22)` → 14,38 |
| `on-primary` sobre `primary` | 4,5 | `rgb(255,255,255)` / `rgb(0,92,187)` → 6,46 | `rgb(0,47,101)` / `rgb(171,199,255)` → 7,74 |
| `on-error` sobre `error` | 4,5 | `rgb(255,255,255)` / `rgb(186,26,26)` → 6,46 | `rgb(105,0,5)` / `rgb(255,180,171)` → 7,72 |
| `on-error-container` sobre `error-container` | 4,5 | `rgb(147,0,10)` / `rgb(255,218,214)` → 7,24 | `rgb(255,218,214)` / `rgb(147,0,10)` → 7,24 |
| `primary` sobre `surface` (indicador) | 3 | `rgb(0,92,187)` / `rgb(250,249,253)` → 6,17 | `rgb(171,199,255)` / `rgb(18,19,22)` → 10,92 |
| `outline` sobre `surface` (controle) | 3 | `rgb(116,119,127)` / `rgb(250,249,253)` → 4,27 | `rgb(142,144,153)` / `rgb(18,19,22)` → 5,84 |

**Resultado registrado**: 19 de 19 pares medidos em cada esquema passaram seus limites aplicáveis; CS-008 aprovado para os pares de tokens e componentes renderizados listados. O teste está em `tests/browser/theme-contrast.spec.ts`. As cores de fundo próprias das notas, inclusive o texto nas telas de detalhe, são cobertas separadamente por CS-004.

## Critérios de aceitação relacionados

Consulte [contrato da interface](./contracts/theme-preference-ui.md), [contrato do serviço](./contracts/theme-preference-service.md), [modelo de dados](./data-model.md) e os critérios `CS-001` a `CS-006` e `CS-008` em [spec.md](./spec.md).
