# Guia de Deployment - Woovi Shield

## Arquitetura

```
login.seu-dominio.com    → Frontend Login
api.seu-dominio.com      → Express Backend (4000)
dashboard.netlify.app    → Dashboard (Netlify)
        ↓
   Supabase PostgreSQL + Realtime
```

## 1. Deploy do Dashboard na Netlify

### Preparar arquivos
```bash
cd /path/to/Login
# Copiar apenas dashboard
mkdir dashboard-deploy
cp dashboard/index.html dashboard-deploy/
cp config.js dashboard-deploy/
```

### No Netlify
1. Conectar repositório Git ou fazer upload manual
2. Build settings:
   - **Base directory**: `dashboard-deploy/`
   - **Publish directory**: `.` (ou deixar vazio)
3. Deploy

### URL da Netlify
Após deploy, você terá: `https://seu-projeto.netlify.app`

---

## 2. Configurar Domínio Customizado (Opcional)

Após Netlify estar rodando:
1. Ir para **Site settings** > **Domain management**
2. Adicionar domínio customizado (ex: `dashboard.seu-dominio.com`)
3. Atualizar DNS no registrador

---

## 3. Atualizar config.js para Produção

```javascript
const CONFIG = {
  API_URL: 'https://api.seu-dominio.com',  // ou localhost:4000 em dev
  SUPABASE_URL: 'https://pfbgsviarvnkaadrkxfd.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_vMQXPTlWH30Bys_bgojo5A_IdyjXEdH',
};
```

### Estratégia de ambiente
**Desenvolvimento**: `http://localhost:4000`
**Produção**: `https://api.seu-dominio.com`

---

## 4. Configurar CORS no Servidor

No arquivo `server/src/index.ts`, adicionar domínios:

```typescript
const allowedOrigins = NODE_ENV === 'production'
  ? [
      'https://seu-dominio.com',                // Login
      'https://seu-projeto.netlify.app',        // Dashboard Netlify
      'https://dashboard.seu-dominio.com',      // Dashboard customizado
    ]
  : [...];
```

---

## 5. Deploy do Login + API

### VPS/Servidor de Produção
1. Copiar arquivos
2. Instalar dependências: `npm install`
3. Build: `npm run build`
4. Configurar variáveis de ambiente
5. Rodar: `npm start`

### Com Docker (Opcional)
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

---

## 6. Checklist de Deployment

- [ ] Dashboard na Netlify
- [ ] `config.js` com URLs de produção
- [ ] CORS configurado no servidor
- [ ] Variáveis de ambiente (.env) setadas
- [ ] SSL/HTTPS em todos os domínios
- [ ] Testar login → API → Dashboard em tempo real

---

## Variáveis de Ambiente (.env)

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=seu-service-key-super-secreto
NODE_ENV=production
PORT=4000
```

⚠️ **IMPORTANTE**: Nunca commitar `.env` no Git!

---

## Troubleshooting

### CORS error no Dashboard
- Verificar se domínio está em `allowedOrigins`
- Verificar HTTPS vs HTTP
- Testar com `curl -H "Origin: https://seu-dominio.com" http://api.seu-dominio.com/health`

### Realtime não conecta
- Verificar conexão Supabase
- Verificar se browser permite WebSocket
- Console (F12) > Network > vê `wss://` connections

### IP não aparece no dashboard
- Verificar `/health` endpoint: `curl http://localhost:4000/health`
- Deve retornar `clientIp`

---

## Próximos passos

1. Registrar domínios
2. Configurar DNS
3. Obter certificados SSL (Let's Encrypt)
4. Testar fluxo completo login → comando → resposta
