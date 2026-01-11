# 🏗️ Arquitetura Multi-Tenant - CRM Imobiliário

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Conceitos Fundamentais](#conceitos-fundamentais)
3. [Arquitetura de Dois Bancos de Dados](#arquitetura-de-dois-bancos-de-dados)
4. [Planos de Assinatura](#planos-de-assinatura)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [Isolamento de Dados](#isolamento-de-dados)
7. [Implementação Técnica](#implementação-técnica)
8. [Provisionamento de Novos Tenants](#provisionamento-de-novos-tenants)
9. [Segurança](#segurança)
10. [Escalabilidade](#escalabilidade)

---

## 🎯 Visão Geral

O CRM Imobiliário utiliza uma **arquitetura multi-tenant com separação de bancos de dados**, onde cada cliente (imobiliária) possui seu próprio banco de dados isolado para dados de negócio, enquanto compartilha um banco de dados central para autenticação e configurações gerais.

### Por que Multi-Tenant?

- **Isolamento Total**: Cada cliente tem seus dados completamente isolados
- **Segurança**: Zero possibilidade de vazamento de dados entre clientes
- **Escalabilidade**: Bancos menores e mais performáticos
- **Flexibilidade**: Possibilidade de migrar clientes grandes para servidores dedicados
- **Backup Independente**: Cada cliente pode ter política de backup personalizada

### Por que Dois Bancos de Dados?

#### 🗄️ Banco Central (Compartilhado)
- **Propósito**: Autenticação, roteamento e configurações globais
- **Dados armazenados**:
  - Usuários e credenciais
  - Informações das empresas/tenants
  - Planos de assinatura
  - Mapeamento de domínios
  - Logs de auditoria global
  - Configurações de tenant

#### 🗄️ Banco do Tenant (Individual por Cliente)
- **Propósito**: Dados de negócio específicos de cada imobiliária
- **Dados armazenados**:
  - Imóveis (properties)
  - Clientes (clients)
  - Visitas (visits)
  - Configurações da loja (store_settings)
  - Mensagens WhatsApp
  - Documentos e anexos
  - Histórico de atividades

---

## 📚 Conceitos Fundamentais

### O que é Multi-Tenant?

**Multi-tenant** (multi-inquilino) é uma arquitetura onde uma única instância de software serve múltiplos clientes (tenants), mantendo dados isolados entre eles.

**Exemplo prático:**
- Tenant 1: Imobiliária ABC
- Tenant 2: Imobiliária XYZ
- Tenant 3: Imobiliária 123

Cada uma usa o mesmo sistema, mas vê apenas seus próprios dados.

### Estratégias de Multi-Tenancy

#### 1️⃣ Banco Único com tenant_id (Não recomendado para este caso)
```
┌─────────────────────────────────┐
│     Database Único              │
├─────────────────────────────────┤
│ properties                      │
│  - id                           │
│  - tenant_id ← Filtro           │
│  - title                        │
│  - ...                          │
└─────────────────────────────────┘
```
**Desvantagens:**
- Risco de vazamento de dados por erro de código
- Performance degrada com volume
- Backup/restore afeta todos os clientes

#### 2️⃣ Schema por Tenant (PostgreSQL schemas)
```
┌─────────────────────────────────┐
│     Database Único              │
├─────────────────────────────────┤
│ Schema: tenant_abc              │
│   - properties                  │
│   - clients                     │
│                                 │
│ Schema: tenant_xyz              │
│   - properties                  │
│   - clients                     │
└─────────────────────────────────┘
```
**Desvantagens:**
- Limite de schemas por database
- Migrations mais complexas
- Backup individual mais difícil

#### 3️⃣ Database por Tenant (✅ Escolhido)
```
┌─────────────────────┐     ┌─────────────────────┐
│  Central Database   │     │  tenant_abc_db      │
│  - users            │     │  - properties       │
│  - companies        │     │  - clients          │
│  - subscriptions    │     │  - visits           │
└─────────────────────┘     └─────────────────────┘
                            ┌─────────────────────┐
                            │  tenant_xyz_db      │
                            │  - properties       │
                            │  - clients          │
                            │  - visits           │
                            └─────────────────────┘
```
**Vantagens:**
- ✅ Isolamento completo
- ✅ Escalabilidade infinita
- ✅ Backup/restore independente
- ✅ Performance previsível
- ✅ Fácil migração para servidor dedicado

---

## 🏗️ Arquitetura de Dois Bancos de Dados

### Diagrama Geral

O sistema opera com dois tipos de bancos de dados com propósitos distintos:

**BANCO CENTRAL** → Gerencia autenticação, empresas, planos
**BANCOS TENANT** → Armazenam dados de negócio de cada imobiliária

### Fluxo de Requisição

1. Usuário acessa https://imobiliaria-abc.com
2. Frontend envia requisição para API
3. API consulta BANCO CENTRAL para identificar tenant
4. API valida autenticação no BANCO CENTRAL
5. API conecta ao BANCO DO TENANT específico
6. API retorna dados filtrados para o frontend

---

## 💰 Planos de Assinatura

### Tabela Comparativa

| Característica | Prime | K | K2 |
|----------------|-------|---|----|
| **Preço Mensal** | R$ 247 | R$ 397 | R$ 597 |
| **Usuários Inclusos** | 2 | 5 | 12 |
| **Limite de Imóveis** | 100 | 500 | Ilimitado |
| **Taxa de Ativação** | R$ 197 | R$ 197 | Grátis |

Para detalhes completos, consulte [PLANOS_E_PRECOS.md](PLANOS_E_PRECOS.md).

---

## 🔄 Fluxo de Dados

### 1. Criação de Nova Imobiliária (Tenant)

O processo de criação de um novo tenant envolve várias etapas:

1. Cliente se cadastra no sistema
2. Sistema cria registro no BANCO CENTRAL
3. Sistema provisiona novo banco de dados
4. Sistema executa migrations no novo banco
5. Sistema cria usuário admin no BANCO CENTRAL
6. Sistema atribui plano padrão
7. Cliente pronto para usar o sistema!

### 2. Usuário Cadastra um Imóvel

1. Frontend envia POST /properties
2. API valida token JWT
3. API busca informações da company no banco central
4. API verifica limites do plano
5. API conecta ao banco do tenant
6. API insere o imóvel
7. API retorna sucesso para o frontend

---

## 🔒 Isolamento de Dados

### Camadas de Segurança

#### Nível 1: Autenticação
Middleware verifica JWT token

#### Nível 2: Identificação do Tenant
Extrai company_id do usuário autenticado

#### Nível 3: Conexão ao Banco Correto
Conecta ao banco específico do tenant

#### Nível 4: Queries Isoladas
Todas as queries são executadas no banco isolado

### Garantias de Isolamento

1. **Impossível Cross-Tenant por Erro de Código** - Dados fisicamente separados
2. **Backup e Restore Independentes** - Políticas personalizadas
3. **Performance Isolada** - Queries não competem
4. **Compliance e Regulamentação** - LGPD/GDPR facilitado

---

## ⚙️ Implementação Técnica

### Estrutura de Conexões

```javascript
// ConnectionManager gerencia conexões aos bancos
class DatabaseConnectionManager {
  constructor() {
    this.centralDB = null;
    this.tenantConnections = new Map();
  }

  getCentralConnection() {
    // Retorna conexão única ao banco central
  }

  async getTenantConnection(tenantId) {
    // Retorna conexão cacheada ao banco do tenant
  }
}
```

### Middleware de Tenant

```javascript
// Injeta contexto do tenant em cada requisição
async function tenantContextMiddleware(req, res, next) {
  const tenantId = req.user?.company_id;
  const tenantDB = await connectionManager.getTenantConnection(tenantId);
  req.tenantDB = tenantDB;
  req.tenantId = tenantId;
  next();
}
```

### Repository Pattern

```javascript
// Repositories usam o banco do tenant injetado
class SupabasePropertyRepository {
  constructor(tenantDB) {
    this.db = tenantDB;
  }

  async findAll(filters = {}) {
    const { data } = await this.db
      .from('properties')
      .select('*');
    return data;
  }
}
```

---

## 🚀 Provisionamento de Novos Tenants

### Script de Provisionamento

O script `scripts/provision-tenant.js` automatiza:

1. Conecta ao banco central
2. Cria registro da empresa
3. Busca plano de assinatura
4. Cria assinatura para o tenant
5. Provisiona banco de dados do tenant
6. Executa migrations no banco do tenant
7. Cria usuário admin
8. Insere dados iniciais

**Uso:**
```bash
node scripts/provision-tenant.js \
  --name "Imobiliária ABC" \
  --email "contato@abc.com" \
  --admin-email "admin@abc.com" \
  --plan "prime"
```

---

## 🔐 Segurança

### 1. Autenticação e Autorização

JWT contém informações do tenant:
- user_id
- email
- **company_id** (Tenant ID)
- role

### 2. Validação de Acesso ao Tenant

Middleware verifica se usuário pertence ao tenant solicitado.

### 3. Limites de Plano

Middleware verifica limites antes de criar recursos.

### 4. Auditoria

Registra todas as ações importantes no `tenant_audit_log`.

---

## 📈 Escalabilidade

### Estratégias de Crescimento

#### 1. Distribuição de Tenants

Tenants podem ser distribuídos entre múltiplos servidores de banco de dados.

#### 2. Migração para Servidor Dedicado

Clientes grandes podem ser migrados para servidores dedicados:

1. Backup do banco atual
2. Criar banco no novo servidor
3. Restaurar backup
4. Atualizar configuração no banco central
5. Validar migração
6. Remover banco antigo

#### 3. Load Balancing de Queries

Distribuir queries de leitura entre réplicas usando round-robin.

---

## 📝 Resumo

### ✅ Vantagens da Arquitetura

1. Isolamento Total
2. Segurança Máxima
3. Performance Previsível
4. Escalabilidade Infinita
5. Flexibilidade de Crescimento
6. Backup Independente
7. Compliance Facilitado

### ⚠️ Considerações

1. Complexidade de gerenciar múltiplas conexões
2. Migrations precisam rodar em todos os bancos
3. Custo pode variar por banco
4. Necessário monitoring robusto

### 🎯 Casos de Uso Ideais

- ✅ SaaS B2B com clientes grandes
- ✅ Requisitos rígidos de isolamento
- ✅ Clientes em regiões diferentes
- ✅ Backup/restore independente
- ✅ Compliance com LGPD/GDPR

---

## 📚 Próximos Passos

1. ✅ Entender a arquitetura proposta
2. Executar migration do banco central
3. Implementar ConnectionManager
4. Implementar script de provisionamento
5. Atualizar repositories para usar tenantDB
6. Testar criação de novo tenant
7. Testar isolamento de dados
8. Documentar processo de onboarding
9. Configurar monitoring

---

**Versão:** 1.0.0  
**Data:** 2026-01-11  
**Autor:** CRM Imobiliário Team
