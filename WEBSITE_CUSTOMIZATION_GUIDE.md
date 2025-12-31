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

### Adicionando um Domínio

1. Clique em **➕ Adicionar Domínio**
2. Preencha:
   - **Domínio**: Ex: minhaimo.com.br
   - **Subdomínio** (opcional): Ex: www
3. Clique em **Adicionar**
4. Anote as instruções de configuração DNS

### Configurando DNS

Após adicionar o domínio, você verá 3 registros DNS necessários:

#### 1. Registro A
```
Tipo: A
Host: @
Valor: [IP_DO_SERVIDOR]
TTL: 3600
```

#### 2. Registro CNAME
```
Tipo: CNAME
Host: www
Valor: minhaimo.com.br
TTL: 3600
```

#### 3. Registro TXT (Verificação)
```
Tipo: TXT
Host: _verification
Valor: crm-verify-[TOKEN_ÚNICO]
TTL: 3600
```

### Passo a Passo por Provedor

#### Registro.br
1. Acesse o painel do Registro.br
2. Vá em "DNS" → "Editar Zona"
3. Adicione os 3 registros
4. Aguarde propagação (até 48h)

#### GoDaddy
1. Acesse "Meus Domínios"
2. Clique em "Gerenciar DNS"
3. Adicione os registros
4. Salve alterações

#### Hostgator
1. Painel cPanel
2. Seção "Domínios" → "Editor de Zona"
3. Adicione registros
4. Salve

### Verificando o Domínio

1. Aguarde propagação DNS (1-48 horas)
2. Na interface de domínios, clique em **✅ Verificar**
3. Se bem-sucedido, status muda para "Verificado"

### Habilitando SSL

1. Após verificação, clique em **🔒 Habilitar SSL**
2. O sistema gerará automaticamente um certificado Let's Encrypt
3. Certificado é válido por 90 dias e renovado automaticamente
4. Status muda para "Ativo"

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

## ⚙️ Configuração do Servidor

### Requisitos

- **Servidor**: Linux (Ubuntu 20.04+ recomendado)
- **Web Server**: Nginx ou Apache
- **Node.js**: 18+
- **SSL**: Certbot (Let's Encrypt)
- **Banco de Dados**: PostgreSQL (via Supabase)

### Configuração do Nginx

#### 1. Instalar Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 2. Configurar Domínio Principal
Crie `/etc/nginx/sites-available/crm-imobil`:

```nginx
# Servidor principal do CRM
server {
    listen 80;
    server_name crm.seuservidor.com;

    root /var/www/crm-imobil-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. Configurar Sites Personalizados
Crie `/etc/nginx/sites-available/custom-domains`:

```nginx
# Captura todos os domínios personalizados
server {
    listen 80 default_server;
    server_name _;

    root /var/www/crm-imobil-app/dist;
    index index.html;

    # Redireciona para rota de site público baseado em domínio
    location / {
        # Detecta company_id pelo domínio no backend
        # e redireciona para rota correta
        try_files $uri $uri/ /index.html;
    }

    # Headers para identificação de domínio
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 4. Habilitar Sites
```bash
sudo ln -s /etc/nginx/sites-available/crm-imobil /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/custom-domains /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Instalando SSL (Certbot)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado para domínio
sudo certbot --nginx -d minhaimo.com.br -d www.minhaimo.com.br

# Renovação automática (já configurada)
sudo certbot renew --dry-run
```

### Backend: Identificação por Domínio

Para identificar a empresa pelo domínio, você precisará de um middleware no backend (Node.js/Express exemplo):

```javascript
// middleware/domainResolver.js
const resolveCompanyByDomain = async (req, res, next) => {
  const host = req.headers.host;
  
  // Buscar company_id pelo domínio
  const { data: domain } = await supabase
    .from('custom_domains')
    .select('company_id')
    .eq('domain', host)
    .eq('status', 'active')
    .single();
  
  if (domain) {
    req.companyId = domain.company_id;
  }
  
  next();
};

// Aplicar em rotas públicas
app.use('/public/*', resolveCompanyByDomain);
```

### Deploy

#### Build do Angular
```bash
cd /home/runner/work/CRM-IMOBIL-APP/CRM-IMOBIL-APP
npm install
npm run build --prod
```

#### Deploy dos Arquivos
```bash
# Copiar para servidor
sudo cp -r dist/crm-imobil-app/* /var/www/crm-imobil-app/dist/
sudo chown -R www-data:www-data /var/www/crm-imobil-app/
sudo chmod -R 755 /var/www/crm-imobil-app/
```

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
