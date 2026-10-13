import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { saveImage, UploadError, type UploadKind } from '@/lib/storage';
import { MAX_CONDITION_PHOTOS, MAX_ITEM_PHOTOS } from '@/lib/constants';

// File uploads go through this route handler (not a Server Action) to avoid
// the Server Action body limit. Returns the stored URLs.
const KINDS: Record<UploadKind, number> = { item: MAX_ITEM_PHOTOS, condition: MAX_CONDITION_PHOTOS, claim: MAX_CONDITION_PHOTOS, complaint: MAX_CONDITION_PHOTOS, id: 1 };

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Upload failed. Try a smaller image.' }, { status: 400 });
  }
  const kind = String(fd.get('kind')) as UploadKind;
  if (!(kind in KINDS)) return NextResponse.json({ error: 'Unknown upload type.' }, { status: 400 });
  const files = fd.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: 'Choose at least one image.' }, { status: 400 });
  if (files.length > KINDS[kind]) return NextResponse.json({ error: `Up to ${KINDS[kind]} photos.` }, { status: 400 });
  try {
    const urls: string[] = [];
    for (const f of files) urls.push(await saveImage(f, kind, user.id));
    return NextResponse.json({ urls });
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
