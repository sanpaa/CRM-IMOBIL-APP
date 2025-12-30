# 🚀 Guia de Início Rápido

Este guia vai te ajudar a ter o CRM Imobiliário rodando em menos de 10 minutos!

## ⚡ Instalação Rápida

### 1️⃣ Pré-requisitos (2 min)

Certifique-se de ter instalado:
- ✅ Node.js 18+ ([Download](https://nodejs.org))
- ✅ npm (vem com Node.js)
- ✅ Git ([Download](https://git-scm.com))

Verifique as versões:
```bash
node --version  # deve ser >= 18
npm --version   # deve ser >= 9
```

### 2️⃣ Clone o Projeto (1 min)

```bash
git clone https://github.com/sanpaa/CRM-IMOBIL-APP.git
cd CRM-IMOBIL-APP
```

### 3️⃣ Instale as Dependências (2 min)

```bash
npm install
```

### 4️⃣ Configure o Supabase (3 min)

#### A. Crie uma conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto

#### B. Execute o Schema SQL
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em **Run**

✅ Isso criará todas as tabelas, índices e políticas de segurança!

#### C. Configure as Credenciais
1. No painel do Supabase, vá em **Settings** > **API**
2. Copie a **URL** e a **anon public key**
3. Edite o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'COLE_SUA_URL_AQUI',
    anonKey: 'COLE_SUA_CHAVE_AQUI'
  }
};
```

### 5️⃣ Execute o Projeto (1 min)

```bash
npm start
```

✅ Abra seu navegador em: [http://localhost:4200](http://localhost:4200)

## 🎯 Primeiro Acesso

### 1. Cadastre-se
- Acesse a página de registro
- Preencha os dados da imobiliária
- Crie sua conta de administrador

### 2. Explore o Dashboard
- Veja as estatísticas
- Navegue pelos módulos no menu lateral

### 3. Cadastre seu Primeiro Cliente
- Clique em "Clientes" no menu
- Clique em "+ Novo Cliente"
- Preencha os dados e salve

### 4. Cadastre um Imóvel
- Clique em "Imóveis" no menu
- Clique em "+ Novo Imóvel"
- Preencha os detalhes e salve

### 5. Agende uma Visita
- Clique em "Visitas" no menu
- Clique em "+ Nova Visita"
- Defina data, hora e salve

### 6. Crie um Negócio
- Clique em "Negócios" no menu
- Clique em "+ Novo Negócio"
- Veja o funil Kanban!

## 🔍 Estrutura do Projeto

```
CRM-IMOBIL-APP/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 components/     # Componentes da UI
│   │   │   ├── login/         # Tela de login
│   │   │   ├── register/      # Cadastro
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── clients/       # Gestão de clientes
│   │   │   ├── properties/    # Gestão de imóveis
│   │   │   ├── visits/        # Agenda de visitas
│   │   │   └── deals/         # Funil de negócios
│   │   ├── 📁 services/       # Lógica de negócio
│   │   │   ├── auth.service.ts
│   │   │   ├── client.service.ts
│   │   │   ├── property.service.ts
│   │   │   └── ...
│   │   ├── 📁 models/         # Interfaces TypeScript
│   │   └── 📁 guards/         # Proteção de rotas
│   └── 📁 environments/       # Configurações
├── 📄 supabase-schema.sql     # Schema do banco
├── 📄 README.md               # Documentação principal
├── 📄 DEPLOYMENT.md           # Guia de deploy
└── 📄 package.json            # Dependências
```

## 🆘 Problemas Comuns

### Erro: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 4200 already in use"
```bash
# Mate o processo na porta 4200
lsof -ti:4200 | xargs kill -9
npm start
```

### Erro de CORS no Supabase
1. Vá em **Settings** > **API** no Supabase
2. Adicione `http://localhost:4200` em **Allowed Origins**

### Tabelas não aparecem
1. Verifique se executou o `supabase-schema.sql`
2. Vá em **Database** > **Tables** no Supabase
3. Deve ver todas as 9 tabelas criadas

## 📚 Próximos Passos

1. ✅ Leia o [README.md](README.md) completo
2. ✅ Configure [notificações em tempo real](README.md#notificações)
3. ✅ Adicione mais usuários com roles diferentes
4. ✅ Explore o [guia de deploy](DEPLOYMENT.md)
5. ✅ Personalize o design e as cores

## 💡 Dicas

### Desenvolvimento
- Use `Ctrl+C` para parar o servidor
- Mudanças no código são aplicadas automaticamente (hot reload)
- Abra o console do navegador (F12) para ver logs

### Debug
- Erros aparecem no terminal e no console do navegador
- Verifique a aba **Network** para problemas de API
- Logs do Supabase em **Logs** > **Database**

### Performance
- Build de produção: `npm run build`
- Testes: `npm test`
- Lint: `npm run lint`

## 🎓 Recursos Úteis

- 📖 [Documentação do Angular](https://angular.io/docs)
- 🗄️ [Documentação do Supabase](https://supabase.com/docs)
- 💬 [Stack Overflow](https://stackoverflow.com/questions/tagged/angular)
- 🐛 [Reportar Bug](https://github.com/sanpaa/CRM-IMOBIL-APP/issues)

## 🤝 Precisa de Ajuda?

- 📧 Abra uma [issue no GitHub](https://github.com/sanpaa/CRM-IMOBIL-APP/issues)
- 💬 Veja o [guia de contribuição](CONTRIBUTING.md)
- 🔒 Para segurança, veja [SECURITY.md](SECURITY.md)

---

**Pronto!** Você agora tem um CRM imobiliário profissional rodando! 🎉

Explore, personalize e venda como SaaS! 💰
