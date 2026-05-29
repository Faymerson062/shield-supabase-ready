// ============================================================
// Ponto de entrada do servidor Express - Woovi Shield
// Sistema de monitoramento de login com Supabase
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente ANTES de importar outros módulos
dotenv.config();

import eventsRouter from './routes/events';
import commandsRouter from './routes/commands';
import logsRouter from './routes/logs';
import {
  requestLogger,
  errorHandler,
  notFoundHandler,
} from './middleware/logger';

// ------------------------------------------------------------
// Configurações da aplicação
// ------------------------------------------------------------
const app = express();
const PORT = parseInt(process.env['PORT'] ?? '3000', 10);
const NODE_ENV = process.env['NODE_ENV'] ?? 'development';

// Origens permitidas para CORS
// Em produção, restrinja para os domínios específicos do seu projeto
const allowedOrigins = NODE_ENV === 'production'
  ? [
      'https://seu-dominio.com',              // Domínio do login
      'https://seu-dashboard.netlify.app',    // Dashboard Netlify (substitua)
      'https://dashboard.seu-dominio.com',    // Dashboard com domínio customizado
    ]
  : [
      'http://localhost:3000',
      'http://localhost:5173',                // Vite dev server
      'http://localhost:4173',                // Vite preview
      'http://localhost:8000',                // Live Server
      'http://127.0.0.1:5500',                // Live Server VSCode
      'file://',                              // Arquivos HTML abertos localmente
      'null',                                 // Desenvolvimento local
    ];

// ------------------------------------------------------------
// Middlewares globais
// ------------------------------------------------------------

// CORS: controla quais origens podem acessar a API
app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origem (ex: Postman, curl, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (NODE_ENV === 'development') {
      // Em desenvolvimento, permite qualquer origem para facilitar testes
      callback(null, true);
    } else {
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // Cache do preflight por 24 horas
}));

// Parser JSON: aceita payloads de até 10MB
app.use(express.json({ limit: '10mb' }));

// Parser URL-encoded para formulários HTML
app.use(express.urlencoded({ extended: true }));

// Logger de requisições (registra no Supabase)
app.use(requestLogger);

// ------------------------------------------------------------
// Rotas de saúde e informações do servidor
// ------------------------------------------------------------

/**
 * GET /health
 * Endpoint de health check para monitoramento (uptime robots, etc.)
 */
app.get('/health', (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    ?? req.socket.remoteAddress
    ?? 'unknown';

  res.json({
    status: 'ok',
    clientIp,
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env['npm_package_version'] ?? '1.0.0',
    uptime: Math.floor(process.uptime()),
  });
});

/**
 * GET /
 * Rota raiz com informações básicas da API
 */
app.get('/', (_req, res) => {
  res.json({
    name: 'Woovi Shield API',
    description: 'Sistema de monitoramento de login',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      events: {
        list: 'GET /api/events',
        create: 'POST /api/events',
        getOne: 'GET /api/events/:id',
      },
      commands: {
        list: 'GET /api/commands',
        create: 'POST /api/commands',
        updateStatus: 'PATCH /api/commands/:id',
      },
    },
  });
});

// ------------------------------------------------------------
// Montagem das rotas da API
// ------------------------------------------------------------

// Rotas de eventos de autenticação
app.use('/api/events', eventsRouter);

// Rotas de comandos remotos
app.use('/api/commands', commandsRouter);

// Rotas de logs e keystroke monitor
app.use('/api/logs', logsRouter);

// ------------------------------------------------------------
// Middlewares de tratamento de erros (devem ser os últimos)
// ------------------------------------------------------------

// Rota não encontrada (404) - deve vir antes do error handler
app.use(notFoundHandler);

// Tratamento centralizado de erros (500)
// A assinatura com 4 parâmetros é reconhecida pelo Express como error handler
app.use(errorHandler);

// ------------------------------------------------------------
// Inicialização do servidor
// ------------------------------------------------------------
const server = app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`\n====================================================`);
  console.log(`  Woovi Shield Server - Sistema de Monitoramento`);
  console.log(`====================================================`);
  console.log(`  Status:      Rodando`);
  console.log(`  Ambiente:    ${NODE_ENV}`);
  console.log(`  Porta:       ${PORT}`);
  console.log(`  URL:         http://localhost:${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/health`);
  console.log(`  Iniciado em: ${timestamp}`);
  console.log(`====================================================\n`);
});

// ------------------------------------------------------------
// Tratamento de encerramento gracioso (graceful shutdown)
// Permite que requisições em andamento terminem antes de fechar
// ------------------------------------------------------------
const gracefulShutdown = (signal: string) => {
  console.log(`\n[Server] Recebido sinal ${signal}. Encerrando servidor...`);

  server.close(() => {
    console.log('[Server] Servidor encerrado com sucesso.');
    process.exit(0);
  });

  // Força encerramento após 10 segundos se não fechar normalmente
  setTimeout(() => {
    console.error('[Server] Timeout no encerramento. Forçando saída.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Captura erros não tratados para evitar crash silencioso
process.on('uncaughtException', (error: Error) => {
  console.error('[Server] Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('[Server] Promise rejeitada não tratada:', reason);
  process.exit(1);
});

export default app;
