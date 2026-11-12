'use client';
import { useState } from 'react';

/** R09 upload slot: one private image (ID or selfie) → hidden input with its URL. */
export default function SingleUpload({ name, title, hint, capture, icon }: { name: string; title: string; hint: string; capture?: 'user' | 'environment'; icon: React.ReactNode }) {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pick(f?: File) {
    if (!f) return;
    setError('');
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setError('Only JPG, PNG or WebP images.');
    if (f.size > 5 * 1024 * 1024) return setError('The image is larger than 5 MB.');
    const fd = new FormData();
    fd.set('kind', 'id');
    fd.append('files', f);
    setBusy(true);
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const j = await r.json().catch(() => ({ error: 'Upload failed.' }));
      if (!r.ok) return setError(j.error || 'Upload failed.');
      setUrl(j.urls[0]);
      setFile({ name: f.name, size: f.size });
    } catch {
      setError('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div style={{ borderRadius: '20px', padding: '14px', background: 'var(--kb-eef3ec)', boxShadow: 'inset 0 0 0 1.5px var(--kl-1f4d3a)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '96px', height: '64px', borderRadius: '12px', background: 'var(--kb-bfd1bd)', overflow: 'hidden', flex: 'none' }}><img src={url} alt={title} className="k-photo" /></div>
          <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <b style={{ fontSize: '14px' }}>{title}</b>
            <span className="mute" style={{ fontSize: '12.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file?.name} · {((file?.size ?? 0) / 1048576).toFixed(1)} MB</span>
            <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', color: 'var(--kf-1e5a37)', fontSize: '12.5px', fontWeight: '700' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '14px', height: '14px', strokeWidth: '2.6' }}><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>Uploaded</span>
          </div>
          <button type="button" aria-label={`Remove ${title}`} onClick={() => { setUrl(''); setFile(null); }} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '0', background: 'var(--kb-fffdf8)', color: 'var(--kf-474c52)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path d="M6 6l12 12M18 6 6 18"></path></svg></button>
        </div>
      ) : (
        <label style={{ borderRadius: '20px', padding: '14px', border: '2px dashed var(--kl-bfb4a0)', display: 'flex', gap: '12px', alignItems: 'center', cursor: busy ? 'progress' : 'pointer', background: 'var(--kb-ffffff)', position: 'relative' }}>
          <span style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--kb-fbe3d8)', color: 'var(--kf-a93c18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{icon}</span>
          <span style={{ display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: '14px' }}>{busy ? 'Uploading…' : title}</b><span className="mute" style={{ fontSize: '12.5px' }}>{hint}</span></span>
          <input type="file" accept="image/jpeg,image/png,image/webp" capture={capture} disabled={busy} onChange={(e) => pick(e.target.files?.[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
        </label>
      )}
      {error && <p className="k-alert err" role="alert">{error}</p>}
    </div>
  );
}
