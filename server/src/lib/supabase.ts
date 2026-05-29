// ============================================================
// Clientes e helpers do Supabase
// Woovi Shield - Camada de acesso ao banco de dados
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import type {
  Event,
  Log,
  Command,
  CreateEventInput,
  CreateLogInput,
  CreateCommandInput,
  CommandStatus,
} from '../types/index';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// ------------------------------------------------------------
// Validação das variáveis de ambiente obrigatórias
// ------------------------------------------------------------
const SUPABASE_URL = process.env['SUPABASE_URL'];
const SUPABASE_ANON_KEY = process.env['SUPABASE_ANON_KEY'];
const SUPABASE_SERVICE_KEY = process.env['SUPABASE_SERVICE_KEY'];

if (!SUPABASE_URL) {
  throw new Error('Variável de ambiente SUPABASE_URL não definida');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Variável de ambiente SUPABASE_ANON_KEY não definida');
}

if (!SUPABASE_SERVICE_KEY) {
  throw new Error('Variável de ambiente SUPABASE_SERVICE_KEY não definida');
}

// ------------------------------------------------------------
// Cliente público (anon key) - para uso em browsers/frontend
// Respeita as políticas RLS do banco de dados
// ------------------------------------------------------------
export const supabaseClient: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// ------------------------------------------------------------
// Cliente administrativo (service_role) - APENAS para uso no servidor
// Bypassa as políticas RLS, tem acesso total ao banco
// NUNCA exponha esta chave no frontend!
// ------------------------------------------------------------
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// ------------------------------------------------------------
// Helpers: funções utilitárias para operações no banco
// ------------------------------------------------------------

/**
 * Insere um novo evento na tabela `events`
 * @param input - Dados do evento a ser inserido
 * @returns O evento criado com todos os campos gerados pelo banco
 */
export async function insertEvent(input: CreateEventInput): Promise<Event> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .insert({
      tipo: input.tipo,
      mensagem: input.mensagem,
      status: input.status ?? 'info',
      usuario: input.usuario ?? null,
      ip: input.ip ?? null,
      user_agent: input.user_agent ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao inserir evento: ${error.message}`);
  }

  if (!data) {
    throw new Error('Evento não retornado após inserção');
  }

  return data as Event;
}

/**
 * Insere um novo log na tabela `logs`
 * @param input - Dados do log a ser inserido
 * @returns O log criado com todos os campos gerados pelo banco
 */
export async function insertLog(input: CreateLogInput): Promise<Log> {
  const { data, error } = await supabaseAdmin
    .from('logs')
    .insert({
      level: input.level ?? 'info',
      categoria: input.categoria ?? null,
      mensagem: input.mensagem,
      detalhes: input.detalhes ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao inserir log: ${error.message}`);
  }

  if (!data) {
    throw new Error('Log não retornado após inserção');
  }

  return data as Log;
}

/**
 * Insere um novo comando na tabela `commands`
 * @param input - Dados do comando a ser inserido
 * @returns O comando criado com todos os campos gerados pelo banco
 */
export async function insertCommand(input: CreateCommandInput): Promise<Command> {
  const { data, error } = await supabaseAdmin
    .from('commands')
    .insert({
      acao: input.acao,
      payload: input.payload ?? null,
      status: 'pendente',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao inserir comando: ${error.message}`);
  }

  if (!data) {
    throw new Error('Comando não retornado após inserção');
  }

  return data as Command;
}

/**
 * Atualiza o status de um comando existente
 * @param id - UUID do comando a ser atualizado
 * @param status - Novo status do comando
 * @returns O comando atualizado
 */
export async function updateCommandStatus(
  id: string,
  status: CommandStatus
): Promise<Command> {
  const { data, error } = await supabaseAdmin
    .from('commands')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar status do comando: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Comando com ID ${id} não encontrado`);
  }

  return data as Command;
}

/**
 * Busca um evento pelo ID
 * @param id - UUID do evento
 * @returns O evento encontrado ou null
 */
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // Código PGRST116 indica que nenhum registro foi encontrado
    if (error.code === 'PGRST116') return null;
    throw new Error(`Erro ao buscar evento: ${error.message}`);
  }

  return data as Event | null;
}

/**
 * Lista os eventos mais recentes com suporte a paginação e filtros
 * @param limit - Quantidade máxima de registros (padrão: 100)
 * @param offset - Deslocamento para paginação (padrão: 0)
 * @returns Array de eventos ordenados por data de criação (mais recentes primeiro)
 */
export async function listEvents(
  limit = 100,
  offset = 0
): Promise<Event[]> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Erro ao listar eventos: ${error.message}`);
  }

  return (data ?? []) as Event[];
}

/**
 * Lista os comandos com suporte a filtro por status
 * @param limit - Quantidade máxima de registros (padrão: 50)
 * @param offset - Deslocamento para paginação (padrão: 0)
 * @returns Array de comandos ordenados por data de criação
 */
export async function listCommands(
  limit = 50,
  offset = 0
): Promise<Command[]> {
  const { data, error } = await supabaseAdmin
    .from('commands')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Erro ao listar comandos: ${error.message}`);
  }

  return (data ?? []) as Command[];
}
