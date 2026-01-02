# 🎯 Configurações do Site Público - IMPLEMENTADO

## ✅ O QUE FOI CRIADO

### 1. **Nova Página de Configurações**
- **Localização**: `/public-site-settings`
- **Menu**: Sidebar > Site Público (🌐) - APENAS para admins
- **Arquivos criados**:
  - `public-site-settings.component.ts`
  - `public-site-settings.component.html`
  - `public-site-settings.component.scss`

### 2. **Formulário Completo de Configuração**

#### **HEADER (Cabeçalho)**
- ✅ URL da Logo
- ✅ Mostrar/Esconder Logo (checkbox)
- ✅ Mostrar/Esconder Menu (checkbox)
- ✅ Cor de Fundo (color picker)
- ✅ Cor do Texto (color picker)

#### **FOOTER (Rodapé)**

**Informações da Empresa:**
- ✅ Nome da Empresa (FIXO - readonly)
- ✅ Descrição (textarea editável)
- ✅ URL da Logo (opcional)
- ✅ Mostrar/Esconder Logo (checkbox)

**Informações de Contato:**
- ✅ 📍 Endereço
- ✅ 📞 Telefone
- ✅ ✉️ Email

**Redes Sociais** (aparecem apenas se preenchidos):
- ✅ 📷 Instagram (URL)
- ✅ 📘 Facebook (URL)
- ✅ 💬 WhatsApp (número com DDI)

**Links Rápidos** (gerenciável):
- ✅ Adicionar links
- ✅ Remover links
- ✅ Nome + Rota para cada link

**Serviços** (gerenciável):
- ✅ Adicionar serviços
- ✅ Remover serviços
- ✅ Nome + Rota para cada serviço

**Outras opções:**
- ✅ Mostrar/Esconder Copyright (checkbox)

### 3. **Interface de Gerenciamento**
- Formulário responsivo com grid de 2 colunas
- Color pickers para cores
- Gerenciamento dinâmico de links (adicionar/remover)
- Validação de campos
- Feedback visual (salvando/salvo)

## 📋 COMO FUNCIONA

### **Fluxo de Configuração:**

1. Admin acessa **Sidebar > Site Público**
2. Preenche os campos desejados:
   - Upload/Cole URL da logo
   - Preencha informações de contato
   - Adicione links de redes sociais (opcional)
   - Configure Links Rápidos
   - Configure Serviços
3. Clica em **💾 Salvar Configurações**
4. Sistema salva no backend (TODO: implementar endpoint)

### **Onde os dados são salvos:**

```typescript
// Estrutura que será salva no backend
{
  header_config: {
    logoUrl: "https://...",
    showLogo: true,
    showMenu: true,
    backgroundColor: "#ffffff",
    textColor: "#333333"
  },
  footer_config: {
    companyName: "Minha Imobiliária",
    description: "A melhor imobiliária...",
    logoUrl: "https://...",
    showLogo: false,
    address: "Rua X, 123",
    phone: "(11) 9999-9999",
    email: "contato@empresa.com",
    instagram: "https://instagram.com/...",
    facebook: "https://facebook.com/...",
    whatsapp: "5511999999999",
    quickLinks: [
      { label: "Sobre Nós", route: "/sobre" },
      { label: "Contato", route: "/contato" }
    ],
    services: [
      { label: "Comprar", route: "/imoveis?tipo=venda" },
      { label: "Alugar", route: "/imoveis?tipo=aluguel" }
    ],
    showCopyright: true
  }
}
```

## 🔧 BACKEND - O QUE FALTA IMPLEMENTAR

### **1. Schema do Banco de Dados**

```sql
-- Adicionar colunas na tabela store_settings (ou similar)
ALTER TABLE store_settings 
ADD COLUMN header_config JSONB,
ADD COLUMN footer_config JSONB;
```

### **2. API Endpoints**

```typescript
// GET - Buscar configurações
GET /api/store-settings/:companyId
Response: {
  header_config: {...},
  footer_config: {...}
}

// PUT - Salvar configurações
PUT /api/store-settings/:companyId
Body: {
  header_config: {...},
  footer_config: {...}
}
```

### **3. Service Method**

Adicionar no `company.service.ts`:

```typescript
async updateStoreSettings(companyId: string, settings: any) {
  const { data, error } = await this.supabase.client
    .from('store_settings')
    .update({
      header_config: settings.header_config,
      footer_config: settings.footer_config,
      updated_at: new Date().toISOString()
    })
    .eq('company_id', companyId);
    
  if (error) throw error;
  return data;
}

async getStoreSettings(companyId: string) {
  const { data, error } = await this.supabase.client
    .from('store_settings')
    .select('*')
    .eq('company_id', companyId)
    .single();
    
  if (error) throw error;
  return data;
}
```

### **4. Ativar no Frontend**

No arquivo `public-site-settings.component.ts`, descomentar:

```typescript
// Linha ~68 - loadSettings()
const storeSettings = await this.companyService.getStoreSettings(this.companyId);
this.headerConfig = storeSettings.header_config;
this.footerConfig = storeSettings.footer_config;

// Linha ~93 - saveSettings()
await this.companyService.updateStoreSettings(this.companyId, {
  header_config: this.headerConfig,
  footer_config: this.footerConfig
});
```

## 🎨 EXEMPLO DE USO

### **Cenário: Imobiliária ABC**

1. Admin acessa **Site Público** no menu
2. Configura:
   - Logo: `https://storage.com/logo-abc.png`
   - Endereço: "Rua das Flores, 100 - SP"
   - Telefone: "(11) 3333-4444"
   - Instagram: "https://instagram.com/imobiliariabc"
   - WhatsApp: "5511333334444"
   - Links Rápidos:
     - "Quem Somos" → `/sobre`
     - "Fale Conosco" → `/contato`
   - Serviços:
     - "Comprar Imóvel" → `/imoveis?tipo=venda`
     - "Alugar Imóvel" → `/imoveis?tipo=aluguel`
3. Salva as configurações
4. Site público renderiza automaticamente com essas informações

## 📍 LOCALIZAÇÃO NO CÓDIGO

```
src/app/
├── components/
│   ├── settings/
│   │   ├── public-site-settings.component.ts      ← NOVO
│   │   ├── public-site-settings.component.html    ← NOVO
│   │   └── public-site-settings.component.scss    ← NOVO
│   ├── layout/
│   │   └── main-layout.component.ts               ← ATUALIZADO (menu)
│   └── public-website/
│       └── public-website.component.ts            ← LÊ configurações
├── models/
│   └── company.model.ts                           ← HeaderConfig, FooterConfig
├── shared/
│   └── website-components/
│       ├── header/header.component.ts             ← USA HeaderConfig
│       └── footer/footer.component.ts             ← USA FooterConfig
└── app.routes.ts                                  ← ROTA adicionada
```

## ✅ STATUS ATUAL

- ✅ Interface completa criada
- ✅ Formulários funcionando
- ✅ Validações implementadas
- ✅ Componentes header/footer atualizados para receber configs
- ✅ Rota e menu adicionados
- ⏳ **FALTA**: Endpoints do backend
- ⏳ **FALTA**: Salvar/Carregar do banco de dados

## 🚀 PRÓXIMOS PASSOS

1. **Backend**: Criar tabela/colunas para store_settings
2. **Backend**: Implementar endpoints GET/PUT
3. **Frontend**: Descomentar chamadas de API
4. **Testes**: Testar fluxo completo de salvar/carregar

---

**IMPORTANTE**: Esta página está **separada do Website Builder**. Aqui o admin configura informações fixas do site (logo, contatos, redes sociais). O Website Builder é para montar as páginas com componentes drag-and-drop.
