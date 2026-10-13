import 'server-only';
import { cookies } from 'next/headers';
import { LOCATION_COOKIE } from './constants';
import type { SessionUser } from './auth';

export type Loc = { city: string; area: string };

/** User's saved location, else the cookie, else null. */
export async function getLocation(user: SessionUser | null): Promise<Loc | null> {
  if (user?.city && user.area) return { city: user.city, area: user.area };
  const raw = (await cookies()).get(LOCATION_COOKIE)?.value;
  if (!raw) return null;
  const [city, area] = decodeURIComponent(raw).split('|');
  return city && area ? { city, area } : null;
}

export async function setLocationCookie(loc: Loc) {
  (await cookies()).set(LOCATION_COOKIE, encodeURIComponent(`${loc.city}|${loc.area}`), {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 365 * 86400,
  });
}
