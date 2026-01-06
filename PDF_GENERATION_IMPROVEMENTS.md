# Melhorias na Geração de PDF - Roteiro de Visita

## Visão Geral

O sistema de geração de PDF para roteiros de visita foi completamente redesenhado para oferecer uma apresentação visual profissional e completa.

## Novas Funcionalidades

### 1. Informações da Empresa (CRECI)

O PDF agora inclui informações completas da empresa:
- **Nome da empresa**
- **Endereço completo**
- **Telefone**
- **CRECI da empresa** (novo campo)
- **Logo da empresa** (placeholder para futura implementação)

### 2. Informações do Corretor

Seção dedicada para o corretor responsável:
- **Nome do corretor**
- **CRECI do corretor** (novo campo)
- **Telefone do corretor** (novo campo)

### 3. Layout Profissional

O PDF apresenta um layout visual melhorado:

#### Cabeçalho
- Bordas superiores e inferiores para destaque
- Logo da empresa (placeholder de 18x18mm)
- Informações da empresa à esquerda
- Informações do corretor responsável à direita

#### Seções
- Títulos de seção com fundo cinza (#f0f0f0)
- Bordas bem definidas ao redor de cada seção
- Conteúdo organizado em colunas quando apropriado

#### Avaliações
- **Ratings visuais**: Caixas numeradas de 1-5, preenchidas em preto para indicar a classificação
- **Checkboxes de interesse**: Caixas com checkmarks (✓) para indicar a opção selecionada

#### Rodapé
- Declaração de visita
- Linhas de assinatura para Cliente, Corretor e Proprietário
- Timestamp de geração do documento

### 4. Suporte Multi-Propriedades

- Cada propriedade gera uma nova página
- Quebra de página automática entre propriedades
- Numeração clara (Imóvel 1, Imóvel 2, etc.)

## Campos de Banco de Dados Adicionados

### Tabela `companies`
```sql
- creci VARCHAR(50)          -- CRECI da empresa
- address TEXT               -- Endereço completo
- logo_url TEXT              -- URL do logo (para futura implementação)
```

### Tabela `users`
```sql
- creci VARCHAR(50)          -- CRECI do corretor
- phone VARCHAR(20)          -- Telefone do corretor
```

## Como Usar

### Configurar Dados da Empresa

1. Acesse as configurações da empresa
2. Preencha os campos:
   - CRECI da Empresa
   - Endereço Completo
   - Telefone
   - (Opcional) URL do Logo

### Configurar Dados do Corretor

1. Acesse o cadastro de usuários/corretores
2. Para cada corretor, preencha:
   - CRECI
   - Telefone

### Gerar PDF

1. Acesse a lista de visitas
2. Clique em "Gerar PDF" na visita desejada
3. O PDF será baixado automaticamente com o nome: `roteiro-visita-[data].pdf`

## Estrutura do PDF

```
┌──────────────────────────────────────────────┐
│ CABEÇALHO                                    │
│ [LOGO] Empresa Info    Corretor Responsável │
│       CRECI: XXXXX            CRECI: XXXXX   │
├──────────────────────────────────────────────┤
│          ROTEIRO DE VISITA                   │
├──────────────────────────────────────────────┤
│ Dados da Visita                              │
│ Data | Horário | Status                      │
├──────────────────────────────────────────────┤
│ Participantes                                │
│ Cliente, Corretor, Proprietário              │
├──────────────────────────────────────────────┤
│ Dados do Imóvel N                            │
│ Referência, Endereço, Características        │
├──────────────────────────────────────────────┤
│ Avaliação do Imóvel (se realizada)           │
│ [■■■■□] Estado de conservação                │
│ [■■■□□] Localização                          │
│ [■■□□□] Valor                                │
│ [✓] Descartou [ ] Interessou                 │
├──────────────────────────────────────────────┤
│ Declaração de Visita                         │
│                                              │
│ _____________  _____________  _____________  │
│   Cliente       Corretor      Proprietário   │
│                                              │
│          Gerado em DD/MM/YYYY HH:MM         │
└──────────────────────────────────────────────┘
```

## Melhorias Visuais

### Antes
- Layout simples baseado em texto
- Sem informações da empresa
- Sem CRECI
- Ratings apenas como texto ("4 de 5 estrelas")
- Sem organização visual clara

### Depois
- Layout profissional com bordas e seções
- Cabeçalho completo com informações da empresa e corretor
- CRECI da empresa e do corretor destacados
- Ratings visuais com caixas preenchidas
- Checkboxes com marcação visual
- Seções bem definidas com títulos em cinza
- Linhas de assinatura profissionais
- Layout A4 otimizado

## Migração de Dados

Execute o arquivo de migração para adicionar os novos campos:

```bash
psql -U your_user -d your_database -f migration-add-company-creci.sql
```

Ou execute manualmente no Supabase SQL Editor.

## Observações Técnicas

- O PDF é gerado usando jsPDF v4.0.0
- Formato: A4 (210mm x 297mm)
- Margens: 15mm em todos os lados
- Fonte: Helvetica
- Tamanhos de fonte: 8-16pt conforme contexto
- Sem dependência de HTML2Canvas para maior confiabilidade

## Próximos Passos Sugeridos

1. ✅ Implementar campos CRECI na interface de cadastro
2. ✅ Adicionar campo de endereço na empresa
3. ✅ Adicionar campo de telefone no corretor
4. 🔄 Implementar upload e exibição de logo da empresa
5. 🔄 Adicionar preview do PDF antes de gerar
6. 🔄 Opção de enviar PDF por email
