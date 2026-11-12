import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { MAX_UPLOAD_BYTES } from './constants';

// The ONLY module that touches the disk for user files, so it can be swapped
// for S3 later. Public files: ./uploads (served by app/uploads/[...path]).
// Private files (ID document, selfie): ./private-uploads (served only to the
// owner of the file and the admin by app/api/private/[...path]).

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'uploads');
const PRIVATE_DIR = path.join(ROOT, 'private-uploads');

export type UploadKind = 'item' | 'condition' | 'claim' | 'complaint' | 'id';
const PRIVATE_KINDS: UploadKind[] = ['id'];

const TYPES = {
  jpg: { mime: 'image/jpeg', test: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  png: { mime: 'image/png', test: (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  webp: { mime: 'image/webp', test: (b: Buffer) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP' },
} as const;
type Ext = keyof typeof TYPES;

export const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

/** Detects jpg/png/webp from the file's bytes (not its name). */
export function sniff(buf: Buffer): Ext | null {
  for (const [ext, t] of Object.entries(TYPES) as [Ext, (typeof TYPES)[Ext]][]) if (t.test(buf)) return ext;
  return null;
}

export class UploadError extends Error {}

/**
 * Validates and stores one image. Returns its URL:
 *  - public:  /uploads/<kind>/<file>
 *  - private: /api/private/<userId>/<file>
 */
export async function saveImage(file: File, kind: UploadKind, userId: string): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`${file.name}: larger than 5 MB.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) throw new UploadError(`${file.name}: only JPG, PNG or WebP images.`);
  const name = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
  if (PRIVATE_KINDS.includes(kind)) {
    const dir = path.join(PRIVATE_DIR, userId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buf);
    return `/api/private/${userId}/${name}`;
  }
  const dir = path.join(PUBLIC_DIR, kind);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/${kind}/${name}`;
}

/** Copies a local file into public uploads (used by the seed). */
export async function importPublicFile(src: string, kind: UploadKind): Promise<string> {
  const buf = await fs.readFile(src);
  const ext = sniff(buf) ?? 'jpg';
  const name = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
  const dir = path.join(PUBLIC_DIR, kind);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/${kind}/${name}`;
}

function safeJoin(base: string, parts: string[]): string | null {
  if (parts.some((p) => !p || p === '.' || p === '..' || p.includes('\\') || p.includes('/'))) return null;
  const full = path.join(base, ...parts);
  return full.startsWith(base + path.sep) ? full : null;
}

export async function readPublic(parts: string[]): Promise<{ data: Buffer; mime: string } | null> {
  const full = safeJoin(PUBLIC_DIR, parts);
  if (!full) return null;
  try {
    const data = await fs.readFile(/*turbopackIgnore: true*/ full);
    return { data, mime: MIME[path.extname(full).slice(1)] ?? 'application/octet-stream' };
  } catch {
    return null;
  }
}

export async function readPrivate(parts: string[]): Promise<{ data: Buffer; mime: string } | null> {
  const full = safeJoin(PRIVATE_DIR, parts);
  if (!full) return null;
  try {
    const data = await fs.readFile(/*turbopackIgnore: true*/ full);
    return { data, mime: MIME[path.extname(full).slice(1)] ?? 'application/octet-stream' };
  } catch {
    return null;
  }
}

/** True if a stored URL points to an existing public upload or a seeded demo photo. */
export async function publicUrlExists(url: string): Promise<boolean> {
  if (url.startsWith('/demo/')) {
    const full = safeJoin(path.join(ROOT, 'public', 'demo'), url.slice(6).split('/'));
    return full ? fs.access(full).then(() => true, () => false) : false;
  }
  if (!url.startsWith('/uploads/')) return false;
  const full = safeJoin(PUBLIC_DIR, url.slice(9).split('/'));
  return full ? fs.access(full).then(() => true, () => false) : false;
}

export async function privateUrlExists(url: string, userId: string): Promise<boolean> {
  const prefix = `/api/private/${userId}/`;
  if (!url.startsWith(prefix)) return false;
  const full = safeJoin(PRIVATE_DIR, [userId, url.slice(prefix.length)]);
  return full ? fs.access(full).then(() => true, () => false) : false;
}

/** Wipes all uploaded files (db:reset / seed only). */
export async function wipeUploads() {
  await fs.rm(PUBLIC_DIR, { recursive: true, force: true });
  await fs.rm(PRIVATE_DIR, { recursive: true, force: true });
}

/** Stores bytes as a private (ID) file for a user (used by the seed). */
export async function importPrivateBuffer(buf: Buffer, userId: string): Promise<string> {
  const ext = sniff(buf) ?? 'jpg';
  const name = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
  const dir = path.join(PRIVATE_DIR, userId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `/api/private/${userId}/${name}`;
}
