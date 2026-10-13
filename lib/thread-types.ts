// Shapes sent to the chat client (no server imports here).
import type { NextStep, Step } from './bookings';

export type ThreadMsg = {
  id: string;
  type: 'TEXT' | 'BOOKING_REQUEST' | 'SYSTEM';
  text: string;
  mine: boolean;
  fromRenter: boolean;
  start: string | null;
  end: string | null;
  requestStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COUNTERED' | 'WITHDRAWN' | null;
  bookingId: string | null;
  createdAt: string;
  read: boolean;
};

export type ThreadBooking = {
  id: string;
  code: string;
  status: string;
  statusLabel: string;
  holdExpiresAt: string | null;
  start: string;
  end: string;
  total: number;
  next: NextStep;
  steps: Step[];
  canCancel: boolean;
  href: string;
};

export type ThreadData = {
  id: string;
  role: 'RENTER' | 'OWNER';
  me: { id: string; verified: boolean };
  other: { name: string; initials: string; color: string; sub: string };
  item: { id: string; title: string; photo: string | null; status: string; pricePerDay: number; pricePerWeek: number | null; deposit: number; minDays: number; maxDays: number; area: string; city: string; live: boolean };
  messages: ThreadMsg[];
  booking: ThreadBooking | null;
  unavailable: string[];
  today: string;
  deliveryFee: number;
  quickReplies: string[];
  pendingRequest: boolean;
};
