# Biluca Notes

Aplicação local para criar, organizar, pesquisar e manter notas pessoais com imagens. As notas e imagens são armazenadas no IndexedDB do navegador; não há servidor nem integração externa.

## Executar

Requisitos: Node.js compatível com Angular 22 e npm.

```text
npm ci
npm start
```

O provedor de identidade padrão usa `local-user`. Uma aplicação hospedeira pode substituir o token `CURRENT_USER_PROVIDER`; esta aplicação não cria autenticação.

## Validar

```text
npm test -- --watch=false
npm run build
npm run test:browser:install
npm run test:browser
```

O Vitest cobre domínio e serviços. O Playwright inicia o servidor Angular e valida IndexedDB e interações reais no Chromium.

Consulte [o guia completo de validação da funcionalidade](./specs/001-gerenciar-notas/quickstart.md) para os cenários e critérios de aceite.
