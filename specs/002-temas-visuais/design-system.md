# Decisões do sistema de design: Temas visuais

**Sistema de design**: Angular Material M3  
**Versão**: 22.2.5  
**Inventário**: `.design-system/inventory.json`  
**Fonte dos princípios**: `default` — o sistema não fornece princípios próprios; a configuração habilita os princípios padrão da extensão.  
**Tipos de superfície**: interativa, layout, texto, movimento  
**Pontos de quebra**: nenhum breakpoint nomeado é publicado pelo inventário.

## Vocabulário consultado

- **Tokens**: consultados em `.design-system/inventory.json`. `color.*` contém valores claro/escuro gerados a partir da paleta Azure do tema já usado pelo projeto. `typography.*` e `shape.*` permanecem disponíveis.
- **Breakpoints**: a capacidade foi consultada e não encontrou breakpoints no inventário. Nenhum nome foi inventado; a interface deve continuar utilizável em viewports estreitas.
- **Princípios**: 14 princípios padrão, todos aplicáveis e verificáveis; nenhum foi desativado ou declarado não aplicável.
- **Versão**: 22.2.5, confirmada na dependência instalada e definida na configuração do design system.

## Superfície: abrir as opções de tema na navegação superior

**Resolução**: Compose (componentes)  
**Decisão**: Reutilizar a `MatToolbar` existente com `MatIconButton` no lado direito, acionando `MatMenu` com três `MatMenuItem`. Usar `MatIcon` com o registro SVG local da aplicação e criar um ícone de tema próprio porque o conjunto atual não contém um ícone adequado. O texto do item ativo deve incluir uma indicação como “(atual)”. O componente de menu não oferece papéis `menuitemradio`; a seleção não deve depender apenas de cor.

**Pesquisas**: ledger consultado para “theme menu selection” e “icon button in top toolbar for theme menu”; nenhum precedente específico de seletor de tema foi adotado. A decisão anterior da barra de notas (dd-001, versão 22.2.5) cobre a composição geral da toolbar, não a nova ação nem seu posicionamento à direita. Foram consultadas as buscas “theme selector”, “menu” e “dropdown menu theme options”.

| Candidato | Fonte | Veredito |
|---|---|---|
| `MatToolbar` + `MatIconButton` | Inventário local e decisão dd-001 | Reutilizar como região e acionador. |
| `MatIcon` + SVG local | Inventário da aplicação, decisão dd-005 e documentação oficial | Reutilizar o componente e o registro de SVG existente; criar apenas o novo recurso gráfico local, sem fonte ou biblioteca externa. |
| `MatMenu` + `MatMenuItem` | Inventário local e documentação oficial | Compor para exibir as três escolhas; a documentação define teclado e gestão/restauração de foco. |
| `MatButtonToggleGroup` | Inventário local | Rejeitado: alternância segmentada não corresponde ao menu suspenso solicitado. |
| `MatFormField` | Inventário local | Rejeitado: campo de formulário não corresponde a um menu de ações. |
| Padrão de seletor de tema | Busca de padrões | Não encontrado; não é necessário criar padrão porque a composição documentada de componentes atende ao fluxo. |

**Princípios aplicáveis**: PRIN-SEMANTIC-HTML, PRIN-KEYBOARD, PRIN-FOCUS-VISIBLE, PRIN-ACCESSIBLE-NAME, PRIN-NOT-COLOR-ALONE, PRIN-TARGET-SIZE, PRIN-RESPONSIVE, PRIN-INPUT-MODALITIES, PRIN-REDUCED-MOTION, PRIN-STATE-COVERAGE, PRIN-STATE-FEEDBACK, PRIN-TOKENS, PRIN-NO-BESPOKE-PRIMITIVES.

**Restrições**: acionador com nome acessível; ícone decorativo; foco visível e restaurado ao fechar; menu operável por teclado, toque e ponteiro; opção atual indicada por texto; animação reduzida conforme a preferência do sistema; manter a barra e o menu sem recorte em viewports estreitas. Falhas de persistência usam mensagem global acessível `role="alert"`, seguindo o feedback existente (dd-005), e não indicam sucesso.

**Impacto no sistema de design**: nenhum componente novo. O inventário foi atualizado para representar a versão instalada e incluir os componentes já usados nesta composição.

## Superfície: aplicar tema claro, escuro ou definido pelo sistema

**Resolução**: Compose (padrão)  
**Decisão**: Usar o padrão oficial Angular Material de esquema de cores claro/escuro, gerado da paleta Azure existente. O modo escolhido controla o `color-scheme` visual da raiz: claro, escuro ou claro/escuro para acompanhar o dispositivo. Os valores semânticos correspondentes estão registrados sob os mesmos tokens `color.*` no inventário.

**Pesquisas**: ledger consultado para “light dark color scheme”; o resultado dd-006 refere-se à escolha da cor de fundo de notas e foi rejeitado como não correspondente. Foram consultados o padrão “Angular Material light and dark color scheme”, os tokens e a documentação oficial de theming. A geração Sass local com Angular Material 22.2.5 confirmou os valores das variantes derivadas da paleta Azure.

**Princípios aplicáveis**: PRIN-CONTRAST, PRIN-TOKENS, PRIN-STATE-COVERAGE, PRIN-STATE-FEEDBACK, PRIN-RESPONSIVE.

**Restrições**: aplicar somente a paleta do sistema nos temas claro e escuro; manter as cores de fundo próprias das notas e a regra existente de legibilidade; verificar contraste das superfícies e controles nos dois esquemas; não introduzir paleta de terceiros nem cores ad hoc.

**Impacto no sistema de design**: o inventário agora descreve os valores claro/escuro dos tokens da paleta Azure. A escolha explícita do usuário e a preferência do sistema são modos do mesmo esquema, não temas de terceiros.

## Superfície: ler e operar notas em cada esquema

**Resolução**: Reuse  
**Decisão**: Reutilizar os tokens semânticos de superfície e texto, especialmente `color.surface`, `color.on-surface`, `color.surface-container`, `color.primary`, `color.on-primary`, `color.outline` e `color.error`. Notas com cor própria conservam essa cor e seguem as regras existentes de contraste; a troca de tema não reescreve seus dados.

**Fonte**: superfícies e controles já documentados no inventário e nas decisões dd-002 a dd-005, com tokens de cor atualizado para o esquema claro/escuro.  
**Princípios aplicáveis**: PRIN-CONTRAST, PRIN-NOT-COLOR-ALONE, PRIN-TOKENS, PRIN-RESPONSIVE.

**Restrições**: todos os estados de coleção, detalhe e edição devem continuar legíveis, operáveis e sem recorte; contrastes devem ser verificados nos dois esquemas e nas cores de nota preservadas.

**Impacto no sistema de design**: nenhum componente novo; a mudança apenas seleciona variantes do mesmo conjunto de tokens.

## Referências

- [Angular Material — Theming](https://material.angular.dev/guide/theming)
- [Angular Material — Menu](https://material.angular.dev/components/menu/overview)
- [Angular Material — Button](https://material.angular.dev/components/button/overview)
- [Angular Material — Icon](https://material.angular.dev/components/icon/overview)
- Tema Azure gerado com a paleta M3 em `src/styles.scss`; a folha precompilada anterior não é mais usada.

## Validation round 1 — 2026-11-05

Principles source: `default` (14 applicable principles; none disabled). Surface kinds: interactive, layout, text, movement and motion.  
Scan: 10 implementation files, 64 raw values, 1 scanner unknown-token diagnostic and 5 documented tokens not recognized by the scanner. Tests: 28 Vitest and 19 Playwright tests passed with 4 workers; build succeeded with the configured initial-bundle budget warning.

- [x] DS-F-001 **note** · Token scan · 62 length literals are layout spacing/sizing values, while the inventory has no spacing token family. Numeric matches to `shape.*` are corner tokens and are not semantically valid replacements for margins, gaps or dimensions; retained the existing layout values.
- [x] DS-F-002 **note** · Note color picker · The two `#e8def8` literals are the default custom-note color, not a global theme surface. The inventory has no exact token for this user-editable note color, which remains independent of the selected theme as required.
- [x] DS-F-003 **note** · Token scan · The `color-scheme` diagnostic is the native CSS property used to select the browser color scheme, not an unknown design-system token.
- [x] DS-F-004 **note** · Token scan · The five `color.*` names not recognized by the scanner are implemented by their Angular Material M3 CSS variables (`--mat-sys-surface`, `--mat-sys-primary`, `--mat-sys-on-primary`, `--mat-sys-outline` and `--mat-sys-error`); the names map to the documented semantic tokens.
- [x] DS-F-005 **note** · Browser test scheduling · The default 16-worker invocation failed the pre-existing cross-tab edit warning test under parallel load; the isolated test and the complete 19-test suite passed with 4 workers. The quickstart records the reliable bounded-worker command; no production behavior was changed.

Review: the toolbar, icon button, menu, menu items and registered local icon follow the committed Compose decision. The theme uses Angular Material's Azure light/dark scheme and semantic color tokens; note backgrounds remain unchanged. The selector has an accessible name, textual current-state indicator, keyboard focus restoration, 48×48 touch target, touch/keyboard/pointer operation and a 320px no-overflow check. Error feedback is announced, and reduced-motion behavior is tested. All required states and dimensions were checked; the adapter does not provide a `validate` query capability. No bespoke UI primitives were introduced.

No violations or warnings. All notes are accounted for; no open findings.

## Validation round 2 — 2026-11-05

Principles source: `default` (14 applicable principles; none disabled). Surface kinds: interactive, layout, text, movement and motion.  
Scan: 10 implementation files; the 64 raw values, `color-scheme` diagnostic and five semantic-token aliases were rechecked. Tests: 28 Vitest and 19 Playwright tests passed with 4 workers.

No new findings. DS-F-001 through DS-F-005 were rechecked: the scan notes remain accurate, and the bounded-worker browser suite passes. All round 1 notes are accounted for; no open findings.

## Verification — 2026-11-05

RFC acceptance criteria: met by theme selection/persistence/system-mode, keyboard, error, note-compatibility and contrast tests.  
Spec requirements: DS-001 through DS-005 satisfied.  
Principles: all 14 applicable `default` principles honored; reduced motion, narrow viewport, touch target and contrast were verified. No principles were disabled.  
Definition of Done: no items configured.  
Tests: 28 Vitest passed; 19 Playwright passed with `--workers=4`; production build succeeded. The configured bundle-size warning and the 16-worker test-scheduling note are recorded above. Manual screen-reader and physical-device checks were not performed.

Verdict: the implementation meets its design requirements.
