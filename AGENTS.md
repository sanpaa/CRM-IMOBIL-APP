# PROMPT PARA MEU AGENT (REFATORAÇÃO COMPLETA DO SISTEMA DE CRIAÇÃO DE SITES)

Você é um **arquiteto de software sênior e designer de produto SaaS**, especialista em **Angular, GrapesJS, sistemas de templates, sincronização frontend/backend e UX para plataformas no-code simples**.

Meu objetivo é **transformar meu sistema de criação de sites imobiliários em algo MUITO SIMPLES para o cliente e FÁCIL de manter tecnicamente**.

Hoje o sistema está complexo, difícil de sincronizar, difícil de criar novos componentes reutilizáveis e sem um bom fluxo de templates.

---

# 🎯 OBJETIVO FINAL

Quero um sistema onde o cliente:

1. Escolhe um **template pronto**
2. Personaliza apenas:

   * Nome da imobiliária
   * Logo
   * Cor principal
   * WhatsApp / Contato
   * Textos principais
3. Clica em **Publicar**

Sem editor visual avançado.
Sem arrastar blocos.
Sem quebrar layout.

E eu, como desenvolvedor, consigo:

* Criar novos templates facilmente
* Criar novos componentes reutilizáveis
* Manter sincronização simples entre editor, banco e site público

---

# 🧱 ARQUITETURA QUE VOCÊ DEVE PROPOR

## 1. Separação Clara de Responsabilidades

Crie três camadas:

### A) Template (controlado por mim)

* Define layout
* Define seções
* Define estrutura visual

### B) Configuração do Cliente (controlado pelo cliente)

* Cores
* Textos
* Logo
* Contatos

### C) Renderizador do Site Público

* Apenas consome Template + Configuração
* Nunca salva layout

---

# 📦 FORMATO PADRÃO DE TEMPLATE

Cada template deve ser um **JSON simples e versionado**, por exemplo:

```json
{
  "id": "luxo-imobiliario-v1",
  "name": "Luxo Imobiliário",
  "preview": "/previews/luxo.png",
  "sections": [
    "hero",
    "imoveis",
    "sobre",
    "contato"
  ],
  "theme": {
    "fonts": {
      "title": "Playfair Display",
      "body": "Inter"
    },
    "defaults": {
      "primaryColor": "#C9A24D",
      "secondaryColor": "#0F172A"
    }
  }
}
```

---

# 🧩 COMPONENTES REUTILIZÁVEIS

Você deve projetar um **sistema de blocos fixos**, como:

* HeroSection
* ImoveisGrid
* SobreSection
* ContatoSection
* Footer

Cada bloco deve:

* Receber apenas um `config` JSON
* Nunca conhecer o template inteiro

Exemplo:

```ts
renderHero(config) {
  title = config.companyName
  color = config.primaryColor
}
```

---

# 🔄 SINCRONIZAÇÃO SIMPLES (PONTO CRÍTICO)

Você deve criar um fluxo assim:

## Backend

Salva apenas:

```json
{
  "siteId": "123",
  "templateId": "luxo-imobiliario-v1",
  "config": {
    "companyName": "Imobiliária Silva",
    "logo": "/uploads/logo.png",
    "primaryColor": "#2563EB",
    "whatsapp": "11999999999",
    "heroText": "Encontre seu imóvel ideal"
  }
}
```

## Frontend

1. Carrega Template pelo `templateId`
2. Mescla com `config`
3. Renderiza componentes

Nunca salvar HTML.
Nunca salvar CSS.

---

# 🛠️ GRAPESJS (SE USAR)

Use GrapesJS SOMENTE para:

* Criar templates
* Exportar JSON
* Versionar layouts

O cliente NUNCA deve acessar o editor.

---

# 🎨 PAINEL DO CLIENTE (UX OBRIGATÓRIO)

Você deve projetar uma tela com:

* Campo: Nome da Imobiliária
* Upload: Logo
* Color Picker: Cor principal
* Campo: WhatsApp
* Campo: Texto da Home

Cada mudança deve:

* Atualizar preview em tempo real
* Salvar automaticamente

---

# 📑 TEMPLATES QUE VOCÊ DEVE ENTREGAR

Você deve gerar pelo menos **3 templates completos**, incluindo:

## 1. Clássico Imobiliária

* Fundo claro
* Azul/Verde
* Grid de imóveis
* CTA WhatsApp

## 2. Moderno Dark

* Fundo escuro
* Hero grande
* Cards com sombra
* Fonte moderna

## 3. Alto Padrão

* Preto + dourado
* Tipografia elegante
* Layout espaçado
* Poucos imóveis, muito impacto

Cada template deve vir com:

* JSON
* HTML base
* CSS base

---

# ⚙️ STACK TÉCNICO

Leve em consideração:

* Angular
* PrimeNG / Tailwind
* Backend REST

Evite:

* Lógica complexa
* Dependência entre componentes

---

# 🧠 PRINCÍPIOS QUE VOCÊ DEVE SEGUIR

* Simplicidade > Flexibilidade
* Produto > Editor
* Controle do layout é MEU
* Cliente só personaliza, não constrói

---

# 📤 SAÍDA QUE EU QUERO DE VOCÊ

Você deve me entregar:

1. Arquitetura técnica explicada
2. Fluxo de dados (editor → banco → site)
3. Estrutura de pastas
4. Exemplo de código Angular para renderização
5. 3 templates prontos
6. Checklist para criar novos templates em menos de 30 minutos

---

# 🚨 REGRA FINAL

Se em qualquer parte da solução você estiver tornando o sistema mais complexo do que isso:

> Você está errando.

O foco é:
**VENDER SITE PARA IMOBILIÁRIA, NÃO CRIAR UM WORDPRESS NOVO.**
