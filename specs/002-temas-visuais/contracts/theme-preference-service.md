# Contrato interno: Serviço de preferência de tema

Este contrato é interno à aplicação Angular; não expõe API HTTP nem integração externa.

## Tipos

- `ThemeMode`: união literal `light | dark | system`.
- O serviço expõe sinais somente de leitura para o modo selecionado e para a falha de persistência atual.

## Interface prevista

```ts
import type { Signal } from '@angular/core';

interface ThemePreferenceService {
  readonly mode: Signal<ThemeMode>;
  readonly persistenceError: Signal<string | null>;
  initialize(): void;
  select(mode: ThemeMode): void;
}
```

O contrato será publicado por um token de injeção tipado. O serviço de produção mantém o estado em `@ngrx/signals` e centraliza leitura/gravação e aplicação do esquema.

## Comportamento observável

- `initialize()` valida o valor persistido, escolhe `system` quando ele está ausente e aplica o modo à raiz antes da renderização da aplicação.
- `select(mode)` aceita apenas os três valores do contrato, aplica o modo em memória e tenta persistir o valor.
- `persistenceError` fica vazio após gravação bem-sucedida; falhas de acesso, leitura, valor inválido ou gravação são reportadas explicitamente.
- Em falha de gravação, o tema continua aplicado na sessão atual, mas o estado de erro deixa claro que a escolha não será restaurada após reabrir.
- O modo `system` permanece o valor selecionado durante alterações da preferência do dispositivo.

## Verificação

Testes unitários devem cobrir ausência e restauração de valores, validação, cada seleção, aplicação do modo, mudança da preferência do dispositivo, falhas de leitura/gravação e a ausência de mutações nas notas.
