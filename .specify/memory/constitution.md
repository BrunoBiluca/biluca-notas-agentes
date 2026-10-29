<!--
Relatório de impacto da sincronização
Versão: 1.1.0 -> 1.1.1
Princípios alterados: Nenhum
Princípios adicionados: Nenhum
Seções adicionadas: Nenhuma
Seções removidas: Nenhuma
Pendências: Nenhuma
-->

# Constituição do Biluca Notes Agents

## Princípios Fundamentais

### I. Estado com sinais como padrão
Variáveis de componentes Angular que representem estado ou estado derivado DEVEM usar sinais
como padrão. O estado da aplicação em memória DEVE usar exclusivamente `@ngrx/signals`;
outros pacotes de estado do NgRx NÃO DEVEM ser introduzidos. Isso mantém as atualizações de
estado explícitas e consistentes em toda a aplicação.

### II. Contratos de serviço definidos por interfaces
Componentes DEVEM conter apenas comportamento relacionado à interface com o usuário. Acesso
a dados, persistência e regras de negócio DEVEM ficar em serviços. O contrato de cada serviço
DEVE ser definido por uma interface, e componentes DEVEM depender dessa interface por meio de
um token de injeção de dependência tipado, nunca de uma implementação concreta. Isso separa
as responsabilidades e evita acoplar a interface às implementações dos serviços.

### III. Regras de negócio cobertas por testes unitários
Toda regra de negócio DEVE ter testes unitários que verifiquem seu comportamento observável.
Os testes DEVEM usar Vitest. Alterações em regras de negócio DEVEM incluir os testes
correspondentes para detectar regressões na camada de serviço responsável pela regra.

### IV. Persistência local no navegador e ausência de integrações externas
Dados da aplicação que precisem persistir DEVEM ser armazenados no IndexedDB do navegador e
acessados por meio de serviços. A aplicação NÃO DEVE adicionar integrações com sistemas
externos. Assim, a persistência permanece no navegador e a aplicação não depende de serviços
externos.

### V. Dependências justificadas
Uma dependência nova NÃO DEVE ser adicionada sem justificativa documentada que explique sua
necessidade e as alternativas consideradas, nem sem aprovação explícita antes de sua inclusão.
Essa regra limita dependências desnecessárias e seus riscos.

### VI. Idioma dos documentos e do código
Todo documento do projeto DEVE ser escrito em português. Todo código gerado DEVE ser escrito
em inglês, incluindo nomes de identificadores, testes e comentários inseridos no código.
Essas regras são obrigatórias e não negociáveis. Nomes oficiais de tecnologias, APIs,
bibliotecas e identificadores exigidos por contratos externos podem permanecer em sua forma
oficial.

## Restrições Adicionais

- A aplicação DEVE usar a versão estável mais recente do Angular disponível no início da
  implementação.
- Formulários DEVEM usar Angular Signal Forms (`@angular/forms/signals`); outras abordagens de
  formulários do Angular NÃO DEVEM ser introduzidas.
- Vitest DEVE ser o executor dos testes unitários.
- Dados persistentes da aplicação DEVEM usar o IndexedDB do navegador. O estado em memória
  DEVE seguir o Princípio I.
- Nenhuma integração externa, incluindo APIs ou serviços externos, pode ser introduzida.

## Fluxo de Desenvolvimento

- Cada alteração DEVE ser revisada conforme os Princípios Fundamentais e as Restrições
  Adicionais.
- Alterações em regras de negócio DEVEM incluir testes unitários com Vitest para o comportamento
  alterado.
- Alterações nos contratos de serviço DEVEM preservar a dependência dos componentes em
  interfaces, conforme o Princípio II.
- Propostas de novas dependências DEVEM incluir a justificativa e as alternativas exigidas pelo
  Princípio V e receber aprovação antes de sua inclusão.
- Revisões DEVEM rejeitar alterações que introduzam integrações externas ou persistam dados da
  aplicação fora do IndexedDB.
- Documentação e código DEVEM obedecer aos idiomas definidos no Princípio VI.

## Governança

Esta constituição é a fonte de autoridade para os princípios e as restrições de engenharia do
projeto. Alterações DEVEM ser propostas com sua justificativa e seu impacto no código existente,
revisadas quanto à consistência com os demais princípios e aprovadas explicitamente antes de
serem adotadas. Qualquer exceção de implementação DEVE ser documentada, justificada e aprovada
como parte da alteração que a introduz.

A constituição segue o versionamento semântico: MAJOR para alterações incompatíveis nos
princípios ou na governança, MINOR para novos princípios ou expansão material dos requisitos e
PATCH para esclarecimentos ou alterações de redação sem mudança semântica. Cada emenda DEVE
atualizar a versão e a data da última alteração. Alterações e revisões do projeto DEVEM verificar
a conformidade com esta constituição; a não conformidade DEVE ser corrigida ou tratada por meio
de uma exceção aprovada explicitamente.

**Versão**: 1.1.1 | **Ratificada**: 2026-10-27 | **Última alteração**: 2026-10-27
