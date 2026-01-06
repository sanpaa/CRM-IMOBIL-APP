# Melhorias do Módulo de Visitas

## Visão Geral

O módulo de VISITAS foi melhorado para suportar a geração de PDF de Roteiro de Visita, mantendo o fluxo principal intacto.

## Alterações Implementadas

### 1. Expansão do Modelo de Dados

A entidade `Visit` foi expandida para incluir:

#### Vínculos Adicionais
- **cliente** (`client_id`): Referência ao cliente que participará da visita
- **corretor** (`broker_id`): Referência ao corretor responsável pela visita  
- **proprietário** (`owner_id`): Referência ao proprietário do imóvel

#### Múltiplos Imóveis por Visita
Uma visita agora pode conter um ou mais imóveis, cada um com:
- Referência do imóvel
- Endereço completo
- Empreendimento (opcional)
- Dormitórios, suítes, banheiros, vagas
- Área total e área construída
- Valor de venda sugerido

#### Avaliação do Cliente
Após a visita ser realizada, é possível registrar avaliações para cada imóvel:
- Estado de conservação (nota 1 a 5)
- Localização (nota 1 a 5)
- Valor do imóvel (nota 1 a 5)
- Nível de interesse:
  - DESCARTOU
  - INTERESSOU
  - INTERESSOU_E_ASSINOU_PROPOSTA

### 2. Banco de Dados

#### Migration SQL
Execute o arquivo `migration-visit-improvements.sql` no seu banco de dados Supabase para:
- Adicionar novos campos à tabela `visits`
- Criar tabela `visit_properties` para armazenar múltiplos imóveis
- Criar tabela `visit_evaluations` para armazenar avaliações
- Criar índices para melhor performance

### 3. Novos Componentes e Serviços

#### VisitFormComponent
- Formulário modal completo para criar/editar visitas
- Permite adicionar múltiplos imóveis
- Exibe campos de avaliação quando status = "Realizada"
- Validação de campos conforme regras de negócio

#### VisitPdfService
- Gera PDF formatado no padrão A4
- Inclui todos os dados da visita:
  - Informações básicas (data, horário, status)
  - Participantes (cliente, corretor, proprietário)
  - Lista de imóveis com detalhes
  - Avaliações do cliente (quando disponível)
  - Observações
- Quebra automática de página para múltiplos imóveis

#### VisitService (expandido)
Novos métodos adicionados:
- `getVisitWithDetails()`: Busca visita com todos os dados relacionados
- `getVisitProperties()`: Lista imóveis de uma visita
- `addVisitProperty()`: Adiciona imóvel à visita
- `updateVisitProperty()`: Atualiza dados de um imóvel
- `deleteVisitProperty()`: Remove imóvel da visita
- `getVisitEvaluations()`: Lista avaliações da visita
- `addVisitEvaluation()`: Adiciona avaliação
- `updateVisitEvaluation()`: Atualiza avaliação
- `deleteVisitEvaluation()`: Remove avaliação

### 4. Interface do Usuário

#### Tela de Listagem (mantida intacta)
A tela existente continua exibindo:
- Data
- Horário
- Status
- Observações
- Ações: Editar, Excluir, **Gerar PDF** (novo)

#### Formulário de Edição (melhorado)
- Modal completo com todas as seções
- Seleção de cliente, corretor e proprietário
- Gestão de múltiplos imóveis (adicionar/remover)
- Campos de avaliação (visíveis apenas quando status = "Realizada")
- Interface responsiva e intuitiva

## Regras de Negócio

1. **Criação de Visita**
   - Visita pode ser criada apenas com data, hora e status "Agendada"
   - Vínculos e imóveis podem ser adicionados posteriormente

2. **Avaliações**
   - Só podem ser preenchidas quando status = "Realizada"
   - Ficam bloqueadas quando status = "Cancelada"

3. **Observações**
   - Permanecem livres em qualquer status

4. **PDF**
   - Pode ser gerado a qualquer momento
   - Exibe todos os dados disponíveis no momento da geração

## Como Usar

### 1. Aplicar Migration
```sql
-- Execute o arquivo migration-visit-improvements.sql no Supabase SQL Editor
```

### 2. Criar Nova Visita
1. Clique em "+ Nova Visita"
2. Preencha data, horário e status
3. Selecione cliente, corretor e proprietário (opcional)
4. Adicione imóveis clicando em "+ Adicionar Imóvel"
5. Preencha os detalhes de cada imóvel
6. Salve a visita

### 3. Editar Visita
1. Clique em "Editar" na listagem
2. Atualize os campos necessários
3. Adicione ou remova imóveis
4. Se status = "Realizada", preencha as avaliações
5. Salve as alterações

### 4. Gerar PDF
1. Clique em "Gerar PDF" na listagem
2. O PDF será baixado automaticamente
3. O arquivo terá o nome: `roteiro-visita-{data}.pdf`

## Estrutura de Arquivos

```
src/app/
├── models/
│   └── visit.model.ts (expandido)
├── services/
│   ├── visit.service.ts (expandido)
│   └── visit-pdf.service.ts (novo)
└── components/
    └── visits/
        ├── visit-list.component.ts (atualizado)
        └── visit-form.component.ts (novo)

migration-visit-improvements.sql (novo)
```

## Dependências Adicionadas

- `jspdf`: ^2.5.2 - Geração de PDF
- `jspdf-autotable`: ^3.8.3 - Tabelas no PDF

## Compatibilidade

- Angular 17+
- Supabase 2.38+
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

## Melhorias Futuras Sugeridas

1. Upload de imagens dos imóveis
2. Assinatura digital no PDF
3. Envio automático do PDF por email
4. Templates personalizados de PDF
5. Histórico de alterações da visita
6. Integração com Google Maps para rotas

## Suporte

Para dúvidas ou problemas, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.
