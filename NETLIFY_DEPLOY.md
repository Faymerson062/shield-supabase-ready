# Deploy do Dashboard no Netlify

## 📦 Arquivo: `dashboard-deploy.zip`

Contém:
- `index.html` — Dashboard Woovi Shield
- `config.js` — Configuração de URLs (API, Supabase)

## 🚀 Passo a Passo para Fazer Deploy

### 1. Abrir Netlify
Acesse: https://app.netlify.com

### 2. Fazer Login (ou criar conta)
- Google, GitHub, ou e-mail
- Confirmar e-mail

### 3. Deploy Manual
Clique em **"Add new site"** → **"Deploy manually"**

### 4. Upload do ZIP
Arraste e solte **`dashboard-deploy.zip`** na área de upload

Ou clique para selecionar o arquivo.

### 5. Aguardar Deploy
Netlify vai:
- Extrair o ZIP
- Processar os arquivos
- Publicar automaticamente

Vai aparecer uma URL tipo: `https://seu-projeto-aleatório.netlify.app`

### 6. Testar
Abra a URL e verifique se:
- [ ] Dashboard carrega
- [ ] Sessões aparecem em tempo real
- [ ] Comandos funcionam

## ⚙️ Configurar Domínio Customizado (Depois)

1. Na página do site Netlify
2. **Site settings** → **Domain management**
3. **Add custom domain**
4. Digite seu domínio: `dashboard.seu-dominio.com`
5. Seguir instruções de DNS

## 🔒 Atualizar config.js em Produção

Se precisar mudar a URL da API depois:

1. Acesse o código-fonte no Netlify
2. Edite `config.js`
3. Salve → Auto-deploy

Ou se estiver usando GitHub:
1. Edite `config.js` localmente
2. Commit + Push
3. Netlify faz deploy automaticamente

## 📝 Exemplo de config.js para Produção

```javascript
const CONFIG = {
  API_URL: 'https://api.seu-dominio.com',  // Seu servidor
  SUPABASE_URL: 'https://pfbgsviarvnkaadrkxfd.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_vMQXPTlWH30Bys_bgojo5A_IdyjXEdH',
};
```

## ✅ Pronto!

Seu dashboard estará online e recebendo eventos em tempo real! 🎉
