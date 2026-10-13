// Dev helper: rewrites kit hrefs inside a JSX snippet into app routes and
// converts <a href="/..."> into <Link>. Usage: node tools/relink.mjs in.jsx > out
import fs from 'node:fs';
export const ROUTES = {
  'R01-Home.html': '/', 'R02-Location.html': '/location', 'R03-Search.html': '/browse', 'R04-Item.html': '/items',
  'R05-Login.html': '/login', 'R06-VerifyOTP.html': '/verify', 'R07-Chat.html': '/chat', 'R13-MyRentals.html': '/bookings',
  'R20-Profile.html': '/profile', 'R21-About.html': '/about', 'R22-HowItWorks.html': '/how-it-works', 'R23-Contact.html': '/contact',
  'R24-Terms.html': '/terms', 'R25-Privacy.html': '/privacy', 'R26-DepositPolicy.html': '/deposit-policy',
  'R09-IDVerify.html': '/verify-id', 'R10-IDStatus.html': '/verify-id',
  '../owner/O02-ListItem.html': '/owner/new', '../owner/O01-Dashboard.html': '/owner', '../renter/R01-Home.html': '/',
  'O01-Dashboard.html': '/owner', 'O02-ListItem.html': '/owner/new', 'O03-MyListings.html': '/owner/listings', 'O04-Requests.html': '/owner/requests',
  'O05-Calendar.html': '/owner/calendar', 'O08-Earnings.html': '/owner/earnings', 'O09-Reviews.html': '/owner/reviews',
  'A01-Dashboard.html': '/admin', 'A02-IDVerifications.html': '/admin/ids', 'A03-ListingApprovals.html': '/admin/listings', 'A04-Users.html': '/admin/users',
  'A05-Bookings.html': '/admin/bookings', 'A06-Disputes.html': '/admin/disputes', 'A07-Payouts.html': '/admin/payouts',
};
export function relink(s) {
  for (const [k, v] of Object.entries(ROUTES)) s = s.split(`href="${k}"`).join(`href="${v}"`);
  let out = '', last = 0, m; const stack = []; const re = /<(\/?)(a|Link)\b([^>]*)>/g;
  while ((m = re.exec(s))) {
    out += s.slice(last, m.index);
    if (m[1]) out += '</' + stack.pop() + '>';
    else if (/href="\//.test(m[3])) { stack.push('Link'); out += '<Link' + m[3] + '>'; }
    else { stack.push('a'); out += m[0]; }
    last = re.lastIndex;
  }
  return out + s.slice(last);
}
if (process.argv[2]) process.stdout.write(relink(fs.readFileSync(process.argv[2], 'utf8')));
