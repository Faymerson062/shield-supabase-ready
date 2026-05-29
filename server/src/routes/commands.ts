// ============================================================
// Rotas de Comandos - /api/commands
// Woovi Shield - Gerenciamento de comandos remotos do sistema
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import {
  insertCommand,
  listCommands,
  updateCommandStatus,
} from '../lib/supabase';
import type {
  CreateCommandInput,
  CommandStatus,
} from '../types/index';

const router = Router();

// ------------------------------------------------------------
// POST /api/commands
// Registra um novo comando para ser executado pelo sistema
// ------------------------------------------------------------
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body as Partial<CreateCommandInput>;

    // Validação do campo obrigatório
    if (!body.acao) {
      res.status(400).json({
        success: false,
        error: 'Campo obrigatório ausente: acao',
        statusCode: 400,
      });
      return;
    }

    // Ações válidas conhecidas (aceita outros valores custom também)
    const acoesConhecidas = ['block_ip', 'reset_session', 'force_logout', 'clear_logs'];

    // Aviso no log se a ação não for uma das conhecidas (mas não bloqueia)
    if (!acoesConhecidas.includes(body.acao)) {
      console.warn(`[Commands] Ação não reconhecida: ${body.acao}`);
    }

    // Valida que o payload, se fornecido, é um objeto
    if (body.payload !== undefined && typeof body.payload !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Campo payload deve ser um objeto JSON',
        statusCode: 400,
      });
      return;
    }

    const input: CreateCommandInput = {
      acao: body.acao,
      payload: body.payload,
    };

    const comando = await insertCommand(input);

    res.status(201).json({
      success: true,
      data: comando,
      message: 'Comando registrado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------
// GET /api/commands
// Lista todos os comandos com suporte a paginação
// Suporta ?limit=N&offset=N para paginação
// Suporta ?status=pendente|executando|concluido|falhou para filtro
// ------------------------------------------------------------
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(
      parseInt(req.query['limit'] as string) || 50,
      200 // Limite máximo por requisição
    );

    const offset = Math.max(
      parseInt(req.query['offset'] as string) || 0,
      0
    );

    const comandos = await listCommands(limit, offset);

    // Filtro opcional por status (aplicado após consulta para simplicidade)
    const statusFilter = req.query['status'] as CommandStatus | undefined;
    const statusValidos: CommandStatus[] = ['pendente', 'executando', 'concluido', 'falhou'];

    let resultado = comandos;

    if (statusFilter) {
      if (!statusValidos.includes(statusFilter)) {
        res.status(400).json({
          success: false,
          error: `Status inválido: ${statusFilter}. Valores aceitos: ${statusValidos.join(', ')}`,
          statusCode: 400,
        });
        return;
      }
      resultado = comandos.filter((c) => c.status === statusFilter);
    }

    res.json({
      success: true,
      data: resultado,
      meta: {
        count: resultado.length,
        limit,
        offset,
        filter: statusFilter ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------
// PATCH /api/commands/:id
// Atualiza o status de um comando específico pelo UUID
// Body: { "status": "executando" | "concluido" | "falhou" }
// ------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Validação do formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      res.status(400).json({
        success: false,
        error: 'ID inválido: deve ser um UUID válido',
        statusCode: 400,
      });
      return;
    }

    const body = req.body as { status?: CommandStatus };

    // Validação do novo status
    if (!body.status) {
      res.status(400).json({
        success: false,
        error: 'Campo obrigatório ausente: status',
        statusCode: 400,
      });
      return;
    }

    const statusValidos: CommandStatus[] = ['pendente', 'executando', 'concluido', 'falhou'];
    if (!statusValidos.includes(body.status)) {
      res.status(400).json({
        success: false,
        error: `Status inválido: ${body.status}. Valores aceitos: ${statusValidos.join(', ')}`,
        statusCode: 400,
      });
      return;
    }

    const comandoAtualizado = await updateCommandStatus(id, body.status);

    res.json({
      success: true,
      data: comandoAtualizado,
      message: `Status do comando atualizado para: ${body.status}`,
    });
  } catch (error) {
    // Trata erro de comando não encontrado
    if (error instanceof Error && error.message.includes('não encontrado')) {
      res.status(404).json({
        success: false,
        error: error.message,
        statusCode: 404,
      });
      return;
    }
    next(error);
  }
});

export default router;
