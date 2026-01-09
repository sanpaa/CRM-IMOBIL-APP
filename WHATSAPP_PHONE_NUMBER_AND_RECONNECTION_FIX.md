# 🔧 Fix: WhatsApp phone_number undefined e Reconexões Frequentes

## 📋 Problemas Identificados

### Problema 1: `phone_number: undefined` no Status
**Sintoma:** O frontend recebe `phone_number: undefined` mesmo quando o WhatsApp está conectado com sucesso.

**Evidência nos Logs:**
```
[WhatsApp] ✅ Connected successfully! Phone: 5511943299160
[WhatsAppService] Status: { status: 'connected', is_connected: true, phone_number: undefined }
```

### Problema 2: Reconexões Frequentes (Keepalive)
**Sintoma:** O WhatsApp se desconecta frequentemente devido a problemas de keepalive e tenta reconectar automaticamente.

**Evidência nos Logs:**
```
[WhatsApp] ⚠️ Keepalive: Socket appears disconnected for 3b1bee0c-cbee-4de1-88f1-d6e890f4c995. Closing gracefully.
[WhatsApp] 🔄 Connection update for 3b1bee0c-cbee-4de1-88f1-d6e890f4c995: {
  connection: 'close',
  hasQR: false,
  isOnline: undefined,
  statusCode: undefined
}
[WhatsApp] ⚠️ Disconnected (reason: unknown, code: undefined)
[WhatsApp] 🔄 Transient disconnect detected. Auto-reconnecting in 5s... (attempt 1/2)
```

---

## 🔍 Análise da Causa Raiz

### Problema 1: phone_number undefined

**Causa Provável:**
O backend está conectando com sucesso e tem acesso ao número do telefone (`5511943299160`), mas quando retorna o status para o frontend, o campo `phone_number` não está sendo incluído no objeto de resposta.

**Possíveis Causas:**
1. O método `getStatus()` no backend não está incluindo `phone_number` no objeto de retorno
2. O campo `phone_number` no banco de dados não está sendo atualizado corretamente após a conexão
3. O cliente Baileys está retornando `phone_number` com uma estrutura diferente (ex: `client.info.wid.user` vs `client.user.id`)

### Problema 2: Reconexões Frequentes

**Causa Provável:**
O Baileys está detectando que o socket WebSocket parece estar desconectado (keepalive timeout) e fecha a conexão preventivamente. Isso pode acontecer por:

1. **Keepalive timeout muito agressivo**: O tempo de timeout está muito curto
2. **Problemas de rede**: Latência ou perda de pacotes
3. **Servidor ocupado**: O servidor não está respondendo aos pings do keepalive a tempo
4. **Configuração incorreta do Baileys**: Parâmetros de conexão podem estar inadequados

---

## ✅ Soluções Recomendadas

### Solução 1: Fix phone_number undefined

#### Passo 1: Verificar Atualização no Banco de Dados
No backend, quando o WhatsApp conecta com sucesso, certifique-se de que o `phone_number` está sendo salvo no banco de dados:

```javascript
// No evento 'open' do Baileys (quando conecta com sucesso)
sock.ev.on('connection.update', async (update) => {
  const { connection, lastDisconnect } = update;
  
  if (connection === 'open') {
    // Obter o número de telefone do usuário autenticado
    const phoneNumber = sock.user?.id?.split(':')[0] || sock.authState?.creds?.me?.id?.split(':')[0];
    
    console.log('[WhatsApp] ✅ Connected successfully! Phone:', phoneNumber);
    
    // IMPORTANTE: Atualizar no banco de dados
    await supabase
      .from('whatsapp_connections')
      .update({
        is_connected: true,
        phone_number: phoneNumber,  // ← Certifique-se de que este campo está sendo salvo
        qr_code: null,
        last_connected_at: new Date().toISOString()
      })
      .eq('company_id', companyId);
  }
});
```

#### Passo 2: Incluir phone_number no getStatus()
No método `getStatus()` do backend, certifique-se de que o `phone_number` está sendo retornado:

```javascript
async getStatus(companyId: string): Promise<any> {
  const instance = this.clients.get(companyId);
  
  if (instance && instance.isReady) {
    // Obter phone_number do cliente conectado
    const phoneNumber = instance.client.user?.id?.split(':')[0] || 
                       instance.client.authState?.creds?.me?.id?.split(':')[0];
    
    // Buscar do banco de dados como fallback
    const { data: connection } = await supabase
      .from('whatsapp_connections')
      .select('phone_number')
      .eq('company_id', companyId)
      .single();
    
    return {
      status: 'connected',
      is_connected: true,
      phone_number: phoneNumber || connection?.phone_number,  // ← Garantir que retorna o phone_number
      message: 'WhatsApp connected successfully'
    };
  }
  
  // Se não está em memória, buscar do banco
  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('*')
    .eq('company_id', companyId)
    .single();
  
  if (connection?.is_connected) {
    return {
      status: 'connecting',
      is_connected: false,
      phone_number: connection.phone_number,  // ← Incluir phone_number mesmo quando está restaurando
      message: 'Restoring connection from saved session...'
    };
  }
  
  return {
    status: 'disconnected',
    is_connected: false,
    phone_number: null
  };
}
```

#### Passo 3: Verificar Estrutura do Baileys
Se você está usando Baileys, o número de telefone pode estar em diferentes locais dependendo da versão:

```javascript
// Baileys versões mais recentes
const phoneNumber = sock.user?.id?.split(':')[0];

// Ou
const phoneNumber = sock.authState?.creds?.me?.id?.split(':')[0];

// Ou ainda (algumas versões)
const phoneNumber = sock.user?.phone || sock.user?.number;

// Método mais robusto que tenta todas as opções
function getPhoneNumber(sock) {
  return sock.user?.id?.split(':')[0] || 
         sock.authState?.creds?.me?.id?.split(':')[0] ||
         sock.user?.phone ||
         sock.user?.number ||
         null;
}
```

---

### Solução 2: Fix Reconexões Frequentes (Keepalive)

#### Opção A: Aumentar Timeout do Keepalive
No backend, ao criar o socket Baileys, ajuste as configurações de keepalive:

```javascript
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';

async function createBaileysSocket(companyId: string) {
  const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${companyId}`);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    
    // ✅ CONFIGURAÇÕES DE KEEPALIVE E CONEXÃO
    keepAliveIntervalMs: 30000,           // Aumentar para 30 segundos (padrão: 25s)
    connectTimeoutMs: 60000,              // Timeout de conexão: 60 segundos
    defaultQueryTimeoutMs: 60000,         // Timeout de queries: 60 segundos
    
    // ✅ CONFIGURAÇÕES DE RECONEXÃO
    retryRequestDelayMs: 250,             // Delay entre retries
    maxMsgRetryCount: 5,                  // Número máximo de retries
    
    // ✅ CONFIGURAÇÕES DE SOCKET
    socketTimeoutMs: 60000,               // Timeout do socket: 60 segundos
    
    // ✅ LOG LEVEL para debug (remover em produção)
    logger: pino({ level: 'silent' }),    // ou 'debug' para ver logs detalhados
  });
  
  return sock;
}
```

#### Opção B: Implementar Reconexão Inteligente
Em vez de fechar e reconectar imediatamente, implemente uma estratégia mais inteligente:

```javascript
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 5000;

sock.ev.on('connection.update', async (update) => {
  const { connection, lastDisconnect } = update;
  
  if (connection === 'close') {
    const shouldReconnect = 
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
    
    console.log('[WhatsApp] Connection closed. Should reconnect?', shouldReconnect);
    
    if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`[WhatsApp] 🔄 Reconnecting... Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
      
      // Esperar antes de reconectar (backoff exponencial)
      await new Promise(resolve => 
        setTimeout(resolve, RECONNECT_DELAY_MS * reconnectAttempts)
      );
      
      // Reconectar
      await restoreClient(companyId, userId);
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[WhatsApp] ❌ Max reconnection attempts reached. Manual reconnection required.');
      
      // Atualizar banco de dados
      await supabase
        .from('whatsapp_connections')
        .update({
          is_connected: false,
          qr_code: null
        })
        .eq('company_id', companyId);
      
      // Limpar cliente da memória
      await destroyClient(companyId);
    }
  } else if (connection === 'open') {
    // Reset contador de tentativas quando conectar com sucesso
    reconnectAttempts = 0;
    console.log('[WhatsApp] ✅ Connection established. Reconnect attempts reset.');
  }
});
```

#### Opção C: Desabilitar Keepalive Automático (Não Recomendado)
Se os problemas persistirem, você pode tentar desabilitar o keepalive automático, mas isso pode causar outros problemas:

```javascript
const sock = makeWASocket({
  // ... outras configurações
  
  // ⚠️ Desabilitar keepalive (não recomendado)
  emitOwnEvents: false,
  fireInitQueries: false,
  
  // Ou tentar aumentar significativamente o intervalo
  keepAliveIntervalMs: 120000,  // 2 minutos
});
```

---

## 📋 Checklist de Implementação

### Problema 1: phone_number undefined
- [ ] Verificar que `phone_number` está sendo salvo no banco quando conecta
- [ ] Adicionar log para verificar o valor de `phoneNumber` no evento 'open'
- [ ] Modificar `getStatus()` para incluir `phone_number` em todos os cenários
- [ ] Testar função `getPhoneNumber()` robusta que tenta múltiplas fontes
- [ ] Validar que o frontend recebe `phone_number` corretamente

### Problema 2: Reconexões Frequentes
- [ ] Aumentar `keepAliveIntervalMs` para 30000ms (30 segundos)
- [ ] Aumentar `connectTimeoutMs` para 60000ms (60 segundos)
- [ ] Implementar backoff exponencial nas reconexões
- [ ] Limitar número máximo de tentativas de reconexão
- [ ] Adicionar logs detalhados para diagnosticar causas de disconnect
- [ ] Monitorar logs para verificar se as desconexões diminuíram

---

## 🧪 Como Testar

### Teste 1: phone_number Definido
1. Conectar WhatsApp escaneando QR code
2. Após conectar, verificar logs do backend: `Connected successfully! Phone: XXXXX`
3. No frontend, abrir Console do navegador
4. Verificar que o status mostra: `phone_number: "5511943299160"` (não undefined)
5. Pressionar F5 e verificar que o phone_number continua aparecendo

**Esperado:** ✅ `phone_number` deve estar sempre preenchido quando conectado

### Teste 2: Menos Reconexões
1. Conectar WhatsApp
2. Deixar conectado por 30 minutos
3. Observar logs do backend
4. Contar quantas vezes aparece "Keepalive: Socket appears disconnected"

**Antes do Fix:** ❌ Múltiplas desconexões em 30 minutos
**Após o Fix:** ✅ Zero ou muito poucas desconexões em 30 minutos

### Teste 3: Reconexão Inteligente
1. Conectar WhatsApp
2. Simular perda de rede (desconectar Wi-Fi por 10 segundos)
3. Reconectar Wi-Fi
4. Observar logs: deve tentar reconectar automaticamente
5. Verificar que reconecta sem precisar escanear QR code novamente

**Esperado:** ✅ Reconexão automática após perda temporária de rede

---

## 📝 Logs de Debug Úteis

Adicione estes logs no backend para facilitar o diagnóstico:

```javascript
// No evento 'connection.update'
sock.ev.on('connection.update', (update) => {
  console.log('[WhatsApp] 🔄 Connection update:', {
    connection: update.connection,
    hasQR: !!update.qr,
    isOnline: update.isOnline,
    statusCode: update.lastDisconnect?.error?.output?.statusCode,
    error: update.lastDisconnect?.error?.message
  });
});

// No getStatus()
async getStatus(companyId: string) {
  console.log('[WhatsAppService] Getting status for company:', companyId);
  
  const instance = this.clients.get(companyId);
  console.log('[WhatsAppService] Instance in memory?', !!instance);
  
  if (instance) {
    const phoneNumber = getPhoneNumber(instance.client);
    console.log('[WhatsAppService] Phone number from client:', phoneNumber);
  }
  
  // ... resto do código
}
```

---

## 📊 Arquivos Afetados (Backend)

Assumindo estrutura típica do backend:

```
backend/
├── src/
│   ├── services/
│   │   └── whatsappService.ts        ← Adicionar getPhoneNumber() robusto
│   ├── utils/
│   │   └── whatsappClient.ts         ← Modificar configurações Baileys
│   ├── controllers/
│   │   └── whatsappController.ts     ← Verificar getStatus() retorna phone_number
│   └── routes/
│       └── whatsapp.routes.ts        ← (sem alterações)
```

---

## 🆘 Troubleshooting

### phone_number Continua undefined
**Possíveis Causas:**
1. Versão do Baileys usa estrutura diferente para user info
2. Campo `phone_number` no banco tem tipo incompatível
3. getStatus() não está retornando o campo do banco corretamente

**Solução:**
- Adicionar logs em TODOS os pontos onde `phone_number` é acessado
- Verificar estrutura exata do objeto `sock.user` no seu Baileys
- Fazer query direto no Supabase para ver se o campo está sendo salvo

### Reconexões Continuam Frequentes
**Possíveis Causas:**
1. Problema de rede/firewall bloqueando WebSocket
2. Servidor com recursos limitados (CPU/RAM)
3. Versão do Baileys com bugs de conexão

**Solução:**
- Atualizar Baileys para versão mais recente: `npm update @whiskeysockets/baileys`
- Verificar recursos do servidor: `top` / `htop`
- Verificar logs de rede: existem timeouts ou RST packets?
- Considerar usar proxy/tunnel como ngrok para debug

---

## 📞 Próximos Passos

1. **Implementar fixes no backend** (conforme documentado acima)
2. **Testar em ambiente de desenvolvimento**
3. **Monitorar logs por 24-48 horas**
4. **Ajustar timeouts se necessário**
5. **Deploy em produção**
6. **Continuar monitorando métricas de conexão**

---

**Criado em:** 2026-01-09
**Versão:** 1.0
**Status:** Aguardando Implementação no Backend
