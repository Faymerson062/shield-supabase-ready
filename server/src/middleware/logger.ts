// ============================================================
// Middlewares de logging e tratamento de erros
// Woovi Shield - Registra todas as requisições no Supabase
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { insertLog } from '../lib/supabase';

// ------------------------------------------------------------
// Middleware: Logger de requisições HTTP
// Registra cada requisição no banco de dados (tabela logs)
// Também faz output no console para debugging local
// ------------------------------------------------------------
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const inicio = Date.now();

  // Captura o IP real (considera proxies e load balancers)
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    'unknown';

  // Intercepta o evento de finalização da resposta para logar status e duração
  res.on('finish', () => {
    const duracao = Date.now() - inicio;
    const status = res.statusCode;

    // Determina o nível do log baseado no status HTTP
    const level =
      status >= 500 ? 'error' :
      status >= 400 ? 'warn' :
      'info';

    // Log no console para desenvolvimento
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} → ${status} (${duracao}ms) [${ip}]`);

    // Log assíncrono no Supabase - não bloqueia a resposta
    // Ignora erros de log para não impactar o usuário final
    insertLog({
      level,
      categoria: 'http',
      mensagem: `${req.method} ${req.path} → ${status}`,
      detalhes: {
        method: req.method,
        path: req.path,
        status_code: status,
        duracao_ms: duracao,
        ip,
        user_agent: req.headers['user-agent'] ?? null,
        query: Object.keys(req.query).length > 0 ? req.query : null,
      },
    }).catch((err: unknown) => {
      // Apenas registra no console se falhar - não interrompe o fluxo
      console.error('[Logger] Falha ao salvar log no Supabase:', err);
    });
  });

  next();
}

// ------------------------------------------------------------
// Middleware: Tratamento centralizado de erros
// Captura erros não tratados nas rotas e retorna resposta padronizada
// ------------------------------------------------------------
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Extrai a mensagem de erro de forma segura
  const mensagemErro =
    err instanceof Error ? err.message : 'Erro interno desconhecido';

  // Log detalhado no console para diagnóstico
  console.error(`[ErrorHandler] ${req.method} ${req.path} →`, err);

  // Registra o erro no Supabase de forma assíncrona
  insertLog({
    level: 'error',
    categoria: 'server_error',
    mensagem: `Erro não tratado: ${mensagemErro}`,
    detalhes: {
      method: req.method,
      path: req.path,
      error: mensagemErro,
      stack: err instanceof Error ? err.stack : null,
    },
  }).catch((logErr: unknown) => {
    console.error('[ErrorHandler] Falha ao registrar erro no Supabase:', logErr);
  });

  // Retorna resposta de erro padronizada para o cliente
  // Evita expor detalhes internos em produção
  const isProd = process.env['NODE_ENV'] === 'production';

  res.status(500).json({
    success: false,
    error: isProd ? 'Erro interno do servidor' : mensagemErro,
    statusCode: 500,
    ...(isProd ? {} : { details: err instanceof Error ? err.stack : err }),
  });
}

// ------------------------------------------------------------
// Middleware: Rota não encontrada (404)
// Deve ser registrado após todas as rotas válidas
// ------------------------------------------------------------
export function notFoundHandler(
  req: Request,
  res: Response
): void {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.path}`,
    statusCode: 404,
  });
}
