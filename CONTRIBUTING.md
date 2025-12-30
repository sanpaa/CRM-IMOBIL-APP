# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o CRM Imobiliário! 

## Como Contribuir

### Reportando Bugs

Se você encontrou um bug, por favor abra uma issue incluindo:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
- Versão do Node/npm
- Navegador e versão

### Sugerindo Melhorias

Para sugerir novas funcionalidades:
- Abra uma issue com a tag `enhancement`
- Descreva claramente a funcionalidade
- Explique por que seria útil
- Forneça exemplos de uso

### Pull Requests

1. **Fork o projeto**
```bash
git clone https://github.com/seu-usuario/CRM-IMOBIL-APP.git
```

2. **Crie uma branch**
```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bugfix
```

3. **Faça suas alterações**
- Siga os padrões de código existentes
- Comente código complexo
- Mantenha commits pequenos e focados

4. **Teste suas alterações**
```bash
npm run build
npm test
npm run lint
```

5. **Commit suas mudanças**
```bash
git commit -m "feat: adiciona funcionalidade X"
# ou
git commit -m "fix: corrige bug Y"
```

Padrão de mensagens de commit:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adição de testes
- `chore`: Manutenção

6. **Push para o GitHub**
```bash
git push origin feature/minha-feature
```

7. **Abra um Pull Request**
- Descreva suas mudanças
- Referencie issues relacionadas
- Aguarde review

## Padrões de Código

### TypeScript
- Use tipos sempre que possível
- Evite `any`
- Prefira interfaces para objetos
- Use async/await ao invés de callbacks

### Angular
- Use standalone components
- Siga a estrutura de pastas existente
- Componentes devem ser reutilizáveis quando possível
- Services devem conter lógica de negócio

### Naming Conventions
- Components: `PascalCase` (ex: `ClientListComponent`)
- Services: `PascalCase` com sufixo `Service` (ex: `ClientService`)
- Models: `PascalCase` (ex: `Client`)
- Variáveis: `camelCase` (ex: `clientList`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_ITEMS`)

### CSS/SCSS
- Use classes descritivas
- Prefira flexbox/grid
- Mantenha consistência com estilos existentes

## Estrutura de Arquivos

```
src/
├── app/
│   ├── components/       # Componentes da UI
│   ├── services/         # Serviços (lógica)
│   ├── models/           # Interfaces/Types
│   ├── guards/           # Route guards
│   └── utils/            # Funções utilitárias
```

## Testes

- Escreva testes para novas funcionalidades
- Mantenha cobertura de testes > 70%
- Use mocks para serviços externos

```bash
# Rodar testes
npm test

# Com cobertura
npm test -- --coverage
```

## Documentação

- Atualize README.md se necessário
- Documente funções complexas
- Adicione comentários JSDoc quando relevante

## Code Review

Todos os PRs passam por revisão. O revisor verificará:
- ✅ Código segue os padrões
- ✅ Testes passam
- ✅ Não há breaking changes sem aviso
- ✅ Documentação está atualizada
- ✅ Código está otimizado

## Dúvidas?

Abra uma issue com a tag `question` ou entre em contato.

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).
