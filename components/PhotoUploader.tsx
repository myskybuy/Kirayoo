'use client';
import { useRef, useState } from 'react';

type Props = {
  kind: 'item' | 'condition' | 'claim' | 'complaint' | 'id';
  name: string;
  max: number;
  initial?: string[];
  cover?: boolean;
  label?: string;
  tile?: number;
  onChange?: (urls: string[]) => void;
};

/**
 * Uploads images immediately through /api/upload and keeps the stored URLs in a
 * hidden input (JSON) named `name`. Tiles follow the O02 photo grid.
 */
export default function PhotoUploader({ kind, name, max, initial = [], cover = false, label = 'Add photos', tile = 120, onChange }: Props) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  function update(next: string[]) {
    setUrls(next);
    onChange?.(next);
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    const room = max - urls.length;
    const list = Array.from(files).slice(0, room);
    if (files.length > room) setError(`Up to ${max} photos — extra ones were skipped.`);
    for (const f of list) {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setError(`${f.name}: only JPG, PNG or WebP images.`);
      if (f.size > 5 * 1024 * 1024) return setError(`${f.name}: larger than 5 MB.`);
    }
    if (!list.length) return;
    const fd = new FormData();
    fd.set('kind', kind);
    list.forEach((f) => fd.append('files', f));
    setBusy(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const j = await res.json().catch(() => ({ error: 'Upload failed.' }));
      if (!res.ok) setError(j.error || 'Upload failed.');
      else update([...urls, ...j.urls]);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: `repeat(auto-fill,minmax(${tile}px,1fr))` }}>
        {urls.map((u, i) => (
          <div key={u} style={{ aspectRatio: '1', borderRadius: '18px', background: 'var(--kb-bfd1bd)', position: 'relative', overflow: 'hidden' }}>
            <img src={u} alt={`Photo ${i + 1}`} className="k-photo" />
            {cover && i === 0 && <span style={{ position: 'absolute', left: '8px', bottom: '8px', padding: '3px 8px', borderRadius: '999px', background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)', fontSize: '11px', fontWeight: '800' }}>COVER</span>}
            <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => update(urls.filter((x) => x !== u))}
              style={{ position: 'absolute', top: '6px', right: '6px', width: '28px', height: '28px', borderRadius: '50%', border: 0, background: 'rgba(35,38,42,.72)', color: 'var(--kf-ffffff)', cursor: 'pointer', fontWeight: 800 }}>×</button>
            {cover && i > 0 && (
              <button type="button" onClick={() => update([u, ...urls.filter((x) => x !== u)])}
                style={{ position: 'absolute', left: '6px', bottom: '6px', padding: '3px 8px', borderRadius: '999px', border: 0, background: 'rgba(255,253,248,.92)', color: 'var(--kf-1f4d3a)', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Make cover</button>
            )}
          </div>
        ))}
        {urls.length < max && (
          <label style={{ aspectRatio: '1', borderRadius: '18px', border: '2px dashed var(--kl-bfb4a0)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--kf-a93c18)', fontSize: '13px', fontWeight: '700', cursor: busy ? 'progress' : 'pointer', background: 'var(--kb-ffffff)', position: 'relative', textAlign: 'center', padding: '6px' }}>
            <svg className="ic" viewBox="0 0 24 24" style={{ width: '26px', height: '26px' }}><path d="M12 16V4M7 9l5-5 5 5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"></path></svg>
            {busy ? 'Uploading…' : label}
            <input ref={input} type="file" multiple={max > 1} accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => upload(e.target.files)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          </label>
        )}
      </div>
      <span className="mute" style={{ fontSize: '12.5px' }}>{urls.length}/{max} · JPG, PNG or WebP, up to 5 MB each</span>
      {error && <p className="k-alert err" role="alert">{error}</p>}
    </div>
  );
}
