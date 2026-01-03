# Prompt para Implementação do Backend - Integração WhatsApp Web

## Objetivo
Implementar um backend que permita integração com WhatsApp Web usando a biblioteca `whatsapp-web.js`, permitindo:
1. Gerar QR code para autenticação
2. Gerenciar sessões ativas
3. Receber mensagens automaticamente
4. Criar clientes automaticamente quando receber mensagens de números não cadastrados
5. Enviar mensagens via WhatsApp

## Stack Tecnológica Recomendada
- **Node.js** (v18 ou superior)
- **whatsapp-web.js** - Biblioteca para integração com WhatsApp
- **Supabase** - Banco de dados e autenticação
- **Express** - Framework web
- **QRCode** - Geração de QR codes em base64

## Estrutura do Banco de Dados

### Tabela: `whatsapp_connections`
```sql
CREATE TABLE whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone_number TEXT,
  is_connected BOOLEAN DEFAULT false,
  session_data JSONB,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Índices
CREATE INDEX idx_whatsapp_connections_company ON whatsapp_connections(company_id);
CREATE INDEX idx_whatsapp_connections_user ON whatsapp_connections(user_id);
CREATE INDEX idx_whatsapp_connections_connected ON whatsapp_connections(is_connected);
```

### Tabela: `whatsapp_messages`
```sql
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  body TEXT,
  message_id TEXT UNIQUE,
  is_group BOOLEAN DEFAULT false,
  is_from_me BOOLEAN DEFAULT false,
  contact_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_whatsapp_messages_connection ON whatsapp_messages(connection_id);
CREATE INDEX idx_whatsapp_messages_company ON whatsapp_messages(company_id);
CREATE INDEX idx_whatsapp_messages_from ON whatsapp_messages(from_number);
CREATE INDEX idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp DESC);
```

### Tabela: `whatsapp_auto_clients`
```sql
CREATE TABLE whatsapp_auto_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(connection_id, phone_number)
);

-- Índice
CREATE INDEX idx_whatsapp_auto_clients_connection ON whatsapp_auto_clients(connection_id);
```

## Implementação do Backend

### 1. Instalação de Dependências
```bash
npm install whatsapp-web.js qrcode express @supabase/supabase-js
npm install -D @types/express @types/qrcode
```

### 2. Estrutura de Arquivos
```
backend/
├── src/
│   ├── controllers/
│   │   └── whatsappController.ts
│   ├── services/
│   │   └── whatsappService.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── utils/
│   │   └── whatsappClient.ts
│   └── index.ts
├── sessions/               # Pasta para armazenar sessões
└── package.json
```

### 3. Arquivo: `src/utils/whatsappClient.ts`
```typescript
import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface WhatsAppClientInstance {
  client: Client;
  qrCode?: string;
  isReady: boolean;
  companyId: string;
  userId: string;
}

export class WhatsAppClientManager {
  private clients: Map<string, WhatsAppClientInstance> = new Map();

  async initializeClient(companyId: string, userId: string): Promise<string> {
    // Remove cliente existente se houver
    await this.destroyClient(companyId);

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

    // Evento: QR Code gerado
    clientInstance.client.on('qr', async (qr) => {
      console.log('QR Code gerado para company:', companyId);
      const qrCodeDataUrl = await QRCode.toDataURL(qr);
      clientInstance.qrCode = qrCodeDataUrl;

      // Atualiza no banco
      await supabase
        .from('whatsapp_connections')
        .upsert({
          company_id: companyId,
          user_id: userId,
          is_connected: false,
          qr_code: qrCodeDataUrl
        }, { onConflict: 'company_id' });
    });

    // Evento: Cliente pronto
    clientInstance.client.on('ready', async () => {
      console.log('WhatsApp pronto para company:', companyId);
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

    // Evento: Cliente autenticado
    clientInstance.client.on('authenticated', async () => {
      console.log('WhatsApp autenticado para company:', companyId);
    });

    // Evento: Falha na autenticação
    clientInstance.client.on('auth_failure', async (msg) => {
      console.error('Falha na autenticação para company:', companyId, msg);
      await this.destroyClient(companyId);
    });

    // Evento: Cliente desconectado
    clientInstance.client.on('disconnected', async (reason) => {
      console.log('WhatsApp desconectado para company:', companyId, reason);
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
    await clientInstance.client.initialize();

    return 'Inicialização em progresso';
  }

  async handleIncomingMessage(message: any, companyId: string): Promise<void> {
    try {
      // Ignora mensagens de grupo e mensagens enviadas por mim
      if (message.isGroup || message.fromMe) {
        return;
      }

      const contact = await message.getContact();
      const fromNumber = contact.id.user;
      const contactName = contact.pushname || contact.name || fromNumber;

      // Busca a conexão
      const { data: connection } = await supabase
        .from('whatsapp_connections')
        .select('id')
        .eq('company_id', companyId)
        .single();

      if (!connection) return;

      // Salva a mensagem
      await supabase
        .from('whatsapp_messages')
        .insert({
          connection_id: connection.id,
          company_id: companyId,
          from_number: fromNumber,
          to_number: message.to,
          body: message.body,
          message_id: message.id._serialized,
          is_group: message.isGroup,
          is_from_me: message.fromMe,
          contact_name: contactName,
          timestamp: new Date(message.timestamp * 1000).toISOString()
        });

      // Verifica se o cliente já existe
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('company_id', companyId)
        .eq('phone', fromNumber)
        .single();

      // Se não existe, cria automaticamente
      if (!existingClient) {
        console.log('Criando novo cliente automaticamente:', contactName, fromNumber);

        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            company_id: companyId,
            name: contactName,
            phone: fromNumber,
            email: null,
            source: 'whatsapp',
            status: 'lead',
            notes: `Cliente criado automaticamente via WhatsApp em ${new Date().toLocaleDateString('pt-BR')}`
          })
          .select()
          .single();

        if (newClient) {
          // Registra a criação automática
          await supabase
            .from('whatsapp_auto_clients')
            .insert({
              connection_id: connection.id,
              client_id: newClient.id,
              phone_number: fromNumber
            });

          console.log('Cliente criado com sucesso:', newClient.id);
        }
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  async getClient(companyId: string): Promise<Client | null> {
    const instance = this.clients.get(companyId);
    return instance?.isReady ? instance.client : null;
  }

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
        // Reconectar cliente
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
      is_connected: false
    };
  }

  async destroyClient(companyId: string): Promise<void> {
    const instance = this.clients.get(companyId);
    if (instance) {
      try {
        await instance.client.destroy();
      } catch (error) {
        console.error('Erro ao destruir cliente:', error);
      }
      this.clients.delete(companyId);
    }
  }

  async sendMessage(companyId: string, to: string, message: string): Promise<void> {
    const client = await this.getClient(companyId);
    if (!client) {
      throw new Error('WhatsApp não está conectado');
    }

    // Formata o número para o formato do WhatsApp
    const chatId = to.includes('@') ? to : `${to}@c.us`;
    await client.sendMessage(chatId, message);
  }
}

export const whatsappClientManager = new WhatsAppClientManager();
```

### 4. Arquivo: `src/controllers/whatsappController.ts`
```typescript
import { Request, Response } from 'express';
import { whatsappClientManager } from '../utils/whatsappClient';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class WhatsAppController {
  async initialize(req: Request, res: Response) {
    try {
      const { company_id, user_id } = req.body;
      
      if (!company_id || !user_id) {
        return res.status(400).json({ error: 'company_id e user_id são obrigatórios' });
      }

      await whatsappClientManager.initializeClient(company_id, user_id);
      
      res.json({ 
        message: 'Inicialização iniciada. Aguarde o QR code.',
        status: 'connecting'
      });
    } catch (error: any) {
      console.error('Erro ao inicializar WhatsApp:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Busca company_id do usuário
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (!userData?.company_id) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      const status = await whatsappClientManager.getStatus(userData.company_id);
      res.json(status);
    } catch (error: any) {
      console.error('Erro ao obter status:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async disconnect(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (!userData?.company_id) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      await whatsappClientManager.destroyClient(userData.company_id);

      await supabase
        .from('whatsapp_connections')
        .update({
          is_connected: false,
          qr_code: null
        })
        .eq('company_id', userData.company_id);

      res.json({ message: 'Desconectado com sucesso' });
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json({ error: 'to e message são obrigatórios' });
      }

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (!userData?.company_id) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      await whatsappClientManager.sendMessage(userData.company_id, to, message);
      res.json({ message: 'Mensagem enviada com sucesso' });
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (!userData?.company_id) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      const { data: messages } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('company_id', userData.company_id)
        .order('timestamp', { ascending: false })
        .limit(limit);

      res.json(messages || []);
    } catch (error: any) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
```

### 5. Arquivo: `src/middleware/auth.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
}
```

### 6. Arquivo: `src/index.ts`
```typescript
import express from 'express';
import cors from 'cors';
import { WhatsAppController } from './controllers/whatsappController';
import { authMiddleware } from './middleware/auth';

const app = express();
const whatsappController = new WhatsAppController();

app.use(cors());
app.use(express.json());

// Rotas WhatsApp
app.post('/api/whatsapp/initialize', authMiddleware, (req, res) => whatsappController.initialize(req, res));
app.get('/api/whatsapp/status', authMiddleware, (req, res) => whatsappController.getStatus(req, res));
app.post('/api/whatsapp/disconnect', authMiddleware, (req, res) => whatsappController.disconnect(req, res));
app.post('/api/whatsapp/send', authMiddleware, (req, res) => whatsappController.sendMessage(req, res));
app.get('/api/whatsapp/messages', authMiddleware, (req, res) => whatsappController.getMessages(req, res));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

### 7. Variáveis de Ambiente (`.env`)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=3000
NODE_ENV=production
```

### 8. Scripts do package.json
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## Funcionalidades Implementadas

### ✅ Autenticação via QR Code
- Gera QR code em base64 quando o usuário solicita conexão
- Atualiza automaticamente quando o código é escaneado

### ✅ Gerenciamento de Sessão
- Mantém sessões ativas por empresa
- Reconecta automaticamente quando o servidor reinicia
- Detecta desconexões e atualiza o status

### ✅ Registro Automático de Clientes
- Quando recebe mensagem de número não cadastrado, cria um novo cliente automaticamente
- Define source como 'whatsapp'
- Adiciona nota informando a criação automática

### ✅ Histórico de Mensagens
- Salva todas as mensagens recebidas
- Permite consultar histórico por empresa

### ✅ Envio de Mensagens
- Permite enviar mensagens via API
- Valida se a conexão está ativa

## Deploy

### Opção 1: VPS/Servidor Dedicado
```bash
git clone <repo>
cd backend
npm install
npm run build
npm start
```

### Opção 2: Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Opção 3: Railway/Render
- Configure as variáveis de ambiente
- Aponte para o repositório do backend
- A plataforma fará o build e deploy automaticamente

## Considerações de Segurança

1. **Autenticação**: Todas as rotas são protegidas com JWT do Supabase
2. **Rate Limiting**: Recomenda-se adicionar rate limiting para evitar abuso
3. **CORS**: Configure CORS apenas para domínios autorizados
4. **Logs**: Implemente logs adequados para auditoria
5. **Backup de Sessões**: As sessões são salvas em `sessions/` - fazer backup regular

## Testes

### Testar conexão
```bash
curl -X POST http://localhost:3000/api/whatsapp/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_id": "uuid", "user_id": "uuid"}'
```

### Verificar status
```bash
curl -X GET http://localhost:3000/api/whatsapp/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Enviar mensagem
```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": "5511999999999", "message": "Olá!"}'
```

## Troubleshooting

### Problema: QR Code não aparece
- Verifique logs do servidor
- Certifique-se que o Puppeteer está instalado corretamente
- Em ambiente Docker, adicione dependências do Chromium

### Problema: Sessão não persiste
- Verifique se a pasta `sessions/` tem permissões de escrita
- Verifique se o `clientId` está sendo passado corretamente

### Problema: Cliente não criado automaticamente
- Verifique logs do evento `message`
- Confirme que a tabela `clients` existe e tem as colunas corretas
- Verifique permissões do Supabase

## Melhorias Futuras

1. **Webhooks**: Enviar notificações em tempo real quando mensagens chegam
2. **Grupos**: Suporte para mensagens de grupos
3. **Mídias**: Salvar imagens, vídeos e áudios recebidos
4. **Templates**: Criar templates de mensagens rápidas
5. **Chatbot**: Implementar respostas automáticas
6. **Analytics**: Dashboard de métricas de mensagens

## Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do whatsapp-web.js: https://wwebjs.dev/
2. Consulte os logs do servidor
3. Verifique o status no banco de dados

---

**Nota**: Esta implementação usa `whatsapp-web.js` que requer uma instância do Chrome/Chromium. Para produção, recomenda-se usar um servidor dedicado ou container com recursos adequados.
