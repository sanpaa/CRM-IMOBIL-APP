# Guia de Testes - Sistema de Validação de Login

## Visão Geral
Este documento descreve como testar as melhorias implementadas no sistema de validação de login, especialmente a sincronização entre múltiplas abas.

## Pré-requisitos
- Navegador moderno (Chrome 54+, Firefox 38+, Edge 79+, Safari 15.4+)
- Acesso ao console de desenvolvedor do navegador
- Conta de teste no sistema

## Testes Funcionais

### Teste 1: Sincronização de Login Entre Abas

**Objetivo**: Verificar que o login em uma aba sincroniza todas as outras abas abertas.

**Passos**:
1. Abra o aplicativo em duas abas diferentes do navegador
2. Na Aba 1: Faça login com suas credenciais
3. Na Aba 2: Observe que você é automaticamente autenticado

**Resultado Esperado**:
- ✅ Aba 2 detecta o login e sincroniza automaticamente
- ✅ Usuário não precisa fazer login novamente na Aba 2
- ✅ Console mostra: `📡 Mensagem recebida de outra aba: LOGIN`

**Como Verificar**:
```javascript
// No console da Aba 2, você deve ver:
📡 Mensagem recebida de outra aba: LOGIN
✅ Sessão sincronizada: usuário logado em outra aba
```

---

### Teste 2: Sincronização de Logout Entre Abas

**Objetivo**: Verificar que o logout em uma aba desloga todas as outras abas.

**Passos**:
1. Faça login no aplicativo
2. Abra o aplicativo em duas abas diferentes
3. Na Aba 1: Clique em "Sair" ou "Logout"
4. Na Aba 2: Observe que você é automaticamente deslogado

**Resultado Esperado**:
- ✅ Aba 2 detecta o logout e redireciona para tela de login
- ✅ localStorage é limpo em todas as abas
- ✅ Console mostra: `📡 Logout detectado via storage event` ou `📡 Mensagem recebida de outra aba: LOGOUT`

**Como Verificar**:
```javascript
// No console da Aba 2, você deve ver:
📡 Mensagem recebida de outra aba: LOGOUT
🔄 Redirecionando para login devido a logout em outra aba
```

---

### Teste 3: Detecção de Token Expirado

**Objetivo**: Verificar que tokens expirados são detectados e o usuário é deslogado automaticamente.

**Passos**:
1. Faça login no aplicativo
2. Abra as ferramentas de desenvolvedor (F12)
3. Vá para Application/Storage > Local Storage
4. Encontre o item `auth_token`
5. Copie o token, decodifique o payload (parte do meio entre os pontos)
6. Modifique o campo `exp` para uma data no passado (ex: 1234567890)
7. Re-encode em base64 e salve
8. Tente navegar para uma rota protegida

**Resultado Esperado**:
- ✅ Aplicativo detecta token expirado
- ✅ Usuário é redirecionado para tela de login
- ✅ Console mostra: `⚠️ Token expirou em: [data]`

**Como Verificar**:
```javascript
// No console, você deve ver:
⚠️ Sessão inválida: token expirado
🚫 AuthGuard: Sessão inválida
```

---

### Teste 4: Proteção Contra Race Conditions

**Objetivo**: Verificar que múltiplas tentativas simultâneas de login são bloqueadas.

**Passos**:
1. Abra a tela de login
2. Abra o console de desenvolvedor
3. Execute o seguinte código várias vezes rapidamente:
```javascript
// Simular múltiplas tentativas de login
for(let i = 0; i < 5; i++) {
  console.log('Tentativa', i+1);
}
```
4. Tente fazer login normalmente clicando no botão rapidamente várias vezes

**Resultado Esperado**:
- ✅ Apenas uma requisição de login é processada por vez
- ✅ Tentativas subsequentes são bloqueadas até a primeira completar
- ✅ Console mostra: `⚠️ Login já em andamento, aguarde...`

**Como Verificar**:
```javascript
// No console, você deve ver:
🔐 Chamando backend login
// Se tentar novamente antes de completar:
⚠️ Login já em andamento, aguarde...
```

---

### Teste 5: Validação de Estrutura JWT

**Objetivo**: Verificar que tokens malformados são rejeitados.

**Passos**:
1. Faça login no aplicativo
2. Abra as ferramentas de desenvolvedor
3. Vá para Application > Local Storage
4. Modifique o `auth_token` para um valor inválido:
   - Remova uma parte: `header.payload` (sem signature)
   - Use texto aleatório: `invalid-token`
   - Use JSON inválido
5. Recarregue a página ou tente acessar uma rota protegida

**Resultado Esperado**:
- ✅ Token malformado é detectado
- ✅ Usuário é deslogado automaticamente
- ✅ Console mostra: `⚠️ Token inválido: estrutura JWT incorreta`

**Como Verificar**:
```javascript
// No console, você deve ver:
⚠️ Token inválido: estrutura JWT incorreta
⚠️ Sessão inválida detectada (company_id ausente). Limpando localStorage...
```

---

### Teste 6: Auto-Logout por Expiração

**Objetivo**: Verificar que o sistema faz logout automático quando o token expira.

**Passos**:
1. Faça login no aplicativo
2. No console, observe a mensagem de expiração do token
3. Aguarde o tempo indicado (ou modifique o token para expirar em 1 minuto)

**Resultado Esperado**:
- ✅ Timer é configurado corretamente
- ✅ Ao expirar, usuário é automaticamente deslogado
- ✅ Todas as abas abertas são notificadas

**Como Verificar**:
```javascript
// Logo após o login:
⏰ Token expira em 60 minutos

// Quando o token expira:
⏰ Token expirou! Fazendo logout automático...
📡 Mensagem enviada para outras abas: SESSION_INVALID
```

---

### Teste 7: Fallback para Storage Events

**Objetivo**: Verificar que o fallback funciona em navegadores sem BroadcastChannel.

**Passos**:
1. No console, desabilite BroadcastChannel temporariamente:
```javascript
window.BroadcastChannel = undefined;
```
2. Recarregue a página
3. Repita os Testes 1 e 2

**Resultado Esperado**:
- ✅ Sistema usa Storage Events como fallback
- ✅ Sincronização entre abas ainda funciona
- ✅ Console mostra: `⚠️ BroadcastChannel não disponível neste navegador`

---

### Teste 8: Validação no AuthGuard

**Objetivo**: Verificar que o AuthGuard valida completamente a sessão.

**Passos**:
1. Faça login no aplicativo
2. Tente acessar uma rota protegida (ex: /dashboard)
3. No console, observe as mensagens de validação
4. Modifique o localStorage para invalidar a sessão
5. Tente acessar uma rota protegida novamente

**Resultado Esperado**:
- ✅ Sessão válida permite acesso
- ✅ Sessão inválida redireciona para login
- ✅ Console mostra logs detalhados

**Como Verificar**:
```javascript
// Sessão válida:
✅ AuthGuard: Acesso permitido

// Sessão inválida:
🚫 AuthGuard: Usuário não autenticado
// ou
🚫 AuthGuard: Sessão inválida
```

---

## Testes de Performance

### Teste 9: Performance de Sincronização

**Objetivo**: Medir o tempo de sincronização entre abas.

**Passos**:
1. Abra 10 abas do aplicativo
2. Faça login em uma aba
3. Meça quanto tempo leva para todas as abas sincronizarem

**Resultado Esperado**:
- ✅ Sincronização é quase instantânea (< 100ms)
- ✅ Não há travamentos ou lentidão
- ✅ Todas as abas sincronizam corretamente

---

### Teste 10: Consumo de Memória

**Objetivo**: Verificar que não há vazamentos de memória.

**Passos**:
1. Abra o aplicativo
2. Faça login e logout várias vezes (20-30 vezes)
3. Observe o uso de memória no Task Manager
4. Faça um Heap Snapshot no DevTools

**Resultado Esperado**:
- ✅ Memória se mantém estável
- ✅ Não há acúmulo de listeners ou timers
- ✅ Logout limpa corretamente todos os recursos

---

## Testes de Segurança

### Teste 11: XSS em Mensagens de Erro

**Objetivo**: Verificar que mensagens de erro não expõem informações sensíveis.

**Passos**:
1. Tente fazer login com credenciais inválidas
2. Observe as mensagens de erro
3. Tente injetar código JavaScript nas mensagens

**Resultado Esperado**:
- ✅ Mensagens são genéricas e não expõem detalhes
- ✅ Não é possível injetar código
- ✅ Detalhes técnicos ficam apenas no console

---

### Teste 12: Token Injection

**Objetivo**: Verificar que tokens inválidos não são aceitos.

**Passos**:
1. Tente modificar o token no localStorage
2. Tente injetar código no token
3. Tente usar tokens de outros usuários

**Resultado Esperado**:
- ✅ Tokens modificados são rejeitados
- ✅ Sistema valida assinatura e estrutura
- ✅ Usuário é deslogado automaticamente

---

## Checklist de Validação

Use este checklist para validar todas as funcionalidades:

### Sincronização Entre Abas
- [ ] Login em uma aba sincroniza outras
- [ ] Logout em uma aba sincroniza outras
- [ ] Sessão inválida notifica todas as abas
- [ ] BroadcastChannel funciona corretamente
- [ ] Storage Events funciona como fallback

### Validação de Token
- [ ] Tokens válidos são aceitos
- [ ] Tokens expirados são rejeitados
- [ ] Tokens malformados são rejeitados
- [ ] Timer de expiração funciona
- [ ] Auto-logout funciona corretamente

### Proteção e Segurança
- [ ] Session lock previne race conditions
- [ ] Mensagens de erro não expõem dados
- [ ] Validação de JWT é robusta
- [ ] AuthGuard valida completamente
- [ ] Não há vazamentos de memória

### User Experience
- [ ] Mensagens de erro são claras
- [ ] Sincronização é rápida
- [ ] Logs ajudam no debug
- [ ] Não há travamentos ou bugs visuais

## Troubleshooting

### Problema: Abas não sincronizam
**Solução**: 
- Verifique se o navegador suporta BroadcastChannel
- Certifique-se que as abas estão no mesmo domínio
- Limpe o cache e localStorage

### Problema: Token não expira
**Solução**:
- Verifique se o token tem campo `exp`
- Confirme que a data está em formato Unix timestamp
- Verifique o console para mensagens de erro

### Problema: Muitas requisições de login
**Solução**:
- Session lock deve estar funcionando
- Verifique se `sessionLock` está sendo liberado no `finally`
- Revise os logs no console

## Conclusão

Este guia cobre todos os aspectos críticos do novo sistema de validação de login. Certifique-se de executar todos os testes antes de considerar a implementação completa.

Para reportar problemas ou sugerir melhorias, abra uma issue no repositório.
