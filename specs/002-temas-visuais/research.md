# Pesquisa: Temas visuais

## Decisões

### Esquemas do Angular Material

**Decisão**: Trocar a importação precompilada `azure-blue.css` por Sass com o padrão `mat.theme` e `theme-type: color-scheme`, usando a paleta Azure já instalada. Definir o `color-scheme` da raiz como `light`, `dark` ou `light dark` conforme o modo selecionado.

**Motivo**: O tema precompilado atual fixa a aparência clara. O padrão M3 documentado gera tokens semânticos para os dois esquemas a partir de uma mesma paleta e permite ao navegador escolher entre claro e escuro no modo do sistema. Assim, controles Material e superfícies globais permanecem coerentes sem substituir cores próprias das notas.

**Alternativas consideradas**:

- Alternar classes sem gerar os tokens escuros do Material: rejeitada, pois não oferece uma variante escura completa dos componentes e superfícies.
- Manter folhas de estilo de temas externos: rejeitada por estar fora do escopo e não ser necessária.
- Instalar outra biblioteca de temas: rejeitada, pois Angular Material e Sass já estão disponíveis.

### Modelo da preferência

**Decisão**: Representar e persistir a escolha como um único valor (`light`, `dark` ou `system`), sob uma chave específica do projeto em `localStorage`. O valor padrão, quando ausente, é `system`.

**Motivo**: Salvar a opção escolhida preserva o significado de “Definido pelo sistema” entre sessões e permite que a preferência do dispositivo continue mudando sem regravar a escolha.

**Alternativas consideradas**:

- Persistir apenas o esquema efetivo (`light` ou `dark`): rejeitada, porque perderia o modo `system` ao reabrir a aplicação.
- Persistir um objeto JSON: rejeitada por ser desnecessária para um único valor enumerado.
- Usar IndexedDB: rejeitada para esta preferência por instrução explícita do usuário; essa exceção não se estende aos dados das notas.

### Acompanhamento do sistema e inicialização

**Decisão**: Aplicar `color-scheme: light dark` à raiz quando `system` estiver ativo e usar o mecanismo CSS do navegador para acompanhar `prefers-color-scheme`. Restaurar a preferência no inicializador da aplicação antes da primeira renderização.

**Motivo**: A preferência do sistema pode mudar sem reabrir a aplicação; o CSS acompanha essa alteração sem listener JavaScript. O inicializador evita que a interface mostre o tema padrão antes de restaurar o valor salvo. Na ausência de uma preferência escura detectável, o esquema claro é o padrão.

**Alternativas consideradas**:

- Manter listener de `matchMedia` e espelhar uma segunda preferência em estado JavaScript: rejeitada por duplicar o mecanismo CSS e exigir sincronização adicional.
- Aplicar o tema somente depois que a página renderizar: rejeitada pelo risco de mostrar o esquema errado durante a inicialização.

### Falhas de armazenamento

**Decisão**: Tratar separadamente falhas de acesso, leitura, validação e escrita. Na restauração, aplicar `system` como fallback; na seleção durante a sessão, aplicar imediatamente o modo em memória. Em ambos os casos, expor uma mensagem acessível, sem afirmar que a preferência ficou salva.

**Motivo**: O acesso a `localStorage` pode ser negado pelo navegador e lançar `SecurityError`. A aplicação deve continuar utilizável e distinguir a aplicação temporária da persistência bem-sucedida.

**Alternativas consideradas**:

- Ignorar exceções e apresentar sucesso: rejeitada por ocultar a falha e contrariar o feedback exigido.
- Bloquear o seletor ou a aplicação quando o armazenamento falhar: rejeitada, pois o usuário ainda pode usar a aplicação durante a sessão.

### Ícone e menu

**Decisão**: Compor o menu com os componentes Material existentes. Usar `MatIcon` e o registro de SVG local da aplicação; adicionar um SVG de tema próprio, já que os ícones atuais não incluem um adequado.

**Motivo**: Mantém o padrão visual e de acessibilidade do projeto sem baixar fonte ou adicionar dependência de terceiros.

**Alternativas consideradas**:

- Usar um nome de ligadura de Material Symbols: rejeitada, pois a fonte não está configurada no projeto.
- Reutilizar um ícone de ação sem relação visual com aparência: rejeitada por ser ambíguo.
- Instalar uma biblioteca de ícones: rejeitada por desnecessária e fora do objetivo.

## Fontes

- [Angular Material — Theming](https://material.angular.dev/guide/theming)
- [Angular Material — Menu](https://material.angular.dev/components/menu/overview)
- [Angular Material — Button](https://material.angular.dev/components/button/overview)
- [Angular Material — Icon](https://material.angular.dev/components/icon/overview)
- [MDN — `Window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN — `prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [MDN — `color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
- Projeto: `package.json`, `src/styles.css`, `src/app/app.config.ts` e `public/icons/`.
