'use client';
import { useFormStatus } from 'react-dom';

/** Submit button that asks for confirmation first. */
export default function ConfirmButton({ message, children, className, style, name, value }: { message: string; children: React.ReactNode; className?: string; style?: React.CSSProperties; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} className={className} style={style} disabled={pending}
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {pending ? '…' : children}
    </button>
  );
}
