# Contrato de interface: Seletor de tema

## Localização e composição

- O acionador fica no lado direito da `MatToolbar` existente na coleção de notas.
- Um botão de ícone abre `MatMenu` com três `MatMenuItem`: “Claro”, “Escuro” e “Definido pelo sistema”.
- O ícone é decorativo; o botão fornece nome acessível, por exemplo, “Selecionar tema da aplicação”.
- O item atual apresenta uma indicação textual, como “(atual)”; a seleção não depende apenas de cor.
- O esquema é aplicado à raiz e afeta as rotas da aplicação, sem modificar as cores próprias das notas.

## Interação e acessibilidade

- O menu segue navegação por teclado, movimento de foco e restauração de foco fornecidos pelo Angular Material.
- O acionador e as escolhas continuam disponíveis por ponteiro, toque e teclado.
- O menu permanece visível e utilizável em viewports estreitas, sem depender de breakpoints não documentados.
- A falha de leitura/gravação é mostrada como mensagem global `role="alert"` para não ficar restrita à rota da toolbar.
- Não apresentar sucesso de persistência quando o navegador não aceitar a gravação.

## Resultado por opção

| Opção | Aparência |
|---|---|
| Claro | Esquema claro Azure, independente da preferência do dispositivo. |
| Escuro | Esquema escuro Azure, independente da preferência do dispositivo. |
| Definido pelo sistema | O navegador segue `prefers-color-scheme`; o modo selecionado continua sendo `system`. |
