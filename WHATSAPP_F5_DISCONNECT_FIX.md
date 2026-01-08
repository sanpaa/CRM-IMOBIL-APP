# 🔧 Fix: WhatsApp Desconecta ao Pressionar F5

## 🐛 Problema Identificado

### Sintomas
- ❌ Ao pressionar F5 (refresh da página), o WhatsApp aparece como **desconectado** no frontend
- ✅ No celular, o WhatsApp continua **conectado normalmente**
- 📡 Backend retorna `status: 'disconnected'` mesmo com sessão ativa

### Logs do Problema
```javascript
📡 Status response: 200
🎯 Status recebido do backend: {status: 'disconnected', is_connected: false, message: 'Not connected. Click "Connect WhatsApp" to start.'}
```

**Mas no celular:** WhatsApp está conectado! ✅

## 🔍 Causa Raiz

### Análise do Código Backend (arquivo: `whatsappClient.ts`)

O problema está no método `getStatus()` do `WhatsAppClientManager`:

```typescript
async getStatus(companyId: string): Promise<any> {
  const instance = this.clients.get(companyId);
  
  if (!instance) {
    // ❌ PROBLEMA AQUI!
    const { data: connection } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (connection?.is_connected) {
      // ❌ ERRO: Chama initializeClient que DESTRÓI a sessão existente!
      await this.initializeClient(companyId, connection.user_id);
      return {
        status: 'connecting',
        is_connected: false
      };
    }

    return {
      status: 'disconnected',
      is_connected: false
    };
  }
  // ... resto do código
}
```

### Por Que Isso Acontece?

1. **Backend reinicia** ou **memória é limpa** → `this.clients.get(companyId)` retorna `null`
2. Backend verifica banco de dados → encontra `is_connected: true`
3. **ERRO:** Backend chama `initializeClient()` que:
   - Destrói o cliente existente (`await this.destroyClient(companyId)`)
   - Cria um novo cliente do zero
   - Gera um **novo QR code**
   - **PERDE a sessão LocalAuth existente!** ❌

### O Que Deveria Acontecer?

1. Backend reinicia ou memória é limpa
2. Backend verifica banco de dados → encontra `is_connected: true`
3. **CORRETO:** Backend deve **RESTAURAR** o cliente da pasta `sessions/` usando LocalAuth
4. Cliente é restaurado automaticamente **SEM** gerar novo QR code
5. Status retorna `connected` com o número de telefone ✅

## ✅ Solução: Restaurar Sessão em Vez de Recriar

### 1. Criar Novo Método: `restoreClient()`

Adicione este método na classe `WhatsAppClientManager` no arquivo `src/utils/whatsappClient.ts`:

```typescript
/**
 * Restaura um cliente WhatsApp de uma sessão LocalAuth existente
 * DIFERENTE de initializeClient: NÃO destrói sessão existente
 */
async restoreClient(companyId: string, userId: string): Promise<void> {
  console.log(`🔄 Tentando restaurar cliente WhatsApp para company: ${companyId}`);
  
  // Não destrói o cliente existente!
  // Apenas cria uma nova instância que vai carregar da pasta sessions/
  
  const clientInstance: WhatsAppClientInstance = {
    client: new Client({
      authStrategy: new LocalAuth({ clientId: companyId }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    }),
    isReady: false,
    companyId,
    userId
  };

  // Evento: Cliente pronto (sem QR code!)
  clientInstance.client.on('ready', async () => {
    console.log(`✅ WhatsApp restaurado com sucesso para company: ${companyId}`);
    clientInstance.isReady = true;

    const info = clientInstance.client.info;
    const phoneNumber = info.wid.user;

    await supabase
      .from('whatsapp_connections')
      .update({
        is_connected: true,
        phone_number: phoneNumber,
        qr_code: null,
        last_connected_at: new Date().toISOString()
      })
      .eq('company_id', companyId);
  });

  // Evento: Falha ao restaurar (sessão corrompida ou expirada)
  clientInstance.client.on('auth_failure', async (msg) => {
    console.error(`❌ Falha ao restaurar sessão para company: ${companyId}`, msg);
    
    // Marca como desconectado no banco
    await supabase
      .from('whatsapp_connections')
      .update({
        is_connected: false,
        qr_code: null
      })
      .eq('company_id', companyId);
    
    await this.destroyClient(companyId);
  });

  // Evento: Cliente desconectado
  clientInstance.client.on('disconnected', async (reason) => {
    console.log(`🔌 WhatsApp desconectado para company: ${companyId}`, reason);
    await supabase
      .from('whatsapp_connections')
      .update({
        is_connected: false,
        qr_code: null
      })
      .eq('company_id', companyId);

    await this.destroyClient(companyId);
  });

  // Evento: Mensagem recebida
  clientInstance.client.on('message', async (message) => {
    await this.handleIncomingMessage(message, companyId);
  });

  this.clients.set(companyId, clientInstance);
  
  // Inicializa (vai carregar da pasta sessions/ automaticamente)
  await clientInstance.client.initialize();
  
  console.log(`🔄 Cliente WhatsApp em processo de restauração para company: ${companyId}`);
}
```

### 2. Atualizar Método `getStatus()`

Modifique o método `getStatus()` para usar `restoreClient()` em vez de `initializeClient()`:

```typescript
async getStatus(companyId: string): Promise<any> {
  const instance = this.clients.get(companyId);
  
  if (!instance) {
    // Busca do banco de dados
    const { data: connection } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (connection?.is_connected) {
      // ✅ CORREÇÃO: Usa restoreClient em vez de initializeClient
      console.log(`🔄 Sessão encontrada no banco. Restaurando cliente para company: ${companyId}`);
      
      // Inicia restauração em background (não espera)
      this.restoreClient(companyId, connection.user_id).catch(err => {
        console.error(`❌ Erro ao restaurar cliente: ${err.message}`);
      });
      
      // Retorna informação do banco enquanto restaura
      return {
        status: 'connecting',
        is_connected: false,
        phone_number: connection.phone_number,
        message: 'Restaurando sessão WhatsApp...'
      };
    }

    return {
      status: 'disconnected',
      is_connected: false,
      message: 'Not connected. Click "Connect WhatsApp" to start.'
    };
  }

  if (instance.isReady) {
    return {
      status: 'connected',
      is_connected: true,
      phone_number: instance.client.info?.wid.user
    };
  }

  if (instance.qrCode) {
    return {
      status: 'qr_ready',
      is_connected: false,
      qr_code: instance.qrCode
    };
  }

  return {
    status: 'connecting',
    is_connected: false,
    message: 'Connecting to WhatsApp...'
  };
}
```

### 3. Adicionar Restauração Automática no Startup

Adicione este método para restaurar todas as sessões ativas quando o backend iniciar:

```typescript
/**
 * Restaura todas as conexões ativas ao iniciar o servidor
 * Chame este método no startup do backend (index.ts)
 */
async restoreAllActiveSessions(): Promise<void> {
  console.log('🔄 Verificando sessões WhatsApp ativas no banco de dados...');
  
  const { data: activeConnections, error } = await supabase
    .from('whatsapp_connections')
    .select('company_id, user_id, phone_number')
    .eq('is_connected', true);
  
  if (error) {
    console.error('❌ Erro ao buscar conexões ativas:', error);
    return;
  }
  
  if (!activeConnections || activeConnections.length === 0) {
    console.log('ℹ️ Nenhuma sessão WhatsApp ativa encontrada');
    return;
  }
  
  console.log(`📱 Encontradas ${activeConnections.length} sessão(ões) ativa(s). Restaurando...`);
  
  for (const connection of activeConnections) {
    try {
      await this.restoreClient(connection.company_id, connection.user_id);
      console.log(`✅ Sessão restaurada: ${connection.phone_number || connection.company_id}`);
    } catch (error) {
      console.error(`❌ Erro ao restaurar sessão ${connection.company_id}:`, error);
    }
  }
}
```

### 4. Chamar no Startup do Backend

No arquivo `src/index.ts`, adicione a restauração automática:

```typescript
import { whatsappClientManager } from './utils/whatsappClient';

// ... depois de configurar Express e rotas ...

app.listen(port, async () => {
  console.log(`🚀 Server running on port ${port}`);
  
  // ✅ Restaura todas as sessões ativas
  try {
    await whatsappClientManager.restoreAllActiveSessions();
  } catch (error) {
    console.error('❌ Erro ao restaurar sessões WhatsApp:', error);
  }
});
```

## 🧪 Como Testar a Correção

### Teste 1: Refresh da Página (F5)

1. ✅ Conecte o WhatsApp normalmente (escanear QR code)
2. ✅ Verifique que status mostra "Conectado"
3. ✅ Pressione F5 (refresh)
4. ✅ Status deve continuar "Conectado" (ou mostrar "Restaurando..." por alguns segundos)
5. ❌ **NÃO** deve pedir novo QR code

### Teste 2: Reiniciar Backend

1. ✅ Conecte o WhatsApp normalmente
2. ✅ Pare o servidor backend (`Ctrl+C`)
3. ✅ Inicie o servidor novamente (`npm run dev`)
4. ✅ No console do backend, deve aparecer:
   ```
   🔄 Verificando sessões WhatsApp ativas no banco de dados...
   📱 Encontradas 1 sessão(ões) ativa(s). Restaurando...
   ✅ WhatsApp restaurado com sucesso para company: xxx
   ```
5. ✅ Acesse o frontend → Status deve mostrar "Conectado"
6. ❌ **NÃO** deve pedir novo QR code

### Teste 3: Sessão Expirada

1. ✅ Desconecte o WhatsApp pelo celular (remover aparelho conectado)
2. ✅ Pressione F5 no frontend
3. ✅ Backend deve detectar `auth_failure`
4. ✅ Status deve mudar para "Desconectado"
5. ✅ Usuário pode clicar em "Conectar WhatsApp" para gerar novo QR code

## 📊 Fluxo Correto (Após Fix)

### Cenário: Usuário Pressiona F5

```
Frontend: Pressiona F5
    ↓
Frontend: Recarrega e chama /api/whatsapp/status
    ↓
Backend: Verifica this.clients.get(companyId) → null (memória limpa no frontend)
    ↓
Backend: Consulta banco de dados
    ↓
Backend: Encontra is_connected: true
    ↓
Backend: Chama restoreClient() ✅ (não initializeClient)
    ↓
Backend: LocalAuth carrega sessão da pasta sessions/company_id/
    ↓
Backend: Evento 'ready' dispara
    ↓
Backend: Status atualizado para 'connected'
    ↓
Frontend: Recebe status 'connected'
    ↓
Frontend: Mostra "✅ WhatsApp Conectado" ✅
```

### Cenário: Backend Reinicia

```
Backend: Servidor inicia
    ↓
Backend: Chama restoreAllActiveSessions()
    ↓
Backend: Consulta whatsapp_connections WHERE is_connected = true
    ↓
Backend: Para cada conexão ativa:
    ↓
Backend: Chama restoreClient(company_id, user_id)
    ↓
Backend: LocalAuth carrega sessão da pasta sessions/
    ↓
Backend: Evento 'ready' dispara
    ↓
Backend: Cliente em memória e pronto
    ↓
Frontend: Chama /api/whatsapp/status
    ↓
Frontend: Recebe status 'connected'
    ↓
Frontend: Mostra "✅ WhatsApp Conectado" ✅
```

## 📝 Resumo das Mudanças

### Arquivos Modificados (Backend)

1. **`src/utils/whatsappClient.ts`**
   - ✅ Adicionar método `restoreClient()`
   - ✅ Adicionar método `restoreAllActiveSessions()`
   - ✅ Modificar método `getStatus()` para usar `restoreClient()` em vez de `initializeClient()`

2. **`src/index.ts`**
   - ✅ Adicionar chamada para `restoreAllActiveSessions()` no startup

### Diferença Entre `initializeClient()` e `restoreClient()`

| Método | Quando Usar | Comportamento |
|--------|-------------|---------------|
| `initializeClient()` | Primeira conexão ou reconexão manual | Destrói sessão existente, gera novo QR code |
| `restoreClient()` | Backend reinicia ou F5 no frontend | Carrega sessão da pasta `sessions/`, **SEM** QR code |

## ⚠️ Importante: LocalAuth

A correção funciona porque `whatsapp-web.js` com `LocalAuth` salva a sessão em:

```
backend/
  sessions/
    {company_id}/
      Default/
        ... (arquivos da sessão WhatsApp)
```

**Requisitos:**
- ✅ Pasta `sessions/` deve ter permissões de escrita
- ✅ Pasta `sessions/` **NÃO** deve ser limpa ao reiniciar
- ✅ Em produção, `sessions/` deve estar em volume persistente (não efêmero)

## 🚀 Deploy em Produção

### Render.com / Railway / Fly.io

Adicione volume persistente para a pasta `sessions/`:

```yaml
# render.yaml
services:
  - type: web
    name: crm-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    disk:
      name: whatsapp-sessions
      mountPath: /app/sessions
      sizeGB: 1
```

### Docker

```dockerfile
# Dockerfile
FROM node:18

WORKDIR /app

# ... comandos de build ...

# Cria pasta sessions e define permissões
RUN mkdir -p /app/sessions && chmod 777 /app/sessions

# Volume para persistência
VOLUME /app/sessions

CMD ["npm", "start"]
```

## 🎉 Resultado Esperado

Após implementar esta correção:

- ✅ Pressionar F5 **NÃO** desconecta mais o WhatsApp
- ✅ Reiniciar backend restaura todas as sessões automaticamente
- ✅ Usuários não precisam escanear QR code repetidamente
- ✅ Melhor experiência do usuário
- ✅ Sistema mais robusto e confiável

## 🆘 Troubleshooting

### Problema: Ainda desconecta após fix

**Verifique:**
1. Backend está usando a versão corrigida do código
2. Pasta `sessions/` existe e tem permissões corretas
3. Console do backend mostra logs de restauração
4. Banco de dados tem `is_connected: true` para a empresa

### Problema: Erro "auth_failure" ao restaurar

**Possíveis causas:**
1. Sessão expirou (usuário desconectou pelo celular)
2. Arquivos da sessão corrompidos
3. WhatsApp Web bloqueou a sessão

**Solução:**
- Deletar pasta `sessions/{company_id}/`
- Reconectar manualmente (novo QR code)

### Problema: Backend não inicia restauração no startup

**Verifique:**
1. `restoreAllActiveSessions()` está sendo chamado no `app.listen()`
2. Variáveis de ambiente do Supabase estão corretas
3. Console mostra logs de startup

---

**Criado em:** 2026-01-08  
**Autor:** GitHub Copilot Agent  
**Versão:** 1.0
