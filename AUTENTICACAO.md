# Autenticação do Dashboard

## 📋 Como Funciona

O dashboard agora tem uma página de login que protege o acesso.

### Credenciais Padrão
```
Usuário: admin
Senha: admin123
```

---

## 🔑 Alterar Credenciais

### Método 1: Arquivo login.html (Mais Simples)

Abra `dashboard/login.html` e procure por:

```javascript
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};
```

Altere para seus valores:

```javascript
const VALID_CREDENTIALS = {
  username: 'seu-usuario',
  password: 'sua-senha-super-segura',
};
```

### Método 2: Via Supabase (Mais Seguro - Próxima Atualização)

No futuro, vamos armazenar credenciais no Supabase com hash de senha.

---

## 🔐 Segurança

### Atual (Desenvolvimento)
- Token armazenado em `localStorage`
- Válido por 7 dias
- Apenas verificação básica

### Para Produção
Adicione:
1. ✅ Hash de senhas (bcrypt)
2. ✅ Armazenar no Supabase
3. ✅ JWT tokens com expiração curta
4. ✅ Refresh tokens
5. ✅ Rate limiting no login

---

## 🚀 Fluxo de Login

1. Usuário entra em `dashboard/login.html`
2. Digita usuário + senha
3. Sistema valida credenciais
4. Se correto: gera token e redireciona para `index.html`
5. Se incorreto: mostra erro e pede novamente

---

## 🚪 Logout

1. Clique no botão **"🚪 Sair"** no canto superior direito
2. Confirme saída
3. Será redirecionado para a página de login

---

## 🧪 Debug

Para ver as credenciais no navegador (desenvolvimento apenas):

```
https://seu-dashboard.com/login.html?debug
```

Vai mostrar as credenciais no console.

---

## ❌ Erros Comuns

### "Usuário não encontrado"
- Verifique se digitou corretamente
- Certifique-se de estar usando a mesma capitalização

### "Senha incorreta"
- Verifique maiúsculas/minúsculas
- Senhas diferenciam maiúsculas e minúsculas

### Redireciona direto para login
- Token expirou (7 dias)
- localStorage foi limpo
- Fazer login novamente

---

## 📁 Arquivos Relacionados

- `dashboard/login.html` — Página de login
- `dashboard/index.html` — Dashboard (protegido)
- Proteção adicionada no início do `index.html`

---

## 🔄 Próximas Melhorias

- [ ] 2FA (autenticação dupla)
- [ ] OAuth (Google, GitHub)
- [ ] Múltiplos usuários com permissões
- [ ] Logs de acesso
- [ ] Password reset via e-mail
