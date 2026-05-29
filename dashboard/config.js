// Configuração centralizada para login e dashboard.
//
// IMPORTANTE (aprendizado):
// Este arquivo fica DENTRO da pasta dashboard/ porque é ela que publicamos
// no Netlify. Assim a pasta é "autocontida": tudo que o site precisa está aqui.
// Por isso o index.html carrega <script src="config.js"></script> (sem "../").
//
// A SUPABASE_ANON_KEY é uma chave PÚBLICA, feita para rodar no navegador.
// Quem protege os dados são as RLS policies no Supabase, não o segredo da chave.

const CONFIG = {
  // Projeto Supabase (Backend-as-a-Service). O dashboard fala direto com ele.
  SUPABASE_URL: 'https://pfbgsviarvnkaadrkxfd.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_vMQXPTlWH30Bys_bgojo5A_IdyjXEdH',
};
