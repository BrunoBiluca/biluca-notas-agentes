# Guia de validação rápida

Este guia valida os comportamentos de [spec.md](./spec.md), com os dados definidos em [data-model.md](./data-model.md) e os contratos de [contracts/servicos.md](./contracts/servicos.md).

## Pré-requisitos

- Node.js em uma versão suportada pelo Angular 22 (para Angular 22.0.x: `^22.22.3`, `^24.15.0` ou `^26.0.0`).
- Instalação de dependências do projeto Angular.
- Google Chrome moderno para cenários que dependem do IndexedDB e de `BroadcastChannel`.

## Instalação e execução

Na raiz da aplicação:

```text
npm ci
npm start
```

Abra o endereço local informado pelo Angular CLI. A aplicação fornece `local-user` como identidade padrão de instalação local; uma integração hospedeira pode substituir `CURRENT_USER_PROVIDER`. Esta funcionalidade não implementa autenticação.

## Testes

Executar os testes unitários Vitest sem modo watch:

```text
npm test -- --watch=false
```

Os testes cobrem normalização e validação de notas/imagens, ciclo de vida, isolamento, falhas, conflitos, carregamento incremental, busca e ordenação.

Para instalar o Chromium usado nos testes de navegador e executar os cenários:

```text
npm run test:browser:install
npm run test:browser
```

Os testes Playwright iniciam o servidor Angular automaticamente e validam IndexedDB real, persistência de imagens, conflito entre abas, coleção com mais de 100 notas e busca/ordenação com 1.000 notas.

Os cenários de interface também validam a criação no formulário principal, toolbar Material 3, agrupamento de notas, modal com Escape e retorno do foco, imagens antes do título sem recuo, ações por hover/foco/toque, reflow responsivo até 320 px, ícones SVG locais, reordenação por teclado e arraste iniciado no card, além de fundos transparentes e cores escolhidas.

## Cenários de aceitação manuais

1. **Ciclo de vida**: criar uma nota com título válido e dados opcionais; abrir; editar e salvar; cancelar outra edição; iniciar a exclusão, cancelar a confirmação nativa e verificar que a nota permanece; confirmar a exclusão. Verificar datas, dados e que cancelamento não persiste alterações.
2. **Validação e imagens**: tentar salvar título vazio ou só com espaços; selecionar a cor da nota; anexar JPEG, PNG, WebP e GIF de até 10 MB (10.000.000 bytes); rejeitar formato desconhecido e imagem acima do limite com orientação clara; remover uma imagem sem alterar a nota.
3. **Coleção**: testar estado vazio, alternar lista/grade, confirmar título/conteúdo/imagens no resumo e buscar termos em título e conteúdo. Com mais de 100 notas, verificar carregamento automático e busca inclusive por resultado ainda não carregado.
4. **Organização**: fixar e desfixar notas; verificar que fixadas precedem as demais; selecionar ordem manual e mover nota por arrastar/soltar e por teclado; sair e voltar à coleção e confirmar a ordem persistida.
5. **Restrições de interface**: confirmar a ordem dos controles na barra, a pesquisa centralizada, o formulário logo abaixo e as seções “Notas fixadas” e “Notas livres”. No Search Box, verificar aparência outline, ícone de pesquisa à esquerda em `color.primary`, fundo `color.surface-container`, forma `shape.corner-extra-small`, ausência de contorno em repouso, foco visível ao navegar por teclado e altura alinhada aos controles da toolbar. Em viewport estreita, confirmar que o campo reflui para uma linha própria sem recorte ou rolagem horizontal. Verificar que o card apresenta imagens acima do título, sem espaçamento interno ao redor delas, usa a cor escolhida e mantém fundo transparente quando a nota não tem cor.
6. **Ações e detalhe**: confirmar que o hover destaca levemente o card e apresenta ações iconográficas; repetir por foco e toque, verificar nomes acessíveis e arrastar a partir de diferentes áreas do card. Abrir o detalhe e confirmar que aparece em modal, mantém imagens acima do título sem espaçamento interno ao redor e devolve o foco ao acionador ao fechar.
7. **Reflow e modalidades**: testar largura estreita e ampla, confirmando ausência de conteúdo cortado ou rolagem horizontal; percorrer todas as ações por teclado e toque e habilitar movimento reduzido para confirmar que animações não são necessárias.
8. **Isolamento**: com dois IDs de usuário de teste, confirmar que cada usuário só lista, busca, abre, atualiza e exclui suas próprias notas.
9. **Concorrência entre abas**: abrir a mesma nota para edição em duas abas e verificar aviso imediato. Salvar a primeira edição; ao salvar a revisão antiga, confirmar alerta de conflito e opções de recarregar a versão atual ou sobrescrever explicitamente. Confirmar que cancelar descarta o rascunho.
10. **Falha de armazenamento**: simular falha do IndexedDB/quota no navegador; confirmar mensagem acionável e ausência de indicação de sucesso.

## Resultados mensuráveis

- Com 1.000 notas, medir buscas por título/conteúdo e verificar tempo até 2 segundos.
- Com mais de 100 notas, verificar no máximo 100 itens inicialmente e novas páginas carregadas ao se aproximar do fim.
- Para cada falha de operação, verificar que o estado visível não apresenta a alteração como persistida.
- Nas larguras de tela verificadas, confirmar que 100% dos controles e conteúdos continuam visíveis e operáveis sem recorte ou rolagem horizontal.
- Confirmar que todas as ações podem ser identificadas e acionadas por ponteiro, toque e teclado, sem depender exclusivamente de hover.

## Validação de implementação

Executado em 2026-10-29 após a integração da UI Material 3:

| Comando                     | Resultado                                                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run test:browser -- tests/browser/notes-collection.spec.ts` | Aprovado: 3 cenários Playwright; Search Box validado quanto ao ícone, tokens visuais, borda/foco, altura e reflow. |
| `npm test -- --watch=false` | Aprovado: 18 testes unitários em 6 arquivos.                                                                                                                                                                |
| `npm run test:browser`      | Aprovado: 11 cenários Playwright em Chromium.                                                                                                                                                               |
| `npm run build`             | Aprovado. O Angular CLI emite aviso de que o bundle inicial (752,96 kB sem compressão; 163,45 kB estimados transferidos) ultrapassa o limite de aviso de 500 kB; permanece abaixo do limite de erro de 1 MB. |
