-- ============================================================
-- Migração inicial: Sistema de Monitoramento de Login
-- Criado para o projeto Woovi Shield
-- ============================================================

-- Habilita extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELA: events
-- Registra todos os eventos de autenticação do sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        TEXT        NOT NULL,
  mensagem    TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'info',
  usuario     TEXT,
  ip          TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Validação de valores permitidos para tipo
  CONSTRAINT events_tipo_check CHECK (
    tipo IN (
      'login_attempt',
      'login_success',
      'login_error',
      'mfa_request',
      'password_incorrect',
      'cpf_invalid',
      'auth_failure',
      'timeout',
      'internal_error'
    )
  ),

  -- Validação de valores permitidos para status
  CONSTRAINT events_status_check CHECK (
    status IN ('info', 'warning', 'error', 'success')
  )
);

-- Índices para melhorar performance nas consultas mais comuns
CREATE INDEX IF NOT EXISTS idx_events_tipo       ON public.events (tipo);
CREATE INDEX IF NOT EXISTS idx_events_status     ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_usuario    ON public.events (usuario);
CREATE INDEX IF NOT EXISTS idx_events_ip         ON public.events (ip);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events (created_at DESC);

-- ============================================================
-- TABELA: logs
-- Registra logs internos do sistema (debug, info, warn, error)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  level       TEXT        NOT NULL DEFAULT 'info',
  categoria   TEXT,
  mensagem    TEXT        NOT NULL,
  detalhes    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Validação do nível do log
  CONSTRAINT logs_level_check CHECK (
    level IN ('debug', 'info', 'warn', 'error')
  )
);

-- Índices para filtros e busca eficiente
CREATE INDEX IF NOT EXISTS idx_logs_level      ON public.logs (level);
CREATE INDEX IF NOT EXISTS idx_logs_categoria  ON public.logs (categoria);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs (created_at DESC);

-- ============================================================
-- TABELA: commands
-- Registra comandos enviados para o sistema (ex: bloquear IP)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.commands (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  acao        TEXT        NOT NULL,
  payload     JSONB,
  status      TEXT        NOT NULL DEFAULT 'pendente',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Validação dos status permitidos
  CONSTRAINT commands_status_check CHECK (
    status IN ('pendente', 'executando', 'concluido', 'falhou')
  )
);

-- Índices para consultas de comandos por status e data
CREATE INDEX IF NOT EXISTS idx_commands_status     ON public.commands (status);
CREATE INDEX IF NOT EXISTS idx_commands_acao       ON public.commands (acao);
CREATE INDEX IF NOT EXISTS idx_commands_created_at ON public.commands (created_at DESC);

-- ============================================================
-- FUNÇÃO: trigger para atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Aplica o trigger somente na tabela commands (que tem updated_at)
CREATE TRIGGER trigger_commands_updated_at
  BEFORE UPDATE ON public.commands
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Controle de acesso por linha para segurança
-- ============================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Políticas para: events
-- ------------------------------------------------------------

-- service_role tem acesso total (INSERT, SELECT, UPDATE, DELETE)
CREATE POLICY "service_role_full_access_events"
  ON public.events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- anon pode apenas ler (SELECT)
CREATE POLICY "anon_read_events"
  ON public.events
  FOR SELECT
  TO anon
  USING (true);

-- authenticated pode ler e inserir
CREATE POLICY "authenticated_read_insert_events"
  ON public.events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- Políticas para: logs
-- ------------------------------------------------------------

-- service_role tem acesso total
CREATE POLICY "service_role_full_access_logs"
  ON public.logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- anon pode apenas ler
CREATE POLICY "anon_read_logs"
  ON public.logs
  FOR SELECT
  TO anon
  USING (true);

-- authenticated pode ler e inserir
CREATE POLICY "authenticated_read_insert_logs"
  ON public.logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- Políticas para: commands
-- ------------------------------------------------------------

-- service_role tem acesso total
CREATE POLICY "service_role_full_access_commands"
  ON public.commands
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- anon pode apenas ler
CREATE POLICY "anon_read_commands"
  ON public.commands
  FOR SELECT
  TO anon
  USING (true);

-- authenticated pode ler, inserir e atualizar
CREATE POLICY "authenticated_manage_commands"
  ON public.commands
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- REALTIME: habilita publicação em tempo real nas tabelas
-- ============================================================

-- Adiciona as tabelas na publicação de realtime do Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commands;

-- ============================================================
-- DADOS INICIAIS: popula com exemplos para teste
-- ============================================================

-- Evento de exemplo: tentativa de login
INSERT INTO public.events (tipo, mensagem, status, usuario, ip, user_agent)
VALUES (
  'login_attempt',
  'Tentativa de login detectada',
  'info',
  'usuario_teste',
  '127.0.0.1',
  'Mozilla/5.0 (Setup inicial)'
);

-- Log de exemplo: sistema iniciado
INSERT INTO public.logs (level, categoria, mensagem, detalhes)
VALUES (
  'info',
  'sistema',
  'Sistema de monitoramento iniciado',
  '{"versao": "1.0.0", "ambiente": "producao"}'::jsonb
);

-- Comando de exemplo
INSERT INTO public.commands (acao, payload, status)
VALUES (
  'clear_logs',
  '{"motivo": "Setup inicial"}'::jsonb,
  'concluido'
);
