# ✅ WhatsApp Integration - Setup Checklist

## Status: READY TO USE 🚀

### Frontend Setup (100% ✅)
- ✅ Model criado: `whatsapp-connection.model.ts`
- ✅ Serviço criado: `whatsapp.service.ts` (com todos os 7 endpoints)
- ✅ Componente criado: `whatsapp-settings.component.ts` (UI completa)
- ✅ Rota adicionada: `/whatsapp`
- ✅ Menu lateral atualizado com ícone 💬

### Backend Setup (READY)
Você recebeu do backend:
- ✅ 7 arquivos de código (~1,200 linhas)
- ✅ 9 documentos de documentação (~2,000 linhas)
- ✅ 7 endpoints RESTful configurados
- ✅ 3 tabelas de banco de dados

## 📋 Próximos Passos para Integração Completa

### 1️⃣ Preparar Ambiente Backend

**Local:**
```bash
# Navegar até pasta do backend
cd backend/

# Instalar dependências
npm install

# Criar pasta de sessões
mkdir sessions

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com:
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY  
# - PORT (recomendado: 3001)
```

### 2️⃣ Executar Migrations do Banco

**No Supabase Console:**
1. Ir para SQL Editor
2. Copiar conteúdo do arquivo `WHATSAPP_DATABASE_SETUP.sql`
3. Colar e executar as 3 migrations
4. Verificar se 3 tabelas + 8 índices foram criados

### 3️⃣ Atualizar Configuração do Frontend

**Em `src/environments/environment.ts`:**
```typescript
export const environment = {
  // ... outras configurações
  apiUrl: 'http://localhost:3001/api', // ou URL do seu backend em produção
  supabase: {
    url: 'seu-supabase-url',
    anonKey: 'sua-anon-key'
  }
};
```

**Em `src/environments/environment.prod.ts`:**
```typescript
export const environment = {
  // ... outras configurações
  apiUrl: 'https://seu-backend-producao.com/api',
  supabase: {
    url: 'seu-supabase-url',
    anonKey: 'sua-anon-key'
  }
};
```

### 4️⃣ Iniciar Backend

```bash
# Desenvolvimento com hot-reload
npm run dev

# Produção
npm run build && npm start
```

### 5️⃣ Testar a Integração

**Acessar no Frontend:**
1. Login no CRM
2. Menu lateral → 💬 **WhatsApp** (apenas para admins)
3. Clicar em **"Conectar WhatsApp"**
4. QR code deve aparecer
5. Escanear com celular
6. Status deve mudar para **"Conectado"** com número do telefone

**Testar via API (curl):**

```bash
# 1. Inicializar conexão
curl -X POST http://localhost:3001/api/whatsapp/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "company_id": "uuid-da-empresa",
    "user_id": "uuid-do-usuario"
  }'

# 2. Verificar status (deve mostrar QR code)
curl -X GET http://localhost:3001/api/whatsapp/status \
  -H "Authorization: Bearer SEU_TOKEN"

# 3. Enviar mensagem (depois de conectado)
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "to": "5511999999999",
    "message": "Olá! Teste de integração WhatsApp"
  }'

# 4. Buscar mensagens recebidas
curl -X GET http://localhost:3001/api/whatsapp/messages?limit=20 \
  -H "Authorization: Bearer SEU_TOKEN"

# 5. Buscar conversa específica
curl -X GET http://localhost:3001/api/whatsapp/conversation/5511999999999 \
  -H "Authorization: Bearer SEU_TOKEN"

# 6. Listar clientes criados automaticamente
curl -X GET http://localhost:3001/api/whatsapp/auto-clients \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- QR Code gerado em base64
- Escaneamento automático pelo celular
- Sessão persistente

### ✅ Recebimento de Mensagens
- Listener automático de mensagens
- Armazena em `whatsapp_messages`
- Dispara criação automática de cliente se número não existe

### ✅ Criação Automática de Cliente
- Detecta números novos
- Cria cliente com:
  - Nome: do contato (se disponível)
  - Telefone: número que enviou mensagem
  - Status: `lead`
  - Source: `whatsapp`
  - Nota: data e hora da criação automática

### ✅ Envio de Mensagens
- API para enviar mensagens
- Formata automaticamente número WhatsApp

### ✅ Histórico
- Armazena todas as mensagens
- Permite consultar por limite
- Permite consultar conversa específica

### ✅ Segurança
- Todas as rotas autenticadas com JWT
- Isolamento por empresa
- Validações de entrada

## 📊 Verificar Dados Criados

**Após primeira conexão, você deve ter:**

No Supabase:
```sql
-- Verificar conexões ativas
SELECT * FROM whatsapp_connections WHERE is_connected = true;

-- Verificar mensagens recebidas
SELECT * FROM whatsapp_messages ORDER BY timestamp DESC LIMIT 10;

-- Verificar clientes criados automaticamente
SELECT * FROM whatsapp_auto_clients;

-- Verificar clientes criados via WhatsApp
SELECT * FROM clients WHERE source = 'whatsapp';
```

## 🔧 Troubleshooting

### ❌ QR Code não aparece
- [ ] Verificar se backend está rodando em http://localhost:3001
- [ ] Verificar logs do backend para erros
- [ ] Confirmar que `environment.apiUrl` está correto
- [ ] Verificar token JWT é válido

### ❌ Mensagens não chegam
- [ ] Verificar se WhatsApp está conectado (status deve ser "connected")
- [ ] Confirmar que alguém mandou mensagem para o número do WhatsApp vinculado
- [ ] Verificar logs: `backend/logs/whatsapp.log`
- [ ] Confirmar pasta `backend/sessions` tem permissões de escrita

### ❌ Cliente não criado automaticamente
- [ ] Verificar se `is_connected = true` em `whatsapp_connections`
- [ ] Confirmar que número não existe na tabela `clients`
- [ ] Verificar permissões do backend na tabela `clients`
- [ ] Conferir logs para erro na criação

### ❌ Conexão desconecta após reiniciar servidor
- [ ] Verificar se pasta `backend/sessions` foi preservada
- [ ] Confirmar se `LocalAuth` está configurado corretamente
- [ ] Tentar reconectar escaneando QR code novamente

## 🚀 Deploy em Produção

### Opção 1: VPS Linux
```bash
# Clone o backend
git clone seu-repo backend
cd backend

# Instale dependências
npm install --production

# Configure variáveis
nano .env

# Inicie com PM2
pm2 start npm --name "whatsapp-api" -- start
pm2 save
pm2 startup
```

### Opção 2: Docker
```bash
# Build
docker build -t crm-whatsapp-api .

# Run
docker run -d \
  -p 3001:3001 \
  -e SUPABASE_URL=xxx \
  -e SUPABASE_SERVICE_KEY=xxx \
  -v whatsapp_sessions:/app/sessions \
  --name whatsapp-api \
  crm-whatsapp-api
```

### Opção 3: Railway/Render
1. Conectar repositório do backend
2. Definir variáveis de ambiente
3. Fazer deploy automático

## 📈 Monitoramento

**Adicione logs estruturados:**
```bash
npm install winston
```

**Monitore:**
- Status das conexões ativas
- Quantidade de mensagens por dia
- Clientes criados automaticamente
- Taxa de erros

## ✨ Próximas Melhorias Futuras

- [ ] Webhooks para notificações em tempo real
- [ ] Suporte a grupos
- [ ] Receber e armazenar mídia (fotos, vídeos)
- [ ] Templates de mensagens rápidas
- [ ] Chatbot com respostas automáticas
- [ ] Dashboard de analytics
- [ ] Integração com campanhas
- [ ] Sincronização de mensagens antigas

---

## 📞 Resumo Rápido

| Item | Status | Arquivo |
|------|--------|---------|
| Frontend Service | ✅ | `whatsapp.service.ts` |
| Frontend Component | ✅ | `whatsapp-settings.component.ts` |
| Frontend Model | ✅ | `whatsapp-connection.model.ts` |
| Backend API | ✅ | Pronto do seu backend |
| Database | ⏳ | Executar SQL fornecido |
| Integração | ⏳ | Atualizar `environment.ts` |
| Deploy | ⏳ | Seguir instruções acima |

**Total de Endpoints**: 7
**Tabelas de BD**: 3
**Índices**: 8
**Linhas de Código**: ~2,400

---

🎉 **Tudo pronto! Comece pelo passo 1 acima.**
