# 🏢 CRM Imobiliário - Sistema Multi-Tenant SaaS

Sistema completo de CRM para imobiliárias com arquitetura multi-tenant, desenvolvido com Angular e Supabase. **Pronto para deploy em Netlify/Vercel** com suporte real para múltiplos domínios e subdomínios.

## ⚡ Deploy e Arquitetura SaaS

Este sistema foi projetado para ser uma **aplicação SaaS real** que funciona em plataformas modernas como Netlify ou Vercel:

### ✅ O que funciona (Realista)
- 🚀 **Subdomínios Automáticos**: `cliente1.seusite.com`, `cliente2.seusite.com` com SSL automático
- 🌐 **Domínios Customizados**: Suporte para domínios próprios dos clientes (configuração manual)
- 🎨 **Construtor Visual Drag & Drop**: Interface para criar sites personalizados
- 🔒 **SSL Automático**: Fornecido pelo Netlify/Vercel (sem Certbot/Let's Encrypt manual)
- 📊 **Multi-tenant Completo**: Detecção automática de empresa por hostname
- 🗄️ **Backend Serverless**: Supabase com Row Level Security (RLS)

### ❌ O que NÃO tenta fazer (Impossível em Netlify/Vercel)
- Configuração de Nginx
- Upload de certificados SSL
- Certbot ou Let's Encrypt manual
- Automação completa de domínios via código

**📖 Documentação Completa:** Veja [`DEPLOYMENT.md`](DEPLOYMENT.md) para guia de deploy e [`FRONTEND_PUBLIC_PROMPT.md`](FRONTEND_PUBLIC_PROMPT.md) para criar o site público.

## 🚀 Características

### Multi-Tenant
- ✅ Suporte para múltiplas imobiliárias
- ✅ Isolamento completo de dados por `company_id`
- ✅ Segurança através de Row Level Security (RLS)

### Módulos Principais
- 👥 **Clientes/Leads**: Gestão completa de clientes e leads
- 🏠 **Imóveis**: Cadastro e gestão de propriedades
- 📅 **Visitas**: Agenda de visitas com corretor responsável
- 💼 **Negócios**: Funil visual (Kanban) de propostas
- 📎 **Anexos**: Upload de documentos via Supabase Storage
- 📝 **Histórico**: Log automático de ações
- 🔔 **Notificações**: Sistema de notificações em tempo real

### Controle de Acesso
- 🔐 **Admin**: Acesso total à imobiliária
- 👔 **Gestor**: Gerenciar corretores e visualizar todos os dados
- 🏃 **Corretor**: Visualizar apenas dados vinculados

## 🛠️ Stack Tecnológica

- **Frontend**: Angular 17 (Standalone Components)
- **Backend/Auth**: Supabase (PostgreSQL, Auth, Storage, RLS, Realtime)
- **Linguagem**: TypeScript
- **Estilização**: SCSS

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## ⚙️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/sanpaa/CRM-IMOBIL-APP.git
cd CRM-IMOBIL-APP
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um projeto no Supabase
Acesse [https://supabase.com](https://supabase.com) e crie um novo projeto.

#### 3.2. Execute o schema SQL
No painel do Supabase, vá em **SQL Editor** e execute o arquivo `supabase-schema.sql` que está na raiz do projeto.

Este arquivo cria:
- Todas as tabelas (companies, users, clients, properties, visits, deals, attachments, activity_logs, notifications)
- Índices para performance
- Políticas de Row Level Security (RLS)
- Triggers para updated_at

#### 3.3. Configure as variáveis de ambiente
Edite o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'SUA_URL_DO_SUPABASE',
    anonKey: 'SUA_CHAVE_ANONIMA_DO_SUPABASE'
  }
};
```

E também `src/environments/environment.prod.ts` para produção.

### 4. Execute o projeto
```bash
npm start
```

Acesse: [http://localhost:4200](http://localhost:4200)

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### companies
Armazena as imobiliárias (multi-tenant)
- `id`: UUID (PK)
- `name`: Nome da imobiliária
- `document`: CNPJ
- `email`, `phone`: Contatos
- `active`: Status ativo/inativo

#### users
Usuários vinculados ao `auth.users` do Supabase
- `id`: UUID (PK, igual ao auth.users.id)
- `company_id`: FK para companies
- `role`: 'admin', 'gestor', 'corretor'

#### clients
Leads e clientes
- `company_id`: Multi-tenant
- `assigned_user_id`: Corretor responsável

#### properties
Imóveis cadastrados
- `company_id`: Multi-tenant
- `owner_client_id`: Proprietário (FK para clients)
- `value`, `iptu`, `condominium`: Valores

#### visits
Agenda de visitas
- `company_id`: Multi-tenant
- `client_id`, `property_id`, `user_id`: Relacionamentos
- `visit_date`, `visit_time`: Data e hora

#### deals
Negócios/Propostas
- `company_id`: Multi-tenant
- `proposed_value`: Valor da proposta
- `status`: 'proposta', 'negociacao', 'aceito', 'fechado', 'perdido'

#### attachments
Documentos e arquivos
- `company_id`: Multi-tenant
- `entity_type`, `entity_id`: Vínculo genérico

#### activity_logs
Histórico de ações
- Registra automaticamente as ações dos usuários

#### notifications
Notificações do sistema
- Suporta Realtime do Supabase

## 🔐 Row Level Security (RLS)

Todas as tabelas possuem políticas RLS que garantem:
- Usuários só veem dados da própria imobiliária (`company_id`)
- Corretores veem apenas dados vinculados a eles
- Admins e Gestores têm acesso total aos dados da empresa

## 🏗️ Arquitetura do Frontend

```
src/
├── app/
│   ├── components/       # Componentes standalone
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── properties/
│   │   ├── visits/
│   │   └── deals/
│   ├── services/         # Services para API
│   │   ├── supabase.service.ts
│   │   ├── auth.service.ts
│   │   ├── client.service.ts
│   │   ├── property.service.ts
│   │   ├── visit.service.ts
│   │   ├── deal.service.ts
│   │   ├── notification.service.ts
│   │   └── activity-log.service.ts
│   ├── models/           # Interfaces TypeScript
│   ├── guards/           # Guards de autenticação
│   └── app.routes.ts     # Rotas da aplicação
└── environments/         # Configurações de ambiente
```

## 🚀 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/crm-imobil-app/`.

## 📝 Uso do Sistema

### 1. Cadastro Inicial
- Acesse `/register`
- Crie a conta do administrador
- Isso criará automaticamente a imobiliária (companies)

### 2. Login
- Acesse `/login`
- Entre com suas credenciais

### 3. Dashboard
- Visualize estatísticas gerais
- Navegue pelos módulos pelo menu lateral

### 4. Gestão de Clientes
- Cadastre clientes/leads
- Atribua corretor responsável
- Gerencie status no funil

### 5. Gestão de Imóveis
- Cadastre propriedades
- Vincule ao proprietário (cliente)
- Configure valores, IPTU, condomínio

### 6. Agenda de Visitas
- Agende visitas
- Vincule cliente, imóvel e corretor
- Acompanhe status (agendada, confirmada, realizada, cancelada)

### 7. Negócios
- Visualização em Kanban
- Gerencie propostas por estágio
- Acompanhe valores e conversões

## 🔧 Desenvolvimento

### Comandos úteis
```bash
# Desenvolvimento
npm start

# Build
npm run build

# Testes
npm test

# Lint
npm run lint
```

## 🌐 Deploy para Produção

Este sistema está pronto para deploy em Netlify ou Vercel. Veja o guia completo em [`DEPLOYMENT.md`](DEPLOYMENT.md).

### Quick Start - Netlify

```bash
# Build
npm run build

# Deploy via CLI
npm install -g netlify-cli
netlify deploy --prod
```

### Quick Start - Vercel

```bash
# Build
npm run build

# Deploy via CLI
npm install -g vercel
vercel --prod
```

### Configuração de Domínios

**Subdomínios Automáticos (Recomendado):**
1. Configure wildcard DNS: `*.seusite.com` → `seu-site.netlify.app`
2. SSL funciona automaticamente para todos os subdomínios
3. Cada empresa tem seu subdomínio: `empresa1.seusite.com`

**Domínios Customizados (Premium):**
1. Cliente configura DNS: CNAME → `seu-site.netlify.app`
2. Adicione manualmente no painel Netlify/Vercel
3. SSL configurado automaticamente pela plataforma

## 🔧 Serviços Criados para Multi-tenant

### TenantResolverService
Detecta automaticamente qual empresa está sendo acessada baseado no hostname:
```typescript
const companyId = await this.tenantResolver.getCurrentTenant();
```

### PublicSiteConfigService
Carrega configurações e dados da empresa para o site público:
```typescript
const config = await this.publicSiteConfig.getSiteConfig();
```

### DomainManagementService
Gerencia domínios customizados e subdomínios automáticos.

## 📚 Documentação Adicional

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guia completo de deploy (Netlify/Vercel)
- **[WEBSITE_CUSTOMIZATION_GUIDE.md](WEBSITE_CUSTOMIZATION_GUIDE.md)** - Guia do construtor de sites
- **[FRONTEND_PUBLIC_PROMPT.md](FRONTEND_PUBLIC_PROMPT.md)** - Guia para criar o frontend público
- **[SECURITY.md](SECURITY.md)** - Considerações de segurança
- **Migration:** Execute `migration-netlify-domains.sql` no Supabase

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido para ser um CRM imobiliário profissional, escalável e pronto para comercialização como SaaS multi-tenant. Arquitetura otimizada para deploy em Netlify/Vercel com suporte real para múltiplos domínios.

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no GitHub.

---

**Nota Importante:** Este sistema foi refatorado para ser **compatível com Netlify/Vercel**. Não usa Nginx, Certbot ou upload de SSL - tudo isso é gerenciado automaticamente pela plataforma de hospedagem. Veja `DEPLOYMENT.md` para detalhes completos.
