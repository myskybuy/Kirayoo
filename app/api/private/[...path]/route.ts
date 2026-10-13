import { getUser } from '@/lib/auth';
import { readPrivate } from '@/lib/storage';

// Private ID files: only the user they belong to, or the admin.
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  if (path[0] !== user.id && !user.isAdmin) return new Response('Forbidden', { status: 403 });
  const f = await readPrivate(path);
  if (!f) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(f.data), {
    headers: { 'Content-Type': f.mime, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}
