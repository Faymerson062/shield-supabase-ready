// ============================================================
// Rotas de Eventos - /api/events
// Woovi Shield - Gerenciamento de eventos de autenticação
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import {
  insertEvent,
  getEventById,
  listEvents,
} from '../lib/supabase';
import type {
  CreateEventInput,
  EventType,
  EventStatus,
} from '../types/index';

const router = Router();

// ------------------------------------------------------------
// POST /api/events
// Registra um novo evento de autenticação no sistema
// ------------------------------------------------------------
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body as Partial<CreateEventInput>;

    // Validação dos campos obrigatórios
    if (!body.tipo) {
      res.status(400).json({
        success: false,
        error: 'Campo obrigatório ausente: tipo',
        statusCode: 400,
      });
      return;
    }

    if (!body.mensagem) {
      res.status(400).json({
        success: false,
        error: 'Campo obrigatório ausente: mensagem',
        statusCode: 400,
      });
      return;
    }

    // Tipos de eventos válidos
    const tiposValidos: EventType[] = [
      'login_attempt',
      'login_success',
      'login_error',
      'mfa_request',
      'password_incorrect',
      'cpf_invalid',
      'auth_failure',
      'timeout',
      'internal_error',
    ];

    if (!tiposValidos.includes(body.tipo)) {
      res.status(400).json({
        success: false,
        error: `Tipo inválido: ${body.tipo}. Valores aceitos: ${tiposValidos.join(', ')}`,
        statusCode: 400,
      });
      return;
    }

    // Status de eventos válidos
    const statusValidos: EventStatus[] = ['info', 'warning', 'error', 'success'];
    if (body.status && !statusValidos.includes(body.status)) {
      res.status(400).json({
        success: false,
        error: `Status inválido: ${body.status}. Valores aceitos: ${statusValidos.join(', ')}`,
        statusCode: 400,
      });
      return;
    }

    // Captura o IP real do cliente (considera proxies reversos)
    const ip = body.ip
      ?? (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      ?? req.socket.remoteAddress
      ?? 'unknown';

    // Captura o User-Agent se não fornecido no body
    const userAgent = body.user_agent ?? req.headers['user-agent'] ?? undefined;

    const input: CreateEventInput = {
      tipo: body.tipo,
      mensagem: body.mensagem,
      status: body.status,
      usuario: body.usuario,
      ip,
      user_agent: userAgent,
    };

    const evento = await insertEvent(input);

    res.status(201).json({
      success: true,
      data: evento,
      message: 'Evento registrado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------
// GET /api/events
// Lista os eventos mais recentes (máximo 100 por padrão)
// Suporta ?limit=N&offset=N para paginação
// ------------------------------------------------------------
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extrai e valida parâmetros de paginação da query string
    const limit = Math.min(
      parseInt(req.query['limit'] as string) || 100,
      500 // Limite máximo permitido por requisição
    );

    const offset = Math.max(
      parseInt(req.query['offset'] as string) || 0,
      0
    );

    const eventos = await listEvents(limit, offset);

    res.json({
      success: true,
      data: eventos,
      meta: {
        count: eventos.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------
// GET /api/events/:id
// Retorna um único evento pelo UUID
// ------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Validação básica do formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      res.status(400).json({
        success: false,
        error: 'ID inválido: deve ser um UUID válido',
        statusCode: 400,
      });
      return;
    }

    const evento = await getEventById(id);

    if (!evento) {
      res.status(404).json({
        success: false,
        error: `Evento com ID ${id} não encontrado`,
        statusCode: 404,
      });
      return;
    }

    res.json({
      success: true,
      data: evento,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/clear — apaga todos os eventos
router.delete('/clear', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_KEY']!,
      { auth: { persistSession: false } }
    );

    const { error } = await admin
      .from('events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw new Error(error.message);

    res.json({ success: true, message: 'Todos os eventos foram apagados' });
  } catch (error) {
    console.error('[Events] Erro ao deletar:', error);
    next(error);
  }
});

export default router;
