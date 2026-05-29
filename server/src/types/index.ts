// ============================================================
// Tipos e interfaces do sistema de monitoramento de login
// Woovi Shield - Definições centralizadas de TypeScript
// ============================================================

// ------------------------------------------------------------
// Enums: valores permitidos para campos específicos
// ------------------------------------------------------------

/**
 * Tipos de eventos de autenticação que o sistema monitora
 */
export type EventType =
  | 'login_attempt'       // Tentativa de login iniciada
  | 'login_success'       // Login realizado com sucesso
  | 'login_error'         // Erro genérico no login
  | 'mfa_request'         // Requisição de autenticação de dois fatores
  | 'password_incorrect'  // Senha incorreta fornecida
  | 'cpf_invalid'         // CPF inválido ou não encontrado
  | 'auth_failure'        // Falha geral de autenticação
  | 'timeout'             // Timeout durante o processo
  | 'internal_error';     // Erro interno do servidor

/**
 * Nível de severidade do log
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Status de um evento
 */
export type EventStatus = 'info' | 'warning' | 'error' | 'success';

/**
 * Status do ciclo de vida de um comando
 */
export type CommandStatus = 'pendente' | 'executando' | 'concluido' | 'falhou';

/**
 * Ações disponíveis para comandos remotos
 */
export type CommandAction =
  | 'block_ip'        // Bloquear um endereço IP específico
  | 'reset_session'   // Resetar sessão de um usuário
  | 'force_logout'    // Forçar logout de um usuário
  | 'clear_logs';     // Limpar logs antigos do sistema

// ------------------------------------------------------------
// Interfaces: estrutura das entidades do banco de dados
// ------------------------------------------------------------

/**
 * Representa um evento de autenticação registrado no sistema
 */
export interface Event {
  id: string;
  tipo: EventType;
  mensagem: string;
  status: EventStatus;
  usuario?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  created_at: string;
}

/**
 * Dados necessários para criar um novo evento (sem campos gerados automaticamente)
 */
export interface CreateEventInput {
  tipo: EventType;
  mensagem: string;
  status?: EventStatus;
  usuario?: string;
  ip?: string;
  user_agent?: string;
}

/**
 * Representa uma entrada de log interno do sistema
 */
export interface Log {
  id: string;
  level: LogLevel;
  categoria?: string | null;
  mensagem: string;
  detalhes?: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Dados necessários para criar um novo log
 */
export interface CreateLogInput {
  level?: LogLevel;
  categoria?: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
}

/**
 * Representa um comando enviado para o sistema executar
 */
export interface Command {
  id: string;
  acao: CommandAction | string;
  payload?: Record<string, unknown> | null;
  status: CommandStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Dados necessários para criar um novo comando
 */
export interface CreateCommandInput {
  acao: CommandAction | string;
  payload?: Record<string, unknown>;
}

/**
 * Dados para atualizar o status de um comando
 */
export interface UpdateCommandStatusInput {
  status: CommandStatus;
}

// ------------------------------------------------------------
// Interfaces: respostas padronizadas da API
// ------------------------------------------------------------

/**
 * Resposta de sucesso genérica da API
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Resposta de erro padronizada da API
 */
export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
  statusCode: number;
}

/**
 * Union type para qualquer resposta da API
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ------------------------------------------------------------
// Interfaces: parâmetros de consulta (query params)
// ------------------------------------------------------------

/**
 * Parâmetros de paginação e filtro para listagens
 */
export interface QueryParams {
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}

/**
 * Filtros específicos para a listagem de eventos
 */
export interface EventQueryParams extends QueryParams {
  tipo?: EventType;
  status?: EventStatus;
  usuario?: string;
  ip?: string;
}

/**
 * Filtros específicos para a listagem de logs
 */
export interface LogQueryParams extends QueryParams {
  level?: LogLevel;
  categoria?: string;
}

/**
 * Filtros específicos para a listagem de comandos
 */
export interface CommandQueryParams extends QueryParams {
  status?: CommandStatus;
  acao?: string;
}
