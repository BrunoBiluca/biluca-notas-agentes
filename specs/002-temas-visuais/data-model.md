# Modelo de dados: Preferência de tema

## Preferência de tema

Representa a escolha de aparência da aplicação para esta origem e perfil de navegador. Não é uma propriedade de nota nem um dado sincronizado por usuário.

| Campo | Tipo | Persistência | Regra |
|---|---|---|---|
| `mode` | `light \| dark \| system` | `localStorage` como valor textual | Valor enumerado; `system` é o padrão quando não existe uma escolha válida. |
| `effectiveScheme` | `light \| dark` | Derivado, não persistido | Em `light` ou `dark`, corresponde ao modo explícito. Em `system`, corresponde à preferência CSS do dispositivo; usa claro se não houver preferência escura detectável. |
| `persistenceError` | mensagem ou vazio | Estado transitório em memória | Informa falha de leitura, valor inválido ou falha ao salvar; nunca é tratada como preferência persistida. |

**Chave de armazenamento**: `biluca-notas-agentes.theme-preference`  
**Valores válidos**: `light`, `dark`, `system`  
**Formato**: texto simples, sem JSON nem migração de esquema.

## Estados e transições

1. **Inicialização sem valor**: selecionar `system`; não apresentar erro.
2. **Inicialização com valor válido**: restaurar o modo e aplicá-lo antes da primeira renderização.
3. **Inicialização com valor inválido ou falha de leitura/acesso**: selecionar `system`, manter a aplicação utilizável e expor a mensagem de falha.
4. **Seleção válida**: atualizar o modo em memória e aplicar o esquema imediatamente; tentar persistir o modo escolhido.
5. **Gravação bem-sucedida**: manter a seleção e remover qualquer mensagem de falha anterior.
6. **Gravação negada**: manter a seleção somente durante a sessão e expor a mensagem de que ela não será restaurada na próxima abertura.
7. **Modo `system` com mudança do dispositivo**: manter `mode = system`; o navegador atualiza `effectiveScheme` sem modificar a preferência salva.

## Invariantes

- `mode` só pode conter `light`, `dark` ou `system`.
- A preferência global não altera a cor de fundo nem qualquer outro campo de uma nota.
- Falha de persistência não deve impedir criação, leitura, edição ou remoção de notas.
- A aparência efetiva não substitui nem sobrescreve o modo escolhido.

## Entidade existente: Nota

As notas permanecem no modelo e repositório atuais, inclusive seu campo de cor de fundo própria e as regras existentes de legibilidade. Esta funcionalidade não cria migração nem altera o armazenamento de notas.
