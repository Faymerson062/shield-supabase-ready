# Deploy do Dashboard com Autenticação no Netlify

## 📦 Arquivo: `dashboard-deploy-auth.zip`

Contém:
- `login.html` — Página de login com usuário/senha
- `index.html` — Dashboard protegido
- `config.js` — Configuração centralizada

## 🚀 Passo a Passo

### 1. Abrir Netlify
https://app.netlify.com

### 2. Fazer Login (ou criar conta)
- Google, GitHub, ou e-mail

### 3. Deploy Manual
Clique em **"Add new site"** → **"Deploy manually"**

### 4. Upload do ZIP
Arraste e solte **`dashboard-deploy-auth.zip`** na área de upload

### 5. Aguardar Deploy
Netlify extrai e publica automaticamente

Exemplo de URL: `https://seu-projeto-123456.netlify.app`

## 🔑 Login Inicial

**Usuário:** `admin`
**Senha:** `admin123`

## ✅ Testar

1. Acesse a URL gerada
2. Será redirecionado para `login.html` automaticamente
3. Digite as credenciais
4. Clique em "Entrar"
5. Pronto! Dashboard carrega com proteção

## 🔐 Mudar Credenciais

### Opção 1: Editar no Netlify
1. Na página do site Netlify
2. Clique em **"Code"** → **"Edit file"**
3. Edite `login.html`
4. Procure por:
```javascript
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};
```
5. Altere para suas credenciais
6. Salve → Auto-deploy

### Opção 2: Fazer upload novo
1. Edite `login.html` localmente
2. Crie novo ZIP
3. Faça novo upload no Netlify

## 🔒 Recursos

- Login com usuário/senha
- Token válido por 7 dias
- Botão de logout no canto superior direito
- Página de login responsiva e moderna
- Redirecionamento automático se não logado

## 📝 Próximas Melhorias

Para produção, considere:
- Múltiplos usuários
- Hash de senhas (bcrypt)
- Armazenar no Supabase
- 2FA (autenticação dupla)

## ❓ Problemas Comuns

**"Está indo sempre para login"**
- Verifique se `config.js` está no mesmo diretório
- Verifique se `login.html` e `index.html` estão na mesma pasta

**"Credenciais não funcionam"**
- Maiúsculas/minúsculas importam
- Não há espaços antes/depois

**"Logout não funciona"**
- Limpe cache do navegador (Ctrl+Shift+Del)
- Tente em modo privado/anônimo

---

**Pronto para deploy! 🚀**
