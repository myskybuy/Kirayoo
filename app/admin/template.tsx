import { ViewTransition } from 'react';

// Templates remount on every navigation (layouts don't), so each new page
// fades in. router.refresh() keeps the template mounted: no animation on polls.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
