# Guia de Teste - Funcionalidade de Anexo de Documentos

## Pré-requisitos

### 1. Configurar Bucket no Supabase Storage

Antes de testar, você precisa criar o bucket `property-documents` no Supabase:

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **Storage** no menu lateral
4. Clique em **New Bucket**
5. Configure o bucket:
   - **Name**: `property-documents`
   - **Public**: Marque como público para permitir acesso às URLs
   - Clique em **Create bucket**

### 2. Aplicar Migration no Banco de Dados

Execute o arquivo `migration-add-document-urls.sql` no seu banco de dados Supabase:

1. Vá para **SQL Editor** no painel do Supabase
2. Copie o conteúdo do arquivo `migration-add-document-urls.sql`
3. Cole no editor e execute (clique em **Run**)

## Como Testar a Funcionalidade

### Teste 1: Adicionar Novo Imóvel com Documentos

1. Faça login no sistema CRM
2. Navegue para **Imóveis**
3. Clique em **+ Novo Imóvel**
4. Preencha os campos obrigatórios:
   - Título
   - Descrição
   - Tipo
   - Preço
   - Contato
5. Role até a seção **Documentos**
6. Clique em **Escolher arquivos**
7. Selecione um ou mais documentos (PDF, DOC, DOCX, XLS, XLSX, ou TXT)
8. Verifique que os documentos aparecem na lista com ícones apropriados
9. Clique em **Salvar**
10. Aguarde o upload completar

**Resultado Esperado:**
- O imóvel deve ser criado com sucesso
- Os documentos devem ser enviados para o Supabase Storage
- A lista de imóveis deve mostrar o novo imóvel

### Teste 2: Remover Documento Antes de Salvar

1. Clique em **+ Novo Imóvel**
2. Preencha os campos obrigatórios
3. Adicione 2-3 documentos
4. Clique no botão **×** em um dos documentos
5. Verifique que o documento foi removido da lista
6. Clique em **Salvar**

**Resultado Esperado:**
- Apenas os documentos que não foram removidos devem ser salvos

### Teste 3: Editar Imóvel e Adicionar Mais Documentos

1. Na lista de imóveis, clique em **Editar** em um imóvel que já tem documentos
2. Role até a seção **Documentos**
3. Verifique que os documentos existentes aparecem em **Documentos anexados**
4. Adicione novos documentos
5. Verifique que aparecem em **Novos documentos**
6. Clique em **Salvar**

**Resultado Esperado:**
- Os documentos existentes são mantidos
- Os novos documentos são adicionados
- O limite total de 10 documentos é respeitado

### Teste 4: Remover Documento Existente

1. Edite um imóvel que tem documentos
2. Na seção **Documentos anexados**, clique no **×** de um documento
3. Clique em **Salvar**

**Resultado Esperado:**
- O documento deve ser removido da lista
- Os outros documentos permanecem intactos

### Teste 5: Verificar Limite de 10 Documentos

1. Tente adicionar mais de 10 documentos em um único imóvel
2. Ou edite um imóvel com documentos existentes e tente adicionar mais documentos até ultrapassar 10

**Resultado Esperado:**
- O sistema deve exibir um alerta informando que o limite é de 10 documentos
- Apenas os primeiros documentos até o limite devem ser adicionados

### Teste 6: Validação de Tipos de Arquivo

1. Tente adicionar um arquivo que não seja PDF, DOC, DOCX, XLS, XLSX ou TXT (ex: .jpg, .png)
2. O campo de input deve bloquear automaticamente (accept attribute)

**Resultado Esperado:**
- Apenas arquivos dos tipos permitidos devem aparecer no seletor de arquivos

## Verificações Adicionais

### Verificar Storage no Supabase

1. Após fazer upload de documentos, vá para **Storage** > **property-documents** no Supabase
2. Navegue pela estrutura de pastas: `{company_id}/{property_id}/`
3. Verifique que os arquivos foram salvos corretamente

### Verificar Banco de Dados

1. Vá para **Table Editor** no Supabase
2. Abra a tabela **properties**
3. Encontre o imóvel que você editou
4. Verifique a coluna **document_urls**
5. Deve conter um array com as URLs dos documentos

## Possíveis Problemas e Soluções

### Erro: "Bucket não encontrado"
**Solução**: Certifique-se de criar o bucket `property-documents` no Supabase Storage (veja Pré-requisitos)

### Erro: "Permission denied"
**Solução**: Configure as políticas de acesso (RLS) para o bucket no Supabase

### Documentos não aparecem após salvar
**Solução**: 
1. Verifique o console do navegador (F12) para erros
2. Verifique se o bucket está público
3. Verifique se a migration foi aplicada corretamente

## Ícones de Documentos

O sistema exibe ícones diferentes baseados na extensão do arquivo:
- 📄 - PDF
- 📝 - DOC, DOCX
- 📊 - XLS, XLSX
- 📃 - TXT
- 📎 - Outros formatos
