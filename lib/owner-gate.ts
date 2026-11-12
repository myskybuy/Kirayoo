// Pure owner-gate rules (no DB), shared by pages, actions, lib and scripts.
type OwnerGate = { idStatus: string; ownerStatus: string; isBlocked: boolean };

/** An owner whose items may be seen and booked: approved application + verified ID + not blocked. */
export const isLiveOwner = (u: OwnerGate) => u.ownerStatus === 'APPROVED' && u.idStatus === 'VERIFIED' && !u.isBlocked;

/** The same rule as a Prisma filter on `owner`. */
export const LIVE_OWNER = { ownerStatus: 'APPROVED', idStatus: 'VERIFIED', isBlocked: false } as const;

/** May use the owner panel: approved application + verified ID (blocked users can't log in at all). */
export const canUseOwnerPanel = (u: Omit<OwnerGate, 'isBlocked'>) => u.ownerStatus === 'APPROVED' && u.idStatus === 'VERIFIED';
