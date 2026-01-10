# 🔐 Guia de Segurança

## Relatando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, por favor **NÃO** abra uma issue pública. 

Em vez disso:
1. Envie um email para: security@example.com (substitua com email real)
2. Descreva a vulnerabilidade em detalhes
3. Inclua passos para reproduzir
4. Aguarde resposta em até 48 horas

## Boas Práticas Implementadas

### Autenticação
- ✅ Supabase Auth com JWT
- ✅ Tokens seguros e renovação automática
- ✅ Logout em todos os dispositivos
- ✅ Reset de senha seguro
- ✅ Timeout automático por inatividade (15 minutos)

### Autorização
- ✅ Row Level Security (RLS) no banco
- ✅ Políticas por role (admin, gestor, corretor)
- ✅ Validação no backend e frontend
- ✅ Guards de rota no Angular

### Dados
- ✅ Isolamento multi-tenant via company_id
- ✅ Criptografia em trânsito (HTTPS/TLS)
- ✅ Criptografia em repouso (Supabase)
- ✅ Backup automático diário

### Frontend
- ✅ Sanitização de inputs
- ✅ Proteção contra XSS
- ✅ CSRF tokens quando aplicável
- ✅ Headers de segurança

### API/Banco
- ✅ Rate limiting
- ✅ Prepared statements (proteção SQL injection)
- ✅ Validação de tipos
- ✅ CORS configurado

## Configurações Recomendadas

### Supabase

#### RLS (Row Level Security)
Todas as tabelas devem ter RLS habilitado:
```sql
ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;
```

#### Políticas de Storage
Para o bucket de attachments:
```sql
-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Permitir download apenas da própria empresa
CREATE POLICY "Users can download own company files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'attachments' AND 
       (storage.foldername(name))[1] = auth.uid()::text);
```

### Headers de Segurança

Configure no seu servidor/CDN:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Variáveis de Ambiente

**NUNCA** comite:
- Chaves secretas
- Senhas
- Tokens de API
- Credenciais do banco

Use `.env` e adicione ao `.gitignore`:
```bash
# .gitignore
.env
.env.local
.env.*.local
```

## Checklist de Segurança

### Deploy
- [ ] HTTPS habilitado
- [ ] Certificado SSL válido
- [ ] Headers de segurança configurados
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] Logs de segurança habilitados

### Código
- [ ] Sem senhas hardcoded
- [ ] Sem chaves de API expostas
- [ ] Inputs sanitizados
- [ ] Queries parametrizadas
- [ ] Errors não expõem dados sensíveis

### Banco de Dados
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS testadas
- [ ] Backup automático configurado
- [ ] Usuários com privilégios mínimos
- [ ] Auditoria habilitada

### Monitoramento
- [ ] Logs de acesso
- [ ] Alertas de tentativas suspeitas
- [ ] Monitoramento de taxa de erros
- [ ] Tracking de sessões

## Atualizações de Segurança

Mantenha sempre atualizado:
- Angular e dependências
- Supabase SDK
- Node.js
- Bibliotecas npm

Verifique vulnerabilidades:
```bash
npm audit
npm audit fix
```

## Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security](https://angular.io/guide/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)

## Contato

Para questões de segurança: security@example.com
