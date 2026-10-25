import { Pool } from 'pg';
import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { randomUUID } from 'node:crypto';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 60_000, connectionTimeoutMillis: 10_000, keepAlive: true, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined });
export const ok = (data: unknown, res: Response) => res.json({ success: true, data });
export class ApiError extends Error { constructor(public status: number, public code: string, message: string) { super(message); } }
export const fail = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
  void next;
  let e: ApiError;
  if (err instanceof ApiError) e=err;
  else if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') e=new ApiError(400,'VALIDATION_ERROR','Request validation failed');
  else if (err && typeof err === 'object' && 'code' in err && err.code === '23505') e=new ApiError(409,'CONFLICT','A record with these values already exists');
  else e=new ApiError(500,'INTERNAL_ERROR','An unexpected error occurred');
  if (e.status >= 500) {
    const original = err instanceof Error ? err : undefined;
    const details = err && typeof err === 'object' ? err as { code?: string; name?: string } : {};
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: process.env.SERVICE_NAME,
      level: 'error',
      requestId: res.getHeader('x-request-id'),
      name: details.name || original?.name,
      code: details.code,
      message: original?.message || e.message,
    }));
  }
  res.status(e.status).json({ success: false, error: { code: e.code, message: e.message } });
};
export const requestId = (_req: Request, res: Response, next: NextFunction) => { res.setHeader('x-request-id', randomUUID()); next(); };
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.annah_session;
    if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), { issuer: 'annah-boutique', algorithms: ['HS256'] });
    if (typeof payload.sid !== 'string' || typeof payload.sub !== 'string') throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    const result = await pool.query('SELECT id FROM admin_sessions WHERE id=$1 AND admin_id=$2 AND expires_at>now() AND revoked_at IS NULL', [payload.sid, payload.sub]);
    if (!result.rowCount) throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired');
    (req as Request & {adminId?: string}).adminId = payload.sub;
    next();
  } catch (e) { next(e instanceof ApiError ? e : new ApiError(401, 'UNAUTHORIZED', 'Authentication required')); }
}
export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const health = (_req: Request, res: Response) => res.json({ status: 'ok', service: process.env.SERVICE_NAME });
