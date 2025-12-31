# 🎨 Sistema de Personalização de Sites - Guia Completo

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Construtor de Sites](#construtor-de-sites)
4. [Gerenciamento de Domínios](#gerenciamento-de-domínios)
5. [Configuração do Servidor](#configuração-do-servidor)
6. [Guia do Usuário](#guia-do-usuário)

---

## 🎯 Visão Geral

O Sistema de Personalização de Sites permite que cada imobiliária cadastrada no CRM tenha seu próprio site personalizado, com:

- 🎨 **Construtor Visual Drag & Drop**: Interface intuitiva para criar páginas
- 🌐 **Domínios Personalizados**: Cada imobiliária pode usar seu próprio domínio
- 🔒 **SSL Automático**: Certificados SSL gerados automaticamente
- 📱 **Design Responsivo**: Sites otimizados para todos os dispositivos
- 🏗️ **Componentes Reutilizáveis**: Biblioteca de componentes prontos
- ⚡ **Publicação Instantânea**: Alterações aplicadas em tempo real

---

## 🏗️ Arquitetura

### Estrutura do Banco de Dados

#### 1. **custom_domains**
Armazena configurações de domínios personalizados:
```sql
- id: UUID
- company_id: FK para companies
- domain: Domínio completo (ex: minhaimo.com.br)
- subdomain: Subdomínio opcional (ex: www)
- is_primary: Domínio principal da empresa
- ssl_enabled: SSL ativo
- ssl_expires_at: Data de expiração do SSL
- dns_configured: DNS configurado corretamente
- verification_token: Token para verificação
- status: pending | verified | active | failed | disabled
```

#### 2. **website_layouts**
Armazena layouts de páginas:
```sql
- id: UUID
- company_id: FK para companies
- name: Nome do layout
- page_type: home | properties | property-detail | about | contact | custom
- slug: URL personalizada (para páginas custom)
- is_active: Layout ativo
- is_default: Layout padrão para o tipo de página
- layout_config: JSON com estrutura do layout
- meta_title, meta_description, meta_keywords: SEO
```

#### 3. **website_components**
Armazena componentes personalizados:
```sql
- id: UUID
- company_id: FK para companies
- name: Nome do componente
- component_type: Tipo do componente
- config: JSON com configurações
- style_config: JSON com estilos
- is_reusable: Componente reutilizável
```

#### 4. **Atualizações em companies**
```sql
- custom_domain: Domínio personalizado ativo
- website_enabled: Site habilitado
- website_published: Site publicado
```

#### 5. **Atualizações em store_settings**
```sql
- layout_config: Configuração de layout global
- theme_config: Tema (cores, fontes, etc)
- social_links: Links de redes sociais
- business_hours: Horário de funcionamento
- header_image: Imagem do cabeçalho
- footer_text: Texto do rodapé
```

### Componentes Disponíveis

1. **header** - Cabeçalho com logo e navegação
2. **footer** - Rodapé com links e informações
3. **hero** - Banner principal com título e CTA
4. **property-grid** - Grade de imóveis
5. **property-card** - Card individual de imóvel
6. **search-bar** - Barra de busca
7. **contact-form** - Formulário de contato
8. **testimonials** - Depoimentos de clientes
9. **about-section** - Seção sobre a empresa
10. **stats-section** - Estatísticas em destaque
11. **team-section** - Equipe
12. **map-section** - Mapa de localização
13. **text-block** - Bloco de texto livre
14. **image-gallery** - Galeria de imagens
15. **video-section** - Seção de vídeo
16. **cta-button** - Botão de chamada para ação
17. **divider** - Linha divisória
18. **spacer** - Espaçamento

---

## 🎨 Construtor de Sites

### Acessando o Construtor

1. Faça login como **Administrador**
2. No menu lateral, clique em **🎨 Construtor de Sites**
3. A interface do construtor será carregada

### Interface do Construtor

A interface é dividida em 3 painéis:

#### 1. Biblioteca de Componentes (Esquerda)
- Lista de todos os componentes disponíveis
- Clique para adicionar ao layout
- Organizados por categoria

#### 2. Canvas de Edição (Centro)
- Visualização do layout
- Arrastar e soltar para reordenar
- Clique em um componente para editar
- Botão de preview para visualizar

#### 3. Painel de Propriedades (Direita)
- Configurações do componente selecionado
- Opções de estilo (cores, espaçamento)
- Ações do layout (salvar, publicar, excluir)

### Criando um Novo Layout

1. Clique em **➕ Novo Layout**
2. Preencha:
   - **Nome**: Ex: "Home Page Principal"
   - **Tipo de Página**: Escolha entre Home, Properties, etc.
   - **Slug** (opcional): Para páginas custom
3. Clique em **Criar Layout**
4. Um template padrão será criado

### Adicionando Componentes

1. Na biblioteca, clique no componente desejado
2. O componente será adicionado ao final do layout
3. Arraste o componente para reposicioná-lo
4. Clique no componente para editar suas propriedades

### Editando Componentes

Ao selecionar um componente, você pode:

- **Configurações Gerais**: Textos, imagens, links
- **Estilos**: Cores de fundo, texto, espaçamento
- **Ações**: Duplicar ou remover

#### Exemplo: Hero Section
```
Configurações:
- Título: "Encontre seu imóvel ideal"
- Subtítulo: "As melhores opções do mercado"
- Altura: Grande
- Alinhamento: Centro
- Imagem de fundo: URL da imagem

Estilos:
- Cor de fundo: #004AAD
- Cor do texto: #FFFFFF
- Espaçamento: 2rem
```

### Salvando e Publicando

1. **Salvar**: Clique em **💾 Salvar** para salvar alterações
2. **Publicar**: Clique em **🚀 Publicar** para tornar o layout ativo
3. **Preview**: Clique em **👁️ Visualizar** para ver como ficará

### Boas Práticas

✅ **DO:**
- Use componentes de forma consistente
- Mantenha hierarquia visual clara
- Otimize imagens antes de usar
- Teste em diferentes dispositivos
- Use cores da identidade da marca

❌ **DON'T:**
- Não sobrecarregue a página com muitos componentes
- Não use imagens muito pesadas
- Não misture muitas fontes/cores
- Não deixe textos muito longos

---

## 🌐 Gerenciamento de Domínios

### Acessando Configurações de Domínio

1. Faça login como **Administrador**
2. Clique em **🌐 Domínios** no menu

### Duas Opções de Domínio

#### 🚀 Opção 1: Subdomínio Automático (Recomendado)

**Formato:** `suaempresa.seusite.com`

**Vantagens:**
- ✅ SSL automático incluído
- ✅ Zero configuração necessária
- ✅ Ativo imediatamente
- ✅ Sem custos adicionais

**Como usar:**
1. Ao criar sua conta, um subdomínio automático é gerado
2. Use este subdomínio para começar rapidamente
3. Compartilhe com seus clientes

#### 🌐 Opção 2: Domínio Customizado (Premium)

**Formato:** `www.suaempresa.com.br`

**Requisitos:**
- Domínio próprio registrado
- Acesso ao painel do provedor de DNS
- Conta Netlify/Vercel configurada

### Adicionando um Domínio Customizado

1. Clique em **➕ Adicionar Domínio**
2. Preencha:
   - **Domínio**: Ex: minhaimo.com.br
   - **Subdomínio** (opcional): Ex: www
3. Clique em **Adicionar**
4. Siga as instruções de configuração DNS

### Configurando DNS

Após adicionar o domínio, você verá as instruções de CNAME:

#### Registros CNAME necessários
```
Tipo: CNAME
Host: www
Valor: your-site.netlify.app
TTL: 3600

Tipo: CNAME (ou ALIAS)
Host: @
Valor: your-site.netlify.app
TTL: 3600
```

**Importante:** Substitua `your-site.netlify.app` pelo domínio real do seu site no Netlify/Vercel.

### Passo a Passo por Provedor

#### Registro.br
1. Acesse o painel do Registro.br
2. Vá em "DNS" → "Editar Zona"
3. Adicione os registros CNAME
4. Aguarde propagação (até 48h)

#### GoDaddy
1. Acesse "Meus Domínios"
2. Clique em "Gerenciar DNS"
3. Adicione os registros CNAME
4. Salve alterações

#### Hostgator
1. Painel cPanel
2. Seção "Domínios" → "Editor de Zona"
3. Adicione registros CNAME
4. Salve

### Adicionando no Netlify/Vercel

**IMPORTANTE:** Após configurar o DNS, você DEVE adicionar o domínio manualmente na plataforma de hospedagem:

#### No Netlify:
1. Acesse o painel do Netlify
2. Vá para o seu site
3. Clique em "Domain settings"
4. Clique em "Add custom domain"
5. Digite seu domínio e confirme
6. O SSL será configurado automaticamente

#### No Vercel:
1. Acesse o painel do Vercel
2. Vá para o seu projeto
3. Clique em "Settings" → "Domains"
4. Adicione o domínio customizado
5. O SSL será configurado automaticamente

### Verificando o Domínio

1. Aguarde propagação DNS (1-48 horas)
2. Confirme que o domínio foi adicionado no Netlify/Vercel
3. Na interface de domínios do CRM, clique em **✅ Verificar**
4. Se confirmado, clique em **🚀 Ativar**
5. Status muda para "Ativo"

### SSL Automático

O SSL é gerenciado automaticamente pelo Netlify/Vercel:
- ✅ Certificado gerado automaticamente
- ✅ Renovação automática
- ✅ Sem configuração manual necessária
- ✅ Sem necessidade de Certbot ou Let's Encrypt manual

### Definindo Domínio Principal

1. Clique em **⭐ Definir como Principal**
2. Este será o domínio principal usado nos links

### Status dos Domínios

- **⏳ Pendente**: Aguardando configuração DNS
- **✅ Verificado**: DNS configurado, aguardando SSL
- **🟢 Ativo**: Totalmente funcional com SSL
- **❌ Falhou**: Erro na verificação
- **⚪ Desabilitado**: Desativado manualmente

---

## ⚙️ Configuração do Servidor (Netlify/Vercel)

### Arquitetura SaaS Recomendada

Este CRM é projetado para ser hospedado em plataformas modernas como Netlify ou Vercel, que oferecem:
- ✅ SSL automático
- ✅ CDN global
- ✅ Deploy contínuo
- ✅ Escalabilidade automática

### Opção 1: Netlify (Recomendado)

#### Requisitos
- Conta no Netlify (plano gratuito funciona para começar)
- Repositório Git (GitHub, GitLab, Bitbucket)
- Supabase para banco de dados

#### Configuração Inicial

1. **Conecte seu repositório ao Netlify**
```bash
# Via Netlify CLI
npm install -g netlify-cli
netlify login
netlify init
```

2. **Configure o `netlify.toml`**
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

3. **Deploy**
```bash
npm run build
netlify deploy --prod
```

#### Subdomínios Automáticos

Para implementar subdomínios automáticos (ex: `cliente1.seusite.com`, `cliente2.seusite.com`):

1. **No código Angular**, detecte o hostname:
```typescript
// Em um serviço de configuração
const hostname = window.location.hostname;
const subdomain = hostname.split('.')[0];

// Busque configurações da empresa pelo subdomínio
const company = await this.getCompanyBySubdomain(subdomain);
```

2. **Todos os subdomínios apontam para o mesmo site**
   - Netlify automaticamente fornece SSL para subdomínios
   - Use wildcard DNS: `*.seusite.com` → `seusite.netlify.app`

#### Domínios Customizados

**IMPORTANTE:** Domínios customizados devem ser adicionados manualmente:

1. Cliente configura DNS (CNAME → seu-site.netlify.app)
2. Você adiciona o domínio no painel do Netlify
3. Netlify gera SSL automaticamente
4. Marque como ativo no CRM

**Limitações:**
- Netlify Free: 1 domínio customizado
- Netlify Pro: Domínios ilimitados (mas cobra por site)

### Opção 2: Vercel

Similar ao Netlify, com configuração via `vercel.json`:

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

Deploy:
```bash
npm install -g vercel
vercel --prod
```

### Multi-tenant: Como Funciona

#### Frontend (Detecção de Tenant)

```typescript
// tenant-resolver.service.ts
export class TenantResolverService {
  getCurrentTenant(): string {
    const hostname = window.location.hostname;
    
    // Para subdomínios automáticos: cliente1.seusite.com
    if (hostname.includes('seusite.com')) {
      return hostname.split('.')[0];
    }
    
    // Para domínios customizados: www.cliente1.com.br
    // Buscar no backend qual empresa usa este domínio
    return this.fetchCompanyByDomain(hostname);
  }
  
  async fetchCompanyByDomain(domain: string): Promise<string> {
    const { data } = await this.supabase
      .from('custom_domains')
      .select('company_id')
      .eq('domain', domain)
      .eq('status', 'active')
      .single();
    
    return data?.company_id;
  }
}
```

#### Backend (Supabase RLS)

As políticas de Row Level Security (RLS) já estão configuradas para isolar dados por `company_id`. O frontend apenas precisa passar o `company_id` correto nas queries.

### Deploy do Banco de Dados

#### Supabase (Backend Recomendado)

1. Crie projeto no Supabase
2. Execute `supabase-schema.sql`
3. Configure variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Monitoramento e Logs

- **Netlify:** Logs disponíveis no painel
- **Vercel:** Analytics integrado
- **Supabase:** Logs de banco de dados e API

---

## 📚 Guia do Usuário

### Para Administradores

#### Primeiro Acesso

1. Acesse **🎨 Construtor de Sites**
2. Crie seu primeiro layout
3. Adicione componentes essenciais:
   - Header (com logo da empresa)
   - Hero (mensagem de boas-vindas)
   - Property Grid (mostrar imóveis)
   - Contact Form (formulário de contato)
   - Footer
4. Salve e publique

#### Configurar Domínio

1. Acesse **🌐 Domínios**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde verificação (1-48h)
5. Habilite SSL
6. Defina como domínio principal

#### Manutenção

- **Atualizar Conteúdo**: Edite layouts existentes
- **Adicionar Páginas**: Crie novos layouts do tipo "custom"
- **Monitorar SSL**: Verifique data de expiração
- **Testar Site**: Acesse via domínio personalizado

### Para Usuários Finais

Seus clientes verão:
- Site profissional com domínio próprio
- Lista de imóveis atualizada
- Formulário de contato funcional
- Design responsivo em mobile
- Certificado SSL (cadeado verde)

### Limitações Atuais

- Máximo 20 imagens por imóvel
- Máximo 3 vídeos por imóvel
- SSL renovado a cada 90 dias (automático)
- Propagação DNS pode levar até 48h

---

## 🔧 Troubleshooting

### Problema: DNS não propaga
**Solução**: 
- Aguarde até 48h
- Verifique registros com: `nslookup minhaimo.com.br`
- Confirme valores corretos no provedor

### Problema: SSL não habilita
**Solução**:
- Verifique se DNS está configurado
- Aguarde propagação completa
- Tente novamente após 24h

### Problema: Site não carrega
**Solução**:
- Verifique status do domínio (deve estar "Ativo")
- Confirme que layout está publicado
- Limpe cache do navegador
- Verifique logs do servidor

### Problema: Componentes não aparecem
**Solução**:
- Salve o layout
- Publique novamente
- Verifique configurações do componente
- Recarregue a página

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte logs do navegador (F12)
3. Entre em contato com suporte técnico

---

## 🚀 Próximas Funcionalidades

- [ ] Editor de temas avançado
- [ ] Mais componentes (blog, FAQ, etc)
- [ ] A/B Testing de layouts
- [ ] Analytics integrado
- [ ] Editor de CSS customizado
- [ ] Biblioteca de templates prontos

---

**Versão**: 1.0  
**Data**: 2024  
**Sistema**: CRM Imobiliário Multi-tenant
