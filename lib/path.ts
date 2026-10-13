import 'server-only';
import { headers } from 'next/headers';

/** Current path + query (set by proxy.ts). */
export async function currentPath(): Promise<string> {
  return (await headers()).get('x-pathname') || '/';
}
