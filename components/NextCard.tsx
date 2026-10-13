import Link from 'next/link';
import type { NextStep, Step } from '@/lib/bookings';

/** Step progress bar (Golden rule 4). */
export function ProgressBar({ steps }: { steps: Step[] }) {
  return (
    <ol className="k-steps" aria-label="Booking progress">
      {steps.map((s) => (
        <li key={s.label} className={s.state === 'todo' ? undefined : s.state} aria-current={s.state === 'now' ? 'step' : undefined}>{s.label}</li>
      ))}
    </ol>
  );
}

/** "Next:" card — one sentence for this person plus one primary button. */
export function NextCard({ step }: { step: NextStep; who?: string }) {
  const cls = step.tone === 'wait' || step.tone === 'done' || step.tone === 'info' ? ' wait' : step.tone === 'alert' ? ' alert' : '';
  const label = step.tone === 'wait' ? 'Waiting' : step.tone === 'done' ? 'Status' : step.tone === 'alert' ? 'Needs you now' : 'Next';
  return (
    <div className={`k-next${cls}`} role="status">
      <div className="k-next-t"><small>{label}</small><b>{step.text}</b></div>
      {step.buttonLabel && step.href && <Link className={`k-btn ${step.tone === 'alert' ? 'p' : 'g'}`} href={step.href}>{step.buttonLabel}</Link>}
    </div>
  );
}
