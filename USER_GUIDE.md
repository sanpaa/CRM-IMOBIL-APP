# 🎯 Guia Rápido de Uso - CRM Imobiliário

## Como Usar as Novas Funcionalidades

Este guia mostra como usar todas as funcionalidades implementadas.

---

## 🚀 Primeiros Passos

### 1. Migrar o Banco de Dados

No **Supabase SQL Editor**, execute:
```sql
-- Cole e execute o conteúdo do arquivo:
migration-crm-improvements.sql
```

Isso criará:
- Tabela de anotações de clientes
- Tabela de proprietários
- Tabela de configurações de lembretes
- Novos campos em clientes e imóveis

### 2. Acessar o Sistema

Faça login como **administrador** para ter acesso completo às configurações.

---

## 📋 Gestão de Clientes

### Cadastrar Novo Cliente

1. Clique em **"Clientes"** no menu
2. Clique em **"+ Novo Cliente"**
3. Preencha o formulário no modal:
   - Nome (obrigatório)
   - CPF (formato: 000.000.000-00)
   - Email, Telefone, WhatsApp
   - Origem (ex: "Site", "Indicação")
   - Status (Lead, Interessado, Fechamento, Cliente)
   - **Interesse** (ex: "Apartamento 2 quartos no centro")
   - Observações
4. Clique em **"Salvar"**

### Filtrar Clientes

Use os filtros no topo da página:
- **Buscar**: Digite nome, email, telefone ou CPF
- **Status**: Selecione um status específico
- Clique em **"Limpar Filtros"** para resetar

### Adicionar Anotações

1. Na lista de clientes, clique em **"Anotações"**
2. Visualize anotações anteriores
3. Digite nova anotação no campo
4. Clique em **"Adicionar Anotação"**

⚠️ **Importante**: Anotações não podem ser deletadas!

### Status Visual

O status aparece como badge colorido ao lado do nome:
- 🔵 **Lead**: Azul
- 🟡 **Interessado**: Amarelo  
- 🔴 **Fechamento**: Rosa
- 🟢 **Cliente**: Verde

---

## 🏠 Gestão de Imóveis

### Cadastrar Novo Imóvel

1. Clique em **"Imóveis"** no menu
2. Clique em **"+ Novo Imóvel"**
3. Preencha o formulário por seções:

**Informações Básicas**:
- Título e Descrição
- Tipo (Apartamento, Casa, Terreno, Comercial)
- Preço
- **Proprietário** (selecione da lista)
- Contato

**Características**:
- Quartos, Banheiros
- Área (m²)
- Vagas de garagem

**Endereço**:
- CEP, Rua, Bairro
- Cidade, Estado

**Status**:
- Destacado (sim/não)
- Vendido (sim/não)

4. Clique em **"Salvar"**

### Filtrar Imóveis

Use os múltiplos filtros:
- **Buscar**: Título, endereço, bairro
- **Tipo**: Apartamento, Casa, etc.
- **Cidade**: Digite para filtrar
- **Status**: Disponível ou Vendido

---

## 👤 Gestão de Proprietários

### Cadastrar Proprietário

1. Clique em **"Proprietários"** no menu
2. Clique em **"+ Novo Proprietário"**
3. Preencha:
   - Nome
   - CPF (opcional)
   - Telefone, WhatsApp
   - Email
   - Observações
4. Clique em **"Salvar"**

### Ver Imóveis do Proprietário

1. Na lista de proprietários
2. Clique em **"Imóveis"**
3. Visualize todos os imóveis vinculados

### Vincular Imóvel a Proprietário

1. Vá em **Imóveis**
2. Crie/Edite um imóvel
3. Na seção "Informações Básicas"
4. Selecione o proprietário no dropdown

---

## ⚙️ Configurações do Sistema

**Acesso**: Apenas **administradores**

### Configurar Lembretes

1. Clique em **"Configurações"** no menu
2. Na seção **"Sistema de Lembretes"**:
   - Defina os dias (padrão: 15)
   - Ative os canais desejados:
     - 📧 Email
     - 📱 SMS
     - 💬 WhatsApp

### Informações de Contato

1. Na seção **"Informações de Contato"**
2. Preencha:
   - Email de contato
   - Telefone
   - WhatsApp
3. Clique em **"Salvar Configurações"**

---

## 🔔 Como Funciona o Sistema de Lembretes

### Rastreamento Automático

O sistema monitora automaticamente:
- Quando o status de um cliente muda
- Quanto tempo passou desde a última mudança

### Alertas

Quando um cliente fica **X dias** (configurável) sem mudança de status:
- O sistema identifica automaticamente
- Corretor responsável deve ser notificado
- Canais: Email, SMS ou WhatsApp (conforme configurado)

### Clientes Monitorados

- ✅ Lead
- ✅ Interessado  
- ✅ Fechamento
- ❌ Cliente (não gera alertas)

⚠️ **Nota**: Para envio automático de alertas, é necessário backend adicional.

---

## 🔐 Controle de Acesso

### O que cada perfil pode fazer:

#### Administrador
- ✅ Tudo
- ✅ Excluir clientes, imóveis, proprietários
- ✅ Alterar configurações

#### Gestor
- ✅ Ver todos os dados
- ✅ Gerenciar equipe
- ❌ Não pode excluir
- ❌ Não pode alterar configurações

#### Corretor
- ✅ Ver dados atribuídos
- ✅ Gerenciar visitas
- ❌ Não pode excluir
- ❌ Não pode alterar configurações

---

## 📊 Dicas de Uso

### Fluxo Recomendado

1. **Cadastrar Proprietários** primeiro
2. **Cadastrar Imóveis** e vincular aos proprietários
3. **Cadastrar Clientes** conforme chegam leads
4. **Atualizar Status** regularmente
5. **Adicionar Anotações** importantes
6. **Usar Filtros** para encontrar informações rapidamente

### Melhores Práticas

- 📝 **Anotações**: Use para registrar conversas importantes
- 🎯 **Interesse**: Seja específico (ex: "Apto 3 quartos até R$300k")
- 🔄 **Status**: Atualize sempre que houver progresso
- 🔍 **CPF**: Preencha para evitar duplicatas
- 📞 **Contatos**: Mantenha telefone e WhatsApp atualizados

---

## 🆘 Problemas Comuns

### "Não consigo excluir"
→ Verifique se você é administrador

### "Filtros não funcionam"
→ Certifique-se de que os dados foram salvos

### "Modal não abre"
→ Recarregue a página (F5)

### "CPF não formata"
→ Digite apenas números (será formatado automaticamente)

---

## 📱 Acesso Mobile

Todos os componentes são **responsivos**:
- Modais se adaptam à tela
- Tabelas rolam horizontalmente
- Filtros empilham verticalmente
- Botões otimizados para toque

---

## 🎓 Vídeo Tutorial

Para um guia visual completo:
1. Acesse cada seção do sistema
2. Experimente criar registros de teste
3. Teste todos os filtros
4. Configure lembretes
5. Explore as anotações

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte `IMPLEMENTATION_DETAILS.md` para detalhes técnicos
- Veja `SUMMARY.md` para visão geral do projeto
- Leia `README.md` para informações gerais

---

**Última atualização**: 30/12/2024  
**Versão do Sistema**: 2.0.0
