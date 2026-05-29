// Configuração centralizada para login e dashboard
// Use as URLs corretas para cada ambiente

const CONFIG = {
  // URL da API Express (servidor backend)
  API_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4000'
    : 'https://api.seu-dominio.com', // Atualize para seu domínio em produção

  // Supabase
  SUPABASE_URL: 'https://pfbgsviarvnkaadrkxfd.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_vMQXPTlWH30Bys_bgojo5A_IdyjXEdH',
};
