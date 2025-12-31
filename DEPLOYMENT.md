# 🚀 Guia de Implantação - CRM Imobiliário SaaS

## 📋 Visão Geral

Este CRM é projetado como uma aplicação SaaS multi-tenant para ser hospedada em plataformas modernas como **Netlify** ou **Vercel**, que fornecem:
- ✅ SSL automático
- ✅ CDN global
- ✅ Deploy contínuo via Git
- ✅ Escalabilidade automática

## 🎯 Opções de Deploy Recomendadas

### 1. Netlify (⭐ Recomendado para SaaS Multi-tenant)

#### Por que Netlify?
- SSL automático para domínio principal e subdomínios
- Suporte nativo para wildcard subdomains
- Plano gratuito generoso para começar
- Fácil configuração de domínios customizados

#### Passo a Passo:

1. **Instale o Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Configure o arquivo `netlify.toml` na raiz do projeto**
```toml
[build]
  command = "npm run build"
  publish = "dist/crm-imobil-app"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

3. **Configure variáveis de ambiente**
Crie um arquivo `.env` (não commitar!):
```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
```

4. **Build e Deploy**
```bash
npm run build
netlify deploy --prod
```

5. **Configure variáveis de ambiente no Netlify Dashboard**
- Acesse Site Settings > Build & Deploy > Environment
- Adicione as variáveis do Supabase

#### Configurando Multi-tenant com Subdomínios

1. **Configure o domínio principal no Netlify**
   - Adicione seu domínio (ex: `seucrm.com`)
   - Netlify configura SSL automaticamente

2. **Configure Wildcard DNS no seu provedor**
   - Adicione registro: `*.seucrm.com` → `seu-site.netlify.app`
   - Todos os subdomínios (cliente1.seucrm.com, cliente2.seucrm.com) funcionarão automaticamente

3. **SSL automático para subdomínios**
   - Netlify fornece SSL para todos os subdomínios wildcard
   - Sem necessidade de Certbot ou configuração manual

#### Adicionando Domínios Customizados (Premium)

Para permitir que clientes usem seus próprios domínios:

1. **Cliente configura DNS**
   - CNAME: `www` → `seu-site.netlify.app`
   - CNAME: `@` → `seu-site.netlify.app` (ou ALIAS)

2. **Você adiciona no Netlify Dashboard**
   - Site Settings > Domain Management > Add domain
   - Digite o domínio do cliente
   - SSL é configurado automaticamente em minutos

3. **Marque como ativo no CRM**
   - Use a interface de domínios para ativar

**Limitações:**
- Plano Free: 1 domínio customizado
- Plano Pro ($19/mês por site): Domínios ilimitados
- Para múltiplos domínios customizados, considere plano pago

---

### 2. Vercel (Alternativa Recomendada)

#### Passo a Passo:

1. **Instale o Vercel CLI**
```bash
npm i -g vercel
```

2. **Configure o projeto**
Crie um arquivo `vercel.json` na raiz:
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

3. **Build e Deploy**
```bash
npm run build
vercel --prod
```

4. **Configure as variáveis de ambiente no Vercel**
- Acesse o painel do Vercel
- Vá em Settings > Environment Variables
- Adicione:
  - `SUPABASE_URL`: sua URL do Supabase
  - `SUPABASE_ANON_KEY`: sua chave anônima do Supabase

---

### 2. Vercel (Alternativa Recomendada)

#### Passo a Passo:

1. **Instale o Vercel CLI**
```bash
npm i -g vercel
```

2. **Configure o projeto - crie `vercel.json`**
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "build": {
    "env": {
      "NODE_VERSION": "18"
    }
  }
}
```

3. **Build e Deploy**
```bash
npm run build
vercel --prod
```

4. **Configure variáveis de ambiente no Vercel**
- Acesse o painel do Vercel
- Vá em Settings > Environment Variables
- Adicione:
  - `SUPABASE_URL`: sua URL do Supabase
  - `SUPABASE_ANON_KEY`: sua chave anônima do Supabase

**Multi-tenant no Vercel:** Similar ao Netlify, suporta wildcard domains e SSL automático.

---

## 🗄️ Configuração do Supabase (Backend)

### 1. Criar projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote a URL e a chave anônima

### 2. Executar o Schema SQL
- No painel do Supabase, vá para SQL Editor
- Execute o arquivo `supabase-schema.sql`
- Execute migrations adicionais se houver

### 3. Adicionar campo para subdomínios (Recomendado)

Adicione um campo na tabela `companies` para subdomínios automáticos:

```sql
ALTER TABLE companies
ADD COLUMN subdomain_slug VARCHAR(100) UNIQUE;

-- Adicione índice para performance
CREATE INDEX idx_companies_subdomain ON companies(subdomain_slug);
```

### 4. Atualizar tabela custom_domains

Adicione o campo `is_subdomain_auto`:

```sql
ALTER TABLE custom_domains
ADD COLUMN is_subdomain_auto BOOLEAN DEFAULT false;

-- Remover campos de SSL que não são mais usados
ALTER TABLE custom_domains
DROP COLUMN IF EXISTS ssl_certificate,
DROP COLUMN IF EXISTS ssl_expires_at;
```

### 5. Configurar Storage (para anexos e imagens)
- Vá para Storage no painel
- Crie um bucket chamado `attachments`
- Configure as políticas de acesso

### 6. Ativar Realtime (para notificações)
- Vá para Database > Replication
- Ative para a tabela `notifications`

---

## 🌐 Configuração Multi-tenant

### Como funciona a detecção de tenant

O sistema detecta qual empresa mostrar baseado no domínio:

#### 1. Subdomínios Automáticos (Recomendado)
- **Formato:** `cliente1.seucrm.com`, `cliente2.seucrm.com`
- **Como funciona:**
  1. Frontend detecta hostname via `window.location.hostname`
  2. Extrai o subdomínio (`cliente1`)
  3. Busca no banco qual empresa tem esse subdomínio
  4. Carrega dados filtrados por `company_id`

#### 2. Domínios Customizados
- **Formato:** `www.clienteproprio.com.br`
- **Como funciona:**
  1. Frontend detecta hostname
  2. Busca na tabela `custom_domains` qual empresa usa esse domínio
  3. Carrega dados filtrados por `company_id`

### Implementação no Frontend

O serviço `TenantResolverService` já foi criado e faz:

```typescript
// Exemplo de uso em um componente público
export class PublicHomeComponent implements OnInit {
  constructor(
    private publicSiteConfig: PublicSiteConfigService
  ) {}

  async ngOnInit() {
    const config = await this.publicSiteConfig.getSiteConfig();
    
    if (config) {
      this.companyName = config.company.name;
      this.layout = config.layout;
      // Renderizar o site baseado na configuração
    } else {
      // Mostrar página de erro ou default
    }
  }
}
```

---

## ✅ Checklist de Deploy

- [ ] Build do projeto sem erros (`npm run build`)
- [ ] Variáveis de ambiente configuradas (Supabase)
- [ ] Schema SQL executado no Supabase
- [ ] Campo `subdomain_slug` adicionado à tabela companies
- [ ] Campo `is_subdomain_auto` adicionado à tabela custom_domains
- [ ] Deploy realizado (Netlify ou Vercel)
- [ ] Domínio principal configurado
- [ ] Wildcard DNS configurado para subdomínios (`*.seusite.com`)
- [ ] SSL verificado (deve estar ativo automaticamente)
- [ ] Teste de multi-tenant realizado (acessar diferentes subdomínios)
- [ ] Storage do Supabase configurado
- [ ] Realtime ativado para notificações

---

## 🔐 Segurança e Boas Práticas

### Segurança
- ✅ Use HTTPS sempre (automático no Netlify/Vercel)
- ✅ Configure CORS adequadamente no Supabase
- ✅ Revise as políticas RLS (Row Level Security)
- ✅ Nunca exponha chaves secretas no frontend
- ✅ Valide entrada de usuários no backend (Supabase Functions)

### Performance
- ✅ Habilite cache no CDN (automático no Netlify/Vercel)
- ✅ Configure compressão gzip (automático)
- ✅ Otimize imagens e assets antes do upload
- ✅ Use lazy loading nas rotas Angular
- ✅ Implemente paginação para listagens grandes

### Monitoramento
- ✅ Configure Google Analytics ou similar
- ✅ Configure Sentry para tracking de erros
- ✅ Monitore logs do Supabase
- ✅ Configure alertas de uptime (UptimeRobot, etc)
- ✅ Monitore uso do Supabase para não exceder limites

---

## 🚫 O que NÃO fazer (Armadilhas Comuns)

❌ **NÃO tente configurar Certbot ou Let's Encrypt manualmente**
- Netlify/Vercel fazem isso automaticamente

❌ **NÃO tente configurar Nginx**
- Não é possível e não é necessário

❌ **NÃO adicione domínios customizados sem adicionar no painel da plataforma**
- Sempre adicione no Netlify/Vercel primeiro

❌ **NÃO espere SSL instantâneo para domínios customizados**
- Pode levar de minutos a algumas horas após DNS propagar

❌ **NÃO misture VPS com Netlify/Vercel**
- São abordagens diferentes; escolha uma

---

## 🔧 Solução de Problemas

### Erro: "Cannot find module '@angular/core'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS no Supabase
- Vá para Project Settings > API
- Adicione sua URL de produção em "Allowed Origins"
- Adicione também URLs de preview do Netlify se necessário

### Rotas não funcionam após refresh
- Verifique se configurou o redirect no `netlify.toml` ou `vercel.json`
- Todas as rotas devem redirecionar para `/index.html`

### SSL não ativa para domínio customizado
1. Verifique se DNS propagou (`nslookup seudominio.com`)
2. Confirme que adicionou no painel do Netlify/Vercel
3. Aguarde até 24h para propagação completa
4. Tente remover e adicionar novamente o domínio

### Subdomínios não funcionam
1. Verifique wildcard DNS: `*.seusite.com` → `seu-site.netlify.app`
2. Confirme que o campo `subdomain_slug` existe na tabela companies
3. Teste a query no Supabase SQL Editor
4. Verifique logs do navegador (F12) para erros

### Multi-tenant não detecta empresa
1. Verifique se `TenantResolverService` está sendo usado
2. Confirme que o domínio está na tabela `custom_domains` com status 'active'
3. Para subdomínios, confirme que existe em `companies.subdomain_slug`
4. Verifique logs do navegador

---

## 📚 Recursos Adicionais

- [Documentação do Angular](https://angular.io/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Netlify Docs - Custom Domains](https://docs.netlify.com/domains-https/custom-domains/)
- [Vercel Docs - Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Wildcard SSL on Netlify](https://docs.netlify.com/domains-https/https-ssl/#certificates-for-subdomains)

---

## 💰 Considerações de Custo

### Plano Gratuito (Desenvolvimento e MVPs)
- **Netlify Free:** 100GB bandwidth, 1 domínio customizado
- **Vercel Hobby:** 100GB bandwidth, domínios ilimitados (uso pessoal)
- **Supabase Free:** 500MB database, 1GB storage, 2GB transfer

### Plano Pago (Produção)
- **Netlify Pro:** $19/mês - domínios ilimitados, 400GB bandwidth
- **Vercel Pro:** $20/mês - uso comercial, analytics
- **Supabase Pro:** $25/mês - 8GB database, 100GB storage

### Recomendação
- **Começar:** Free tier de todos
- **1-10 clientes:** Netlify/Vercel Free + Supabase Free
- **10-50 clientes:** Netlify/Vercel Pro + Supabase Pro
- **50+ clientes:** Considerar planos Enterprise ou migrar para VPS próprio

---

**Última atualização:** 2024  
