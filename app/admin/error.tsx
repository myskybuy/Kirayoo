'use client';
import ErrorBody from '@/components/states/ErrorBody';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorBody reset={reset} digest={error.digest} />;
}
