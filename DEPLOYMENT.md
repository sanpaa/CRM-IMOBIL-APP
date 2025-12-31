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

### 2. Netlify

#### Passo a Passo:

1. **Instale o Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Configure o arquivo `netlify.toml`**
```toml
[build]
  command = "npm run build"
  publish = "dist/crm-imobil-app"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. **Deploy**
```bash
npm run build
netlify deploy --prod
```

---

### 3. Firebase Hosting

#### Passo a Passo:

1. **Instale Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Faça login no Firebase**
```bash
firebase login
```

3. **Inicialize o projeto**
```bash
firebase init hosting
```

Configurações:
- Public directory: `dist/crm-imobil-app`
- Single-page app: Yes
- Overwrite index.html: No

4. **Deploy**
```bash
npm run build
firebase deploy
```

---

### 4. AWS S3 + CloudFront

#### Passo a Passo:

1. **Build do projeto**
```bash
npm run build
```

2. **Crie um bucket S3**
- Nome: `crm-imobil-app`
- Permissões: Público para leitura
- Static Website Hosting: Habilitado

3. **Upload dos arquivos**
```bash
aws s3 sync dist/crm-imobil-app/ s3://crm-imobil-app --acl public-read
```

4. **Configure CloudFront** (opcional)
- Crie uma distribuição CloudFront
- Origin: Seu bucket S3
- Default Root Object: `index.html`
- Error Pages: Redirecione 403/404 para `/index.html`

---

### 5. Docker

#### Dockerfile:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist/crm-imobil-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Build e Run:
```bash
docker build -t crm-imobil-app .
docker run -p 8080:80 crm-imobil-app
```

---

## Configuração do Supabase

### 1. Criar projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote a URL e a chave anônima

### 2. Executar o Schema SQL
- No painel do Supabase, vá para SQL Editor
- Copie e execute o conteúdo de `supabase-schema.sql`

### 3. Configurar Storage (para anexos)
- Vá para Storage no painel
- Crie um bucket chamado `attachments`
- Configure as políticas de acesso conforme necessário

### 4. Ativar Realtime (para notificações)
- Vá para Database > Replication
- Ative para a tabela `notifications`

---

## Checklist de Deploy

- [ ] Build do projeto sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Schema SQL executado no Supabase
- [ ] Testes básicos realizados
- [ ] SSL/HTTPS configurado
- [ ] Domain personalizado configurado (opcional)
- [ ] Analytics configurado (opcional)
- [ ] Backup do banco configurado
- [ ] Monitoramento configurado

---

## Dicas de Produção

### Segurança
- ✅ Use HTTPS sempre
- ✅ Configure CORS adequadamente no Supabase
- ✅ Revise as políticas RLS
- ✅ Nunca exponha chaves secretas no frontend

### Performance
- ✅ Habilite cache no CDN
- ✅ Configure compressão gzip
- ✅ Otimize imagens e assets
- ✅ Use lazy loading nas rotas

### Monitoramento
- ✅ Configure Google Analytics ou similar
- ✅ Configure Sentry para tracking de erros
- ✅ Monitore logs do Supabase
- ✅ Configure alertas de uptime

---

## Solução de Problemas

### Erro: "Cannot find module '@angular/core'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS no Supabase
- Vá para Project Settings > API
- Adicione sua URL de produção em "Allowed Origins"

### Rotas não funcionam após refresh
- Configure seu servidor para redirecionar todas as rotas para `/index.html`

---

## Suporte

Para mais informações, consulte:
- [Documentação do Angular](https://angular.io/docs)
- [Documentação do Supabase](https://supabase.com/docs)
