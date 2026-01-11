# ⚙️ Setup Multi-Tenant - Guia de Configuração

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Banco Central](#configuração-do-banco-central)
3. [Configuração do Banco Tenant](#configuração-do-banco-tenant)
4. [Provisionamento do Primeiro Tenant](#provisionamento-do-primeiro-tenant)
5. [Configuração do Backend](#configuração-do-backend)
6. [Configuração do Frontend](#configuração-do-frontend)
7. [Testes e Validação](#testes-e-validação)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

Antes de começar, certifique-se de ter:

### Software Necessário
- ✅ Node.js 18+ instalado
- ✅ npm ou yarn
- ✅ Conta no Supabase (https://supabase.com)
- ✅ Git instalado
- ✅ Editor de código (VS Code recomendado)

### Conhecimentos
- ✅ Básico de SQL
- ✅ Básico de JavaScript/TypeScript
- ✅ Conceitos de multi-tenancy
- ✅ Familiaridade com Supabase

### Tempo Estimado
- **Setup completo:** 2-3 horas
- **Primeiro tenant:** 30 minutos
- **Testes:** 1 hora

---

## 🗄️ Configuração do Banco Central

O banco central armazena dados compartilhados entre todos os tenants.

### Passo 1: Criar Projeto Supabase

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Configure:
   - **Name:** CRM-Imobiliario-Central
   - **Database Password:** [escolha uma senha forte]
   - **Region:** South America (São Paulo)
4. Aguarde a criação (~2 minutos)

### Passo 2: Executar Migration do Banco Central

1. No projeto Supabase, vá em **SQL Editor**
2. Abra o arquivo `migrations/migration-central-database.sql`
3. Copie todo o conteúdo
4. Cole no SQL Editor
5. Clique em **Run**
6. Aguarde a execução (~30 segundos)

### Passo 3: Verificar Tabelas Criadas

No **Table Editor**, você deve ver:
- ✅ `companies` - Cadastro de tenants
- ✅ `users` - Usuários do sistema
- ✅ `subscription_plans` - Planos (Prime, K, K2)
- ✅ `tenant_subscriptions` - Assinaturas ativas
- ✅ `custom_domains` - Domínios personalizados
- ✅ `tenant_audit_log` - Log de auditoria

### Passo 4: Verificar Planos Criados

Execute no SQL Editor:
```sql
SELECT * FROM subscription_plans;
```

Deve retornar 3 planos:
- Prime (R$ 247/mês, 2 usuários, 100 imóveis)
- K (R$ 397/mês, 5 usuários, 500 imóveis)
- K2 (R$ 597/mês, 12 usuários, ilimitado)

### Passo 5: Anotar Credenciais

Em **Project Settings** → **API**, anote:
- ✅ **Project URL:** https://xxxxx.supabase.co
- ✅ **Anon Key:** eyJhbGc... (chave pública)
- ✅ **Service Role Key:** eyJhbGc... (chave privada - **não compartilhe!**)

---

## 🏢 Configuração do Banco Tenant

Cada tenant terá seu próprio banco de dados. Vamos criar um template.

### Passo 1: Criar Projeto Template

1. No Supabase, clique em "New Project"
2. Configure:
   - **Name:** CRM-Imobiliario-Tenant-Template
   - **Database Password:** [mesma senha do central ou outra]
   - **Region:** South America (São Paulo)
3. Aguarde a criação

### Passo 2: Executar Migration do Tenant

1. No projeto tenant, vá em **SQL Editor**
2. Abra o arquivo `migrations/migration-tenant-database.sql`
3. Copie todo o conteúdo
4. Cole no SQL Editor
5. Clique em **Run**

### Passo 3: Verificar Tabelas Criadas

No **Table Editor**, você deve ver:
- ✅ `properties` - Imóveis
- ✅ `clients` - Clientes/leads
- ✅ `visits` - Visitas agendadas
- ✅ `store_settings` - Configurações da loja
- ✅ `website_layouts` - Layouts do site
- ✅ `whatsapp_messages` - Mensagens WhatsApp
- ✅ `activity_log` - Log de atividades

### Passo 4: Anotar Credenciais do Template

Em **Project Settings** → **API**, anote:
- ✅ **Project URL:** https://yyyyy.supabase.co
- ✅ **Anon Key:**  [anote]
- ✅ **Service Role Key:** [anote]

---

## 🚀 Provisionamento do Primeiro Tenant

Agora vamos criar o primeiro tenant (imobiliária de teste).

### Passo 1: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco Central
CENTRAL_DB_URL=https://xxxxx.supabase.co
CENTRAL_DB_KEY=eyJhbGc... (service role key do central)

# Banco Tenant Template
TENANT_DB_URL=https://yyyyy.supabase.co
TENANT_DB_KEY=eyJhbGc... (service role key do tenant)
```

### Passo 2: Instalar Dependências

```bash
npm install @supabase/supabase-js
```

### Passo 3: Executar Script de Provisionamento

```bash
node scripts/provision-tenant.js \
  --name "Imobiliária Teste" \
  --email "teste@imobiliaria.com" \
  --admin-email "admin@imobiliaria.com" \
  --admin-password "SenhaSegura123!" \
  --plan "prime" \
  --custom-domain "teste.com.br"
```

### Passo 4: Verificar Criação

O script deve exibir:
```
📦 Provisionando novo tenant: Imobiliária Teste...
✅ Empresa criada: [uuid]
✅ Plano Prime atribuído
✅ Schema do tenant criado
✅ Usuário admin criado: admin@imobiliaria.com
✅ Dados iniciais inseridos

🎉 Tenant provisionado com sucesso!
   Empresa: Imobiliária Teste
   ID: [uuid]
   Database: tenant_[timestamp]
   Plano: Prime
   Admin: admin@imobiliaria.com
```

### Passo 5: Validar no Banco Central

Execute no SQL Editor do banco central:
```sql
SELECT * FROM companies WHERE name = 'Imobiliária Teste';
SELECT * FROM users WHERE email = 'admin@imobiliaria.com';
SELECT * FROM tenant_subscriptions WHERE tenant_id = '[uuid da empresa]';
```

---

## ⚙️ Configuração do Backend

### Passo 1: Implementar ConnectionManager

Crie `src/infrastructure/database/connectionManager.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

class DatabaseConnectionManager {
  constructor() {
    this.centralDB = null;
    this.tenantConnections = new Map();
  }

  getCentralConnection() {
    if (!this.centralDB) {
      this.centralDB = createClient(
        process.env.CENTRAL_DB_URL,
        process.env.CENTRAL_DB_KEY
      );
    }
    return this.centralDB;
  }

  async getTenantConnection(tenantId) {
    if (this.tenantConnections.has(tenantId)) {
      return this.tenantConnections.get(tenantId);
    }

    const { data } = await this.getCentralConnection()
      .from('companies')
      .select('database_url, database_key')
      .eq('id', tenantId)
      .single();

    const connection = createClient(data.database_url, data.database_key);
    this.tenantConnections.set(tenantId, connection);
    
    return connection;
  }
}

module.exports = new DatabaseConnectionManager();
```

### Passo 2: Criar Middleware de Tenant

Crie `src/middleware/tenantMiddleware.js`:

```javascript
const connectionManager = require('../infrastructure/database/connectionManager');

async function tenantContextMiddleware(req, res, next) {
  try {
    const tenantId = req.user?.company_id;
    
    if (!tenantId) {
      return res.status(403).json({ error: 'Tenant context required' });
    }

    const tenantDB = await connectionManager.getTenantConnection(tenantId);
    
    req.tenantDB = tenantDB;
    req.tenantId = tenantId;
    
    next();
  } catch (error) {
    console.error('Tenant context error:', error);
    res.status(500).json({ error: 'Failed to load tenant context' });
  }
}

module.exports = tenantContextMiddleware;
```

### Passo 3: Atualizar Rotas

Aplique o middleware nas rotas protegidas:

```javascript
const tenantMiddleware = require('./middleware/tenantMiddleware');

// Rotas que precisam do contexto do tenant
router.use('/properties', authMiddleware, tenantMiddleware, propertiesRouter);
router.use('/clients', authMiddleware, tenantMiddleware, clientsRouter);
router.use('/visits', authMiddleware, tenantMiddleware, visitsRouter);
```

---

## 🖥️ Configuração do Frontend

### Passo 1: Atualizar Auth Service

No `src/services/auth.service.ts`, certifique-se de que o JWT inclui `company_id`:

```typescript
// Após login bem-sucedido
const user = await supabase.auth.getUser();
const { data: userData } = await supabase
  .from('users')
  .select('company_id, role')
  .eq('id', user.id)
  .single();

// Armazene company_id no localStorage ou context
localStorage.setItem('company_id', userData.company_id);
```

### Passo 2: Criar Tenant Interceptor

```typescript
// src/interceptors/tenant.interceptor.ts
export class TenantInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const companyId = localStorage.getItem('company_id');
    
    if (companyId) {
      req = req.clone({
        setHeaders: {
          'X-Tenant-ID': companyId
        }
      });
    }
    
    return next.handle(req);
  }
}
```

### Passo 3: Testar no Frontend

1. Faça login com `admin@imobiliaria.com`
2. Verifique se `company_id` está no localStorage
3. Tente cadastrar um imóvel
4. Verifique se foi criado no banco do tenant correto

---

## ✅ Testes e Validação

### Teste 1: Isolamento de Dados

1. Crie dois tenants diferentes
2. Faça login no tenant 1 e cadastre um imóvel
3. Faça login no tenant 2
4. ✅ Verifique que não vê o imóvel do tenant 1

### Teste 2: Limites de Plano

1. Tenant com plano Prime (100 imóveis)
2. Cadastre 100 imóveis
3. Tente cadastrar o 101º
4. ✅ Deve retornar erro de limite atingido

### Teste 3: Usuários Adicionais

1. Tenant com 2 usuários inclusos
2. Adicione 3º usuário
3. ✅ Deve cobrar R$ 57/mês extra (plano Prime)

---

## 🆘 Troubleshooting

### Erro: "Tenant context required"

**Causa:** JWT não contém `company_id`  
**Solução:** Verifique se o usuário tem `company_id` na tabela `users`

### Erro: "Failed to load tenant context"

**Causa:** Banco do tenant não existe  
**Solução:** Execute o script de provisionamento novamente

### Erro: "Property limit reached"

**Causa:** Tenant atingiu limite de imóveis do plano  
**Solução:** Faça upgrade do plano ou remova imóveis inativos

### Migration não executa

**Causa:** Erro de sintaxe SQL  
**Solução:** Execute linha por linha para identificar o erro

---

## 📚 Próximos Passos

Após completar o setup:

1. ✅ Leia [ARQUITETURA_MULTI_TENANT.md](ARQUITETURA_MULTI_TENANT.md) para entender a fundo
2. ✅ Configure monitoring e backups
3. ✅ Documente processos operacionais
4. ✅ Treine a equipe
5. ✅ Crie segundo tenant para testar isolamento
6. ✅ Configure ambiente de produção

---

**Versão:** 1.0.0  
**Data:** 2026-01-11  
**Autor:** CRM Imobiliário Team
