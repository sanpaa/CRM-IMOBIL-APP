# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-12-30

### Adicionado
- Sistema completo de CRM multi-tenant para imobiliárias
- Autenticação com Supabase Auth
- Gestão de Clientes/Leads com atribuição de corretor
- Gestão de Imóveis com valores, IPTU e condomínio
- Agenda de Visitas com status de acompanhamento
- Funil de Negócios com visualização Kanban
- Sistema de Notificações em tempo real
- Log de Atividades automático
- Suporte a anexos via Supabase Storage
- Row Level Security (RLS) para isolamento de dados
- Controle de acesso baseado em roles (admin, gestor, corretor)
- Interface responsiva com design moderno
- Documentação completa em português

### Database
- Tabela `companies` para multi-tenant
- Tabela `users` vinculada ao auth.users
- Tabela `clients` para leads e clientes
- Tabela `properties` para cadastro de imóveis
- Tabela `visits` para agenda de visitas
- Tabela `deals` para negócios e propostas
- Tabela `attachments` para documentos
- Tabela `activity_logs` para histórico
- Tabela `notifications` para notificações
- Políticas RLS em todas as tabelas
- Índices para otimização de performance

### Frontend
- Angular 17 com Standalone Components
- Services para todas as entidades
- Guards de autenticação
- Componentes de Login e Registro
- Dashboard com estatísticas
- CRUD completo para todas entidades
- Roteamento lazy loading

### Documentação
- README.md completo em português
- Guia de deployment (DEPLOYMENT.md)
- Guia de contribuição (CONTRIBUTING.md)
- Schema SQL documentado
- Exemplo de configuração de ambiente

## [Unreleased]

### Planejado
- [ ] Upload de múltiplas fotos para imóveis
- [ ] Integração com WhatsApp Business API
- [ ] Relatórios e dashboards analíticos
- [ ] Exportação de dados (PDF, Excel)
- [ ] Sistema de templates de email
- [ ] Integração com Calendário Google
- [ ] App mobile (React Native)
- [ ] Sistema de comissões
- [ ] Integração com portais imobiliários
- [ ] Chat interno entre corretores
