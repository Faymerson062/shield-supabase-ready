import { Router, Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { insertLog } from '../lib/supabase';

const router = Router();

function getAdmin() {
  return createClient(
    process.env['SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_KEY']!,
    { auth: { persistSession: false } }
  );
}

// POST /api/logs
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { level = 'debug', categoria, mensagem, detalhes } = req.body;
    if (!mensagem) {
      res.status(400).json({ success: false, error: 'Campo mensagem é obrigatório' });
      return;
    }
    const log = await insertLog({ level, categoria, mensagem, detalhes });
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
});

// GET /api/logs
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = getAdmin();
    const limit = Math.min(parseInt(req.query['limit'] as string) || 100, 500);
    const categoria = req.query['categoria'] as string | undefined;

    let query = admin.from('logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (categoria) query = query.eq('categoria', categoria);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    res.json({ success: true, data: data ?? [], meta: { count: data?.length ?? 0 } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/logs/clear — apaga logs (todos ou por categoria)
router.delete('/clear', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = getAdmin();
    const categoria = req.query['categoria'] as string | undefined;

    let query = admin.from('logs').delete().not('id', 'is', null);
    if (categoria) query = (query as any).eq('categoria', categoria);

    const { error } = await query;
    if (error) throw new Error(error.message);

    res.json({ success: true, message: 'Logs apagados com sucesso' });
  } catch (error) {
    next(error);
  }
});

export default router;
