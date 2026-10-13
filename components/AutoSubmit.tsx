'use client';

/** Submits the control's form as soon as a select/checkbox inside it changes. */
export default function AutoSubmit({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{ display: 'contents' }}
      onChange={(e) => {
        const el = e.target as HTMLSelectElement | HTMLInputElement;
        el.form?.requestSubmit();
      }}
    >
      {children}
    </span>
  );
}
