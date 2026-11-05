# Plano de implementação: Temas visuais

**Branch**: `main` (branch da funcionalidade não criada) | **Data**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação em `specs/002-temas-visuais/spec.md`

## Resumo

Adicionar um seletor de tema à direita da barra de navegação da coleção de notas e manter a preferência `claro`, `escuro` ou `system` em `localStorage`. Um serviço singleton, definido por interface e token de injeção, restaurará e aplicará a preferência antes da primeira renderização. O tema será implementado com o esquema de cores claro/escuro do Angular Material e a paleta Azure já usada pela aplicação. A troca de esquema não altera dados nem cores próprias das notas.

## Contexto técnico

**Linguagem/versão**: TypeScript; Angular Core 22.2.3 instalado; Angular Material/CDK 22.2.5.

**Dependências principais**: Angular standalone, Angular Material M3, `@ngrx/signals`; Sass 1.104.1 já disponível por meio de `@angular/build`. Nenhuma dependência nova é necessária.

**Armazenamento**: `localStorage` do navegador, na mesma origem, com uma chave própria e um dos valores `light`, `dark` ou `system`. Não há sincronização entre dispositivos nem por conta de usuário.

**Testes**: Vitest via `npm test -- --watch=false`; testes de navegador via Playwright e `npm run test:browser`; compilação via `npm run build`.

**Plataforma-alvo**: Aplicação web Angular executada em navegador com suporte a CSS `color-scheme` e `prefers-color-scheme`.

**Tipo de projeto**: Aplicação web de página única.

**Metas de desempenho**: Sem chamadas de rede para carregar temas; restaurar/aplicar a preferência antes da primeira renderização e refletir uma seleção na interação atual.

**Restrições**:

- Manter as opções claro, escuro e definido pelo sistema, persistindo a opção escolhida, não só a aparência efetiva.
- No modo do sistema, acompanhar alterações da preferência do dispositivo sem sobrescrever o modo salvo.
- Se a preferência não existir, for inválida ou não puder ser lida, aplicar o modo do sistema (claro como padrão quando não houver preferência do dispositivo).
- Capturar falhas de leitura/gravação de `localStorage`, manter a aplicação utilizável, aplicar a escolha em memória durante a sessão e comunicar que ela não foi persistida.
- Manter títulos, textos, imagens, controles e cores próprias das notas visíveis e legíveis; não modificar registros de nota ao trocar o esquema.
- Não adicionar temas ou fontes de ícones de terceiros.
- Toda documentação em português; identificadores e código em inglês.

**Escala/escopo**: Uma preferência por origem e perfil de navegador; três modos; aplicação nas rotas existentes.

## Verificação da constituição

*Gate: aprovado antes da pesquisa e reavaliado após o desenho.*

| Princípio/regra | Avaliação |
|---|---|
| I — Estado em memória com `@ngrx/signals` | Conforme: o estado de tema pertence ao serviço e usa sinais. |
| II — Interface e token de serviço | Conforme: componentes dependem de contrato tipado, não da implementação. |
| III — Regras de negócio testadas com Vitest | Conforme: cobrir restauração, validação, seleção, persistência e falhas. |
| IV — Dados persistentes no IndexedDB | Exceção aprovada: a solicitação explícita do usuário determina `localStorage` para esta preferência de aparência. A exceção fica restrita à preferência de tema; notas e outros dados permanecem no IndexedDB. |
| V — Dependências justificadas | Conforme: não adicionar dependências. |
| VI — Idioma dos documentos e do código | Conforme: documentos em português; código e identificadores em inglês. |
| Restrições adicionais — versão estável e sem integrações externas | Conforme: manter a linha Angular existente e não adicionar serviços externos. |

**Resultado**: PASS com uma exceção delimitada e explicitamente solicitada para o Princípio IV. A constituição não será alterada.

## Estrutura do projeto

### Documentação da funcionalidade

```text
specs/002-temas-visuais/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── theme-preference-service.md
    └── theme-preference-ui.md
```

`tasks.md` pertence à etapa `/speckit-tasks` e não é criado por este plano.

### Código-fonte previsto

```text
src/
├── app/
│   ├── app.component.ts                         # mensagem global de falha de persistência
│   ├── app.config.ts                            # inicialização de tema e registro do ícone
│   ├── core/theme/
│   │   ├── theme-preference.model.ts
│   │   ├── theme-preference.contract.ts
│   │   ├── theme-preference.service.ts
│   │   └── theme-preference.service.spec.ts
│   └── features/notes/pages/
│       └── notes-page.component.ts               # menu no lado direito da toolbar existente
├── styles.scss                                  # esquema Azure claro/escuro
└── public/icons/contrast.svg                    # ícone local do seletor
tests/browser/
└── theme-preference.spec.ts                     # fluxos integrados com Playwright
```

**Decisão de estrutura**: Manter a seleção junto à toolbar existente da coleção de notas; aplicar o esquema na raiz para que ele afete também as demais rotas. A inicialização pertence ao serviço de tema e ao inicializador da aplicação. O aviso de persistência fica na raiz para continuar acessível em qualquer rota. Substituir a importação do tema precompilado em `src/styles.css` por Sass com o tema M3, preservando as demais regras globais.

## Verificação do sistema de design

*Gate: PASS antes da pesquisa e reavaliado após o desenho.*

**Sistema de design**: Angular Material M3 22.2.5

| Superfície | Resolução | Decisão | Fonte |
|---|---|---|---|
| Seletor na barra superior | Compose (componentes) | `MatToolbar`, `MatIconButton`, `MatIcon`, `MatMenu` e `MatMenuItem`; manter o item atual identificável por texto. Usar o registro SVG local existente e adicionar um ícone de tema próprio, sem pacote externo. | `dd-001`, `dd-009` |
| Esquema claro/escuro | Compose (padrão) | Gerar tokens M3 claro/escuro com a paleta Azure existente; usar `color-scheme` claro, escuro ou claro/escuro para o modo do sistema. | `dd-010` |
| Legibilidade das notas | Reuse | Reutilizar tokens semânticos e regras existentes de cor própria das notas; não transformar cores das notas em tokens do tema global. | `dd-002` a `dd-005` |
| Erro de persistência | Reuse | Comunicar indisponibilidade com mensagem acessível `role="alert"`, conforme o padrão existente de feedback de erro. | `dd-005` |

**Fonte dos princípios**: `default`  
**Impacto no sistema de design**: nenhum componente nem dependência novos; o inventário documenta `MatIcon`, já usado pela aplicação.  
**Lacunas abertas**: nenhuma.  
**Decisões registradas**: `dd-009` e `dd-010`.

### Restrições carregadas para o plano

- **Tokens**: `color.surface`, `color.on-surface`, `color.surface-container`, `color.primary`, `color.on-primary`, `color.outline` e `color.error`.
- **Estados**: menu fechado/aberto, foco, opção atual, erro de persistência; os esquemas claro, escuro e sistema.
- **Responsividade**: conservar acionador e menu visíveis, sem recorte em viewports estreitas; não inventar breakpoints nomeados.
- **Acessibilidade**: nome acessível no botão; ícone decorativo oculto de leitores de tela; operação por teclado e foco restaurado pelo menu; seleção atual indicada por texto; falhas anunciadas por mensagem de alerta.
- **Interação**: a seleção aplica o esquema imediatamente; o modo sistema segue a preferência do dispositivo; falha de persistência não deve ser apresentada como sucesso.

### Reavaliação pós-desenho

PASS: o desenho continua dentro dos componentes, padrões e tokens documentados. A gravação em `localStorage` permanece a única exceção constitucional e não cria dependência ou integração externa. Nenhuma superfície requer Extend ou Create de componente.

## Rastreamento da exceção constitucional

| Violação | Necessidade | Alternativa mais simples rejeitada porque |
|---|---|---|
| Princípio IV: persistência da preferência em `localStorage`, não IndexedDB | Instrução explícita do usuário para a persistência desta preferência. A exceção é isolada e não abrange notas. | IndexedDB não atende à escolha expressa para este valor pequeno e síncrono; nenhum outro dado persistente muda de mecanismo. |
