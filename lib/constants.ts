import type { Category } from '@prisma/client';

export const APP_URL = process.env.APP_URL || 'http://localhost:3001';
export const DELIVERY_FEE = Number(process.env.DELIVERY_FEE ?? 99);
export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 0);

export const HOLD_HOURS = 12;
export const RETURN_CONFIRM_HOURS = 48;
export const CLAIM_RESPONSE_HOURS = 48;
export const SESSION_DAYS = 30;
export const PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

export const SESSION_COOKIE = 'kirayo_session';
export const LOCATION_COOKIE = 'kirayo_loc';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_ITEM_PHOTOS = 8;
export const MAX_CONDITION_PHOTOS = 6;

export type CategoryInfo = { key: Category; label: string; slug: string; icon: string };

// Icon paths copied from the design kit (R01 category row, 24px grid).
export const CATEGORIES: CategoryInfo[] = [
  { key: 'CAMERAS', label: 'Cameras', slug: 'cameras', icon: '<rect x="3" y="7" width="18" height="13" rx="3"></rect><path d="M8.5 7 10 4.5h4L15.5 7"></path><circle cx="12" cy="13.5" r="3.5"></circle>' },
  { key: 'TOOLS', label: 'Tools', slug: 'tools', icon: '<path d="M15 4a5 5 0 0 0-4.6 6.9L4 17.3V20h2.7l6.4-6.4A5 5 0 0 0 20 9l-3 3-3-1-1-3z"></path>' },
  { key: 'PARTY', label: 'Party & events', slug: 'party', icon: '<rect x="6" y="3" width="12" height="18" rx="3"></rect><circle cx="12" cy="14" r="3.5"></circle><circle cx="12" cy="7.5" r="1.2"></circle>' },
  { key: 'CAMPING', label: 'Camping', slug: 'camping', icon: '<path d="M3 20 12 4l9 16z"></path><path d="M12 4v16M9 20l3-6 3 6"></path>' },
  { key: 'GAMING', label: 'Gaming', slug: 'gaming', icon: '<rect x="2.5" y="7" width="19" height="11" rx="5"></rect><path d="M7 11v3M5.5 12.5h3"></path><circle cx="16" cy="11.5" r=".9"></circle><circle cx="18" cy="13.5" r=".9"></circle>' },
  { key: 'PROJECTORS', label: 'Projectors', slug: 'projectors', icon: '<rect x="2.5" y="8" width="19" height="9" rx="2.5"></rect><circle cx="15.5" cy="12.5" r="2.5"></circle><path d="M6 12.5h4M5 17v2M19 17v2"></path>' },
  { key: 'MUSIC', label: 'Music', slug: 'music', icon: '<path d="M9 18V5l11-2v13"></path><circle cx="6.5" cy="18" r="2.5"></circle><circle cx="17.5" cy="16" r="2.5"></circle>' },
  { key: 'SPORTS', label: 'Sports & cycles', slug: 'sports', icon: '<circle cx="6" cy="17" r="3.5"></circle><circle cx="18" cy="17" r="3.5"></circle><path d="M6 17 9.5 9h5L18 17M9.5 9 12 17h-6M14.5 9 13 5.5h2.5"></path>' },
];

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.key === c)?.label ?? c;
export const categoryBySlug = (s?: string | null) => CATEGORIES.find((x) => x.slug === s);

export const ID_DOC_TYPES = ['Aadhaar', 'PAN', 'Driving licence', 'Passport'] as const;

export const RENTER_REVIEW_TAGS = ['On time', 'Item as described', 'Friendly owner', 'Easy handover', 'Good value', 'Clean & working'];
export const OWNER_REVIEW_TAGS = ['On time', 'Took good care', 'Easy to talk to', 'Returned clean', 'Would rent again'];

export const COMPLAINT_REASONS = ['Item not working', 'Item different from listing', 'Safety concern', 'Owner unreachable', 'Other'];

export const QUICK_REPLIES_RENTER = ['Is it available?', 'Can I pick it up in the evening?', 'Is delivery possible?', 'What is included?'];
export const QUICK_REPLIES_OWNER = ['Yes, it is available', 'Pickup after 6 pm works', 'Please send a booking request', 'Thanks!'];
