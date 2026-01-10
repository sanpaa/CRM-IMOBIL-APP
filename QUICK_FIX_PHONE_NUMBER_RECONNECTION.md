# 🚀 Quick Fix Guide - WhatsApp phone_number undefined e Reconexões

## ⚡ Problema Rápido

Você está vendo estes logs:
```
✅ Connected successfully! Phone: 5511943299160
❌ Status: { ..., phone_number: undefined }
⚠️ Keepalive: Socket appears disconnected
```

## 🎯 Solução Rápida (2 Minutos)

### Fix 1: phone_number undefined

**No backend, arquivo com configuração do Baileys:**

```javascript
// Quando o WhatsApp conecta (evento 'connection.update' ou 'open')
sock.ev.on('connection.update', async (update) => {
  if (update.connection === 'open') {
    // 1. OBTER O NÚMERO CORRETAMENTE
    const phoneNumber = sock.user?.id?.split(':')[0] || 
                       sock.authState?.creds?.me?.id?.split(':')[0];
    
    console.log('✅ Connected! Phone:', phoneNumber);
    
    // 2. SALVAR NO BANCO (IMPORTANTE!)
    await supabase
      .from('whatsapp_connections')
      .update({
        is_connected: true,
        phone_number: phoneNumber,  // ← Esta linha resolve o problema
        last_connected_at: new Date().toISOString()
      })
      .eq('company_id', companyId);
  }
});
```

**No método getStatus():**

```javascript
async getStatus(companyId) {
  const instance = this.clients.get(companyId);
  
  if (instance?.isReady) {
    // 3. INCLUIR phone_number NA RESPOSTA
    const phoneNumber = instance.client.user?.id?.split(':')[0];
    
    return {
      status: 'connected',
      is_connected: true,
      phone_number: phoneNumber,  // ← Sempre incluir este campo
    };
  }
  
  // 4. INCLUIR phone_number MESMO QUANDO ESTÁ RESTAURANDO
  const { data } = await supabase
    .from('whatsapp_connections')
    .select('phone_number')
    .eq('company_id', companyId)
    .single();
  
  return {
    status: 'connecting',
    is_connected: false,
    phone_number: data?.phone_number,  // ← Do banco de dados
  };
}
```

---

### Fix 2: Reconexões Frequentes (Keepalive)

**No backend, ao criar o socket Baileys:**

```javascript
import makeWASocket from '@whiskeysockets/baileys';

const sock = makeWASocket({
  auth: state,
  
  // ✅ APENAS ADICIONE ESTAS 3 LINHAS
  keepAliveIntervalMs: 30000,      // 30s em vez de 25s (padrão)
  connectTimeoutMs: 60000,         // 60s timeout
  socketTimeoutMs: 60000,          // 60s socket timeout
  
  // ... resto da config
});
```

**Resultado:**
- ✅ Menos desconexões
- ✅ Conexão mais estável
- ✅ Menos logs de "Socket appears disconnected"

---

## 🧪 Como Testar

### Teste phone_number:
```bash
# 1. Conectar WhatsApp
# 2. No navegador, abrir Console
# 3. Verificar logs do frontend:
[WhatsAppService] Status: { ..., phone_number: "5511943299160" }  ← Deve aparecer o número!
```

### Teste Reconexões:
```bash
# 1. Conectar WhatsApp
# 2. Observar logs do backend por 30 minutos
# 3. Antes: múltiplos "Keepalive: Socket appears disconnected"
# 4. Depois: zero ou muito poucos "Socket appears disconnected"
```

---

## 📁 Onde Modificar (Backend)

Se você não sabe onde está o código backend:

1. **O backend provavelmente está em:** `https://crm-imobil.onrender.com/api`
2. **Procure arquivos com nomes como:**
   - `whatsappService.ts` ou `whatsappService.js`
   - `whatsappClient.ts` ou `whatsappClient.js`
   - `baileys.ts` ou `baileys.js`

3. **Se o backend está em outro repositório:**
   - Clone o repositório do backend
   - Procure por `makeWASocket` (criação do Baileys)
   - Procure por `getStatus` (método que retorna status)

---

## ❓ FAQ

### "Não tenho acesso ao backend"
Se o backend está em outro repo ou você não tem acesso:
1. Compartilhe este documento com quem tem acesso
2. Ou diga: "Preciso que o backend inclua `phone_number` na resposta do `/api/whatsapp/status` e aumente o `keepAliveIntervalMs` para 30000"

### "Já está salvando no banco mas ainda vem undefined"
Verifique:
1. O campo `phone_number` no banco está sendo salvo? (verifique no Supabase Table Editor)
2. O `getStatus()` está retornando este campo? (adicione um `console.log` lá)
3. A estrutura do Baileys pode ser diferente: teste `sock.user.phone` ou `sock.user.number`

### "Reconexões continuam depois do fix"
Tente aumentar mais:
```javascript
keepAliveIntervalMs: 60000,      // 60 segundos
connectTimeoutMs: 120000,        // 120 segundos
```

Ou verifique se há problemas de rede/servidor:
- Servidor com pouca RAM/CPU?
- Firewall bloqueando WebSocket?
- Rede instável?

---

## 📚 Documentação Completa

Para mais detalhes técnicos, veja:
- `WHATSAPP_PHONE_NUMBER_AND_RECONNECTION_FIX.md` (documentação completa)
- Seções sobre Baileys e configurações avançadas
- Exemplos de reconexão inteligente com backoff exponencial

---

**Última atualização:** 2026-01-09
**Tempo estimado de fix:** 5-10 minutos
