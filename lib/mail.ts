import nodemailer, { type Transporter } from 'nodemailer';
import { APP_URL } from './constants';

export const smtpConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

let transport: Transporter | null = null;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

/** Sends a plain-text email. Without SMTP (dev) it prints to the console. Never throws. */
export async function sendMail(to: string, subject: string, text: string) {
  const body = `${text}\n\n— Kirayo · ${APP_URL}`;
  if (process.env.KIRAYO_MAIL_SILENT) return;
  if (!smtpConfigured()) {
    console.log(`\n[mail] to=${to}\n[mail] subject=${subject}\n[mail] ${body.replace(/\n/g, '\n[mail] ')}\n`);
    return;
  }
  try {
    await getTransport().sendMail({ from: process.env.MAIL_FROM || 'Kirayo <no-reply@kirayo.local>', to, subject, text: body });
  } catch (e) {
    console.error('[mail] failed', to, subject, e);
  }
}

const link = (p: string) => `${APP_URL}${p}`;

// One line per key event (§6).
export const mail = {
  otp: (to: string, code: string) => sendMail(to, `Your Kirayo code: ${code}`, `Your Kirayo login code is ${code}. It expires in 10 minutes.`),
  newRequest: (to: string, item: string, dates: string, convId: string) =>
    sendMail(to, `New booking request · ${item}`, `You have a new booking request for ${item} (${dates}). Reply: ${link(`/chat/${convId}`)}`),
  requestAccepted: (to: string, item: string, bookingId: string) =>
    sendMail(to, `Dates confirmed · ${item}`, `Your dates for ${item} were accepted. Pay within 12 hours to confirm: ${link(`/book/${bookingId}`)}`),
  requestCountered: (to: string, item: string, dates: string, convId: string) =>
    sendMail(to, `New dates suggested · ${item}`, `New dates were suggested for ${item}: ${dates}. Reply: ${link(`/chat/${convId}`)}`),
  requestDeclined: (to: string, item: string, convId: string) =>
    sendMail(to, `Request declined · ${item}`, `Your booking request for ${item} was declined. ${link(`/chat/${convId}`)}`),
  bookingConfirmed: (to: string, item: string, code: string, path: string) =>
    sendMail(to, `Booking confirmed · ${code}`, `Booking ${code} for ${item} is confirmed. Details: ${link(path)}`),
  paymentReceived: (to: string, item: string, code: string, amount: string, path: string) =>
    sendMail(to, `Payment received · ${code}`, `We received ${amount} for ${item} (${code}). ${link(path)}`),
  pickupTomorrow: (to: string, item: string, path: string) => sendMail(to, `Pickup tomorrow · ${item}`, `Pickup for ${item} is tomorrow. ${link(path)}`),
  returnTomorrow: (to: string, item: string, path: string) => sendMail(to, `Return due tomorrow · ${item}`, `Please return ${item} tomorrow. ${link(path)}`),
  overdue: (to: string, item: string, days: number, path: string) =>
    sendMail(to, `Overdue by ${days} day${days > 1 ? 's' : ''} · ${item}`, `${item} was due back. Please return it today; late days can be charged from your deposit. ${link(path)}`),
  claimRaised: (to: string, item: string, amount: string, path: string) =>
    sendMail(to, `Deposit claim · ${item}`, `The owner claimed ${amount} from your deposit for ${item}. Accept or dispute within 48 hours: ${link(path)}`),
  claimDecided: (to: string, item: string, amount: string, path: string) =>
    sendMail(to, `Claim decided · ${item}`, `The deposit claim for ${item} was settled at ${amount}. ${link(path)}`),
  depositRefunded: (to: string, item: string, amount: string, path: string) =>
    sendMail(to, `Deposit refunded · ${item}`, `${amount} was refunded for ${item}. ${link(path)}`),
  idApproved: (to: string) => sendMail(to, 'Your ID is verified', `Your ID is verified. You can now pay for rentals and list items. ${link('/profile')}`),
  idRejected: (to: string, reason: string) => sendMail(to, 'ID verification needs another try', `We could not verify your ID: ${reason}. Please resubmit: ${link('/verify-id')}`),
  ownerApproved: (to: string, idVerified: boolean) =>
    sendMail(to, 'You’re approved as a Kirayo owner', idVerified ? `Your owner application is approved. List your first item: ${link('/owner/new')}` : `Your owner application is approved. One last step — verify your ID: ${link('/owner/apply')}`),
  ownerRejected: (to: string, reason: string) => sendMail(to, 'Your owner application needs changes', `We could not approve your owner application: ${reason}. Update it and send it again: ${link('/owner/apply')}`),
  payoutPaid: (to: string, amount: string, ref: string) => sendMail(to, `Payout sent · ${amount}`, `We paid ${amount} to you (reference ${ref}). ${link('/owner/earnings')}`),
  status: (to: string, subject: string, text: string, path: string) => sendMail(to, subject, `${text} ${link(path)}`),
};
