--
-- PostgreSQL database dump
--

\restrict sUMMkQ9bDqhNyso9ZJA6R4EZjg378JdhlOLC6JbQLV7jybKMfVV37TczyDYobDA

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Review" DROP CONSTRAINT IF EXISTS "Review_toUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Review" DROP CONSTRAINT IF EXISTS "Review_itemId_fkey";
ALTER TABLE IF EXISTS ONLY public."Review" DROP CONSTRAINT IF EXISTS "Review_fromUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Review" DROP CONSTRAINT IF EXISTS "Review_bookingId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payout" DROP CONSTRAINT IF EXISTS "Payout_ownerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payout" DROP CONSTRAINT IF EXISTS "Payout_bookingId_fkey";
ALTER TABLE IF EXISTS ONLY public."OwnerApplication" DROP CONSTRAINT IF EXISTS "OwnerApplication_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_senderId_fkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_conversationId_fkey";
ALTER TABLE IF EXISTS ONLY public."Item" DROP CONSTRAINT IF EXISTS "Item_ownerId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExtensionRequest" DROP CONSTRAINT IF EXISTS "ExtensionRequest_bookingId_fkey";
ALTER TABLE IF EXISTS ONLY public."DepositRefund" DROP CONSTRAINT IF EXISTS "DepositRefund_bookingId_fkey";
ALTER TABLE IF EXISTS ONLY public."DamageClaim" DROP CONSTRAINT IF EXISTS "DamageClaim_bookingId_fkey";
ALTER TABLE IF EXISTS ONLY public."Conversation" DROP CONSTRAINT IF EXISTS "Conversation_renterId_fkey";
ALTER TABLE IF EXISTS ONLY public."Conversation" DROP CONSTRAINT IF EXISTS "Conversation_ownerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Conversation" DROP CONSTRAINT IF EXISTS "Conversation_itemId_fkey";
ALTER TABLE IF EXISTS ONLY public."ConditionReport" DROP CONSTRAINT IF EXISTS "ConditionReport_byUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."ConditionReport" DROP CONSTRAINT IF EXISTS "ConditionReport_bookingId_fkey";
ALTER TABLE IF EXISTS ONLY public."Complaint" DROP CONSTRAINT IF EXISTS "Complaint_byUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Complaint" DROP CONSTRAINT IF EXISTS "Complaint_bookingId_fkey";
ALTER TABLE IF EXISTS ONLY public."Booking" DROP CONSTRAINT IF EXISTS "Booking_renterId_fkey";
ALTER TABLE IF EXISTS ONLY public."Booking" DROP CONSTRAINT IF EXISTS "Booking_ownerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Booking" DROP CONSTRAINT IF EXISTS "Booking_itemId_fkey";
ALTER TABLE IF EXISTS ONLY public."Booking" DROP CONSTRAINT IF EXISTS "Booking_conversationId_fkey";
ALTER TABLE IF EXISTS ONLY public."BlockedDate" DROP CONSTRAINT IF EXISTS "BlockedDate_itemId_fkey";
ALTER TABLE IF EXISTS ONLY public."Area" DROP CONSTRAINT IF EXISTS "Area_cityId_fkey";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Session_userId_idx";
DROP INDEX IF EXISTS public."Session_token_key";
DROP INDEX IF EXISTS public."Review_bookingId_fromUserId_key";
DROP INDEX IF EXISTS public."Payout_bookingId_key";
DROP INDEX IF EXISTS public."OwnerApplication_userId_key";
DROP INDEX IF EXISTS public."Message_conversationId_createdAt_idx";
DROP INDEX IF EXISTS public."Item_ownerId_idx";
DROP INDEX IF EXISTS public."Item_city_status_idx";
DROP INDEX IF EXISTS public."EmailOtp_email_createdAt_idx";
DROP INDEX IF EXISTS public."DamageClaim_bookingId_key";
DROP INDEX IF EXISTS public."Conversation_ownerId_idx";
DROP INDEX IF EXISTS public."Conversation_itemId_renterId_key";
DROP INDEX IF EXISTS public."City_name_key";
DROP INDEX IF EXISTS public."Booking_renterId_idx";
DROP INDEX IF EXISTS public."Booking_ownerId_idx";
DROP INDEX IF EXISTS public."Booking_itemId_status_idx";
DROP INDEX IF EXISTS public."Booking_code_key";
DROP INDEX IF EXISTS public."BlockedDate_itemId_date_key";
DROP INDEX IF EXISTS public."Area_cityId_name_key";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE IF EXISTS ONLY public."Review" DROP CONSTRAINT IF EXISTS "Review_pkey";
ALTER TABLE IF EXISTS ONLY public."Payout" DROP CONSTRAINT IF EXISTS "Payout_pkey";
ALTER TABLE IF EXISTS ONLY public."OwnerApplication" DROP CONSTRAINT IF EXISTS "OwnerApplication_pkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_pkey";
ALTER TABLE IF EXISTS ONLY public."Item" DROP CONSTRAINT IF EXISTS "Item_pkey";
ALTER TABLE IF EXISTS ONLY public."ExtensionRequest" DROP CONSTRAINT IF EXISTS "ExtensionRequest_pkey";
ALTER TABLE IF EXISTS ONLY public."EmailOtp" DROP CONSTRAINT IF EXISTS "EmailOtp_pkey";
ALTER TABLE IF EXISTS ONLY public."DepositRefund" DROP CONSTRAINT IF EXISTS "DepositRefund_pkey";
ALTER TABLE IF EXISTS ONLY public."DamageClaim" DROP CONSTRAINT IF EXISTS "DamageClaim_pkey";
ALTER TABLE IF EXISTS ONLY public."Conversation" DROP CONSTRAINT IF EXISTS "Conversation_pkey";
ALTER TABLE IF EXISTS ONLY public."ContactMessage" DROP CONSTRAINT IF EXISTS "ContactMessage_pkey";
ALTER TABLE IF EXISTS ONLY public."ConditionReport" DROP CONSTRAINT IF EXISTS "ConditionReport_pkey";
ALTER TABLE IF EXISTS ONLY public."Complaint" DROP CONSTRAINT IF EXISTS "Complaint_pkey";
ALTER TABLE IF EXISTS ONLY public."City" DROP CONSTRAINT IF EXISTS "City_pkey";
ALTER TABLE IF EXISTS ONLY public."Booking" DROP CONSTRAINT IF EXISTS "Booking_pkey";
ALTER TABLE IF EXISTS ONLY public."BlockedDate" DROP CONSTRAINT IF EXISTS "BlockedDate_pkey";
ALTER TABLE IF EXISTS ONLY public."Area" DROP CONSTRAINT IF EXISTS "Area_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Session";
DROP TABLE IF EXISTS public."Review";
DROP TABLE IF EXISTS public."Payout";
DROP TABLE IF EXISTS public."OwnerApplication";
DROP TABLE IF EXISTS public."Message";
DROP TABLE IF EXISTS public."Item";
DROP TABLE IF EXISTS public."ExtensionRequest";
DROP TABLE IF EXISTS public."EmailOtp";
DROP TABLE IF EXISTS public."DepositRefund";
DROP TABLE IF EXISTS public."DamageClaim";
DROP TABLE IF EXISTS public."Conversation";
DROP TABLE IF EXISTS public."ContactMessage";
DROP TABLE IF EXISTS public."ConditionReport";
DROP TABLE IF EXISTS public."Complaint";
DROP TABLE IF EXISTS public."City";
DROP TABLE IF EXISTS public."Booking";
DROP TABLE IF EXISTS public."BlockedDate";
DROP TABLE IF EXISTS public."Area";
DROP TYPE IF EXISTS public."RequestStatus";
DROP TYPE IF EXISTS public."RefundStatus";
DROP TYPE IF EXISTS public."RefundKind";
DROP TYPE IF EXISTS public."PayoutStatus";
DROP TYPE IF EXISTS public."PaymentMode";
DROP TYPE IF EXISTS public."OwnerStatus";
DROP TYPE IF EXISTS public."OtpPurpose";
DROP TYPE IF EXISTS public."MessageType";
DROP TYPE IF EXISTS public."ItemStatus";
DROP TYPE IF EXISTS public."IdStatus";
DROP TYPE IF EXISTS public."HandoverMode";
DROP TYPE IF EXISTS public."ExtensionStatus";
DROP TYPE IF EXISTS public."ConditionStage";
DROP TYPE IF EXISTS public."ComplaintStatus";
DROP TYPE IF EXISTS public."ClaimStatus";
DROP TYPE IF EXISTS public."Category";
DROP TYPE IF EXISTS public."BookingStatus";
--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'PENDING_PAYMENT',
    'CONFIRMED',
    'PICKED_UP',
    'RETURNED',
    'DISPUTED',
    'RETURN_CONFIRMED',
    'DEPOSIT_REFUNDED',
    'CANCELLED'
);


--
-- Name: Category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Category" AS ENUM (
    'CAMERAS',
    'TOOLS',
    'PARTY',
    'CAMPING',
    'GAMING',
    'PROJECTORS',
    'MUSIC',
    'SPORTS'
);


--
-- Name: ClaimStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ClaimStatus" AS ENUM (
    'OPEN',
    'ACCEPTED',
    'DISPUTED',
    'RESOLVED'
);


--
-- Name: ComplaintStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ComplaintStatus" AS ENUM (
    'OPEN',
    'RESOLVED'
);


--
-- Name: ConditionStage; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ConditionStage" AS ENUM (
    'PICKUP',
    'RETURN'
);


--
-- Name: ExtensionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ExtensionStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'PAID'
);


--
-- Name: HandoverMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."HandoverMode" AS ENUM (
    'PICKUP',
    'DELIVERY'
);


--
-- Name: IdStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IdStatus" AS ENUM (
    'NONE',
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


--
-- Name: ItemStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ItemStatus" AS ENUM (
    'PENDING_REVIEW',
    'ACTIVE',
    'REJECTED',
    'PAUSED'
);


--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MessageType" AS ENUM (
    'TEXT',
    'BOOKING_REQUEST',
    'SYSTEM'
);


--
-- Name: OtpPurpose; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OtpPurpose" AS ENUM (
    'LOGIN',
    'SIGNUP'
);


--
-- Name: OwnerStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OwnerStatus" AS ENUM (
    'NONE',
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: PaymentMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMode" AS ENUM (
    'RAZORPAY',
    'DEMO',
    'CASH_AT_PICKUP'
);


--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'PENDING',
    'PAID'
);


--
-- Name: RefundKind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RefundKind" AS ENUM (
    'DEPOSIT',
    'CANCELLATION',
    'CONFLICT'
);


--
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'PENDING',
    'REFUNDED',
    'FAILED'
);


--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'COUNTERED',
    'WITHDRAWN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Area; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Area" (
    id text NOT NULL,
    "cityId" text NOT NULL,
    name text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: BlockedDate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlockedDate" (
    id text NOT NULL,
    "itemId" text NOT NULL,
    date date NOT NULL
);


--
-- Name: Booking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    code text NOT NULL,
    "itemId" text NOT NULL,
    "renterId" text NOT NULL,
    "ownerId" text NOT NULL,
    "conversationId" text,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    days integer NOT NULL,
    "pricePerDay" integer NOT NULL,
    "pricePerWeek" integer,
    "rentAmount" integer NOT NULL,
    "extensionAmount" integer DEFAULT 0 NOT NULL,
    deposit integer NOT NULL,
    "deliveryFee" integer DEFAULT 0 NOT NULL,
    "platformFee" integer DEFAULT 0 NOT NULL,
    total integer NOT NULL,
    mode public."HandoverMode" DEFAULT 'PICKUP'::public."HandoverMode" NOT NULL,
    address text,
    "pickupNote" text,
    "paymentMode" public."PaymentMode",
    "razorpayOrderId" text,
    "paymentId" text,
    "amountPaid" integer DEFAULT 0 NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "holdExpiresAt" timestamp(3) without time zone,
    status public."BookingStatus" DEFAULT 'PENDING_PAYMENT'::public."BookingStatus" NOT NULL,
    "pickupOtp" text NOT NULL,
    "returnOtp" text NOT NULL,
    "otpAttempts" integer DEFAULT 0 NOT NULL,
    "cashCollected" boolean DEFAULT false NOT NULL,
    "ownerKeepAmount" integer DEFAULT 0 NOT NULL,
    "confirmedAt" timestamp(3) without time zone,
    "pickedUpAt" timestamp(3) without time zone,
    "returnedAt" timestamp(3) without time zone,
    "returnConfirmedAt" timestamp(3) without time zone,
    "refundedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "cancelReason" text,
    "cancelledBy" text,
    "pickupReminderAt" timestamp(3) without time zone,
    "returnReminderAt" timestamp(3) without time zone,
    "overdueMailAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: City; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."City" (
    id text NOT NULL,
    name text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: Complaint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Complaint" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "byUserId" text NOT NULL,
    reason text NOT NULL,
    text text NOT NULL,
    photos text[],
    status public."ComplaintStatus" DEFAULT 'OPEN'::public."ComplaintStatus" NOT NULL,
    "adminNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ConditionReport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ConditionReport" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    stage public."ConditionStage" NOT NULL,
    "byUserId" text NOT NULL,
    photos text[],
    notes text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ContactMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContactMessage" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    resolved boolean DEFAULT false NOT NULL,
    "adminNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "itemId" text NOT NULL,
    "renterId" text NOT NULL,
    "ownerId" text NOT NULL,
    "renterReadAt" timestamp(3) without time zone,
    "ownerReadAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: DamageClaim; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DamageClaim" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    amount integer NOT NULL,
    "lateFee" integer DEFAULT 0 NOT NULL,
    reason text NOT NULL,
    photos text[],
    status public."ClaimStatus" DEFAULT 'OPEN'::public."ClaimStatus" NOT NULL,
    "renterNote" text,
    "adminDecisionAmount" integer,
    "adminNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "decidedAt" timestamp(3) without time zone
);


--
-- Name: DepositRefund; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DepositRefund" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    kind public."RefundKind" DEFAULT 'DEPOSIT'::public."RefundKind" NOT NULL,
    amount integer NOT NULL,
    status public."RefundStatus" DEFAULT 'PENDING'::public."RefundStatus" NOT NULL,
    "refundId" text,
    error text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "refundedAt" timestamp(3) without time zone
);


--
-- Name: EmailOtp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailOtp" (
    id text NOT NULL,
    email text NOT NULL,
    "codeHash" text NOT NULL,
    purpose public."OtpPurpose" NOT NULL,
    name text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "consumedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ExtensionRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExtensionRequest" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "newEndDate" date NOT NULL,
    "extraDays" integer NOT NULL,
    "extraAmount" integer NOT NULL,
    status public."ExtensionStatus" DEFAULT 'PENDING'::public."ExtensionStatus" NOT NULL,
    "paymentId" text,
    "razorpayOrderId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "decidedAt" timestamp(3) without time zone
);


--
-- Name: Item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Item" (
    id text NOT NULL,
    "ownerId" text NOT NULL,
    title text NOT NULL,
    category public."Category" NOT NULL,
    description text NOT NULL,
    photos text[],
    "pricePerDay" integer NOT NULL,
    "pricePerWeek" integer,
    deposit integer NOT NULL,
    "minDays" integer DEFAULT 1 NOT NULL,
    "maxDays" integer DEFAULT 30 NOT NULL,
    "canPickup" boolean DEFAULT true NOT NULL,
    "canDeliver" boolean DEFAULT false NOT NULL,
    "acceptsCashAtPickup" boolean DEFAULT false NOT NULL,
    "pickupNote" text,
    city text NOT NULL,
    area text NOT NULL,
    status public."ItemStatus" DEFAULT 'PENDING_REVIEW'::public."ItemStatus" NOT NULL,
    "rejectReason" text,
    views integer DEFAULT 0 NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text,
    type public."MessageType" DEFAULT 'TEXT'::public."MessageType" NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    "startDate" date,
    "endDate" date,
    "requestStatus" public."RequestStatus",
    "bookingId" text,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: OwnerApplication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OwnerApplication" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    categories public."Category"[],
    plans text NOT NULL,
    "termsAt" timestamp(3) without time zone NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone
);


--
-- Name: Payout; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payout" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "ownerId" text NOT NULL,
    amount integer NOT NULL,
    status public."PayoutStatus" DEFAULT 'PENDING'::public."PayoutStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone,
    reference text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "fromUserId" text NOT NULL,
    "toUserId" text NOT NULL,
    "itemId" text,
    rating integer NOT NULL,
    tags text[],
    text text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    phone text,
    city text,
    area text,
    address text,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "idStatus" public."IdStatus" DEFAULT 'NONE'::public."IdStatus" NOT NULL,
    "idDocType" text,
    "idDocPath" text,
    "selfiePath" text,
    "idRejectReason" text,
    "idSubmittedAt" timestamp(3) without time zone,
    "idReviewedAt" timestamp(3) without time zone,
    "ownerCancellations" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ownerRejectReason" text,
    "ownerStatus" public."OwnerStatus" DEFAULT 'NONE'::public."OwnerStatus" NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Area; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Area" (id, "cityId", name, "sortOrder") FROM stdin;
cmvqmlsmz0002uh58lbfvjni5	cmvqmlsmt0000uh58x01to7i3	Hebbal	0
cmvqmlsn50004uh58kc5shhwg	cmvqmlsmt0000uh58x01to7i3	Malleshwaram	1
cmvqmlsna0006uh58zmw1mk4c	cmvqmlsmt0000uh58x01to7i3	Indiranagar	2
cmvqmlsne0008uh58a8dxhib0	cmvqmlsmt0000uh58x01to7i3	Whitefield	3
cmvqmlsnh000auh581afh2se4	cmvqmlsmt0000uh58x01to7i3	Koramangala	4
cmvqmlsnl000cuh585c7k1ynh	cmvqmlsmt0000uh58x01to7i3	HSR Layout	5
cmvqmlsnu000euh58tncxll73	cmvqmlsmt0000uh58x01to7i3	Jayanagar	6
cmvqmlsnz000guh58zpeb67sr	cmvqmlsmt0000uh58x01to7i3	JP Nagar	7
cmvqmlso7000juh58mdyet973	cmvqmlso3000huh58vwn0lgfk	Thane West	0
cmvqmlsoa000luh58c0gytajp	cmvqmlso3000huh58vwn0lgfk	Malad	1
cmvqmlsoe000nuh582f3b0c3y	cmvqmlso3000huh58vwn0lgfk	Goregaon	2
cmvqmlsoh000puh58zjcgc2sc	cmvqmlso3000huh58vwn0lgfk	Powai	3
cmvqmlsol000ruh58b62cktyu	cmvqmlso3000huh58vwn0lgfk	Andheri West	4
cmvqmlsop000tuh58v1iyl2qb	cmvqmlso3000huh58vwn0lgfk	Juhu	5
cmvqmlsou000vuh58npgsxmt0	cmvqmlso3000huh58vwn0lgfk	Bandra West	6
cmvqmlsoy000xuh581z2yy6zm	cmvqmlso3000huh58vwn0lgfk	Colaba	7
cmvqmlsp70010uh58cjcvj8m6	cmvqmlsp2000yuh5817wvgxb4	Rohini	0
cmvqmlspb0012uh58isbftaqm	cmvqmlsp2000yuh5817wvgxb4	Karol Bagh	1
cmvqmlspg0014uh58imho7v4e	cmvqmlsp2000yuh5817wvgxb4	Connaught Place	2
cmvqmlspk0016uh580lm4hpvx	cmvqmlsp2000yuh5817wvgxb4	Mayur Vihar	3
cmvqmlspp0018uh58yucar8qw	cmvqmlsp2000yuh5817wvgxb4	Lajpat Nagar	4
cmvqmlspt001auh58ku8mzm09	cmvqmlsp2000yuh5817wvgxb4	Hauz Khas	5
cmvqmlspz001cuh58mwxqoph9	cmvqmlsp2000yuh5817wvgxb4	Saket	6
cmvqmlsq4001euh58mz1dai2v	cmvqmlsp2000yuh5817wvgxb4	Dwarka	7
cmvqmlsqc001huh58joc3grke	cmvqmlsq8001fuh58g460e8c6	Sector 18	0
cmvqmlsqg001juh58ce3dsko5	cmvqmlsq8001fuh58g460e8c6	Sector 50	1
cmvqmlsqk001luh586kqaxjh3	cmvqmlsq8001fuh58g460e8c6	Sector 62	2
cmvqmlsqo001nuh585f1k43kn	cmvqmlsq8001fuh58g460e8c6	Sector 76	3
cmvqmlsqs001puh58jme4937m	cmvqmlsq8001fuh58g460e8c6	Sector 137	4
cmvqmlsqw001ruh58bra74xnu	cmvqmlsq8001fuh58g460e8c6	Greater Noida West	5
cmvqmlsr4001uuh58zfkdwuxi	cmvqmlsr0001suh58oyg7cum9	Palam Vihar	0
cmvqmlsr8001wuh58dlhf9xg1	cmvqmlsr0001suh58oyg7cum9	DLF Phase 3	1
cmvqmlsrb001yuh58pv03qknp	cmvqmlsr0001suh58oyg7cum9	Cyber City	2
cmvqmlsrf0020uh58v9fpq3e5	cmvqmlsr0001suh58oyg7cum9	DLF Phase 1	3
cmvqmlsri0022uh581duoq8xm	cmvqmlsr0001suh58oyg7cum9	Golf Course Road	4
cmvqmlsrl0024uh58m2hx61vm	cmvqmlsr0001suh58oyg7cum9	Sector 56	5
cmvqmlsrp0026uh58oloplmnv	cmvqmlsr0001suh58oyg7cum9	Sohna Road	6
cmvqmlsrx0029uh581m4szj4c	cmvqmlsrt0027uh58i8ctvt9j	Aundh	0
cmvqmlss0002buh58uv4wtb66	cmvqmlsrt0027uh58i8ctvt9j	Baner	1
cmvqmlss4002duh58u1biweey	cmvqmlsrt0027uh58i8ctvt9j	Hinjewadi	2
cmvqmlss8002fuh58lqfz1eue	cmvqmlsrt0027uh58i8ctvt9j	Kothrud	3
cmvqmlssc002huh58fy6nwqdl	cmvqmlsrt0027uh58i8ctvt9j	Koregaon Park	4
cmvqmlssf002juh58pyl8h514	cmvqmlsrt0027uh58i8ctvt9j	Kalyani Nagar	5
cmvqmlssi002luh58swxnw4xq	cmvqmlsrt0027uh58i8ctvt9j	Viman Nagar	6
cmvqmlssk002nuh58wcntmirj	cmvqmlsrt0027uh58i8ctvt9j	Hadapsar	7
\.


--
-- Data for Name: BlockedDate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BlockedDate" (id, "itemId", date) FROM stdin;
\.


--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Booking" (id, code, "itemId", "renterId", "ownerId", "conversationId", "startDate", "endDate", days, "pricePerDay", "pricePerWeek", "rentAmount", "extensionAmount", deposit, "deliveryFee", "platformFee", total, mode, address, "pickupNote", "paymentMode", "razorpayOrderId", "paymentId", "amountPaid", "paidAt", "holdExpiresAt", status, "pickupOtp", "returnOtp", "otpAttempts", "cashCollected", "ownerKeepAmount", "confirmedAt", "pickedUpAt", "returnedAt", "returnConfirmedAt", "refundedAt", "cancelledAt", "cancelReason", "cancelledBy", "pickupReminderAt", "returnReminderAt", "overdueMailAt", "createdAt", "updatedAt") FROM stdin;
cmvqmluri00p6uh58veptdn32	KR-2026-480685	cmvqmlsvd003puh58eqapc8zw	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmlur100oyuh5839hs9kc5	2026-10-21	2026-10-25	4	300	1500	1200	0	6000	0	0	7200	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_5	7200	2026-10-19 04:52:34.301	\N	PICKED_UP	3949	8954	0	f	0	2026-10-19 04:52:34.301	2026-10-21 15:52:34.315	\N	\N	\N	\N	\N	\N	\N	\N	2026-10-28 12:04:00.923	2026-10-19 03:52:34.301	2026-10-28 12:04:01.332
cmvqmlune00niuh58od2mw09p	KR-2026-480137	cmvqmlsv7003luh58zwhz7732	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmlumx00nauh582vbvsiz3	2026-11-01	2026-11-03	2	700	4000	1400	0	10000	0	0	11400	PICKUP	\N	Near Indiranagar main road	\N	\N	\N	0	\N	\N	CANCELLED	8566	9975	0	f	0	\N	\N	\N	\N	\N	2026-10-28 12:04:01.061	payment not completed in time — the dates are free again	SYSTEM	\N	\N	\N	2026-10-27 08:52:34.153	2026-10-28 12:04:01.069
cmvqmlv4e00vkuh58srwhyyiw	KR-2026-481918	cmvqmlsv7003luh58zwhz7732	cmvqmlsyp004vuh58azi5rvep	cmvqmlssz002quh580lytgi99	cmvqmlv4000vcuh58j5xz7m6v	2026-09-07	2026-09-09	2	700	4000	1400	0	10000	0	0	11400	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_14	11400	2026-09-02 12:52:34.765	\N	DEPOSIT_REFUNDED	2642	4538	0	f	0	2026-09-02 12:52:34.765	2026-09-07 11:52:34.781	2026-09-09 11:52:34.781	2026-09-10 11:52:34.781	2026-09-10 11:52:34.781	\N	\N	\N	\N	\N	\N	2026-09-02 11:52:34.765	2026-10-27 11:52:34.782
cmvqmluso00pquh58ytk3y7vi	KR-2026-480822	cmvqmlsup003buh58cjyzxu9h	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmlusa00piuh58pr2il2s4	2026-10-22	2026-10-26	4	150	700	600	0	1500	0	0	2100	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_6	2100	2026-10-20 00:52:34.343	\N	RETURNED	8543	7335	0	f	0	2026-10-20 00:52:34.343	2026-10-22 13:52:34.36	2026-10-27 06:52:34.372	\N	\N	\N	\N	\N	\N	\N	\N	2026-10-19 23:52:34.343	2026-10-27 11:52:34.377
cmvqmluu400qeuh58r9phar5t	KR-2026-480959	cmvqmlsut003duh5855osls89	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmlutr00q6uh58meaw4sk9	2026-10-19	2026-10-23	4	800	4500	3200	0	8000	0	0	11200	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_7	11200	2026-10-16 16:52:34.395	\N	RETURNED	3090	6372	0	f	0	2026-10-16 16:52:34.395	2026-10-19 13:52:34.407	2026-10-26 05:52:34.416	\N	\N	\N	\N	\N	\N	\N	\N	2026-10-16 15:52:34.395	2026-10-27 11:52:34.42
cmvqmluzb00swuh58hyq63twc	KR-2026-481370	cmvqmlsui0037uh58cz7y6u77	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmluyw00souh58izb75qze	2026-10-13	2026-10-15	2	150	800	300	0	2000	0	0	2300	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_10	2300	2026-10-10 20:52:34.581	\N	DEPOSIT_REFUNDED	1635	5368	0	f	0	2026-10-10 20:52:34.581	2026-10-13 17:52:34.593	2026-10-15 19:52:34.602	2026-10-16 05:52:34.612	2026-10-16 05:52:34.612	\N	\N	\N	\N	\N	\N	2026-10-10 19:52:34.581	2026-10-27 11:52:34.614
cmvqmluvh00r6uh58stbbo4oa	KR-2026-481096	cmvqmlsuf0035uh58oflbhyih	cmvqmlswo0047uh58k9u2g0qg	cmvqmlssz002quh580lytgi99	cmvqmluv300qyuh58k694luh6	2026-10-18	2026-10-21	3	600	\N	1800	0	10000	0	0	11800	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_8	11800	2026-10-15 00:52:34.443	\N	DISPUTED	8084	8765	0	f	0	2026-10-15 00:52:34.443	2026-10-18 15:52:34.458	2026-10-24 13:52:34.472	\N	\N	\N	\N	\N	\N	\N	\N	2026-10-14 23:52:34.443	2026-10-27 11:52:34.476
cmvqmlv0u00tuuh584455pfv9	KR-2026-481507	cmvqmlsv0003huh58fd9app5c	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmlv0i00tmuh58exh5jdxx	2026-11-08	2026-11-10	2	200	1000	400	0	2000	0	0	2400	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_c11	2400	2026-10-25 10:52:34.648	\N	CANCELLED	1548	1951	0	f	0	2026-10-25 10:52:34.648	\N	\N	\N	\N	2026-10-26 11:52:34.648	plans changed	RENTER	\N	\N	\N	2026-10-25 09:52:34.636	2026-10-27 11:52:34.649
cmvqmlux500ryuh58z4znk79b	KR-2026-481233	cmvqmlsv3003juh58v3m9py9i	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmluwr00rquh58mm78wf9t	2026-10-07	2026-10-10	3	700	4000	2100	0	15000	0	0	17100	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_9	17100	2026-10-04 04:52:34.504	\N	DEPOSIT_REFUNDED	1545	1134	0	f	0	2026-10-04 04:52:34.504	2026-10-07 21:52:34.52	2026-10-10 19:52:34.532	2026-10-11 05:52:34.542	2026-10-11 05:52:34.542	\N	\N	\N	\N	\N	\N	2026-10-04 03:52:34.504	2026-10-27 11:52:34.544
cmvqmlv2200ucuh58pn16xpu3	KR-2026-481644	cmvqmlsua0033uh587uahbdhw	cmvqmlt5j0073uh58go1s5jdm	cmvqmlssz002quh580lytgi99	cmvqmlv1m00u4uh58ceydw2i1	2026-09-17	2026-09-19	2	1200	7000	2400	0	15000	0	0	17400	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_12	17400	2026-09-12 12:52:34.681	\N	DEPOSIT_REFUNDED	1246	3821	0	f	0	2026-09-12 12:52:34.681	2026-09-17 11:52:34.695	2026-09-19 11:52:34.695	2026-09-20 11:52:34.695	2026-09-20 11:52:34.695	\N	\N	\N	\N	\N	\N	2026-09-12 11:52:34.681	2026-10-27 11:52:34.696
cmvqmlv3700uyuh58479g5bkp	KR-2026-481781	cmvqmlsuw003fuh58ic927exb	cmvqmlsxn004juh58pupe813r	cmvqmlssz002quh580lytgi99	cmvqmlv2v00uquh587quusj0f	2026-09-12	2026-09-14	2	300	1500	600	0	3000	0	0	3600	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_13	3600	2026-09-07 12:52:34.722	\N	DEPOSIT_REFUNDED	9302	6107	0	f	0	2026-09-07 12:52:34.722	2026-09-12 11:52:34.735	2026-09-14 11:52:34.735	2026-09-15 11:52:34.735	2026-09-15 11:52:34.735	\N	\N	\N	\N	\N	\N	2026-09-07 11:52:34.722	2026-10-27 11:52:34.736
cmvqmlv5o00w6uh58lt5xtn40	KR-2026-482055	cmvqmlsul0039uh583aubhwws	cmvqmlt1p005tuh58ci8ax8kc	cmvqmlssz002quh580lytgi99	cmvqmlv5a00vyuh58bif4glrw	2026-09-02	2026-09-04	2	180	900	360	0	2000	0	0	2360	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_15	2360	2026-08-28 12:52:34.811	\N	DEPOSIT_REFUNDED	5322	9394	0	f	0	2026-08-28 12:52:34.811	2026-09-02 11:52:34.824	2026-09-04 11:52:34.824	2026-09-05 11:52:34.824	2026-09-05 11:52:34.824	\N	\N	\N	\N	\N	\N	2026-08-28 11:52:34.811	2026-10-27 11:52:34.825
cmvqmlv6s00wsuh58tncveshu	KR-2026-482192	cmvqmlsvd003puh58eqapc8zw	cmvqmlsx8004euh5828xw0y30	cmvqmlssz002quh580lytgi99	cmvqmlv6f00wkuh58mubbdkjg	2026-08-28	2026-08-30	2	300	1500	600	0	6000	0	0	6600	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_16	6600	2026-08-23 12:52:34.851	\N	DEPOSIT_REFUNDED	1270	1408	0	f	0	2026-08-23 12:52:34.851	2026-08-28 11:52:34.865	2026-08-30 11:52:34.865	2026-08-31 11:52:34.865	2026-08-31 11:52:34.865	\N	\N	\N	\N	\N	\N	2026-08-23 11:52:34.851	2026-10-27 11:52:34.867
cmvqmlv7z00xeuh58pg8gzl21	KR-2026-482329	cmvqmlsva003nuh58tfn7lvlj	cmvqmlt0b005cuh58qerxh6cc	cmvqmlssz002quh580lytgi99	cmvqmlv7m00x6uh58sddtte5t	2026-08-23	2026-08-25	2	200	1000	400	0	4000	0	0	4400	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_17	4400	2026-08-18 12:52:34.894	\N	DEPOSIT_REFUNDED	2852	6079	0	f	0	2026-08-18 12:52:34.894	2026-08-23 11:52:34.909	2026-08-25 11:52:34.909	2026-08-26 11:52:34.909	2026-08-26 11:52:34.909	\N	\N	\N	\N	\N	\N	2026-08-18 11:52:34.894	2026-10-27 11:52:34.91
cmvqmluoc00nuuh58vndv781t	KR-2026-480274	cmvqmlsuw003fuh58ic927exb	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmlunw00nmuh58egqtkk5p	2026-10-28	2026-10-30	2	300	1500	600	0	3000	99	0	3699	DELIVERY	Flat 4B, Lakshmi Residency, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru 560008	Near Indiranagar main road	DEMO	\N	demo_pay_seed_2	3699	2026-10-26 06:52:34.187	\N	CONFIRMED	8850	2204	0	f	0	2026-10-26 06:52:34.187	\N	\N	\N	\N	\N	\N	\N	2026-10-27 12:02:57.598	\N	\N	2026-10-26 05:52:34.187	2026-10-27 12:02:57.693
cmvqmlup900o8uh582zgat4tt	KR-2026-480411	cmvqmlsul0039uh583aubhwws	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmluow00o0uh58nba9u1e4	2026-10-29	2026-10-31	2	180	900	360	0	2000	0	0	2360	PICKUP	\N	Near Indiranagar main road	CASH_AT_PICKUP	\N	\N	0	2026-10-26 16:52:34.22	\N	CONFIRMED	3096	3224	0	f	0	2026-10-26 16:52:34.22	\N	\N	\N	\N	\N	\N	\N	2026-10-28 12:04:00.923	\N	\N	2026-10-26 15:52:34.22	2026-10-28 12:04:01.222
cmvqmluq600omuh58bndngs1k	KR-2026-480548	cmvqmlsva003nuh58tfn7lvlj	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmlupr00oeuh58456gclxd	2026-10-25	2026-10-29	4	200	1000	800	0	4000	0	0	4800	PICKUP	\N	Near Indiranagar main road	DEMO	\N	demo_pay_seed_4	4800	2026-10-23 12:52:34.253	\N	PICKED_UP	3336	1688	0	f	0	2026-10-23 12:52:34.253	2026-10-25 13:52:34.27	\N	\N	\N	\N	\N	\N	\N	2026-10-28 12:04:00.923	\N	2026-10-23 11:52:34.253	2026-10-28 12:04:01.264
\.


--
-- Data for Name: City; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."City" (id, name, "sortOrder") FROM stdin;
cmvqmlsmt0000uh58x01to7i3	Bengaluru	0
cmvqmlso3000huh58vwn0lgfk	Mumbai	1
cmvqmlsp2000yuh5817wvgxb4	Delhi	2
cmvqmlsq8001fuh58g460e8c6	Noida	3
cmvqmlsr0001suh58oyg7cum9	Gurugram	4
cmvqmlsrt0027uh58i8ctvt9j	Pune	5
\.


--
-- Data for Name: Complaint; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Complaint" (id, "bookingId", "byUserId", reason, text, photos, status, "adminNote", "createdAt") FROM stdin;
cmvqmlv1i00u2uh588x7i992v	cmvqmluq600omuh58bndngs1k	cmvqmlssu002puh58xnyf3xxd	Item not working	The low E string snapped on day one. Owner is not replying yet.	{}	OPEN	\N	2026-10-27 11:52:34.663
\.


--
-- Data for Name: ConditionReport; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ConditionReport" (id, "bookingId", stage, "byUserId", photos, notes, "createdAt") FROM stdin;
cmvqmluqn00osuh58ymzs26t1	cmvqmluq600omuh58bndngs1k	PICKUP	cmvqmlssz002quh580lytgi99	{/demo/guitar-1.jpg,/demo/guitar-2.jpg}	Small scuff on the side — already there.	2026-10-25 13:52:34.27
cmvqmluqr00ouuh58cck8rdjl	cmvqmluq600omuh58bndngs1k	PICKUP	cmvqmlssu002puh58xnyf3xxd	{/demo/guitar-1.jpg}		2026-10-25 13:52:34.27
cmvqmlurw00pcuh58mi8y9byu	cmvqmluri00p6uh58veptdn32	PICKUP	cmvqmlssz002quh580lytgi99	{/demo/mtb-1.jpg,/demo/mtb-2.jpg}	Small scuff on the side — already there.	2026-10-21 15:52:34.315
cmvqmlus000peuh58gdazv2l5	cmvqmluri00p6uh58veptdn32	PICKUP	cmvqmlssu002puh58xnyf3xxd	{/demo/mtb-1.jpg}		2026-10-21 15:52:34.315
cmvqmlut500pwuh586wn2izb0	cmvqmluso00pquh58ytk3y7vi	PICKUP	cmvqmlssz002quh580lytgi99	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	Small scuff on the side — already there.	2026-10-22 13:52:34.36
cmvqmlut700pyuh58o5qvupyu	cmvqmluso00pquh58ytk3y7vi	PICKUP	cmvqmlssu002puh58xnyf3xxd	{/demo/ladder-1.jpg}		2026-10-22 13:52:34.36
cmvqmluti00q2uh58dztqs2u5	cmvqmluso00pquh58ytk3y7vi	RETURN	cmvqmlssz002quh580lytgi99	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}		2026-10-27 06:52:34.372
cmvqmluug00qkuh583jnymn5l	cmvqmluu400qeuh58r9phar5t	PICKUP	cmvqmlssz002quh580lytgi99	{/demo/speaker-1.jpg,/demo/speaker-2.jpg}	Small scuff on the side — already there.	2026-10-19 13:52:34.407
cmvqmluui00qmuh583d51nua5	cmvqmluu400qeuh58r9phar5t	PICKUP	cmvqmlssu002puh58xnyf3xxd	{/demo/speaker-1.jpg}		2026-10-19 13:52:34.407
cmvqmluup00qquh58tlm1zmgt	cmvqmluu400qeuh58r9phar5t	RETURN	cmvqmlssz002quh580lytgi99	{/demo/speaker-1.jpg,/demo/speaker-2.jpg}		2026-10-26 05:52:34.416
cmvqmluvv00rcuh58y36mwo18	cmvqmluvh00r6uh58stbbo4oa	PICKUP	cmvqmlssz002quh580lytgi99	{/demo/lens-1.jpg,/demo/lens-2.jpg}	Small scuff on the side — already there.	2026-10-18 15:52:34.458
cmvqmluvy00reuh58gwbxxoph	cmvqmluvh00r6uh58stbbo4oa	PICKUP	cmvqmlswo0047uh58k9u2g0qg	{/demo/lens-1.jpg}		2026-10-18 15:52:34.458
cmvqmluw900riuh58racymxe1	cmvqmluvh00r6uh58stbbo4oa	RETURN	cmvqmlssz002quh580lytgi99	{/demo/lens-1.jpg,/demo/lens-2.jpg}		2026-10-24 13:52:34.472
cmvqmluxl00s4uh584ck7jngx	cmvqmlux500ryuh58z4znk79b	PICKUP	cmvqmlssz002quh580lytgi99	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	Small scuff on the side — already there.	2026-10-07 21:52:34.52
cmvqmluxo00s6uh585cof1dff	cmvqmlux500ryuh58z4znk79b	PICKUP	cmvqmlssu002puh58xnyf3xxd	{/demo/ps5-1.jpg}		2026-10-07 21:52:34.52
cmvqmluxy00sauh5849ots73w	cmvqmlux500ryuh58z4znk79b	RETURN	cmvqmlssz002quh580lytgi99	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}		2026-10-10 19:52:34.532
cmvqmluzm00t2uh58d7rfbyd0	cmvqmluzb00swuh58hyq63twc	PICKUP	cmvqmlssz002quh580lytgi99	{/demo/tripod-1.jpg,/demo/tripod-2.jpg}	Small scuff on the side — already there.	2026-10-13 17:52:34.593
cmvqmluzo00t4uh58p7p7pkh6	cmvqmluzb00swuh58hyq63twc	PICKUP	cmvqmlssu002puh58xnyf3xxd	{/demo/tripod-1.jpg}		2026-10-13 17:52:34.593
cmvqmluzv00t8uh58vij1ucn0	cmvqmluzb00swuh58hyq63twc	RETURN	cmvqmlssz002quh580lytgi99	{/demo/tripod-1.jpg,/demo/tripod-2.jpg}		2026-10-15 19:52:34.602
\.


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContactMessage" (id, name, email, message, resolved, "adminNote", "createdAt") FROM stdin;
cmvqmlv9200xvuh58tt61g8xm	Sanjay Rao	sanjay.rao@example.com	Do you plan to launch in Hyderabad? I have camping gear to lend.	f	\N	2026-10-27 11:52:34.934
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Conversation" (id, "itemId", "renterId", "ownerId", "renterReadAt", "ownerReadAt", "createdAt", "updatedAt") FROM stdin;
cmvqmlupr00oeuh58456gclxd	cmvqmlsva003nuh58tfn7lvlj	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.267	2026-10-27 11:52:34.267	2026-10-19 03:52:34.238	2026-10-23 13:52:34.267
cmvqmlur100oyuh5839hs9kc5	cmvqmlsvd003puh58eqapc8zw	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.313	2026-10-27 11:52:34.313	2026-10-19 03:52:34.284	2026-10-19 05:52:34.313
cmvqmlusa00piuh58pr2il2s4	cmvqmlsup003buh58cjyzxu9h	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.357	2026-10-27 11:52:34.357	2026-10-19 03:52:34.328	2026-10-20 01:52:34.357
cmvqmlutr00q6uh58meaw4sk9	cmvqmlsut003duh5855osls89	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.405	2026-10-27 11:52:34.405	2026-10-19 03:52:34.382	2026-10-16 17:52:34.405
cmvqmluv300qyuh58k694luh6	cmvqmlsuf0035uh58oflbhyih	cmvqmlswo0047uh58k9u2g0qg	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.456	2026-10-27 11:52:34.456	2026-10-19 03:52:34.43	2026-10-15 01:52:34.456
cmvqmluwr00rquh58mm78wf9t	cmvqmlsv3003juh58v3m9py9i	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.517	2026-10-27 11:52:34.517	2026-10-19 03:52:34.49	2026-10-04 05:52:34.517
cmvqmluyw00souh58izb75qze	cmvqmlsui0037uh58cz7y6u77	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.591	2026-10-27 11:52:34.591	2026-10-19 03:52:34.567	2026-10-10 21:52:34.591
cmvqmlv0i00tmuh58exh5jdxx	cmvqmlsv0003huh58fd9app5c	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.645	2026-10-27 11:52:34.645	2026-10-19 03:52:34.625	2026-10-25 11:52:34.645
cmvqmlv1m00u4uh58ceydw2i1	cmvqmlsua0033uh587uahbdhw	cmvqmlt5j0073uh58go1s5jdm	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.692	2026-10-27 11:52:34.692	2026-10-19 03:52:34.665	2026-09-12 13:52:34.692
cmvqmlv2v00uquh587quusj0f	cmvqmlsuw003fuh58ic927exb	cmvqmlsxn004juh58pupe813r	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.732	2026-10-27 11:52:34.732	2026-10-19 03:52:34.71	2026-09-07 13:52:34.732
cmvqmlv4000vcuh58j5xz7m6v	cmvqmlsv7003luh58zwhz7732	cmvqmlsyp004vuh58azi5rvep	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.778	2026-10-27 11:52:34.778	2026-10-19 03:52:34.75	2026-09-02 13:52:34.778
cmvqmluln00n4uh580acn6lu3	cmvqmlsua0033uh587uahbdhw	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.131	\N	2026-10-19 03:52:34.09	2026-10-27 08:58:34.131
cmvqmlunw00nmuh58egqtkk5p	cmvqmlsuw003fuh58ic927exb	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.203	2026-10-27 11:52:34.203	2026-10-19 03:52:34.171	2026-10-26 07:52:34.203
cmvqmlv5a00vyuh58bif4glrw	cmvqmlsul0039uh583aubhwws	cmvqmlt1p005tuh58ci8ax8kc	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.821	2026-10-27 11:52:34.821	2026-10-19 03:52:34.797	2026-08-28 13:52:34.821
cmvqmluow00o0uh58nba9u1e4	cmvqmlsul0039uh583aubhwws	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.234	2026-10-27 11:52:34.234	2026-10-19 03:52:34.207	2026-10-26 17:52:34.234
cmvqmlv6f00wkuh58mubbdkjg	cmvqmlsvd003puh58eqapc8zw	cmvqmlsx8004euh5828xw0y30	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.863	2026-10-27 11:52:34.863	2026-10-19 03:52:34.838	2026-08-23 13:52:34.863
cmvqmlv7m00x6uh58sddtte5t	cmvqmlsva003nuh58tfn7lvlj	cmvqmlt0b005cuh58qerxh6cc	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.906	2026-10-27 11:52:34.906	2026-10-19 03:52:34.88	2026-08-18 13:52:34.906
cmvqmlv8v00xsuh58gsqa131b	cmvqmlsvm003vuh58wujqzpcq	cmvqmlst9002tuh580d6oo0zv	cmvqmlssz002quh580lytgi99	\N	\N	2026-10-19 03:52:34.926	2026-10-27 11:52:34.927
cmvqmz76w0005uhjwbx9iyx97	cmvqmltni00cluh58pqzh1tt0	cmvqmyzoi0001uhjwld52ac7z	cmvqmltn300cfuh583vxlblc8	2026-10-27 12:14:13.737	\N	2026-10-27 12:02:56.936	2026-10-27 12:14:13.746
cmvqmlumx00nauh582vbvsiz3	cmvqmlsv7003luh58zwhz7732	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	2026-10-27 11:52:34.167	2026-10-27 11:52:34.167	2026-10-19 03:52:34.136	2026-10-28 12:04:01.102
cmvs2genp000duhjwmnjlntn4	cmvqmltt300eduh5840kh3nos	cmvqmyzoi0001uhjwld52ac7z	cmvqmltsi00e7uh5866xzv1io	2026-10-28 12:04:16.519	\N	2026-10-28 12:04:00.18	2026-10-28 12:04:16.529
\.


--
-- Data for Name: DamageClaim; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DamageClaim" (id, "bookingId", amount, "lateFee", reason, photos, status, "renterNote", "adminDecisionAmount", "adminNote", "createdAt", "decidedAt") FROM stdin;
cmvqmluux00quuh58zcuaqb1w	cmvqmluu400qeuh58r9phar5t	1200	0	Damage: the grille has a dent that is not in the pickup photos. Repair quote ₹1,200.	{/demo/speaker-2.jpg}	OPEN	\N	\N	\N	2026-10-27 05:52:34.424	\N
cmvqmluwi00rmuh58c68b6app	cmvqmluvh00r6uh58stbbo4oa	800	0	Missing part: rear lens cap is missing. Replacement ₹800.	{}	DISPUTED	The rear cap was on the lens when I returned it — it was checked in front of me.	\N	\N	2026-10-24 23:52:34.481	\N
cmvqmlv0200tcuh58gg2y0r9j	cmvqmluzb00swuh58hyq63twc	300	0	Missing part: quick-release plate not returned.	\N	ACCEPTED	\N	\N	\N	2026-10-16 00:52:34.609	2026-10-16 05:52:34.609
\.


--
-- Data for Name: DepositRefund; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DepositRefund" (id, "bookingId", kind, amount, status, "refundId", error, "createdAt", "refundedAt") FROM stdin;
cmvqmluyb00seuh58xegkc32f	cmvqmlux500ryuh58z4znk79b	DEPOSIT	15000	REFUNDED	demo_rfnd_seed_znk79b	\N	2026-10-11 05:52:34.542	2026-10-11 05:52:34.542
cmvqmlv0800teuh58rlm1ui73	cmvqmluzb00swuh58hyq63twc	DEPOSIT	1700	REFUNDED	demo_rfnd_seed_q63twc	\N	2026-10-16 05:52:34.612	2026-10-16 05:52:34.612
cmvqmlv1900tyuh58z85wu4xa	cmvqmlv0u00tuuh584455pfv9	CANCELLATION	2400	REFUNDED	demo_rfnd_seed_c11	\N	2026-10-26 11:52:34.652	2026-10-26 11:52:34.652
cmvqmlv2k00uiuh587uqpypdu	cmvqmlv2200ucuh58pn16xpu3	DEPOSIT	15000	REFUNDED	demo_rfnd_x0	\N	2026-10-27 11:52:34.7	2026-09-20 11:52:34.699
cmvqmlv3n00v4uh585qlt3yxh	cmvqmlv3700uyuh58479g5bkp	DEPOSIT	3000	REFUNDED	demo_rfnd_x1	\N	2026-10-27 11:52:34.74	2026-09-15 11:52:34.738
cmvqmlv4y00vquh58tcehtyuj	cmvqmlv4e00vkuh58srwhyyiw	DEPOSIT	10000	REFUNDED	demo_rfnd_x2	\N	2026-10-27 11:52:34.786	2026-09-10 11:52:34.785
cmvqmlv6400wcuh580fmrfotn	cmvqmlv5o00w6uh58lt5xtn40	DEPOSIT	2000	REFUNDED	demo_rfnd_x3	\N	2026-10-27 11:52:34.829	2026-09-05 11:52:34.827
cmvqmlv7a00wyuh58flh17be2	cmvqmlv6s00wsuh58tncveshu	DEPOSIT	6000	REFUNDED	demo_rfnd_x4	\N	2026-10-27 11:52:34.87	2026-08-31 11:52:34.869
cmvqmlv8i00xkuh586cvo5ups	cmvqmlv7z00xeuh58pg8gzl21	DEPOSIT	4000	REFUNDED	demo_rfnd_x5	\N	2026-10-27 11:52:34.914	2026-08-26 11:52:34.912
\.


--
-- Data for Name: EmailOtp; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EmailOtp" (id, email, "codeHash", purpose, name, "expiresAt", attempts, "consumedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: ExtensionRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ExtensionRequest" (id, "bookingId", "newEndDate", "extraDays", "extraAmount", status, "paymentId", "razorpayOrderId", "createdAt", "decidedAt") FROM stdin;
\.


--
-- Data for Name: Item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Item" (id, "ownerId", title, category, description, photos, "pricePerDay", "pricePerWeek", deposit, "minDays", "maxDays", "canPickup", "canDeliver", "acceptsCashAtPickup", "pickupNote", city, area, status, "rejectReason", views, "deletedAt", "createdAt", "updatedAt") FROM stdin;
cmvqmltni00cluh58pqzh1tt0	cmvqmltn300cfuh583vxlblc8	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	t	f	Near Lajpat Nagar main road	Delhi	Lajpat Nagar	ACTIVE	\N	206	\N	2026-10-07 16:55:18.793	2026-10-27 12:02:47.66
cmvqmluk800mluh58oye0sjw7	cmvqmluk000mjuh58rkrwanau	Fairy lights (20 strings)	PARTY	20 warm-white LED strings, 10 m each, with extension boards and plugs.	{/demo/lights-1.jpg}	400	\N	2000	1	30	t	t	f	Near Hadapsar main road	Pune	Hadapsar	ACTIVE	\N	200	\N	2026-09-01 10:44:03.085	2026-10-27 11:52:34.04
cmvqmlukb00mnuh5841jlmb2w	cmvqmluk000mjuh58rkrwanau	Carbon travel tripod	CAMERAS	Light carbon tripod with ball head and quick-release plate. Folds to 40 cm.	{/demo/tripod-1.jpg,/demo/tripod-2.jpg}	150	800	2000	1	30	t	f	f	Near Hadapsar main road	Pune	Hadapsar	ACTIVE	\N	126	\N	2026-10-02 07:48:59.376	2026-10-27 11:52:34.044
cmvqmltt300eduh5840kh3nos	cmvqmltsi00e7uh5866xzv1io	Badminton set (4 rackets + net)	SPORTS	Four rackets, shuttles and a portable net with poles.	{/demo/badminton-1.jpg}	80	400	800	1	30	t	f	t	Near Dwarka main road	Delhi	Dwarka	ACTIVE	\N	62	\N	2026-10-24 11:01:33.526	2026-10-28 12:03:50.764
cmvqmlukf00mpuh584v9y2apy	cmvqmluk000mjuh58rkrwanau	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	f	f	Near Hadapsar main road	Pune	Hadapsar	ACTIVE	\N	179	\N	2026-09-23 23:32:57.903	2026-10-27 11:52:34.047
cmvqmlukp00msuh58lkq9hrhv	cmvqmluki00mquh58yjymyaji	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	f	t	Near Hadapsar main road	Pune	Hadapsar	ACTIVE	\N	192	\N	2026-09-03 03:16:58.442	2026-10-27 11:52:34.057
cmvqmlukr00muuh588jqdn6kr	cmvqmluki00mquh58yjymyaji	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	t	f	Near Hadapsar main road	Pune	Hadapsar	ACTIVE	\N	83	\N	2026-10-03 19:06:38.919	2026-10-27 11:52:34.06
cmvqmluku00mwuh58p6fggibs	cmvqmluki00mquh58yjymyaji	Electric lawn mower	TOOLS	Corded electric mower with grass box and 15 m extension cable.	{/demo/mower-1.jpg,/demo/mower-2.jpg}	350	1800	4000	1	30	t	t	f	Near Hadapsar main road	Pune	Hadapsar	ACTIVE	\N	216	\N	2026-09-30 15:16:49.286	2026-10-27 11:52:34.062
cmvqmlul400myuh5896r9gn93	cmvqmlud800jvuh58oxqzmh53	Digital piano (88 keys)	MUSIC	Weighted-key digital piano with stand, sustain pedal and headphones.	{/demo/piano-1.jpg,/demo/piano-2.jpg}	500	2800	10000	3	30	t	f	f	Near Aundh main road	Pune	Aundh	PENDING_REVIEW	\N	0	\N	2026-10-27 09:52:34.071	2026-10-27 11:52:34.073
cmvqmlul800n0uh58lmzaqo0z	cmvqmlteq00a7uh580kcewoln	Inflatable kayak (2 person)	SPORTS	Two-person inflatable kayak with paddles, pump and life jackets.	{/demo/kayak-1.jpg,/demo/kayak-2.jpg}	600	\N	8000	1	30	t	f	f	Near Bandra West main road	Mumbai	Bandra West	PENDING_REVIEW	\N	0	\N	2026-10-27 08:52:34.075	2026-10-27 11:52:34.076
cmvqmlulb00n2uh58wjc56mxm	cmvqmlu2500geuh580gm1t9yl	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	f	f	Near Greater Noida West main road	Noida	Greater Noida West	PENDING_REVIEW	\N	0	\N	2026-10-27 07:52:34.078	2026-10-27 11:52:34.08
cmvqmlsua0033uh587uahbdhw	cmvqmlssz002quh580lytgi99	Sony A7 III + 28–70mm kit	CAMERAS	Full-frame mirrorless body with the 28–70mm kit lens, 2 batteries, charger, 64 GB card and padded bag.	{/demo/mirrorless-1.jpg,/demo/mirrorless-2.jpg}	1200	7000	15000	1	30	t	t	t	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	226	\N	2026-04-10 11:52:31.808	2026-10-27 11:52:31.81
cmvqmlsuf0035uh58oflbhyih	cmvqmlssz002quh580lytgi99	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	f	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	60	\N	2026-04-20 11:52:31.813	2026-10-27 11:52:31.815
cmvqmlsui0037uh58cz7y6u77	cmvqmlssz002quh580lytgi99	Carbon travel tripod	CAMERAS	Light carbon tripod with ball head and quick-release plate. Folds to 40 cm.	{/demo/tripod-1.jpg,/demo/tripod-2.jpg}	150	800	2000	1	30	t	t	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	72	\N	2026-04-30 11:52:31.817	2026-10-27 11:52:31.818
cmvqmlsul0039uh583aubhwws	cmvqmlssz002quh580lytgi99	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	f	t	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	115	\N	2026-05-10 11:52:31.82	2026-10-27 11:52:31.821
cmvqmlsup003buh58cjyzxu9h	cmvqmlssz002quh580lytgi99	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	t	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	63	\N	2026-05-20 11:52:31.823	2026-10-27 11:52:31.825
cmvqmlsut003duh5855osls89	cmvqmlssz002quh580lytgi99	JBL party speaker with lights	PARTY	Loud Bluetooth party speaker with light show, mic input and wheels. Runs 12 h on battery.	{/demo/speaker-1.jpg,/demo/speaker-2.jpg}	800	4500	8000	1	30	t	f	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	115	\N	2026-05-30 11:52:31.827	2026-10-27 11:52:31.829
cmvqmlsuw003fuh58ic927exb	cmvqmlssz002quh580lytgi99	4-person dome tent	CAMPING	Waterproof dome tent for four with rain fly, pegs, ropes and carry bag.	{/demo/tent-1.jpg,/demo/tent-2.jpg}	300	1500	3000	1	30	t	t	t	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	57	\N	2026-06-09 11:52:31.831	2026-10-27 11:52:31.832
cmvqmlsv0003huh58fd9app5c	cmvqmlssz002quh580lytgi99	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	f	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	133	\N	2026-06-19 11:52:31.834	2026-10-27 11:52:31.836
cmvqmlsv3003juh58v3m9py9i	cmvqmlssz002quh580lytgi99	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	t	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	162	\N	2026-06-29 11:52:31.838	2026-10-27 11:52:31.84
cmvqmlsv7003luh58zwhz7732	cmvqmlssz002quh580lytgi99	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	f	t	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	9	\N	2026-07-09 11:52:31.841	2026-10-27 11:52:31.843
cmvqmlsva003nuh58tfn7lvlj	cmvqmlssz002quh580lytgi99	Yamaha acoustic guitar	MUSIC	Full-size acoustic guitar, freshly strung, with gig bag, capo and picks.	{/demo/guitar-1.jpg,/demo/guitar-2.jpg}	200	1000	4000	1	30	t	t	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	81	\N	2026-07-19 11:52:31.844	2026-10-27 11:52:31.846
cmvqmlsvd003puh58eqapc8zw	cmvqmlssz002quh580lytgi99	Mountain bike (21 gears)	SPORTS	21-gear mountain bike with helmet and lock. Serviced every month.	{/demo/mtb-1.jpg,/demo/mtb-2.jpg}	300	1500	6000	1	30	t	f	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	61	\N	2026-07-29 11:52:31.848	2026-10-27 11:52:31.849
cmvqmlsvg003ruh58qru4v5jc	cmvqmlssz002quh580lytgi99	Canon EOS 200D DSLR kit	CAMERAS	Beginner-friendly DSLR with 18–55mm lens, battery, charger, 32 GB card and strap.	{/demo/dslr-1.jpg,/demo/dslr-2.jpg}	600	3500	8000	1	30	t	t	t	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	26	\N	2026-06-29 11:52:31.85	2026-10-27 11:52:31.852
cmvqmlsvj003tuh58esp2zrxz	cmvqmlssz002quh580lytgi99	Karaoke wireless mic set	PARTY	Two wireless microphones with receiver. Works with any speaker or TV.	{/demo/karaoke-1.jpg,/demo/karaoke-2.jpg}	300	1500	2500	1	30	t	t	f	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	64	\N	2026-07-06 11:52:31.854	2026-10-27 11:52:31.855
cmvqmlsvm003vuh58wujqzpcq	cmvqmlssz002quh580lytgi99	Nintendo Switch with games	GAMING	Switch console with dock, Joy-Cons and Mario Kart + party games.	{/demo/switch-1.jpg,/demo/switch-2.jpg}	450	2500	10000	1	30	t	t	t	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	225	\N	2026-07-13 11:52:31.857	2026-10-27 11:52:31.859
cmvqmlsvq003xuh58b21796kp	cmvqmlssz002quh580lytgi99	Cajon box drum	MUSIC	Wooden cajon with snare wires and a padded seat cover.	{/demo/cajon-1.jpg,/demo/cajon-2.jpg}	150	700	2000	1	30	t	t	f	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	31	\N	2026-07-20 11:52:31.861	2026-10-27 11:52:31.863
cmvqmlsvu003zuh58vhjd43jk	cmvqmlssz002quh580lytgi99	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	f	Near Indiranagar main road	Bengaluru	Indiranagar	PENDING_REVIEW	\N	0	\N	2026-10-27 06:52:31.865	2026-10-27 11:52:31.867
cmvqmlsvy0041uh58iqivel08	cmvqmlssz002quh580lytgi99	Fairy lights (20 strings)	PARTY	20 warm-white LED strings, 10 m each, with extension boards and plugs.	{/demo/lights-1.jpg}	400	\N	2000	1	30	t	f	f	Near Indiranagar main road	Bengaluru	Indiranagar	REJECTED	Only 1 photo. Add photos of all strings and the plugs.	0	\N	2026-10-23 11:52:31.869	2026-10-27 11:52:31.87
cmvqmlswg0044uh58pnxq6q9n	cmvqmlsw30042uh58jsn215ql	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	t	f	Near Hebbal main road	Bengaluru	Hebbal	ACTIVE	\N	80	\N	2026-10-24 11:35:55.922	2026-10-27 11:52:31.889
cmvqmlswk0046uh58etmeme7r	cmvqmlsw30042uh58jsn215ql	Electric guitar + practice amp	MUSIC	Electric guitar with 20 W amp, cable, strap and tuner.	{/demo/eguitar-1.jpg,/demo/eguitar-2.jpg}	450	2500	8000	1	30	t	f	t	Near Hebbal main road	Bengaluru	Hebbal	ACTIVE	\N	30	\N	2026-09-03 07:13:27.32	2026-10-27 11:52:31.893
cmvqmlswx0049uh58cou5k3zs	cmvqmlswo0047uh58k9u2g0qg	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	t	f	Near Hebbal main road	Bengaluru	Hebbal	ACTIVE	\N	55	\N	2026-10-25 17:44:06.941	2026-10-27 11:52:31.905
cmvqmlsx1004buh58s8dcdq5u	cmvqmlswo0047uh58k9u2g0qg	Electric lawn mower	TOOLS	Corded electric mower with grass box and 15 m extension cable.	{/demo/mower-1.jpg,/demo/mower-2.jpg}	350	1800	4000	1	30	t	f	f	Near Hebbal main road	Bengaluru	Hebbal	ACTIVE	\N	116	\N	2026-10-17 15:40:45.596	2026-10-27 11:52:31.909
cmvqmlsx4004duh58mlhzfck6	cmvqmlswo0047uh58k9u2g0qg	Mini portable projector	PROJECTORS	Pocket projector with built-in battery and speaker. Connects to phones.	{/demo/miniprojector-1.jpg}	350	1800	5000	1	30	t	t	t	Near Hebbal main road	Bengaluru	Hebbal	ACTIVE	\N	155	\N	2026-10-05 01:12:51.533	2026-10-27 11:52:31.913
cmvqmlsxg004guh58usw7o6er	cmvqmlsx8004euh5828xw0y30	Folding chairs (set of 10)	PARTY	Ten steel folding chairs with padded seats. Delivery recommended.	{/demo/chairs-1.jpg}	500	2500	3000	1	30	t	f	t	Near Malleshwaram main road	Bengaluru	Malleshwaram	ACTIVE	\N	65	\N	2026-09-12 05:34:16.657	2026-10-27 11:52:31.925
cmvqmlsxk004iuh58rxwvkkdm	cmvqmlsx8004euh5828xw0y30	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	f	t	Near Malleshwaram main road	Bengaluru	Malleshwaram	ACTIVE	\N	197	\N	2026-09-25 23:50:22.823	2026-10-27 11:52:31.928
cmvqmlsxw004luh58iysrj1b0	cmvqmlsxn004juh58pupe813r	Racing wheel + pedals	GAMING	Force-feedback steering wheel with pedals. Works with PC and PlayStation.	{/demo/wheel-1.jpg,/demo/wheel-2.jpg}	350	\N	6000	1	30	t	f	f	Near Malleshwaram main road	Bengaluru	Malleshwaram	ACTIVE	\N	112	\N	2026-10-23 03:48:41.131	2026-10-27 11:52:31.941
cmvqmlsy0004nuh58p6stwk9p	cmvqmlsxn004juh58pupe813r	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	t	f	Near Malleshwaram main road	Bengaluru	Malleshwaram	ACTIVE	\N	185	\N	2026-09-15 09:31:47.094	2026-10-27 11:52:31.944
cmvqmlsy4004puh58ofp15t41	cmvqmlsxn004juh58pupe813r	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	f	f	Near Malleshwaram main road	Bengaluru	Malleshwaram	ACTIVE	\N	230	\N	2026-10-06 22:01:52.608	2026-10-27 11:52:31.948
cmvqmlsyg004suh58t8tel7zj	cmvqmlsy7004quh58psli72a0	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	t	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	63	\N	2026-10-14 22:12:54.019	2026-10-27 11:52:31.96
cmvqmlsyk004uuh58mj0t25qs	cmvqmlsy7004quh58psli72a0	Mini portable projector	PROJECTORS	Pocket projector with built-in battery and speaker. Connects to phones.	{/demo/miniprojector-1.jpg}	350	1800	5000	1	30	t	f	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	171	\N	2026-09-25 02:46:42.702	2026-10-27 11:52:31.965
cmvqmlsz1004xuh583i2eg7ju	cmvqmlsyp004vuh58azi5rvep	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	f	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	115	\N	2026-10-24 17:58:06.904	2026-10-27 11:52:31.981
cmvqmlsz5004zuh58cb6ue0th	cmvqmlsyp004vuh58azi5rvep	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	t	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	162	\N	2026-10-15 09:19:33.53	2026-10-27 11:52:31.985
cmvqmlszk0052uh583uqyn26t	cmvqmlsz90050uh58newfnyrc	Camping gas stove + cookset	CAMPING	Portable gas stove with pot, pan and kettle. Gas canister not included.	{/demo/stove-1.jpg,/demo/stove-2.jpg}	100	500	1000	1	30	t	f	t	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	75	\N	2026-09-28 20:43:22.676	2026-10-27 11:52:32
cmvqmlszn0054uh58n4um6opy	cmvqmlsz90050uh58newfnyrc	Angle grinder 4 inch	TOOLS	Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.	{/demo/grinder-1.jpg,/demo/grinder-2.jpg}	150	\N	1500	1	30	t	t	f	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	39	\N	2026-09-20 13:01:48.509	2026-10-27 11:52:32.003
cmvqmlszr0056uh58a7oad7m4	cmvqmlsz90050uh58newfnyrc	Mini portable projector	PROJECTORS	Pocket projector with built-in battery and speaker. Connects to phones.	{/demo/miniprojector-1.jpg}	350	1800	5000	1	30	t	f	t	Near Indiranagar main road	Bengaluru	Indiranagar	ACTIVE	\N	171	\N	2026-09-02 17:52:43.13	2026-10-27 11:52:32.008
cmvqmlt030059uh586ec9nbim	cmvqmlszv0057uh58ymhloenp	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	f	f	Near Whitefield main road	Bengaluru	Whitefield	ACTIVE	\N	26	\N	2026-10-14 11:20:20.072	2026-10-27 11:52:32.02
cmvqmlt07005buh58gjyfq867	cmvqmlszv0057uh58ymhloenp	DJ controller (2 decks)	MUSIC	Two-deck DJ controller with headphones and laptop stand.	{/demo/dj-1.jpg,/demo/dj-2.jpg}	700	4000	12000	1	30	t	f	f	Near Whitefield main road	Bengaluru	Whitefield	ACTIVE	\N	123	\N	2026-10-12 21:25:54.595	2026-10-27 11:52:32.023
cmvqmlt0i005euh58nl7g4ls1	cmvqmlt0b005cuh58qerxh6cc	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	f	t	Near Whitefield main road	Bengaluru	Whitefield	ACTIVE	\N	9	\N	2026-09-04 12:23:55.012	2026-10-27 11:52:32.035
cmvqmlt0m005guh58f7rugy46	cmvqmlt0b005cuh58qerxh6cc	Sony A7 III + 28–70mm kit	CAMERAS	Full-frame mirrorless body with the 28–70mm kit lens, 2 batteries, charger, 64 GB card and padded bag.	{/demo/mirrorless-1.jpg,/demo/mirrorless-2.jpg}	1200	7000	15000	1	30	t	f	t	Near Whitefield main road	Bengaluru	Whitefield	ACTIVE	\N	225	\N	2026-09-18 03:50:42.744	2026-10-27 11:52:32.038
cmvqmlt0x005juh586y30tzb7	cmvqmlt0q005huh58fkga3tie	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	t	f	Near Whitefield main road	Bengaluru	Whitefield	ACTIVE	\N	94	\N	2026-09-06 20:07:13.525	2026-10-27 11:52:32.049
cmvqmlt10005luh58cnhmib00	cmvqmlt0q005huh58fkga3tie	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	f	f	Near Whitefield main road	Bengaluru	Whitefield	ACTIVE	\N	214	\N	2026-10-09 06:45:36.01	2026-10-27 11:52:32.053
cmvqmlt1d005ouh58rhco2c4t	cmvqmlt14005muh58b6d8poq2	Nintendo Switch with games	GAMING	Switch console with dock, Joy-Cons and Mario Kart + party games.	{/demo/switch-1.jpg,/demo/switch-2.jpg}	450	2500	10000	1	30	t	t	t	Near Koramangala main road	Bengaluru	Koramangala	ACTIVE	\N	55	\N	2026-10-07 14:57:01.461	2026-10-27 11:52:32.066
cmvqmlt1h005quh58t95qqc8j	cmvqmlt14005muh58b6d8poq2	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	t	t	Near Koramangala main road	Bengaluru	Koramangala	ACTIVE	\N	99	\N	2026-08-28 13:37:30.564	2026-10-27 11:52:32.069
cmvqmlt1l005suh58agos4yee	cmvqmlt14005muh58b6d8poq2	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	f	f	Near Koramangala main road	Bengaluru	Koramangala	ACTIVE	\N	74	\N	2026-09-21 10:18:06.741	2026-10-27 11:52:32.073
cmvqmlt1x005vuh58xyn0453z	cmvqmlt1p005tuh58ci8ax8kc	Karaoke wireless mic set	PARTY	Two wireless microphones with receiver. Works with any speaker or TV.	{/demo/karaoke-1.jpg,/demo/karaoke-2.jpg}	300	1500	2500	1	30	t	f	f	Near Koramangala main road	Bengaluru	Koramangala	ACTIVE	\N	24	\N	2026-09-16 03:03:01.066	2026-10-27 11:52:32.086
cmvqmlt21005xuh5810zx5w8f	cmvqmlt1p005tuh58ci8ax8kc	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	t	f	Near Koramangala main road	Bengaluru	Koramangala	ACTIVE	\N	122	\N	2026-10-10 09:59:27.91	2026-10-27 11:52:32.089
cmvqmlt2e0060uh58jbjumjxk	cmvqmlt25005yuh587gq5xrjw	4-person dome tent	CAMPING	Waterproof dome tent for four with rain fly, pegs, ropes and carry bag.	{/demo/tent-1.jpg,/demo/tent-2.jpg}	300	1500	3000	1	30	t	t	f	Near HSR Layout main road	Bengaluru	HSR Layout	ACTIVE	\N	226	\N	2026-09-24 00:13:58.648	2026-10-27 11:52:32.103
cmvqmlt2j0062uh58q6jj4b21	cmvqmlt25005yuh587gq5xrjw	Cricket kit (bat, pads, gloves)	SPORTS	English willow bat, pads, gloves, helmet and stumps for a weekend match.	{/demo/cricket-1.jpg,/demo/cricket-2.jpg}	200	1000	2500	1	30	t	f	f	Near HSR Layout main road	Bengaluru	HSR Layout	ACTIVE	\N	173	\N	2026-09-02 05:09:58.186	2026-10-27 11:52:32.107
cmvqmlt2w0065uh58chs9muo1	cmvqmlt2n0063uh58po2ufpn7	Cricket kit (bat, pads, gloves)	SPORTS	English willow bat, pads, gloves, helmet and stumps for a weekend match.	{/demo/cricket-1.jpg,/demo/cricket-2.jpg}	200	1000	2500	1	30	t	f	f	Near HSR Layout main road	Bengaluru	HSR Layout	ACTIVE	\N	173	\N	2026-10-20 14:25:31.491	2026-10-27 11:52:32.121
cmvqmlt310067uh58se2346zk	cmvqmlt2n0063uh58po2ufpn7	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	t	f	Near HSR Layout main road	Bengaluru	HSR Layout	ACTIVE	\N	209	\N	2026-10-01 17:15:44.86	2026-10-27 11:52:32.125
cmvqmlt340069uh58pmzjhmsk	cmvqmlt2n0063uh58po2ufpn7	Racing wheel + pedals	GAMING	Force-feedback steering wheel with pedals. Works with PC and PlayStation.	{/demo/wheel-1.jpg,/demo/wheel-2.jpg}	350	\N	6000	1	30	t	f	f	Near HSR Layout main road	Bengaluru	HSR Layout	ACTIVE	\N	35	\N	2026-10-04 14:58:58.574	2026-10-27 11:52:32.129
cmvqmlt3g006cuh58mijvpfb0	cmvqmlt37006auh58ri5igsbt	Mini portable projector	PROJECTORS	Pocket projector with built-in battery and speaker. Connects to phones.	{/demo/miniprojector-1.jpg}	350	1800	5000	1	30	t	t	f	Near HSR Layout main road	Bengaluru	HSR Layout	ACTIVE	\N	6	\N	2026-09-23 15:31:13.676	2026-10-27 11:52:32.14
cmvqmlt3j006euh58us3wu2ex	cmvqmlt37006auh58ri5igsbt	Karaoke wireless mic set	PARTY	Two wireless microphones with receiver. Works with any speaker or TV.	{/demo/karaoke-1.jpg,/demo/karaoke-2.jpg}	300	1500	2500	1	30	t	t	f	Near HSR Layout main road	Bengaluru	HSR Layout	ACTIVE	\N	77	\N	2026-10-25 08:39:26.816	2026-10-27 11:52:32.143
cmvqmlt3u006huh580i69jdmx	cmvqmlt3m006fuh58caglp1ed	DJ controller (2 decks)	MUSIC	Two-deck DJ controller with headphones and laptop stand.	{/demo/dj-1.jpg,/demo/dj-2.jpg}	700	4000	12000	1	30	t	f	f	Near Jayanagar main road	Bengaluru	Jayanagar	ACTIVE	\N	64	\N	2026-09-20 17:05:38.737	2026-10-27 11:52:32.155
cmvqmlt3y006juh58hfqwaqkm	cmvqmlt3m006fuh58caglp1ed	Karaoke wireless mic set	PARTY	Two wireless microphones with receiver. Works with any speaker or TV.	{/demo/karaoke-1.jpg,/demo/karaoke-2.jpg}	300	1500	2500	1	30	t	t	t	Near Jayanagar main road	Bengaluru	Jayanagar	ACTIVE	\N	90	\N	2026-10-03 08:31:51.083	2026-10-27 11:52:32.158
cmvqmlt48006muh586hg8hubw	cmvqmlt41006kuh58w43g0c9w	Inflatable kayak (2 person)	SPORTS	Two-person inflatable kayak with paddles, pump and life jackets.	{/demo/kayak-1.jpg,/demo/kayak-2.jpg}	600	\N	8000	1	30	t	t	f	Near Jayanagar main road	Bengaluru	Jayanagar	ACTIVE	\N	226	\N	2026-09-14 13:53:07.354	2026-10-27 11:52:32.169
cmvqmlt4b006ouh58ae6q2hzu	cmvqmlt41006kuh58w43g0c9w	Badminton set (4 rackets + net)	SPORTS	Four rackets, shuttles and a portable net with poles.	{/demo/badminton-1.jpg}	80	400	800	1	30	t	t	f	Near Jayanagar main road	Bengaluru	Jayanagar	ACTIVE	\N	75	\N	2026-10-18 02:22:48.316	2026-10-27 11:52:32.171
cmvqmlt4o006ruh58ztm0dvzr	cmvqmlt4f006puh58y07wq6xg	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	t	t	Near JP Nagar main road	Bengaluru	JP Nagar	ACTIVE	\N	202	\N	2026-08-29 17:38:21.861	2026-10-27 11:52:32.184
cmvqmlt4s006tuh58v9hxl88x	cmvqmlt4f006puh58y07wq6xg	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	t	Near JP Nagar main road	Bengaluru	JP Nagar	ACTIVE	\N	61	\N	2026-09-22 22:05:49.578	2026-10-27 11:52:32.188
cmvqmlt4w006vuh58c37oemjd	cmvqmlt4f006puh58y07wq6xg	Carbon travel tripod	CAMERAS	Light carbon tripod with ball head and quick-release plate. Folds to 40 cm.	{/demo/tripod-1.jpg,/demo/tripod-2.jpg}	150	800	2000	1	30	t	t	f	Near JP Nagar main road	Bengaluru	JP Nagar	ACTIVE	\N	183	\N	2026-08-31 19:52:53.374	2026-10-27 11:52:32.192
cmvqmlt58006yuh586zmzc1ld	cmvqmlt4z006wuh58w9a8bu8w	GoPro Hero action camera	CAMERAS	Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.	{/demo/actioncam-1.jpg,/demo/actioncam-2.jpg}	400	2200	5000	1	30	t	t	f	Near JP Nagar main road	Bengaluru	JP Nagar	ACTIVE	\N	172	\N	2026-10-11 17:28:43.433	2026-10-27 11:52:32.204
cmvqmlt5c0070uh58n6l2f4zy	cmvqmlt4z006wuh58w9a8bu8w	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	f	Near JP Nagar main road	Bengaluru	JP Nagar	ACTIVE	\N	61	\N	2026-09-12 15:19:10.766	2026-10-27 11:52:32.208
cmvqmlt5f0072uh58o92bkjs3	cmvqmlt4z006wuh58w9a8bu8w	Cajon box drum	MUSIC	Wooden cajon with snare wires and a padded seat cover.	{/demo/cajon-1.jpg,/demo/cajon-2.jpg}	150	700	2000	1	30	t	t	f	Near JP Nagar main road	Bengaluru	JP Nagar	ACTIVE	\N	112	\N	2026-10-05 22:38:40.491	2026-10-27 11:52:32.212
cmvqmlt5q0075uh58bjh4mg5h	cmvqmlt5j0073uh58go1s5jdm	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	t	f	Near JP Nagar main road	Bengaluru	JP Nagar	ACTIVE	\N	163	\N	2026-09-07 09:33:29.852	2026-10-27 11:52:32.223
cmvqmlt5u0077uh581310sq37	cmvqmlt5j0073uh58go1s5jdm	Digital piano (88 keys)	MUSIC	Weighted-key digital piano with stand, sustain pedal and headphones.	{/demo/piano-1.jpg,/demo/piano-2.jpg}	500	2800	10000	3	30	t	t	t	Near JP Nagar main road	Bengaluru	JP Nagar	ACTIVE	\N	74	\N	2026-09-19 15:21:51.837	2026-10-27 11:52:32.226
cmvqmlt66007auh58lk1owk56	cmvqmlt5y0078uh58zh9uztse	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	t	f	Near Thane West main road	Mumbai	Thane West	ACTIVE	\N	72	\N	2026-10-24 12:01:55.869	2026-10-27 11:52:32.239
cmvqmlt6a007cuh58tiopy06x	cmvqmlt5y0078uh58zh9uztse	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	t	t	Near Thane West main road	Mumbai	Thane West	ACTIVE	\N	68	\N	2026-10-11 00:01:17.904	2026-10-27 11:52:32.242
cmvqmlt6d007euh58g84qyklb	cmvqmlt5y0078uh58zh9uztse	Racing wheel + pedals	GAMING	Force-feedback steering wheel with pedals. Works with PC and PlayStation.	{/demo/wheel-1.jpg,/demo/wheel-2.jpg}	350	\N	6000	1	30	t	t	t	Near Thane West main road	Mumbai	Thane West	ACTIVE	\N	141	\N	2026-09-23 02:04:41.556	2026-10-27 11:52:32.245
cmvqmlt6p007huh58insd7dhg	cmvqmlt6g007fuh58ia2t4vjs	Angle grinder 4 inch	TOOLS	Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.	{/demo/grinder-1.jpg,/demo/grinder-2.jpg}	150	\N	1500	1	30	t	f	f	Near Thane West main road	Mumbai	Thane West	ACTIVE	\N	130	\N	2026-10-07 22:19:16.053	2026-10-27 11:52:32.258
cmvqmlt6t007juh58kf82pk5x	cmvqmlt6g007fuh58ia2t4vjs	Sleeping bag (comfort 5°C)	CAMPING	Warm mummy sleeping bag, washed after every use. Compression sack included.	{/demo/sleepingbag-1.jpg,/demo/sleepingbag-2.jpg}	120	600	1500	1	30	t	f	f	Near Thane West main road	Mumbai	Thane West	ACTIVE	\N	182	\N	2026-10-01 18:46:30.106	2026-10-27 11:52:32.262
cmvqmlt6x007luh58jf16d5wo	cmvqmlt6g007fuh58ia2t4vjs	Cajon box drum	MUSIC	Wooden cajon with snare wires and a padded seat cover.	{/demo/cajon-1.jpg,/demo/cajon-2.jpg}	150	700	2000	1	30	t	f	t	Near Thane West main road	Mumbai	Thane West	ACTIVE	\N	134	\N	2026-09-12 17:04:38.144	2026-10-27 11:52:32.266
cmvqmlt7d007ouh58u358a4wv	cmvqmlt71007muh587qpnbvi1	Yamaha acoustic guitar	MUSIC	Full-size acoustic guitar, freshly strung, with gig bag, capo and picks.	{/demo/guitar-1.jpg,/demo/guitar-2.jpg}	200	1000	4000	1	30	t	t	f	Near Malad main road	Mumbai	Malad	ACTIVE	\N	158	\N	2026-09-27 01:49:28.108	2026-10-27 11:52:32.281
cmvqmlt7g007quh58s7fftnzo	cmvqmlt71007muh587qpnbvi1	4-person dome tent	CAMPING	Waterproof dome tent for four with rain fly, pegs, ropes and carry bag.	{/demo/tent-1.jpg,/demo/tent-2.jpg}	300	1500	3000	1	30	t	t	t	Near Malad main road	Mumbai	Malad	ACTIVE	\N	102	\N	2026-10-18 22:09:01.868	2026-10-27 11:52:32.285
cmvqmlt7k007suh58951zqmvi	cmvqmlt71007muh587qpnbvi1	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	t	f	Near Malad main road	Mumbai	Malad	ACTIVE	\N	110	\N	2026-09-22 11:10:56.509	2026-10-27 11:52:32.288
cmvqmlt7w007vuh585etuaz14	cmvqmlt7n007tuh58iuvmxe75	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	f	f	Near Malad main road	Mumbai	Malad	ACTIVE	\N	171	\N	2026-09-28 07:57:37.013	2026-10-27 11:52:32.3
cmvqmlt7z007xuh58f0qmwst2	cmvqmlt7n007tuh58iuvmxe75	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	t	f	Near Malad main road	Mumbai	Malad	ACTIVE	\N	31	\N	2026-09-24 08:51:45.086	2026-10-27 11:52:32.303
cmvqmlt890080uh58bnjcurhz	cmvqmlt82007yuh58882gnwhw	DJ controller (2 decks)	MUSIC	Two-deck DJ controller with headphones and laptop stand.	{/demo/dj-1.jpg,/demo/dj-2.jpg}	700	4000	12000	1	30	t	t	f	Near Malad main road	Mumbai	Malad	ACTIVE	\N	185	\N	2026-10-20 13:21:13.134	2026-10-27 11:52:32.313
cmvqmlt8c0082uh589vherj8h	cmvqmlt82007yuh58882gnwhw	Cajon box drum	MUSIC	Wooden cajon with snare wires and a padded seat cover.	{/demo/cajon-1.jpg,/demo/cajon-2.jpg}	150	700	2000	1	30	t	f	t	Near Malad main road	Mumbai	Malad	ACTIVE	\N	124	\N	2026-10-11 01:13:41.113	2026-10-27 11:52:32.316
cmvqmlt8f0084uh588llh8lng	cmvqmlt82007yuh58882gnwhw	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	f	Near Malad main road	Mumbai	Malad	ACTIVE	\N	189	\N	2026-09-09 10:56:46.889	2026-10-27 11:52:32.319
cmvqmlt8s0087uh582olr962j	cmvqmlt8j0085uh58eduyt6hw	GoPro Hero action camera	CAMERAS	Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.	{/demo/actioncam-1.jpg,/demo/actioncam-2.jpg}	400	2200	5000	1	30	t	f	f	Near Goregaon main road	Mumbai	Goregaon	ACTIVE	\N	203	\N	2026-08-31 20:40:54.86	2026-10-27 11:52:32.332
cmvqmlt8w0089uh58nl76vhgp	cmvqmlt8j0085uh58eduyt6hw	Chocolate fountain (3 tier)	PARTY	Three-tier chocolate fountain for birthdays and weddings. Cleaned before every rental.	{/demo/fountain-1.jpg,/demo/fountain-2.jpg}	600	\N	3000	1	30	t	f	t	Near Goregaon main road	Mumbai	Goregaon	ACTIVE	\N	179	\N	2026-10-01 02:52:41.7	2026-10-27 11:52:32.336
cmvqmlt91008buh588un8xizt	cmvqmlt8j0085uh58eduyt6hw	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	f	t	Near Goregaon main road	Mumbai	Goregaon	ACTIVE	\N	37	\N	2026-08-30 14:26:04.755	2026-10-27 11:52:32.341
cmvqmlt9d008euh589se9rqs8	cmvqmlt94008cuh5839etd7ke	Yamaha acoustic guitar	MUSIC	Full-size acoustic guitar, freshly strung, with gig bag, capo and picks.	{/demo/guitar-1.jpg,/demo/guitar-2.jpg}	200	1000	4000	1	30	t	f	f	Near Goregaon main road	Mumbai	Goregaon	ACTIVE	\N	97	\N	2026-09-14 15:14:24.524	2026-10-27 11:52:32.354
cmvqmlt9i008guh58r9dhxizk	cmvqmlt94008cuh5839etd7ke	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	f	t	Near Goregaon main road	Mumbai	Goregaon	ACTIVE	\N	43	\N	2026-09-21 17:07:56.292	2026-10-27 11:52:32.358
cmvqmlt9v008juh58owjpfdm7	cmvqmlt9l008huh58ezl2ulup	Cajon box drum	MUSIC	Wooden cajon with snare wires and a padded seat cover.	{/demo/cajon-1.jpg,/demo/cajon-2.jpg}	150	700	2000	1	30	t	f	f	Near Powai main road	Mumbai	Powai	ACTIVE	\N	187	\N	2026-09-13 05:40:06.499	2026-10-27 11:52:32.371
cmvqmlt9y008luh58ape2w6q7	cmvqmlt9l008huh58ezl2ulup	Badminton set (4 rackets + net)	SPORTS	Four rackets, shuttles and a portable net with poles.	{/demo/badminton-1.jpg}	80	400	800	1	30	t	t	t	Near Powai main road	Mumbai	Powai	ACTIVE	\N	13	\N	2026-09-04 04:05:15.747	2026-10-27 11:52:32.375
cmvqmlta2008nuh58jw7ds26m	cmvqmlt9l008huh58ezl2ulup	Electric lawn mower	TOOLS	Corded electric mower with grass box and 15 m extension cable.	{/demo/mower-1.jpg,/demo/mower-2.jpg}	350	1800	4000	1	30	t	f	f	Near Powai main road	Mumbai	Powai	ACTIVE	\N	160	\N	2026-10-08 07:31:52.384	2026-10-27 11:52:32.378
cmvqmltad008quh58j1cl8aqf	cmvqmlta5008ouh58yq1g8w6f	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	f	f	Near Powai main road	Mumbai	Powai	ACTIVE	\N	173	\N	2026-09-26 06:01:28.073	2026-10-27 11:52:32.39
cmvqmltah008suh587tb249sb	cmvqmlta5008ouh58yq1g8w6f	Fairy lights (20 strings)	PARTY	20 warm-white LED strings, 10 m each, with extension boards and plugs.	{/demo/lights-1.jpg}	400	\N	2000	1	30	t	f	f	Near Powai main road	Mumbai	Powai	ACTIVE	\N	204	\N	2026-09-15 04:04:45.259	2026-10-27 11:52:32.393
cmvqmltas008vuh581ddbr1ax	cmvqmltak008tuh58opblqnh7	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	f	t	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	93	\N	2026-09-02 17:46:33.555	2026-10-27 11:52:32.404
cmvqmltav008xuh58re11x8f8	cmvqmltak008tuh58opblqnh7	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	t	t	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	97	\N	2026-09-05 23:59:52.047	2026-10-27 11:52:32.407
cmvqmltb50090uh58qxne2kss	cmvqmltay008yuh58792klaxd	Karaoke wireless mic set	PARTY	Two wireless microphones with receiver. Works with any speaker or TV.	{/demo/karaoke-1.jpg,/demo/karaoke-2.jpg}	300	1500	2500	1	30	t	f	t	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	64	\N	2026-09-22 21:51:04.425	2026-10-27 11:52:32.417
cmvqmltb80092uh58y4r34j6f	cmvqmltay008yuh58792klaxd	Fairy lights (20 strings)	PARTY	20 warm-white LED strings, 10 m each, with extension boards and plugs.	{/demo/lights-1.jpg}	400	\N	2000	1	30	t	t	t	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	208	\N	2026-09-18 16:26:10.951	2026-10-27 11:52:32.421
cmvqmltbc0094uh58gf0v7ht5	cmvqmltay008yuh58792klaxd	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	f	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	176	\N	2026-10-08 02:56:09.885	2026-10-27 11:52:32.424
cmvqmltbp0097uh58eh99ryl6	cmvqmltbf0095uh584zppa7js	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	f	f	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	29	\N	2026-09-21 12:15:28.841	2026-10-27 11:52:32.437
cmvqmltbt0099uh584z6yctjq	cmvqmltbf0095uh584zppa7js	JBL party speaker with lights	PARTY	Loud Bluetooth party speaker with light show, mic input and wheels. Runs 12 h on battery.	{/demo/speaker-1.jpg,/demo/speaker-2.jpg}	800	4500	8000	1	30	t	f	f	Near Andheri West main road	Mumbai	Andheri West	ACTIVE	\N	163	\N	2026-10-24 03:57:18.296	2026-10-27 11:52:32.442
cmvqmltca009cuh58qr2ii449	cmvqmltby009auh581h149isv	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	t	f	Near Juhu main road	Mumbai	Juhu	ACTIVE	\N	134	\N	2026-09-01 02:25:43.197	2026-10-27 11:52:32.459
cmvqmltce009euh58vtydbbhi	cmvqmltby009auh581h149isv	GoPro Hero action camera	CAMERAS	Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.	{/demo/actioncam-1.jpg,/demo/actioncam-2.jpg}	400	2200	5000	1	30	t	t	f	Near Juhu main road	Mumbai	Juhu	ACTIVE	\N	215	\N	2026-10-16 07:15:56.748	2026-10-27 11:52:32.463
cmvqmltcj009guh58ztzv4ejj	cmvqmltby009auh581h149isv	Angle grinder 4 inch	TOOLS	Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.	{/demo/grinder-1.jpg,/demo/grinder-2.jpg}	150	\N	1500	1	30	t	f	f	Near Juhu main road	Mumbai	Juhu	ACTIVE	\N	97	\N	2026-10-26 22:09:33.714	2026-10-27 11:52:32.467
cmvqmltcx009juh58i1iz3blb	cmvqmltcm009huh58vjzw2064	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	t	f	Near Juhu main road	Mumbai	Juhu	ACTIVE	\N	160	\N	2026-09-22 06:07:20.072	2026-10-27 11:52:32.481
cmvqmltd1009luh58veiinljf	cmvqmltcm009huh58vjzw2064	Mini portable projector	PROJECTORS	Pocket projector with built-in battery and speaker. Connects to phones.	{/demo/miniprojector-1.jpg}	350	1800	5000	1	30	t	t	f	Near Juhu main road	Mumbai	Juhu	ACTIVE	\N	193	\N	2026-09-09 15:43:15.398	2026-10-27 11:52:32.485
cmvqmltd5009nuh58ot93z4j5	cmvqmltcm009huh58vjzw2064	Electric guitar + practice amp	MUSIC	Electric guitar with 20 W amp, cable, strap and tuner.	{/demo/eguitar-1.jpg,/demo/eguitar-2.jpg}	450	2500	8000	1	30	t	f	f	Near Juhu main road	Mumbai	Juhu	ACTIVE	\N	188	\N	2026-09-04 01:44:52.921	2026-10-27 11:52:32.489
cmvqmltdj009quh587l4y42w5	cmvqmltda009ouh58c12lg9p3	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	f	t	Near Juhu main road	Mumbai	Juhu	ACTIVE	\N	21	\N	2026-09-12 04:59:49.866	2026-10-27 11:52:32.504
cmvqmltdn009suh58bgzkukr1	cmvqmltda009ouh58c12lg9p3	Mini portable projector	PROJECTORS	Pocket projector with built-in battery and speaker. Connects to phones.	{/demo/miniprojector-1.jpg}	350	1800	5000	1	30	t	f	f	Near Juhu main road	Mumbai	Juhu	ACTIVE	\N	193	\N	2026-09-06 21:57:41.376	2026-10-27 11:52:32.508
cmvqmltdy009vuh58m4usw4p1	cmvqmltdr009tuh584irnqwfc	Trekking backpack 60 L	CAMPING	Comfortable 60 L backpack with rain cover and hip belt pockets.	{/demo/backpack-1.jpg}	150	800	2000	1	30	t	t	t	Near Bandra West main road	Mumbai	Bandra West	ACTIVE	\N	219	\N	2026-10-21 15:18:48.731	2026-10-27 11:52:32.518
cmvqmlte2009xuh58otdgbfa4	cmvqmltdr009tuh584irnqwfc	JBL party speaker with lights	PARTY	Loud Bluetooth party speaker with light show, mic input and wheels. Runs 12 h on battery.	{/demo/speaker-1.jpg,/demo/speaker-2.jpg}	800	4500	8000	1	30	t	t	f	Near Bandra West main road	Mumbai	Bandra West	ACTIVE	\N	226	\N	2026-09-04 21:28:54.412	2026-10-27 11:52:32.522
cmvqmlte6009zuh58vvuoaea7	cmvqmltdr009tuh584irnqwfc	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	t	t	Near Bandra West main road	Mumbai	Bandra West	ACTIVE	\N	14	\N	2026-09-12 19:38:50.942	2026-10-27 11:52:32.526
cmvqmlteg00a2uh58zoe784wm	cmvqmlte900a0uh58jf6cr92m	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	f	f	Near Bandra West main road	Mumbai	Bandra West	ACTIVE	\N	77	\N	2026-10-04 09:30:22.635	2026-10-27 11:52:32.537
cmvqmltek00a4uh58erq36s4z	cmvqmlte900a0uh58jf6cr92m	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	f	f	Near Bandra West main road	Mumbai	Bandra West	ACTIVE	\N	225	\N	2026-10-10 05:29:59.899	2026-10-27 11:52:32.541
cmvqmlteo00a6uh58gd00gcqt	cmvqmlte900a0uh58jf6cr92m	Nintendo Switch with games	GAMING	Switch console with dock, Joy-Cons and Mario Kart + party games.	{/demo/switch-1.jpg,/demo/switch-2.jpg}	450	2500	10000	1	30	t	t	t	Near Bandra West main road	Mumbai	Bandra West	ACTIVE	\N	206	\N	2026-10-02 09:10:53.424	2026-10-27 11:52:32.544
cmvqmltex00a9uh58hhs9kwct	cmvqmlteq00a7uh580kcewoln	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	f	t	Near Bandra West main road	Mumbai	Bandra West	ACTIVE	\N	171	\N	2026-09-29 23:54:20.6	2026-10-27 11:52:32.554
cmvqmltf100abuh58tz9l5jcr	cmvqmlteq00a7uh580kcewoln	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	t	f	Near Bandra West main road	Mumbai	Bandra West	ACTIVE	\N	226	\N	2026-09-26 04:55:23.11	2026-10-27 11:52:32.557
cmvqmltf400aduh58kzdgpy29	cmvqmlteq00a7uh580kcewoln	Road bike (size M)	SPORTS	Light road bike for long weekend rides. Helmet, lights and pump included.	{/demo/roadbike-1.jpg,/demo/roadbike-2.jpg}	500	2800	10000	1	30	t	f	f	Near Bandra West main road	Mumbai	Bandra West	ACTIVE	\N	170	\N	2026-10-20 23:19:37.158	2026-10-27 11:52:32.561
cmvqmltfk00aguh586sxmljwe	cmvqmltf800aeuh58c2wi8ogu	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	t	t	Near Colaba main road	Mumbai	Colaba	ACTIVE	\N	217	\N	2026-10-05 14:10:31.985	2026-10-27 11:52:32.576
cmvqmltfn00aiuh58rkhoyzdl	cmvqmltf800aeuh58c2wi8ogu	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	f	t	Near Colaba main road	Mumbai	Colaba	ACTIVE	\N	59	\N	2026-09-18 11:19:50.088	2026-10-27 11:52:32.579
cmvqmltfq00akuh5868vikj85	cmvqmltf800aeuh58c2wi8ogu	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	f	t	Near Colaba main road	Mumbai	Colaba	ACTIVE	\N	93	\N	2026-10-03 04:35:25.405	2026-10-27 11:52:32.582
cmvqmltg200anuh58tadzuczj	cmvqmltft00aluh589bc1uk8v	Camping gas stove + cookset	CAMPING	Portable gas stove with pot, pan and kettle. Gas canister not included.	{/demo/stove-1.jpg,/demo/stove-2.jpg}	100	500	1000	1	30	t	t	f	Near Colaba main road	Mumbai	Colaba	ACTIVE	\N	125	\N	2026-10-19 14:05:46.476	2026-10-27 11:52:32.594
cmvqmltg600apuh585lq70naj	cmvqmltft00aluh589bc1uk8v	Folding chairs (set of 10)	PARTY	Ten steel folding chairs with padded seats. Delivery recommended.	{/demo/chairs-1.jpg}	500	2500	3000	1	30	t	f	t	Near Colaba main road	Mumbai	Colaba	ACTIVE	\N	31	\N	2026-08-28 16:00:40.154	2026-10-27 11:52:32.598
cmvqmltgh00asuh582b4zwznq	cmvqmltg900aquh58x99ru7ds	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	t	t	Near Colaba main road	Mumbai	Colaba	ACTIVE	\N	93	\N	2026-09-12 03:20:27.452	2026-10-27 11:52:32.609
cmvqmltgk00auuh58zhxo6vo3	cmvqmltg900aquh58x99ru7ds	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	t	t	Near Colaba main road	Mumbai	Colaba	ACTIVE	\N	149	\N	2026-09-30 11:16:07.938	2026-10-27 11:52:32.612
cmvqmltgw00axuh58kotw094w	cmvqmltgn00avuh58ht8sju6f	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	f	f	Near Rohini main road	Delhi	Rohini	ACTIVE	\N	146	\N	2026-08-29 21:27:04.748	2026-10-27 11:52:32.624
cmvqmltgz00azuh58k6teajjk	cmvqmltgn00avuh58ht8sju6f	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	f	f	Near Rohini main road	Delhi	Rohini	ACTIVE	\N	70	\N	2026-09-17 16:24:34.947	2026-10-27 11:52:32.627
cmvqmlth800b2uh5822fqt46s	cmvqmlth100b0uh58qxxbekbr	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	t	t	Near Rohini main road	Delhi	Rohini	ACTIVE	\N	106	\N	2026-09-22 09:45:35.388	2026-10-27 11:52:32.637
cmvqmlthc00b4uh58ngg21uft	cmvqmlth100b0uh58qxxbekbr	GoPro Hero action camera	CAMERAS	Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.	{/demo/actioncam-1.jpg,/demo/actioncam-2.jpg}	400	2200	5000	1	30	t	f	f	Near Rohini main road	Delhi	Rohini	ACTIVE	\N	124	\N	2026-08-29 00:36:11.433	2026-10-27 11:52:32.64
cmvqmlthm00b7uh58pvlzshqj	cmvqmlthf00b5uh58prd3gj6d	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	t	Near Rohini main road	Delhi	Rohini	ACTIVE	\N	97	\N	2026-10-21 08:12:46.376	2026-10-27 11:52:32.651
cmvqmlthp00b9uh58g9j69i1i	cmvqmlthf00b5uh58prd3gj6d	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	f	f	Near Rohini main road	Delhi	Rohini	ACTIVE	\N	106	\N	2026-10-03 10:41:45.485	2026-10-27 11:52:32.654
cmvqmlthu00bbuh58e5k7k004	cmvqmlthf00b5uh58prd3gj6d	Fairy lights (20 strings)	PARTY	20 warm-white LED strings, 10 m each, with extension boards and plugs.	{/demo/lights-1.jpg}	400	\N	2000	1	30	t	t	t	Near Rohini main road	Delhi	Rohini	ACTIVE	\N	101	\N	2026-09-20 16:09:03.007	2026-10-27 11:52:32.658
cmvqmltjk00beuh58atdieu11	cmvqmlthx00bcuh589s6xiq5u	Sony A7 III + 28–70mm kit	CAMERAS	Full-frame mirrorless body with the 28–70mm kit lens, 2 batteries, charger, 64 GB card and padded bag.	{/demo/mirrorless-1.jpg,/demo/mirrorless-2.jpg}	1200	7000	15000	1	30	t	f	t	Near Karol Bagh main road	Delhi	Karol Bagh	ACTIVE	\N	93	\N	2026-09-05 14:22:10.77	2026-10-27 11:52:32.721
cmvqmltjr00bguh582j4l1tw8	cmvqmlthx00bcuh589s6xiq5u	GoPro Hero action camera	CAMERAS	Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.	{/demo/actioncam-1.jpg,/demo/actioncam-2.jpg}	400	2200	5000	1	30	t	f	f	Near Karol Bagh main road	Delhi	Karol Bagh	ACTIVE	\N	144	\N	2026-09-27 00:29:12.625	2026-10-27 11:52:32.727
cmvqmltjv00biuh58q1yyn9yv	cmvqmlthx00bcuh589s6xiq5u	Road bike (size M)	SPORTS	Light road bike for long weekend rides. Helmet, lights and pump included.	{/demo/roadbike-1.jpg,/demo/roadbike-2.jpg}	500	2800	10000	1	30	t	f	f	Near Karol Bagh main road	Delhi	Karol Bagh	ACTIVE	\N	216	\N	2026-10-01 16:52:59.484	2026-10-27 11:52:32.731
cmvqmltkn00bluh58b5negz6o	cmvqmltkb00bjuh58548seyu5	DJ controller (2 decks)	MUSIC	Two-deck DJ controller with headphones and laptop stand.	{/demo/dj-1.jpg,/demo/dj-2.jpg}	700	4000	12000	1	30	t	f	t	Near Karol Bagh main road	Delhi	Karol Bagh	ACTIVE	\N	221	\N	2026-09-08 19:55:32.086	2026-10-27 11:52:32.759
cmvqmltks00bnuh58pi5dw0f9	cmvqmltkb00bjuh58548seyu5	Yamaha acoustic guitar	MUSIC	Full-size acoustic guitar, freshly strung, with gig bag, capo and picks.	{/demo/guitar-1.jpg,/demo/guitar-2.jpg}	200	1000	4000	1	30	t	t	f	Near Karol Bagh main road	Delhi	Karol Bagh	ACTIVE	\N	118	\N	2026-09-26 16:29:18.154	2026-10-27 11:52:32.765
cmvqmltl400bquh58iii3bukt	cmvqmltkw00bouh5825rcbswd	Cajon box drum	MUSIC	Wooden cajon with snare wires and a padded seat cover.	{/demo/cajon-1.jpg,/demo/cajon-2.jpg}	150	700	2000	1	30	t	f	t	Near Karol Bagh main road	Delhi	Karol Bagh	ACTIVE	\N	8	\N	2026-09-24 22:19:53.381	2026-10-27 11:52:32.777
cmvqmltl800bsuh58wgls6nwo	cmvqmltkw00bouh5825rcbswd	Fairy lights (20 strings)	PARTY	20 warm-white LED strings, 10 m each, with extension boards and plugs.	{/demo/lights-1.jpg}	400	\N	2000	1	30	t	t	t	Near Karol Bagh main road	Delhi	Karol Bagh	ACTIVE	\N	81	\N	2026-09-15 02:00:50.317	2026-10-27 11:52:32.781
cmvqmltlm00bvuh58lxw1et86	cmvqmltlc00btuh58x46y8u4p	Trekking backpack 60 L	CAMPING	Comfortable 60 L backpack with rain cover and hip belt pockets.	{/demo/backpack-1.jpg}	150	800	2000	1	30	t	t	f	Near Connaught Place main road	Delhi	Connaught Place	ACTIVE	\N	32	\N	2026-09-27 13:52:19.704	2026-10-27 11:52:32.795
cmvqmltlp00bxuh58n3o5zvmk	cmvqmltlc00btuh58x46y8u4p	Cricket kit (bat, pads, gloves)	SPORTS	English willow bat, pads, gloves, helmet and stumps for a weekend match.	{/demo/cricket-1.jpg,/demo/cricket-2.jpg}	200	1000	2500	1	30	t	t	f	Near Connaught Place main road	Delhi	Connaught Place	ACTIVE	\N	174	\N	2026-10-02 16:53:20.794	2026-10-27 11:52:32.798
cmvqmltls00bzuh58mi6cd3zq	cmvqmltlc00btuh58x46y8u4p	Camping gas stove + cookset	CAMPING	Portable gas stove with pot, pan and kettle. Gas canister not included.	{/demo/stove-1.jpg,/demo/stove-2.jpg}	100	500	1000	1	30	t	t	f	Near Connaught Place main road	Delhi	Connaught Place	ACTIVE	\N	109	\N	2026-09-05 02:12:43.233	2026-10-27 11:52:32.8
cmvqmltm400c2uh58j2eoc63r	cmvqmltlv00c0uh5849humzjm	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	f	t	Near Connaught Place main road	Delhi	Connaught Place	ACTIVE	\N	120	\N	2026-10-25 02:48:10.032	2026-10-27 11:52:32.812
cmvqmltm700c4uh58zt2lk0x4	cmvqmltlv00c0uh5849humzjm	Racing wheel + pedals	GAMING	Force-feedback steering wheel with pedals. Works with PC and PlayStation.	{/demo/wheel-1.jpg,/demo/wheel-2.jpg}	350	\N	6000	1	30	t	f	t	Near Connaught Place main road	Delhi	Connaught Place	ACTIVE	\N	58	\N	2026-10-14 19:31:17.579	2026-10-27 11:52:32.815
cmvqmltmi00c7uh58jylysyt5	cmvqmltma00c5uh58vh32xqk2	Chocolate fountain (3 tier)	PARTY	Three-tier chocolate fountain for birthdays and weddings. Cleaned before every rental.	{/demo/fountain-1.jpg,/demo/fountain-2.jpg}	600	\N	3000	1	30	t	f	t	Near Mayur Vihar main road	Delhi	Mayur Vihar	ACTIVE	\N	103	\N	2026-08-30 17:11:43.812	2026-10-27 11:52:32.827
cmvqmltml00c9uh58n006dijw	cmvqmltma00c5uh58vh32xqk2	Canon EOS 200D DSLR kit	CAMERAS	Beginner-friendly DSLR with 18–55mm lens, battery, charger, 32 GB card and strap.	{/demo/dslr-1.jpg,/demo/dslr-2.jpg}	600	3500	8000	1	30	t	f	f	Near Mayur Vihar main road	Delhi	Mayur Vihar	ACTIVE	\N	20	\N	2026-09-20 00:40:03.528	2026-10-27 11:52:32.83
cmvqmltmw00ccuh586wgehjaf	cmvqmltmo00cauh586iwaz1lm	Folding chairs (set of 10)	PARTY	Ten steel folding chairs with padded seats. Delivery recommended.	{/demo/chairs-1.jpg}	500	2500	3000	1	30	t	f	f	Near Mayur Vihar main road	Delhi	Mayur Vihar	ACTIVE	\N	65	\N	2026-09-23 12:37:39.62	2026-10-27 11:52:32.84
cmvqmltmz00ceuh58371xj96e	cmvqmltmo00cauh586iwaz1lm	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	f	f	Near Mayur Vihar main road	Delhi	Mayur Vihar	ACTIVE	\N	115	\N	2026-10-08 11:04:21.665	2026-10-27 11:52:32.843
cmvqmltna00chuh58xg23yvt7	cmvqmltn300cfuh583vxlblc8	Camping gas stove + cookset	CAMPING	Portable gas stove with pot, pan and kettle. Gas canister not included.	{/demo/stove-1.jpg,/demo/stove-2.jpg}	100	500	1000	1	30	t	t	f	Near Lajpat Nagar main road	Delhi	Lajpat Nagar	ACTIVE	\N	110	\N	2026-09-02 19:02:47.564	2026-10-27 11:52:32.854
cmvqmltnf00cjuh58oozcng6j	cmvqmltn300cfuh583vxlblc8	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	t	t	Near Lajpat Nagar main road	Delhi	Lajpat Nagar	ACTIVE	\N	132	\N	2026-09-10 03:27:44.991	2026-10-27 11:52:32.859
cmvqmltnt00couh587brcprjk	cmvqmltnl00cmuh58vqvtwp6h	Electric guitar + practice amp	MUSIC	Electric guitar with 20 W amp, cable, strap and tuner.	{/demo/eguitar-1.jpg,/demo/eguitar-2.jpg}	450	2500	8000	1	30	t	f	f	Near Lajpat Nagar main road	Delhi	Lajpat Nagar	ACTIVE	\N	111	\N	2026-10-25 17:41:45.268	2026-10-27 11:52:32.873
cmvqmltnx00cquh58hvfrred9	cmvqmltnl00cmuh58vqvtwp6h	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	f	t	Near Lajpat Nagar main road	Delhi	Lajpat Nagar	ACTIVE	\N	66	\N	2026-09-04 08:51:20.092	2026-10-27 11:52:32.878
cmvqmlto000csuh58bjkjo5ej	cmvqmltnl00cmuh58vqvtwp6h	DJI mini drone with 3 batteries	CAMERAS	Compact drone, remote, 3 batteries and charging hub. Fly only where it is allowed.	{/demo/drone-1.jpg,/demo/drone-2.jpg}	900	5000	15000	2	30	t	f	t	Near Lajpat Nagar main road	Delhi	Lajpat Nagar	ACTIVE	\N	84	\N	2026-10-16 06:14:12.579	2026-10-27 11:52:32.881
cmvqmltoc00cvuh58gqr69foa	cmvqmlto300ctuh58pqcx5zc3	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	t	f	Near Lajpat Nagar main road	Delhi	Lajpat Nagar	ACTIVE	\N	132	\N	2026-09-26 01:55:45.341	2026-10-27 11:52:32.893
cmvqmltog00cxuh589k458j1x	cmvqmlto300ctuh58pqcx5zc3	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	t	Near Lajpat Nagar main road	Delhi	Lajpat Nagar	ACTIVE	\N	145	\N	2026-09-21 21:11:28.726	2026-10-27 11:52:32.896
cmvqmltou00d0uh58t5cj4lwu	cmvqmltok00cyuh587vw13ax0	Mini portable projector	PROJECTORS	Pocket projector with built-in battery and speaker. Connects to phones.	{/demo/miniprojector-1.jpg}	350	1800	5000	1	30	t	f	t	Near Hauz Khas main road	Delhi	Hauz Khas	ACTIVE	\N	200	\N	2026-10-05 07:10:00.646	2026-10-27 11:52:32.91
cmvqmltox00d2uh58zyzmp7op	cmvqmltok00cyuh587vw13ax0	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	f	t	Near Hauz Khas main road	Delhi	Hauz Khas	ACTIVE	\N	180	\N	2026-09-06 00:18:19.206	2026-10-27 11:52:32.914
cmvqmltp900d5uh58u2cutdan	cmvqmltp000d3uh58ph2u0o76	Karaoke wireless mic set	PARTY	Two wireless microphones with receiver. Works with any speaker or TV.	{/demo/karaoke-1.jpg,/demo/karaoke-2.jpg}	300	1500	2500	1	30	t	f	f	Near Hauz Khas main road	Delhi	Hauz Khas	ACTIVE	\N	199	\N	2026-09-20 14:53:22	2026-10-27 11:52:32.925
cmvqmltpc00d7uh58kckgucjm	cmvqmltp000d3uh58ph2u0o76	Carbon travel tripod	CAMERAS	Light carbon tripod with ball head and quick-release plate. Folds to 40 cm.	{/demo/tripod-1.jpg,/demo/tripod-2.jpg}	150	800	2000	1	30	t	f	t	Near Hauz Khas main road	Delhi	Hauz Khas	ACTIVE	\N	29	\N	2026-09-18 19:32:08.719	2026-10-27 11:52:32.928
cmvqmltpf00d9uh58sk4lfbpv	cmvqmltp000d3uh58ph2u0o76	Chocolate fountain (3 tier)	PARTY	Three-tier chocolate fountain for birthdays and weddings. Cleaned before every rental.	{/demo/fountain-1.jpg,/demo/fountain-2.jpg}	600	\N	3000	1	30	t	f	f	Near Hauz Khas main road	Delhi	Hauz Khas	ACTIVE	\N	10	\N	2026-09-11 14:08:36.385	2026-10-27 11:52:32.931
cmvqmltpq00dcuh58ysfedid0	cmvqmltpi00dauh585zk1nglh	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	f	f	Near Saket main road	Delhi	Saket	ACTIVE	\N	55	\N	2026-09-23 03:05:23.812	2026-10-27 11:52:32.943
cmvqmltpt00deuh5876ims0q8	cmvqmltpi00dauh585zk1nglh	Sony A7 III + 28–70mm kit	CAMERAS	Full-frame mirrorless body with the 28–70mm kit lens, 2 batteries, charger, 64 GB card and padded bag.	{/demo/mirrorless-1.jpg,/demo/mirrorless-2.jpg}	1200	7000	15000	1	30	t	t	t	Near Saket main road	Delhi	Saket	ACTIVE	\N	166	\N	2026-09-24 20:38:40.755	2026-10-27 11:52:32.946
cmvqmltpw00dguh58wdwz0kug	cmvqmltpi00dauh585zk1nglh	Digital piano (88 keys)	MUSIC	Weighted-key digital piano with stand, sustain pedal and headphones.	{/demo/piano-1.jpg,/demo/piano-2.jpg}	500	2800	10000	3	30	t	t	f	Near Saket main road	Delhi	Saket	ACTIVE	\N	69	\N	2026-10-13 05:50:03.765	2026-10-27 11:52:32.949
cmvqmltq800djuh58dp3rzpxg	cmvqmltpz00dhuh58xhzjyd1b	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	f	f	Near Saket main road	Delhi	Saket	ACTIVE	\N	99	\N	2026-10-23 20:47:24.97	2026-10-27 11:52:32.96
cmvqmltqb00dluh581n5smy8m	cmvqmltpz00dhuh58xhzjyd1b	Electric guitar + practice amp	MUSIC	Electric guitar with 20 W amp, cable, strap and tuner.	{/demo/eguitar-1.jpg,/demo/eguitar-2.jpg}	450	2500	8000	1	30	t	f	t	Near Saket main road	Delhi	Saket	ACTIVE	\N	74	\N	2026-09-05 14:56:33.731	2026-10-27 11:52:32.963
cmvqmltqo00douh583huifjw1	cmvqmltqf00dmuh58qe5rcf8c	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	f	t	Near Saket main road	Delhi	Saket	ACTIVE	\N	123	\N	2026-09-02 19:05:01.152	2026-10-27 11:52:32.976
cmvqmltqs00dquh58fq996uvt	cmvqmltqf00dmuh58qe5rcf8c	Road bike (size M)	SPORTS	Light road bike for long weekend rides. Helmet, lights and pump included.	{/demo/roadbike-1.jpg,/demo/roadbike-2.jpg}	500	2800	10000	1	30	t	t	f	Near Saket main road	Delhi	Saket	ACTIVE	\N	75	\N	2026-09-11 20:06:35.494	2026-10-27 11:52:32.98
cmvqmltqw00dsuh58h59a02yd	cmvqmltqf00dmuh58qe5rcf8c	Angle grinder 4 inch	TOOLS	Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.	{/demo/grinder-1.jpg,/demo/grinder-2.jpg}	150	\N	1500	1	30	t	f	f	Near Saket main road	Delhi	Saket	ACTIVE	\N	123	\N	2026-09-21 10:24:25.89	2026-10-27 11:52:32.985
cmvqmltrd00dvuh585xvs3i3d	cmvqmltr000dtuh5857p2o69t	4-person dome tent	CAMPING	Waterproof dome tent for four with rain fly, pegs, ropes and carry bag.	{/demo/tent-1.jpg,/demo/tent-2.jpg}	300	1500	3000	1	30	t	f	f	Near Dwarka main road	Delhi	Dwarka	ACTIVE	\N	233	\N	2026-09-23 13:04:12.986	2026-10-27 11:52:33.001
cmvqmltri00dxuh58ytcpc73b	cmvqmltr000dtuh5857p2o69t	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	f	f	Near Dwarka main road	Delhi	Dwarka	ACTIVE	\N	124	\N	2026-10-10 16:13:13.063	2026-10-27 11:52:33.007
cmvqmltrn00dzuh58k3e68ha7	cmvqmltr000dtuh5857p2o69t	Electric lawn mower	TOOLS	Corded electric mower with grass box and 15 m extension cable.	{/demo/mower-1.jpg,/demo/mower-2.jpg}	350	1800	4000	1	30	t	f	f	Near Dwarka main road	Delhi	Dwarka	ACTIVE	\N	94	\N	2026-10-07 21:42:28.671	2026-10-27 11:52:33.011
cmvqmlts500e2uh58vhlez8lq	cmvqmltrs00e0uh58x5464vsz	JBL party speaker with lights	PARTY	Loud Bluetooth party speaker with light show, mic input and wheels. Runs 12 h on battery.	{/demo/speaker-1.jpg,/demo/speaker-2.jpg}	800	4500	8000	1	30	t	f	f	Near Dwarka main road	Delhi	Dwarka	ACTIVE	\N	141	\N	2026-10-15 19:04:05.851	2026-10-27 11:52:33.029
cmvqmlts900e4uh58x9jdax4y	cmvqmltrs00e0uh58x5464vsz	Fairy lights (20 strings)	PARTY	20 warm-white LED strings, 10 m each, with extension boards and plugs.	{/demo/lights-1.jpg}	400	\N	2000	1	30	t	t	f	Near Dwarka main road	Delhi	Dwarka	ACTIVE	\N	96	\N	2026-10-03 23:06:19.952	2026-10-27 11:52:33.034
cmvqmltsd00e6uh58855yskez	cmvqmltrs00e0uh58x5464vsz	GoPro Hero action camera	CAMERAS	Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.	{/demo/actioncam-1.jpg,/demo/actioncam-2.jpg}	400	2200	5000	1	30	t	f	t	Near Dwarka main road	Delhi	Dwarka	ACTIVE	\N	119	\N	2026-10-13 10:11:28.069	2026-10-27 11:52:33.037
cmvqmltst00e9uh58oqy1rk55	cmvqmltsi00e7uh5866xzv1io	Cajon box drum	MUSIC	Wooden cajon with snare wires and a padded seat cover.	{/demo/cajon-1.jpg,/demo/cajon-2.jpg}	150	700	2000	1	30	t	t	f	Near Dwarka main road	Delhi	Dwarka	ACTIVE	\N	139	\N	2026-08-31 01:47:03.079	2026-10-27 11:52:33.053
cmvqmltsy00ebuh58fjlmcrqm	cmvqmltsi00e7uh5866xzv1io	Chocolate fountain (3 tier)	PARTY	Three-tier chocolate fountain for birthdays and weddings. Cleaned before every rental.	{/demo/fountain-1.jpg,/demo/fountain-2.jpg}	600	\N	3000	1	30	t	t	f	Near Dwarka main road	Delhi	Dwarka	ACTIVE	\N	79	\N	2026-10-17 02:57:11.65	2026-10-27 11:52:33.059
cmvqmltth00eguh58jw09rwj1	cmvqmltt700eeuh58akrzb54t	Road bike (size M)	SPORTS	Light road bike for long weekend rides. Helmet, lights and pump included.	{/demo/roadbike-1.jpg,/demo/roadbike-2.jpg}	500	2800	10000	1	30	t	t	t	Near Sector 18 main road	Noida	Sector 18	ACTIVE	\N	76	\N	2026-10-11 10:27:27.437	2026-10-27 11:52:33.077
cmvqmlttl00eiuh58pzb0fthv	cmvqmltt700eeuh58akrzb54t	DJI mini drone with 3 batteries	CAMERAS	Compact drone, remote, 3 batteries and charging hub. Fly only where it is allowed.	{/demo/drone-1.jpg,/demo/drone-2.jpg}	900	5000	15000	2	30	t	f	t	Near Sector 18 main road	Noida	Sector 18	ACTIVE	\N	20	\N	2026-10-17 10:11:06.975	2026-10-27 11:52:33.081
cmvqmltu000eluh5827epzpww	cmvqmlttp00ejuh58yf1hto01	Electric guitar + practice amp	MUSIC	Electric guitar with 20 W amp, cable, strap and tuner.	{/demo/eguitar-1.jpg,/demo/eguitar-2.jpg}	450	2500	8000	1	30	t	f	f	Near Sector 18 main road	Noida	Sector 18	ACTIVE	\N	101	\N	2026-09-04 14:09:12.876	2026-10-27 11:52:33.096
cmvqmltu400enuh589z4kk7le	cmvqmlttp00ejuh58yf1hto01	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	f	Near Sector 18 main road	Noida	Sector 18	ACTIVE	\N	159	\N	2026-10-22 02:36:26.644	2026-10-27 11:52:33.1
cmvqmltu800epuh58hj4j10fg	cmvqmlttp00ejuh58yf1hto01	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	f	t	Near Sector 18 main road	Noida	Sector 18	ACTIVE	\N	178	\N	2026-10-21 18:04:26.994	2026-10-27 11:52:33.104
cmvqmltun00esuh5800ajz6cu	cmvqmltuc00equh58jpwzczwr	Badminton set (4 rackets + net)	SPORTS	Four rackets, shuttles and a portable net with poles.	{/demo/badminton-1.jpg}	80	400	800	1	30	t	t	f	Near Sector 50 main road	Noida	Sector 50	ACTIVE	\N	234	\N	2026-09-25 11:55:50.342	2026-10-27 11:52:33.119
cmvqmltut00euuh58jkaxebez	cmvqmltuc00equh58jpwzczwr	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	f	t	Near Sector 50 main road	Noida	Sector 50	ACTIVE	\N	233	\N	2026-08-29 06:57:25.714	2026-10-27 11:52:33.125
cmvqmltuy00ewuh58lhlwjaa0	cmvqmltuc00equh58jpwzczwr	Karaoke wireless mic set	PARTY	Two wireless microphones with receiver. Works with any speaker or TV.	{/demo/karaoke-1.jpg,/demo/karaoke-2.jpg}	300	1500	2500	1	30	t	t	f	Near Sector 50 main road	Noida	Sector 50	ACTIVE	\N	19	\N	2026-09-08 09:22:36.499	2026-10-27 11:52:33.13
cmvqmltvh00ezuh583plkye1j	cmvqmltv300exuh58u3iy43o5	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	f	f	Near Sector 50 main road	Noida	Sector 50	ACTIVE	\N	186	\N	2026-10-17 05:32:34.862	2026-10-27 11:52:33.149
cmvqmltvm00f1uh58axj8ombb	cmvqmltv300exuh58u3iy43o5	Electric guitar + practice amp	MUSIC	Electric guitar with 20 W amp, cable, strap and tuner.	{/demo/eguitar-1.jpg,/demo/eguitar-2.jpg}	450	2500	8000	1	30	t	f	f	Near Sector 50 main road	Noida	Sector 50	ACTIVE	\N	217	\N	2026-09-14 15:12:11.354	2026-10-27 11:52:33.154
cmvqmltvr00f3uh58dyqmfko8	cmvqmltv300exuh58u3iy43o5	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	f	f	Near Sector 50 main road	Noida	Sector 50	ACTIVE	\N	64	\N	2026-10-09 17:01:26.168	2026-10-27 11:52:33.159
cmvqmltw700f6uh5816bvtn5m	cmvqmltvv00f4uh58rdxb5u81	Sony A7 III + 28–70mm kit	CAMERAS	Full-frame mirrorless body with the 28–70mm kit lens, 2 batteries, charger, 64 GB card and padded bag.	{/demo/mirrorless-1.jpg,/demo/mirrorless-2.jpg}	1200	7000	15000	1	30	t	t	f	Near Sector 50 main road	Noida	Sector 50	ACTIVE	\N	71	\N	2026-09-22 17:16:51.213	2026-10-27 11:52:33.175
cmvqmltxw00f8uh58k8582j79	cmvqmltvv00f4uh58rdxb5u81	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	t	f	Near Sector 50 main road	Noida	Sector 50	ACTIVE	\N	186	\N	2026-09-22 01:35:32.936	2026-10-27 11:52:33.236
cmvqmlty100fauh58lgfg6xr3	cmvqmltvv00f4uh58rdxb5u81	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	t	f	Near Sector 50 main road	Noida	Sector 50	ACTIVE	\N	45	\N	2026-09-04 01:49:44.292	2026-10-27 11:52:33.241
cmvqmltyd00fduh585w9lzc7z	cmvqmlty400fbuh58tcjpyl0u	Electric lawn mower	TOOLS	Corded electric mower with grass box and 15 m extension cable.	{/demo/mower-1.jpg,/demo/mower-2.jpg}	350	1800	4000	1	30	t	t	t	Near Sector 62 main road	Noida	Sector 62	ACTIVE	\N	126	\N	2026-10-24 13:33:35.295	2026-10-27 11:52:33.254
cmvqmltyi00ffuh58btd6pu0g	cmvqmlty400fbuh58tcjpyl0u	Inflatable kayak (2 person)	SPORTS	Two-person inflatable kayak with paddles, pump and life jackets.	{/demo/kayak-1.jpg,/demo/kayak-2.jpg}	600	\N	8000	1	30	t	f	f	Near Sector 62 main road	Noida	Sector 62	ACTIVE	\N	222	\N	2026-09-04 09:45:01.385	2026-10-27 11:52:33.258
cmvqmltz000fkuh58ueg16rh8	cmvqmltym00fguh58rmuclrfw	Cajon box drum	MUSIC	Wooden cajon with snare wires and a padded seat cover.	{/demo/cajon-1.jpg,/demo/cajon-2.jpg}	150	700	2000	1	30	t	t	f	Near Sector 62 main road	Noida	Sector 62	ACTIVE	\N	151	\N	2026-09-09 18:25:16.744	2026-10-27 11:52:33.277
cmvqmltza00fnuh5823x6zxjb	cmvqmltz300fluh58srmku3su	Karaoke wireless mic set	PARTY	Two wireless microphones with receiver. Works with any speaker or TV.	{/demo/karaoke-1.jpg,/demo/karaoke-2.jpg}	300	1500	2500	1	30	t	f	f	Near Sector 76 main road	Noida	Sector 76	ACTIVE	\N	87	\N	2026-10-15 16:22:17.221	2026-10-27 11:52:33.286
cmvqmltyu00fiuh58rykxdnun	cmvqmltym00fguh58rmuclrfw	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	f	Near Sector 62 main road	Noida	Sector 62	ACTIVE	\N	80	\N	2026-10-16 16:50:01.046	2026-10-29 11:52:35.98
cmvqmltzf00fpuh586g3sjaj9	cmvqmltz300fluh58srmku3su	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	f	f	Near Sector 76 main road	Noida	Sector 76	ACTIVE	\N	68	\N	2026-09-09 22:01:12.925	2026-10-27 11:52:33.291
cmvqmltzq00fsuh58aai79ko1	cmvqmltzi00fquh589870p6la	Electric lawn mower	TOOLS	Corded electric mower with grass box and 15 m extension cable.	{/demo/mower-1.jpg,/demo/mower-2.jpg}	350	1800	4000	1	30	t	t	f	Near Sector 76 main road	Noida	Sector 76	ACTIVE	\N	161	\N	2026-09-18 05:23:19.861	2026-10-27 11:52:33.303
cmvqmltzu00fuuh58nuqdwkle	cmvqmltzi00fquh589870p6la	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	f	f	Near Sector 76 main road	Noida	Sector 76	ACTIVE	\N	115	\N	2026-09-24 23:15:46.263	2026-10-27 11:52:33.306
cmvqmlu0800fxuh58fu6r2ub1	cmvqmltzx00fvuh58ziwhf6b0	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	t	Near Sector 137 main road	Noida	Sector 137	ACTIVE	\N	227	\N	2026-10-10 07:38:12.628	2026-10-27 11:52:33.32
cmvqmlu0d00fzuh584msmfnde	cmvqmltzx00fvuh58ziwhf6b0	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	f	f	Near Sector 137 main road	Noida	Sector 137	ACTIVE	\N	157	\N	2026-09-12 05:59:02.751	2026-10-27 11:52:33.326
cmvqmlu0t00g2uh587p1wgvi7	cmvqmlu0i00g0uh58hgb10z5j	Yamaha acoustic guitar	MUSIC	Full-size acoustic guitar, freshly strung, with gig bag, capo and picks.	{/demo/guitar-1.jpg,/demo/guitar-2.jpg}	200	1000	4000	1	30	t	f	f	Near Sector 137 main road	Noida	Sector 137	ACTIVE	\N	120	\N	2026-09-11 04:21:14.083	2026-10-27 11:52:33.341
cmvqmlu0y00g4uh5839fj07cf	cmvqmlu0i00g0uh58hgb10z5j	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	f	f	Near Sector 137 main road	Noida	Sector 137	ACTIVE	\N	126	\N	2026-09-11 15:04:58.232	2026-10-27 11:52:33.346
cmvqmlu1300g6uh58nv4zocgd	cmvqmlu0i00g0uh58hgb10z5j	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	f	f	Near Sector 137 main road	Noida	Sector 137	ACTIVE	\N	7	\N	2026-09-05 21:11:32.537	2026-10-27 11:52:33.351
cmvqmlu1l00g9uh58cft2ka8a	cmvqmlu1700g7uh580xgy4l17	Sony A7 III + 28–70mm kit	CAMERAS	Full-frame mirrorless body with the 28–70mm kit lens, 2 batteries, charger, 64 GB card and padded bag.	{/demo/mirrorless-1.jpg,/demo/mirrorless-2.jpg}	1200	7000	15000	1	30	t	f	f	Near Greater Noida West main road	Noida	Greater Noida West	ACTIVE	\N	190	\N	2026-09-05 04:44:42.683	2026-10-27 11:52:33.369
cmvqmlu1u00gbuh582q3q7thk	cmvqmlu1700g7uh580xgy4l17	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	t	f	Near Greater Noida West main road	Noida	Greater Noida West	ACTIVE	\N	18	\N	2026-09-13 21:11:41.312	2026-10-27 11:52:33.378
cmvqmlu2000gduh58o7q0zjfc	cmvqmlu1700g7uh580xgy4l17	Cricket kit (bat, pads, gloves)	SPORTS	English willow bat, pads, gloves, helmet and stumps for a weekend match.	{/demo/cricket-1.jpg,/demo/cricket-2.jpg}	200	1000	2500	1	30	t	f	f	Near Greater Noida West main road	Noida	Greater Noida West	ACTIVE	\N	150	\N	2026-10-13 03:31:40.816	2026-10-27 11:52:33.384
cmvqmlu2j00gguh58nns5ii0e	cmvqmlu2500geuh580gm1t9yl	Camping gas stove + cookset	CAMPING	Portable gas stove with pot, pan and kettle. Gas canister not included.	{/demo/stove-1.jpg,/demo/stove-2.jpg}	100	500	1000	1	30	t	f	f	Near Greater Noida West main road	Noida	Greater Noida West	ACTIVE	\N	147	\N	2026-10-02 04:31:16.517	2026-10-27 11:52:33.403
cmvqmlu2o00giuh58w1f0izu2	cmvqmlu2500geuh580gm1t9yl	JBL party speaker with lights	PARTY	Loud Bluetooth party speaker with light show, mic input and wheels. Runs 12 h on battery.	{/demo/speaker-1.jpg,/demo/speaker-2.jpg}	800	4500	8000	1	30	t	t	f	Near Greater Noida West main road	Noida	Greater Noida West	ACTIVE	\N	35	\N	2026-09-17 21:45:38.38	2026-10-27 11:52:33.408
cmvqmlu2s00gkuh581e3fdtiv	cmvqmlu2500geuh580gm1t9yl	Digital piano (88 keys)	MUSIC	Weighted-key digital piano with stand, sustain pedal and headphones.	{/demo/piano-1.jpg,/demo/piano-2.jpg}	500	2800	10000	3	30	t	f	f	Near Greater Noida West main road	Noida	Greater Noida West	ACTIVE	\N	31	\N	2026-09-01 17:36:17.212	2026-10-27 11:52:33.412
cmvqmlu3500gnuh589bcoj58d	cmvqmlu2v00gluh58rehwbuc9	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	f	t	Near Greater Noida West main road	Noida	Greater Noida West	ACTIVE	\N	145	\N	2026-09-23 06:55:58.799	2026-10-27 11:52:33.425
cmvqmlu3800gpuh588tgrovq7	cmvqmlu2v00gluh58rehwbuc9	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	f	f	Near Greater Noida West main road	Noida	Greater Noida West	ACTIVE	\N	148	\N	2026-10-16 06:11:02.953	2026-10-27 11:52:33.428
cmvqmlu3m00gsuh58bfivuckk	cmvqmlu3c00gquh58tfkensje	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	f	f	Near Palam Vihar main road	Gurugram	Palam Vihar	ACTIVE	\N	73	\N	2026-09-21 23:55:26.931	2026-10-27 11:52:33.442
cmvqmlu3q00guuh58pmutjsk9	cmvqmlu3c00gquh58tfkensje	Folding chairs (set of 10)	PARTY	Ten steel folding chairs with padded seats. Delivery recommended.	{/demo/chairs-1.jpg}	500	2500	3000	1	30	t	f	t	Near Palam Vihar main road	Gurugram	Palam Vihar	ACTIVE	\N	32	\N	2026-10-01 05:34:48.347	2026-10-27 11:52:33.446
cmvqmlu3u00gwuh585fyhjwz8	cmvqmlu3c00gquh58tfkensje	Badminton set (4 rackets + net)	SPORTS	Four rackets, shuttles and a portable net with poles.	{/demo/badminton-1.jpg}	80	400	800	1	30	t	f	f	Near Palam Vihar main road	Gurugram	Palam Vihar	ACTIVE	\N	104	\N	2026-09-01 02:24:48.87	2026-10-27 11:52:33.451
cmvqmlu4700gzuh582num772m	cmvqmlu3y00gxuh58umekx9nd	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	t	f	Near Palam Vihar main road	Gurugram	Palam Vihar	ACTIVE	\N	152	\N	2026-09-28 14:46:27.429	2026-10-27 11:52:33.463
cmvqmlu4b00h1uh58br9z8ii3	cmvqmlu3y00gxuh58umekx9nd	Folding chairs (set of 10)	PARTY	Ten steel folding chairs with padded seats. Delivery recommended.	{/demo/chairs-1.jpg}	500	2500	3000	1	30	t	t	f	Near Palam Vihar main road	Gurugram	Palam Vihar	ACTIVE	\N	32	\N	2026-10-17 23:18:48.974	2026-10-27 11:52:33.467
cmvqmlu4o00h4uh585e7k3s3x	cmvqmlu4f00h2uh586ffqrqgv	JBL party speaker with lights	PARTY	Loud Bluetooth party speaker with light show, mic input and wheels. Runs 12 h on battery.	{/demo/speaker-1.jpg,/demo/speaker-2.jpg}	800	4500	8000	1	30	t	t	f	Near DLF Phase 3 main road	Gurugram	DLF Phase 3	ACTIVE	\N	53	\N	2026-10-17 21:19:08.92	2026-10-27 11:52:33.48
cmvqmlu4t00h6uh58lgv9qswr	cmvqmlu4f00h2uh586ffqrqgv	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	f	f	Near DLF Phase 3 main road	Gurugram	DLF Phase 3	ACTIVE	\N	18	\N	2026-09-18 22:09:57.738	2026-10-27 11:52:33.485
cmvqmlu5500h9uh589d3gnfbh	cmvqmlu4x00h7uh58u2v6ityd	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	f	t	Near DLF Phase 3 main road	Gurugram	DLF Phase 3	ACTIVE	\N	191	\N	2026-10-13 21:19:27.894	2026-10-27 11:52:33.498
cmvqmlu5900hbuh58d9op209v	cmvqmlu4x00h7uh58u2v6ityd	4-person dome tent	CAMPING	Waterproof dome tent for four with rain fly, pegs, ropes and carry bag.	{/demo/tent-1.jpg,/demo/tent-2.jpg}	300	1500	3000	1	30	t	f	f	Near DLF Phase 3 main road	Gurugram	DLF Phase 3	ACTIVE	\N	225	\N	2026-10-05 09:46:57.057	2026-10-27 11:52:33.501
cmvqmlu5l00heuh58to5jf2uu	cmvqmlu5c00hcuh5849k02f7g	Carbon travel tripod	CAMERAS	Light carbon tripod with ball head and quick-release plate. Folds to 40 cm.	{/demo/tripod-1.jpg,/demo/tripod-2.jpg}	150	800	2000	1	30	t	t	f	Near Cyber City main road	Gurugram	Cyber City	ACTIVE	\N	70	\N	2026-09-12 07:49:44.546	2026-10-27 11:52:33.513
cmvqmlu5o00hguh58dunahul8	cmvqmlu5c00hcuh5849k02f7g	Electric lawn mower	TOOLS	Corded electric mower with grass box and 15 m extension cable.	{/demo/mower-1.jpg,/demo/mower-2.jpg}	350	1800	4000	1	30	t	t	f	Near Cyber City main road	Gurugram	Cyber City	ACTIVE	\N	216	\N	2026-10-27 00:46:24.66	2026-10-27 11:52:33.517
cmvqmlu6100hjuh58dpf31f1n	cmvqmlu5s00hhuh58i9pax39i	Karaoke wireless mic set	PARTY	Two wireless microphones with receiver. Works with any speaker or TV.	{/demo/karaoke-1.jpg,/demo/karaoke-2.jpg}	300	1500	2500	1	30	t	f	t	Near Cyber City main road	Gurugram	Cyber City	ACTIVE	\N	144	\N	2026-09-03 21:15:59.309	2026-10-27 11:52:33.529
cmvqmlu6500hluh58xo7pmrgh	cmvqmlu5s00hhuh58i9pax39i	Camping gas stove + cookset	CAMPING	Portable gas stove with pot, pan and kettle. Gas canister not included.	{/demo/stove-1.jpg,/demo/stove-2.jpg}	100	500	1000	1	30	t	t	t	Near Cyber City main road	Gurugram	Cyber City	ACTIVE	\N	69	\N	2026-10-16 09:38:29.6	2026-10-27 11:52:33.533
cmvqmlu6800hnuh58pyg9gv21	cmvqmlu5s00hhuh58i9pax39i	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	t	f	Near Cyber City main road	Gurugram	Cyber City	ACTIVE	\N	83	\N	2026-10-17 11:36:57.518	2026-10-27 11:52:33.537
cmvqmlu6l00hquh58qs22j6yp	cmvqmlu6c00houh58hkufy4ru	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	t	f	Near DLF Phase 1 main road	Gurugram	DLF Phase 1	ACTIVE	\N	226	\N	2026-09-18 03:50:21.377	2026-10-27 11:52:33.549
cmvqmlu6p00hsuh58emkl93oh	cmvqmlu6c00houh58hkufy4ru	Angle grinder 4 inch	TOOLS	Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.	{/demo/grinder-1.jpg,/demo/grinder-2.jpg}	150	\N	1500	1	30	t	t	f	Near DLF Phase 1 main road	Gurugram	DLF Phase 1	ACTIVE	\N	205	\N	2026-09-05 01:46:06.6	2026-10-27 11:52:33.553
cmvqmlu6t00huuh58gu8sse12	cmvqmlu6c00houh58hkufy4ru	GoPro Hero action camera	CAMERAS	Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.	{/demo/actioncam-1.jpg,/demo/actioncam-2.jpg}	400	2200	5000	1	30	t	t	f	Near DLF Phase 1 main road	Gurugram	DLF Phase 1	ACTIVE	\N	39	\N	2026-10-09 18:15:52.313	2026-10-27 11:52:33.557
cmvqmlu7700hxuh58j8sjkrjf	cmvqmlu6w00hvuh58yw0fgkkp	Fairy lights (20 strings)	PARTY	20 warm-white LED strings, 10 m each, with extension boards and plugs.	{/demo/lights-1.jpg}	400	\N	2000	1	30	t	t	t	Near DLF Phase 1 main road	Gurugram	DLF Phase 1	ACTIVE	\N	78	\N	2026-09-14 18:16:00.551	2026-10-27 11:52:33.571
cmvqmlu7c00hzuh58ac5pf4fd	cmvqmlu6w00hvuh58yw0fgkkp	Sony A7 III + 28–70mm kit	CAMERAS	Full-frame mirrorless body with the 28–70mm kit lens, 2 batteries, charger, 64 GB card and padded bag.	{/demo/mirrorless-1.jpg,/demo/mirrorless-2.jpg}	1200	7000	15000	1	30	t	f	t	Near DLF Phase 1 main road	Gurugram	DLF Phase 1	ACTIVE	\N	162	\N	2026-10-19 03:19:38.473	2026-10-27 11:52:33.576
cmvqmlu7o00i2uh58nwlktxrm	cmvqmlu7f00i0uh58vdq65gz9	Canon EOS 200D DSLR kit	CAMERAS	Beginner-friendly DSLR with 18–55mm lens, battery, charger, 32 GB card and strap.	{/demo/dslr-1.jpg,/demo/dslr-2.jpg}	600	3500	8000	1	30	t	f	f	Near DLF Phase 1 main road	Gurugram	DLF Phase 1	ACTIVE	\N	140	\N	2026-08-30 14:04:34.098	2026-10-27 11:52:33.588
cmvqmlu7s00i4uh580m7rvxm0	cmvqmlu7f00i0uh58vdq65gz9	Badminton set (4 rackets + net)	SPORTS	Four rackets, shuttles and a portable net with poles.	{/demo/badminton-1.jpg}	80	400	800	1	30	t	f	t	Near DLF Phase 1 main road	Gurugram	DLF Phase 1	ACTIVE	\N	27	\N	2026-10-07 07:10:34.88	2026-10-27 11:52:33.592
cmvqmlu8600i7uh589u8hz6gu	cmvqmlu7w00i5uh58duyf2jfk	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	t	t	Near Golf Course Road main road	Gurugram	Golf Course Road	ACTIVE	\N	155	\N	2026-09-19 21:20:23.653	2026-10-27 11:52:33.606
cmvqmlu8900i9uh58phub0x0h	cmvqmlu7w00i5uh58duyf2jfk	JBL party speaker with lights	PARTY	Loud Bluetooth party speaker with light show, mic input and wheels. Runs 12 h on battery.	{/demo/speaker-1.jpg,/demo/speaker-2.jpg}	800	4500	8000	1	30	t	t	f	Near Golf Course Road main road	Gurugram	Golf Course Road	ACTIVE	\N	196	\N	2026-10-11 07:54:34.075	2026-10-27 11:52:33.61
cmvqmlu8d00ibuh58g5wahu9k	cmvqmlu7w00i5uh58duyf2jfk	Angle grinder 4 inch	TOOLS	Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.	{/demo/grinder-1.jpg,/demo/grinder-2.jpg}	150	\N	1500	1	30	t	f	t	Near Golf Course Road main road	Gurugram	Golf Course Road	ACTIVE	\N	32	\N	2026-09-03 22:07:58.78	2026-10-27 11:52:33.614
cmvqmlu8q00ieuh58xbk81ncm	cmvqmlu8h00icuh58qwla4lsa	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	t	t	Near Golf Course Road main road	Gurugram	Golf Course Road	ACTIVE	\N	110	\N	2026-10-23 05:16:26.015	2026-10-27 11:52:33.626
cmvqmlu8t00iguh58dj1nwdrv	cmvqmlu8h00icuh58qwla4lsa	Angle grinder 4 inch	TOOLS	Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.	{/demo/grinder-1.jpg,/demo/grinder-2.jpg}	150	\N	1500	1	30	t	t	t	Near Golf Course Road main road	Gurugram	Golf Course Road	ACTIVE	\N	32	\N	2026-09-24 09:47:32.138	2026-10-27 11:52:33.629
cmvqmlu9500ijuh58lcrfz5tt	cmvqmlu8x00ihuh58tqx77irj	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	f	f	Near Golf Course Road main road	Gurugram	Golf Course Road	ACTIVE	\N	230	\N	2026-10-04 10:37:09.435	2026-10-27 11:52:33.641
cmvqmlu9900iluh58vdca455x	cmvqmlu8x00ihuh58tqx77irj	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	t	t	Near Golf Course Road main road	Gurugram	Golf Course Road	ACTIVE	\N	147	\N	2026-10-02 23:08:18.416	2026-10-27 11:52:33.645
cmvqmlu9l00iouh58kl3lmzbl	cmvqmlu9c00imuh58l7xcm2f8	Sleeping bag (comfort 5°C)	CAMPING	Warm mummy sleeping bag, washed after every use. Compression sack included.	{/demo/sleepingbag-1.jpg,/demo/sleepingbag-2.jpg}	120	600	1500	1	30	t	t	t	Near Sector 56 main road	Gurugram	Sector 56	ACTIVE	\N	206	\N	2026-10-13 23:52:29.117	2026-10-27 11:52:33.658
cmvqmlu9p00iquh58hzt413jd	cmvqmlu9c00imuh58l7xcm2f8	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	t	f	Near Sector 56 main road	Gurugram	Sector 56	ACTIVE	\N	178	\N	2026-09-06 19:58:58.704	2026-10-27 11:52:33.661
cmvqmlu9t00isuh5885f7830m	cmvqmlu9c00imuh58l7xcm2f8	Nintendo Switch with games	GAMING	Switch console with dock, Joy-Cons and Mario Kart + party games.	{/demo/switch-1.jpg,/demo/switch-2.jpg}	450	2500	10000	1	30	t	t	f	Near Sector 56 main road	Gurugram	Sector 56	ACTIVE	\N	78	\N	2026-09-24 06:36:31.454	2026-10-27 11:52:33.666
cmvqmlua700ivuh58tsjsciar	cmvqmlu9x00ituh58cc9salg3	Carbon travel tripod	CAMERAS	Light carbon tripod with ball head and quick-release plate. Folds to 40 cm.	{/demo/tripod-1.jpg,/demo/tripod-2.jpg}	150	800	2000	1	30	t	f	f	Near Sector 56 main road	Gurugram	Sector 56	ACTIVE	\N	85	\N	2026-10-01 01:46:42.844	2026-10-27 11:52:33.679
cmvqmluaa00ixuh58797i17ju	cmvqmlu9x00ituh58cc9salg3	Angle grinder 4 inch	TOOLS	Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.	{/demo/grinder-1.jpg,/demo/grinder-2.jpg}	150	\N	1500	1	30	t	f	f	Near Sector 56 main road	Gurugram	Sector 56	ACTIVE	\N	34	\N	2026-10-22 22:35:26.164	2026-10-27 11:52:33.682
cmvqmluap00j0uh58whhomue3	cmvqmluaf00iyuh58r0y5a574	Folding chairs (set of 10)	PARTY	Ten steel folding chairs with padded seats. Delivery recommended.	{/demo/chairs-1.jpg}	500	2500	3000	1	30	t	t	t	Near Sector 56 main road	Gurugram	Sector 56	ACTIVE	\N	36	\N	2026-09-21 04:15:28.563	2026-10-27 11:52:33.698
cmvqmluat00j2uh58m719chu6	cmvqmluaf00iyuh58r0y5a574	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	t	t	Near Sector 56 main road	Gurugram	Sector 56	ACTIVE	\N	9	\N	2026-10-15 01:27:50.263	2026-10-27 11:52:33.702
cmvqmluay00j4uh58ymk46jy2	cmvqmluaf00iyuh58r0y5a574	Angle grinder 4 inch	TOOLS	Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.	{/demo/grinder-1.jpg,/demo/grinder-2.jpg}	150	\N	1500	1	30	t	f	f	Near Sector 56 main road	Gurugram	Sector 56	ACTIVE	\N	34	\N	2026-09-25 00:58:44.358	2026-10-27 11:52:33.707
cmvqmlubh00j7uh58xlwanzsi	cmvqmlub400j5uh5857x78qss	Electric lawn mower	TOOLS	Corded electric mower with grass box and 15 m extension cable.	{/demo/mower-1.jpg,/demo/mower-2.jpg}	350	1800	4000	1	30	t	f	t	Near Sohna Road main road	Gurugram	Sohna Road	ACTIVE	\N	11	\N	2026-10-10 23:09:09.812	2026-10-27 11:52:33.726
cmvqmlubl00j9uh58z2dbtcst	cmvqmlub400j5uh5857x78qss	Cricket kit (bat, pads, gloves)	SPORTS	English willow bat, pads, gloves, helmet and stumps for a weekend match.	{/demo/cricket-1.jpg,/demo/cricket-2.jpg}	200	1000	2500	1	30	t	f	t	Near Sohna Road main road	Gurugram	Sohna Road	ACTIVE	\N	35	\N	2026-09-07 02:32:59.51	2026-10-27 11:52:33.73
cmvqmlubo00jbuh58dml6nhmd	cmvqmlub400j5uh5857x78qss	DJ controller (2 decks)	MUSIC	Two-deck DJ controller with headphones and laptop stand.	{/demo/dj-1.jpg,/demo/dj-2.jpg}	700	4000	12000	1	30	t	f	t	Near Sohna Road main road	Gurugram	Sohna Road	ACTIVE	\N	103	\N	2026-09-24 06:00:59.451	2026-10-27 11:52:33.733
cmvqmlubz00jeuh58xv8nw4xh	cmvqmlubs00jcuh5808r6o5a5	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	t	f	Near Sohna Road main road	Gurugram	Sohna Road	ACTIVE	\N	8	\N	2026-10-15 07:39:38.381	2026-10-27 11:52:33.744
cmvqmluc300jguh58ae26j6f7	cmvqmlubs00jcuh5808r6o5a5	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	f	t	Near Sohna Road main road	Gurugram	Sohna Road	ACTIVE	\N	54	\N	2026-09-11 04:06:41.045	2026-10-27 11:52:33.747
cmvqmluc600jiuh5842tou056	cmvqmlubs00jcuh5808r6o5a5	Folding chairs (set of 10)	PARTY	Ten steel folding chairs with padded seats. Delivery recommended.	{/demo/chairs-1.jpg}	500	2500	3000	1	30	t	t	f	Near Sohna Road main road	Gurugram	Sohna Road	ACTIVE	\N	76	\N	2026-10-10 13:01:05.618	2026-10-27 11:52:33.75
cmvqmluci00jluh58lvrfba4u	cmvqmluc900jjuh58272ep349	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	f	f	Near Sohna Road main road	Gurugram	Sohna Road	ACTIVE	\N	208	\N	2026-08-28 17:31:17.069	2026-10-27 11:52:33.763
cmvqmlucm00jnuh58zdi6tbig	cmvqmluc900jjuh58272ep349	Mountain bike (21 gears)	SPORTS	21-gear mountain bike with helmet and lock. Serviced every month.	{/demo/mtb-1.jpg,/demo/mtb-2.jpg}	300	1500	6000	1	30	t	t	f	Near Sohna Road main road	Gurugram	Sohna Road	ACTIVE	\N	84	\N	2026-09-07 22:08:39.631	2026-10-27 11:52:33.766
cmvqmlucp00jpuh5832qngar3	cmvqmluc900jjuh58272ep349	4-person dome tent	CAMPING	Waterproof dome tent for four with rain fly, pegs, ropes and carry bag.	{/demo/tent-1.jpg,/demo/tent-2.jpg}	300	1500	3000	1	30	t	t	f	Near Sohna Road main road	Gurugram	Sohna Road	ACTIVE	\N	88	\N	2026-10-10 10:23:43.734	2026-10-27 11:52:33.77
cmvqmlud100jsuh58yoyuluog	cmvqmluct00jquh58fj4ci3uy	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	f	f	Near Aundh main road	Pune	Aundh	ACTIVE	\N	195	\N	2026-10-08 22:53:55.203	2026-10-27 11:52:33.781
cmvqmlud400juuh58w32egqxb	cmvqmluct00jquh58fj4ci3uy	Home tool kit (108 pieces)	TOOLS	Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.	{/demo/toolkit-1.jpg}	120	600	1500	1	30	t	f	t	Near Aundh main road	Pune	Aundh	ACTIVE	\N	109	\N	2026-10-12 00:13:51.088	2026-10-27 11:52:33.784
cmvqmludi00jxuh58tqns5bho	cmvqmlud800jvuh58oxqzmh53	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	t	t	Near Aundh main road	Pune	Aundh	ACTIVE	\N	197	\N	2026-10-02 17:24:27.841	2026-10-27 11:52:33.799
cmvqmludm00jzuh58m8yerhfa	cmvqmlud800jvuh58oxqzmh53	Trekking backpack 60 L	CAMPING	Comfortable 60 L backpack with rain cover and hip belt pockets.	{/demo/backpack-1.jpg}	150	800	2000	1	30	t	t	t	Near Aundh main road	Pune	Aundh	ACTIVE	\N	6	\N	2026-08-28 12:08:14.346	2026-10-27 11:52:33.802
cmvqmludy00k2uh58ceupc1em	cmvqmludp00k0uh581by3g1zz	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	f	f	Near Baner main road	Pune	Baner	ACTIVE	\N	100	\N	2026-09-19 22:05:52.058	2026-10-27 11:52:33.815
cmvqmlue200k4uh58glq7kp9c	cmvqmludp00k0uh581by3g1zz	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	f	Near Baner main road	Pune	Baner	ACTIVE	\N	88	\N	2026-09-04 00:00:12.839	2026-10-27 11:52:33.818
cmvqmlue500k6uh58jvzq7gs1	cmvqmludp00k0uh581by3g1zz	Trekking backpack 60 L	CAMPING	Comfortable 60 L backpack with rain cover and hip belt pockets.	{/demo/backpack-1.jpg}	150	800	2000	1	30	t	f	f	Near Baner main road	Pune	Baner	ACTIVE	\N	228	\N	2026-08-30 15:42:41.788	2026-10-27 11:52:33.821
cmvqmlueh00k9uh58jao1mfbh	cmvqmlue900k7uh58qpcufnv1	Cajon box drum	MUSIC	Wooden cajon with snare wires and a padded seat cover.	{/demo/cajon-1.jpg,/demo/cajon-2.jpg}	150	700	2000	1	30	t	t	f	Near Baner main road	Pune	Baner	ACTIVE	\N	23	\N	2026-09-05 10:24:08.843	2026-10-27 11:52:33.833
cmvqmluek00kbuh58jcfpp5n5	cmvqmlue900k7uh58qpcufnv1	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	f	t	Near Baner main road	Pune	Baner	ACTIVE	\N	160	\N	2026-10-21 10:21:55.477	2026-10-27 11:52:33.837
cmvqmlueo00kduh587zv51vxj	cmvqmlue900k7uh58qpcufnv1	Canon EOS 200D DSLR kit	CAMERAS	Beginner-friendly DSLR with 18–55mm lens, battery, charger, 32 GB card and strap.	{/demo/dslr-1.jpg,/demo/dslr-2.jpg}	600	3500	8000	1	30	t	t	f	Near Baner main road	Pune	Baner	ACTIVE	\N	46	\N	2026-10-17 02:27:45.484	2026-10-27 11:52:33.84
cmvqmluez00kguh58gnevydkr	cmvqmluer00keuh58n98shepi	Racing wheel + pedals	GAMING	Force-feedback steering wheel with pedals. Works with PC and PlayStation.	{/demo/wheel-1.jpg,/demo/wheel-2.jpg}	350	\N	6000	1	30	t	t	f	Near Hinjewadi main road	Pune	Hinjewadi	ACTIVE	\N	179	\N	2026-10-10 01:17:59.796	2026-10-27 11:52:33.852
cmvqmluf200kiuh583jpsxwnp	cmvqmluer00keuh58n98shepi	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	t	t	Near Hinjewadi main road	Pune	Hinjewadi	ACTIVE	\N	128	\N	2026-10-21 23:48:42.195	2026-10-27 11:52:33.854
cmvqmluf500kkuh58eag7zx83	cmvqmluer00keuh58n98shepi	Projector screen 100 inch	PROJECTORS	Foldable 100" screen with tripod stand. Sets up in 5 minutes.	{/demo/screen-1.jpg,/demo/screen-2.jpg}	200	1000	2000	1	30	t	f	t	Near Hinjewadi main road	Pune	Hinjewadi	ACTIVE	\N	205	\N	2026-09-10 11:27:05.946	2026-10-27 11:52:33.857
cmvqmluff00knuh581hybgt7x	cmvqmluf800kluh58njmcxlql	Sony A7 III + 28–70mm kit	CAMERAS	Full-frame mirrorless body with the 28–70mm kit lens, 2 batteries, charger, 64 GB card and padded bag.	{/demo/mirrorless-1.jpg,/demo/mirrorless-2.jpg}	1200	7000	15000	1	30	t	t	t	Near Hinjewadi main road	Pune	Hinjewadi	ACTIVE	\N	35	\N	2026-10-18 16:33:13.936	2026-10-27 11:52:33.867
cmvqmlufh00kpuh588gftkbij	cmvqmluf800kluh58njmcxlql	VR headset (Quest 2)	GAMING	Standalone VR headset with both controllers and charging cable. Sanitised after use.	{/demo/vr-1.jpg,/demo/vr-2.jpg}	600	3500	12000	1	30	t	t	f	Near Hinjewadi main road	Pune	Hinjewadi	ACTIVE	\N	163	\N	2026-10-27 06:24:49.411	2026-10-27 11:52:33.87
cmvqmlufk00kruh58swh6bdeo	cmvqmluf800kluh58njmcxlql	Xbox Series S + controller	GAMING	Compact Xbox with one controller and Game Pass games already installed.	{/demo/xbox-1.jpg,/demo/xbox-2.jpg}	500	2800	10000	1	30	t	t	f	Near Hinjewadi main road	Pune	Hinjewadi	ACTIVE	\N	116	\N	2026-09-10 22:00:52.126	2026-10-27 11:52:33.872
cmvqmluft00kuuh58ds9qe926	cmvqmlufn00ksuh58mg7kbrgw	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	f	f	Near Hinjewadi main road	Pune	Hinjewadi	ACTIVE	\N	16	\N	2026-09-25 21:37:40.435	2026-10-27 11:52:33.881
cmvqmlufv00kwuh58lpoud3tl	cmvqmlufn00ksuh58mg7kbrgw	Racing wheel + pedals	GAMING	Force-feedback steering wheel with pedals. Works with PC and PlayStation.	{/demo/wheel-1.jpg,/demo/wheel-2.jpg}	350	\N	6000	1	30	t	t	t	Near Hinjewadi main road	Pune	Hinjewadi	ACTIVE	\N	179	\N	2026-09-24 21:56:34.389	2026-10-27 11:52:33.884
cmvqmlug500kzuh580gub6fth	cmvqmlufy00kxuh582c6l5dkv	Trekking backpack 60 L	CAMPING	Comfortable 60 L backpack with rain cover and hip belt pockets.	{/demo/backpack-1.jpg}	150	800	2000	1	30	t	f	f	Near Kothrud main road	Pune	Kothrud	ACTIVE	\N	25	\N	2026-09-09 08:11:40.461	2026-10-27 11:52:33.893
cmvqmlug800l1uh58hibp95j9	cmvqmlufy00kxuh582c6l5dkv	Canon EOS 200D DSLR kit	CAMERAS	Beginner-friendly DSLR with 18–55mm lens, battery, charger, 32 GB card and strap.	{/demo/dslr-1.jpg,/demo/dslr-2.jpg}	600	3500	8000	1	30	t	f	f	Near Kothrud main road	Pune	Kothrud	ACTIVE	\N	119	\N	2026-10-21 20:04:16.85	2026-10-27 11:52:33.897
cmvqmlugj00l4uh58pyrv8plb	cmvqmlugc00l2uh58uhl6n52g	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	f	f	Near Kothrud main road	Pune	Kothrud	ACTIVE	\N	8	\N	2026-08-31 07:50:17.026	2026-10-27 11:52:33.907
cmvqmlugm00l6uh587oe2i36j	cmvqmlugc00l2uh58uhl6n52g	DJI mini drone with 3 batteries	CAMERAS	Compact drone, remote, 3 batteries and charging hub. Fly only where it is allowed.	{/demo/drone-1.jpg,/demo/drone-2.jpg}	900	5000	15000	2	30	t	f	f	Near Kothrud main road	Pune	Kothrud	ACTIVE	\N	216	\N	2026-09-09 16:43:01.023	2026-10-27 11:52:33.91
cmvqmlugv00l9uh58qo3qfjp1	cmvqmlugo00l7uh58zms40d59	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	f	f	Near Kothrud main road	Pune	Kothrud	ACTIVE	\N	8	\N	2026-09-17 22:05:56.627	2026-10-27 11:52:33.919
cmvqmlugy00lbuh58uli3qx7m	cmvqmlugo00l7uh58zms40d59	Full HD home projector	PROJECTORS	1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.	{/demo/projector-1.jpg,/demo/projector-2.jpg}	700	4000	10000	1	30	t	t	f	Near Kothrud main road	Pune	Kothrud	ACTIVE	\N	106	\N	2026-10-01 04:38:19.053	2026-10-27 11:52:33.922
cmvqmluh700leuh58lbyl2xul	cmvqmluh000lcuh58eo32ta90	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	t	f	Near Koregaon Park main road	Pune	Koregaon Park	ACTIVE	\N	169	\N	2026-09-05 18:01:58.612	2026-10-27 11:52:33.931
cmvqmluha00lguh585onhez1a	cmvqmluh000lcuh58eo32ta90	Aluminium folding ladder 8 ft	TOOLS	Sturdy folding ladder, anti-slip feet, holds up to 150 kg.	{/demo/ladder-1.jpg,/demo/ladder-2.jpg}	150	700	1500	1	30	t	f	t	Near Koregaon Park main road	Pune	Koregaon Park	ACTIVE	\N	135	\N	2026-10-16 11:00:09.898	2026-10-27 11:52:33.934
cmvqmluhc00liuh588tonndta	cmvqmluh000lcuh58eo32ta90	Sony 70–200mm f/4 G lens	CAMERAS	Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.	{/demo/lens-1.jpg,/demo/lens-2.jpg}	600	\N	10000	1	30	t	f	f	Near Koregaon Park main road	Pune	Koregaon Park	ACTIVE	\N	186	\N	2026-08-28 12:23:05.987	2026-10-27 11:52:33.937
cmvqmluhl00lluh58cx02lqd5	cmvqmluhf00ljuh58oz5h5kpf	Canon EOS 200D DSLR kit	CAMERAS	Beginner-friendly DSLR with 18–55mm lens, battery, charger, 32 GB card and strap.	{/demo/dslr-1.jpg,/demo/dslr-2.jpg}	600	3500	8000	1	30	t	t	f	Near Koregaon Park main road	Pune	Koregaon Park	ACTIVE	\N	94	\N	2026-09-05 07:38:55.6	2026-10-27 11:52:33.946
cmvqmluho00lnuh581xdiddb5	cmvqmluhf00ljuh58oz5h5kpf	Mini portable projector	PROJECTORS	Pocket projector with built-in battery and speaker. Connects to phones.	{/demo/miniprojector-1.jpg}	350	1800	5000	1	30	t	t	f	Near Koregaon Park main road	Pune	Koregaon Park	ACTIVE	\N	145	\N	2026-10-08 17:04:01.084	2026-10-27 11:52:33.949
cmvqmluhy00lquh58erjqt5s5	cmvqmluhr00louh58zrc4l4sg	GoPro Hero action camera	CAMERAS	Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.	{/demo/actioncam-1.jpg,/demo/actioncam-2.jpg}	400	2200	5000	1	30	t	f	t	Near Kalyani Nagar main road	Pune	Kalyani Nagar	ACTIVE	\N	49	\N	2026-09-16 04:28:39.889	2026-10-27 11:52:33.958
cmvqmlui100lsuh58sw7kv7di	cmvqmluhr00louh58zrc4l4sg	Camping chairs (set of 4) + table	CAMPING	4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.	{/demo/campchairs-1.jpg}	200	1000	2000	1	30	t	t	f	Near Kalyani Nagar main road	Pune	Kalyani Nagar	ACTIVE	\N	133	\N	2026-10-01 11:40:54.04	2026-10-27 11:52:33.961
cmvqmluic00lvuh58cqxc23rq	cmvqmlui400ltuh58i5cb0h0z	Bosch 500W impact drill	TOOLS	Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.	{/demo/drill-1.jpg,/demo/drill-2.jpg}	180	900	2000	1	30	t	f	t	Near Kalyani Nagar main road	Pune	Kalyani Nagar	ACTIVE	\N	175	\N	2026-10-04 09:03:40.438	2026-10-27 11:52:33.972
cmvqmluif00lxuh58wkkvvszh	cmvqmlui400ltuh58i5cb0h0z	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	f	t	Near Kalyani Nagar main road	Pune	Kalyani Nagar	ACTIVE	\N	123	\N	2026-10-04 13:20:12.834	2026-10-27 11:52:33.976
cmvqmluij00lzuh588qhadpdv	cmvqmlui400ltuh58i5cb0h0z	Camping gas stove + cookset	CAMPING	Portable gas stove with pot, pan and kettle. Gas canister not included.	{/demo/stove-1.jpg,/demo/stove-2.jpg}	100	500	1000	1	30	t	t	f	Near Kalyani Nagar main road	Pune	Kalyani Nagar	ACTIVE	\N	55	\N	2026-10-21 16:24:58.75	2026-10-27 11:52:33.979
cmvqmluit00m2uh58b7rakcgd	cmvqmluim00m0uh589m0137k0	Fairy lights (20 strings)	PARTY	20 warm-white LED strings, 10 m each, with extension boards and plugs.	{/demo/lights-1.jpg}	400	\N	2000	1	30	t	t	f	Near Viman Nagar main road	Pune	Viman Nagar	ACTIVE	\N	10	\N	2026-10-11 08:22:16.05	2026-10-27 11:52:33.99
cmvqmluix00m4uh58rrvo7lzg	cmvqmluim00m0uh589m0137k0	GoPro Hero action camera	CAMERAS	Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.	{/demo/actioncam-1.jpg,/demo/actioncam-2.jpg}	400	2200	5000	1	30	t	f	f	Near Viman Nagar main road	Pune	Viman Nagar	ACTIVE	\N	201	\N	2026-10-23 11:27:30.469	2026-10-27 11:52:33.993
cmvqmluj800m7uh58bvlf88pl	cmvqmluj000m5uh58b2g4jzgt	PlayStation 5 + 2 controllers	GAMING	PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.	{/demo/ps5-1.jpg,/demo/ps5-2.jpg}	700	4000	15000	1	30	t	t	f	Near Viman Nagar main road	Pune	Viman Nagar	ACTIVE	\N	30	\N	2026-09-19 14:50:24.649	2026-10-27 11:52:34.005
cmvqmlujc00m9uh585megu4ph	cmvqmluj000m5uh58b2g4jzgt	Racing wheel + pedals	GAMING	Force-feedback steering wheel with pedals. Works with PC and PlayStation.	{/demo/wheel-1.jpg,/demo/wheel-2.jpg}	350	\N	6000	1	30	t	t	f	Near Viman Nagar main road	Pune	Viman Nagar	ACTIVE	\N	224	\N	2026-09-07 09:56:16.587	2026-10-27 11:52:34.008
cmvqmlujg00mbuh58wriucqy8	cmvqmluj000m5uh58b2g4jzgt	Nintendo Switch with games	GAMING	Switch console with dock, Joy-Cons and Mario Kart + party games.	{/demo/switch-1.jpg,/demo/switch-2.jpg}	450	2500	10000	1	30	t	f	f	Near Viman Nagar main road	Pune	Viman Nagar	ACTIVE	\N	159	\N	2026-09-08 03:35:28.524	2026-10-27 11:52:34.012
cmvqmlujq00meuh58cbsgcdu9	cmvqmlujj00mcuh58at04jmdw	Electric pressure washer 1800W	TOOLS	Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.	{/demo/washer-1.jpg,/demo/washer-2.jpg}	300	1500	3000	1	30	t	t	f	Near Viman Nagar main road	Pune	Viman Nagar	ACTIVE	\N	167	\N	2026-09-05 23:14:39.678	2026-10-27 11:52:34.023
cmvqmluju00mguh58x9zgjocn	cmvqmlujj00mcuh58at04jmdw	Mini portable projector	PROJECTORS	Pocket projector with built-in battery and speaker. Connects to phones.	{/demo/miniprojector-1.jpg}	350	1800	5000	1	30	t	t	t	Near Viman Nagar main road	Pune	Viman Nagar	ACTIVE	\N	235	\N	2026-09-27 19:44:05.64	2026-10-27 11:52:34.026
cmvqmlujx00miuh58trq82icp	cmvqmlujj00mcuh58at04jmdw	Yamaha acoustic guitar	MUSIC	Full-size acoustic guitar, freshly strung, with gig bag, capo and picks.	{/demo/guitar-1.jpg,/demo/guitar-2.jpg}	200	1000	4000	1	30	t	t	f	Near Viman Nagar main road	Pune	Viman Nagar	ACTIVE	\N	145	\N	2026-09-15 14:41:06.226	2026-10-27 11:52:34.029
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "conversationId", "senderId", type, text, "startDate", "endDate", "requestStatus", "bookingId", "readAt", "createdAt") FROM stdin;
cmvqmzqtg0007uhjw51cl9plb	cmvqmz76w0005uhjwbx9iyx97	cmvqmyzoi0001uhjwld52ac7z	BOOKING_REQUEST		2026-10-27	2026-10-31	PENDING	\N	\N	2026-10-27 12:03:22.373
cmvqmzttd0009uhjwzc9gcl8h	cmvqmz76w0005uhjwbx9iyx97	cmvqmyzoi0001uhjwld52ac7z	TEXT	Is it available?	\N	\N	\N	\N	\N	2026-10-27 12:03:26.258
cmvqmlulw00n6uh58cqoavnml	cmvqmluln00n4uh580acn6lu3	cmvqmlssu002puh58xnyf3xxd	TEXT	Hi Arjun! I need the camera for a wedding shoot. Is it free those days?	\N	\N	\N	\N	2026-10-27 08:52:34.099	2026-10-27 08:52:34.099
cmvqmlumn00n8uh58iqxs33q1	cmvqmluln00n4uh580acn6lu3	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-11-06	2026-11-09	PENDING	\N	\N	2026-10-27 08:58:34.126
cmvqn09u1000buhjw65idid1u	cmvqmz76w0005uhjwbx9iyx97	cmvqmyzoi0001uhjwld52ac7z	TEXT	Deal done	\N	\N	\N	\N	\N	2026-10-27 12:03:47.017
cmvqmluq300okuh58y6fqsb50	cmvqmlupr00oeuh58456gclxd	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-10-25	2026-10-29	ACCEPTED	cmvqmluq600omuh58bndngs1k	2026-10-23 11:52:34.25	2026-10-23 11:52:34.25
cmvqmluqe00oouh58nlmc690i	cmvqmlupr00oeuh58456gclxd	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmluq600omuh58bndngs1k	2026-10-23 11:58:34.26	2026-10-23 11:58:34.26
cmvqmluqh00oquh58gl6nvsvo	cmvqmlupr00oeuh58456gclxd	\N	SYSTEM	Payment of ₹4,800 received — booking KR-2026-480548 is confirmed.	\N	\N	\N	cmvqmluq600omuh58bndngs1k	2026-10-23 12:52:34.264	2026-10-23 12:52:34.264
cmvqmlun400ncuh582a8nbflc	cmvqmlumx00nauh582vbvsiz3	cmvqmlssu002puh58xnyf3xxd	TEXT	Is the projector free for a movie night?	\N	\N	\N	\N	2026-10-27 06:52:34.143	2026-10-27 06:52:34.143
cmvqmlun700neuh58qlkxthpz	cmvqmlumx00nauh582vbvsiz3	cmvqmlssz002quh580lytgi99	TEXT	Yes! Accepted your dates.	\N	\N	\N	\N	2026-10-27 07:04:34.146	2026-10-27 07:04:34.146
cmvqmlun900nguh58uf0tz6gh	cmvqmlumx00nauh582vbvsiz3	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-11-01	2026-11-03	ACCEPTED	cmvqmlune00niuh58od2mw09p	2026-10-27 08:52:34.148	2026-10-27 08:52:34.148
cmvqmlunp00nkuh58bn689h1c	cmvqmlumx00nauh582vbvsiz3	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlune00niuh58od2mw09p	2026-10-27 08:58:34.164	2026-10-27 08:58:34.164
cmvqmluo200nouh58sldals2q	cmvqmlunw00nmuh58egqtkk5p	cmvqmlssu002puh58xnyf3xxd	TEXT	Planning a trip to Nandi Hills — is the tent waterproof?	\N	\N	\N	\N	2026-10-26 03:52:34.177	2026-10-26 03:52:34.177
cmvqmluo500nquh586r3z3yvl	cmvqmlunw00nmuh58egqtkk5p	cmvqmlssz002quh580lytgi99	TEXT	Yes, with a rain fly. Delivery works too.	\N	\N	\N	\N	2026-10-26 04:04:34.18	2026-10-26 04:04:34.18
cmvqmluo800nsuh58mzu50ibb	cmvqmlunw00nmuh58egqtkk5p	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-10-28	2026-10-30	ACCEPTED	cmvqmluoc00nuuh58vndv781t	2026-10-26 05:52:34.183	2026-10-26 05:52:34.183
cmvqmluoj00nwuh5860trcy3j	cmvqmlunw00nmuh58egqtkk5p	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmluoc00nuuh58vndv781t	2026-10-26 05:58:34.194	2026-10-26 05:58:34.194
cmvqmluop00nyuh58whmamqnv	cmvqmlunw00nmuh58egqtkk5p	\N	SYSTEM	Payment of ₹3,699 received — booking KR-2026-480274 is confirmed.	\N	\N	\N	cmvqmluoc00nuuh58vndv781t	2026-10-26 06:52:34.2	2026-10-26 06:52:34.2
cmvqmlup100o2uh58v5vogdyr	cmvqmluow00o0uh58nba9u1e4	cmvqmlssu002puh58xnyf3xxd	TEXT	Can I pay cash when I pick up the drill?	\N	\N	\N	\N	2026-10-26 13:52:34.212	2026-10-26 13:52:34.212
cmvqmlup400o4uh584mmy6fus	cmvqmluow00o0uh58nba9u1e4	cmvqmlssz002quh580lytgi99	TEXT	Sure, cash or UPI at pickup is fine.	\N	\N	\N	\N	2026-10-26 14:04:34.215	2026-10-26 14:04:34.215
cmvqmlup600o6uh58c2dffb9o	cmvqmluow00o0uh58nba9u1e4	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-10-29	2026-10-31	ACCEPTED	cmvqmlup900o8uh582zgat4tt	2026-10-26 15:52:34.217	2026-10-26 15:52:34.217
cmvqmlupg00oauh58lkurx0i2	cmvqmluow00o0uh58nba9u1e4	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlup900o8uh582zgat4tt	2026-10-26 15:58:34.227	2026-10-26 15:58:34.227
cmvqmlupk00ocuh58xa4c0fhm	cmvqmluow00o0uh58nba9u1e4	\N	SYSTEM	Confirmed with payment at pickup (cash / UPI). The owner collects rent + deposit at handover.	\N	\N	\N	cmvqmlup900o8uh582zgat4tt	2026-10-26 16:52:34.231	2026-10-26 16:52:34.231
cmvqmlupx00oguh5853bd64hq	cmvqmlupr00oeuh58456gclxd	cmvqmlssu002puh58xnyf3xxd	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-10-23 09:52:34.244	2026-10-23 09:52:34.244
cmvqmluq000oiuh58vgbaryg1	cmvqmlupr00oeuh58456gclxd	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-10-23 10:04:34.247	2026-10-23 10:04:34.247
cmvqmluqy00owuh58gp9ep8v5	cmvqmlupr00oeuh58456gclxd	\N	SYSTEM	Handed over — the renter’s pickup code matched. Enjoy the rental!	\N	\N	\N	cmvqmluq600omuh58bndngs1k	2026-10-25 13:52:34.27	2026-10-25 13:52:34.27
cmvqmlur800p0uh58hg1lr4fk	cmvqmlur100oyuh5839hs9kc5	cmvqmlssu002puh58xnyf3xxd	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-10-19 01:52:34.291	2026-10-19 01:52:34.291
cmvqmlurc00p2uh58lha2pc23	cmvqmlur100oyuh5839hs9kc5	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-10-19 02:04:34.294	2026-10-19 02:04:34.294
cmvqmlure00p4uh58nh36s0gk	cmvqmlur100oyuh5839hs9kc5	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-10-21	2026-10-25	ACCEPTED	cmvqmluri00p6uh58veptdn32	2026-10-19 03:52:34.297	2026-10-19 03:52:34.297
cmvqmluro00p8uh58i2k580co	cmvqmlur100oyuh5839hs9kc5	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmluri00p6uh58veptdn32	2026-10-19 03:58:34.307	2026-10-19 03:58:34.307
cmvqmlurr00pauh58bk7q0r4q	cmvqmlur100oyuh5839hs9kc5	\N	SYSTEM	Payment of ₹7,200 received — booking KR-2026-480685 is confirmed.	\N	\N	\N	cmvqmluri00p6uh58veptdn32	2026-10-19 04:52:34.31	2026-10-19 04:52:34.31
cmvqmlus600pguh58neliqz9x	cmvqmlur100oyuh5839hs9kc5	\N	SYSTEM	Handed over — the renter’s pickup code matched. Enjoy the rental!	\N	\N	\N	cmvqmluri00p6uh58veptdn32	2026-10-21 15:52:34.315	2026-10-21 15:52:34.315
cmvqmlusf00pkuh58x9ehy5b7	cmvqmlusa00piuh58pr2il2s4	cmvqmlssu002puh58xnyf3xxd	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-10-19 21:52:34.334	2026-10-19 21:52:34.334
cmvqmlusi00pmuh58t984mw19	cmvqmlusa00piuh58pr2il2s4	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-10-19 22:04:34.337	2026-10-19 22:04:34.337
cmvqmlusl00pouh58ixturwkw	cmvqmlusa00piuh58pr2il2s4	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-10-22	2026-10-26	ACCEPTED	cmvqmluso00pquh58ytk3y7vi	2026-10-19 23:52:34.34	2026-10-19 23:52:34.34
cmvqmlusw00psuh58xxs259x8	cmvqmlusa00piuh58pr2il2s4	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmluso00pquh58ytk3y7vi	2026-10-19 23:58:34.351	2026-10-19 23:58:34.351
cmvqmlusz00puuh58x0myyqok	cmvqmlusa00piuh58pr2il2s4	\N	SYSTEM	Payment of ₹2,100 received — booking KR-2026-480822 is confirmed.	\N	\N	\N	cmvqmluso00pquh58ytk3y7vi	2026-10-20 00:52:34.354	2026-10-20 00:52:34.354
cmvqmlutf00q0uh58j9so2erq	cmvqmlusa00piuh58pr2il2s4	\N	SYSTEM	Handed over — the renter’s pickup code matched. Enjoy the rental!	\N	\N	\N	cmvqmluso00pquh58ytk3y7vi	2026-10-22 13:52:34.36	2026-10-22 13:52:34.36
cmvqmluto00q4uh582vaukunz	cmvqmlusa00piuh58pr2il2s4	\N	SYSTEM	Returned — the return code matched. The owner has 48 h to confirm “All OK” or raise a claim.	\N	\N	\N	cmvqmluso00pquh58ytk3y7vi	2026-10-27 06:52:34.372	2026-10-27 06:52:34.372
cmvqmlutw00q8uh581tagg460	cmvqmlutr00q6uh58meaw4sk9	cmvqmlssu002puh58xnyf3xxd	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-10-16 13:52:34.387	2026-10-16 13:52:34.387
cmvqmluty00qauh58ljlbfl2q	cmvqmlutr00q6uh58meaw4sk9	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-10-16 14:04:34.389	2026-10-16 14:04:34.389
cmvqmluu100qcuh587hakml62	cmvqmlutr00q6uh58meaw4sk9	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-10-19	2026-10-23	ACCEPTED	cmvqmluu400qeuh58r9phar5t	2026-10-16 15:52:34.392	2026-10-16 15:52:34.392
cmvqmluu900qguh58pu3yw7m1	cmvqmlutr00q6uh58meaw4sk9	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmluu400qeuh58r9phar5t	2026-10-16 15:58:34.4	2026-10-16 15:58:34.4
cmvqmluub00qiuh58q0hvnkkf	cmvqmlutr00q6uh58meaw4sk9	\N	SYSTEM	Payment of ₹11,200 received — booking KR-2026-480959 is confirmed.	\N	\N	\N	cmvqmluu400qeuh58r9phar5t	2026-10-16 16:52:34.402	2026-10-16 16:52:34.402
cmvqmluun00qouh58ba1thzv0	cmvqmlutr00q6uh58meaw4sk9	\N	SYSTEM	Handed over — the renter’s pickup code matched. Enjoy the rental!	\N	\N	\N	cmvqmluu400qeuh58r9phar5t	2026-10-19 13:52:34.407	2026-10-19 13:52:34.407
cmvqmluuv00qsuh58tix8ia22	cmvqmlutr00q6uh58meaw4sk9	\N	SYSTEM	Returned — the return code matched. The owner has 48 h to confirm “All OK” or raise a claim.	\N	\N	\N	cmvqmluu400qeuh58r9phar5t	2026-10-26 05:52:34.416	2026-10-26 05:52:34.416
cmvs2gfcv000fuhjw0bh3gu5j	cmvqmlumx00nauh582vbvsiz3	\N	SYSTEM	Booking cancelled by Kirayo: payment not completed in time — the dates are free again.	\N	\N	\N	cmvqmlune00niuh58od2mw09p	\N	2026-10-28 12:04:01.087
cmvqmluv100qwuh58ewvhc6uo	cmvqmlutr00q6uh58meaw4sk9	\N	SYSTEM	Owner claimed ₹1,200 from the deposit: dented grille. The renter has 48 h to accept or dispute.	\N	\N	\N	cmvqmluu400qeuh58r9phar5t	2026-10-27 05:52:34.428	2026-10-27 05:52:34.428
cmvqmluv900r0uh581yfgxi6i	cmvqmluv300qyuh58k694luh6	cmvqmlswo0047uh58k9u2g0qg	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-10-14 21:52:34.436	2026-10-14 21:52:34.436
cmvqmluvb00r2uh58tbel052c	cmvqmluv300qyuh58k694luh6	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-10-14 22:04:34.438	2026-10-14 22:04:34.438
cmvqmluve00r4uh58cog8m0u1	cmvqmluv300qyuh58k694luh6	cmvqmlswo0047uh58k9u2g0qg	BOOKING_REQUEST		2026-10-18	2026-10-21	ACCEPTED	cmvqmluvh00r6uh58stbbo4oa	2026-10-14 23:52:34.441	2026-10-14 23:52:34.441
cmvqmluvm00r8uh58aptes8uv	cmvqmluv300qyuh58k694luh6	\N	SYSTEM	Dates confirmed. Aarav has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmluvh00r6uh58stbbo4oa	2026-10-14 23:58:34.449	2026-10-14 23:58:34.449
cmvqmluvq00rauh58k99il8g1	cmvqmluv300qyuh58k694luh6	\N	SYSTEM	Payment of ₹11,800 received — booking KR-2026-481096 is confirmed.	\N	\N	\N	cmvqmluvh00r6uh58stbbo4oa	2026-10-15 00:52:34.453	2026-10-15 00:52:34.453
cmvqmluw600rguh587zorcakk	cmvqmluv300qyuh58k694luh6	\N	SYSTEM	Handed over — the renter’s pickup code matched. Enjoy the rental!	\N	\N	\N	cmvqmluvh00r6uh58stbbo4oa	2026-10-18 15:52:34.458	2026-10-18 15:52:34.458
cmvqmluwf00rkuh58w8my84za	cmvqmluv300qyuh58k694luh6	\N	SYSTEM	Returned — the return code matched. The owner has 48 h to confirm “All OK” or raise a claim.	\N	\N	\N	cmvqmluvh00r6uh58stbbo4oa	2026-10-24 13:52:34.472	2026-10-24 13:52:34.472
cmvqmluwm00rouh58nwhxmmnr	cmvqmluv300qyuh58k694luh6	\N	SYSTEM	Renter disputed the claim. Kirayo admin will review both condition reports and decide.	\N	\N	\N	cmvqmluvh00r6uh58stbbo4oa	2026-10-25 19:52:34.485	2026-10-25 19:52:34.485
cmvqmluwx00rsuh58z8piydks	cmvqmluwr00rquh58mm78wf9t	cmvqmlssu002puh58xnyf3xxd	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-10-04 01:52:34.495	2026-10-04 01:52:34.495
cmvqmluwz00ruuh58snahn37b	cmvqmluwr00rquh58mm78wf9t	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-10-04 02:04:34.498	2026-10-04 02:04:34.498
cmvqmlux200rwuh58qui2yw39	cmvqmluwr00rquh58mm78wf9t	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-10-07	2026-10-10	ACCEPTED	cmvqmlux500ryuh58z4znk79b	2026-10-04 03:52:34.501	2026-10-04 03:52:34.501
cmvqmluxb00s0uh584vd01iwr	cmvqmluwr00rquh58mm78wf9t	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlux500ryuh58z4znk79b	2026-10-04 03:58:34.51	2026-10-04 03:58:34.51
cmvqmluxe00s2uh583t60ivqf	cmvqmluwr00rquh58mm78wf9t	\N	SYSTEM	Payment of ₹17,100 received — booking KR-2026-481233 is confirmed.	\N	\N	\N	cmvqmlux500ryuh58z4znk79b	2026-10-04 04:52:34.513	2026-10-04 04:52:34.513
cmvqmluxv00s8uh58qzcrmcp0	cmvqmluwr00rquh58mm78wf9t	\N	SYSTEM	Handed over — the renter’s pickup code matched. Enjoy the rental!	\N	\N	\N	cmvqmlux500ryuh58z4znk79b	2026-10-07 21:52:34.52	2026-10-07 21:52:34.52
cmvqmluy400scuh58xs4hg3r0	cmvqmluwr00rquh58mm78wf9t	\N	SYSTEM	Returned — the return code matched. The owner has 48 h to confirm “All OK” or raise a claim.	\N	\N	\N	cmvqmlux500ryuh58z4znk79b	2026-10-10 19:52:34.532	2026-10-10 19:52:34.532
cmvqmluyk00siuh58rkho4n3v	cmvqmluwr00rquh58mm78wf9t	\N	SYSTEM	Deposit refund of ₹15,000 sent to the original payment method.	\N	\N	\N	cmvqmlux500ryuh58z4znk79b	2026-10-11 05:52:34.542	2026-10-11 05:52:34.542
cmvqmluz200squh580sa1zpj7	cmvqmluyw00souh58izb75qze	cmvqmlssu002puh58xnyf3xxd	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-10-10 17:52:34.573	2026-10-10 17:52:34.573
cmvqmluz500ssuh58msugto0p	cmvqmluyw00souh58izb75qze	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-10-10 18:04:34.576	2026-10-10 18:04:34.576
cmvqmluz800suuh58i0wpifp6	cmvqmluyw00souh58izb75qze	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-10-13	2026-10-15	ACCEPTED	cmvqmluzb00swuh58hyq63twc	2026-10-10 19:52:34.579	2026-10-10 19:52:34.579
cmvqmluzg00syuh58kyerjrvh	cmvqmluyw00souh58izb75qze	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmluzb00swuh58hyq63twc	2026-10-10 19:58:34.586	2026-10-10 19:58:34.586
cmvqmluzi00t0uh58u1jic560	cmvqmluyw00souh58izb75qze	\N	SYSTEM	Payment of ₹2,300 received — booking KR-2026-481370 is confirmed.	\N	\N	\N	cmvqmluzb00swuh58hyq63twc	2026-10-10 20:52:34.589	2026-10-10 20:52:34.589
cmvqmluzt00t6uh589hfe3ata	cmvqmluyw00souh58izb75qze	\N	SYSTEM	Handed over — the renter’s pickup code matched. Enjoy the rental!	\N	\N	\N	cmvqmluzb00swuh58hyq63twc	2026-10-13 17:52:34.593	2026-10-13 17:52:34.593
cmvqmlv0000tauh58vxiq0pxz	cmvqmluyw00souh58izb75qze	\N	SYSTEM	Returned — the return code matched. The owner has 48 h to confirm “All OK” or raise a claim.	\N	\N	\N	cmvqmluzb00swuh58hyq63twc	2026-10-15 19:52:34.602	2026-10-15 19:52:34.602
cmvqmlv0d00tiuh58tns6x8yp	cmvqmluyw00souh58izb75qze	\N	SYSTEM	Deposit refund of ₹1,700 sent to the original payment method.	\N	\N	\N	cmvqmluzb00swuh58hyq63twc	2026-10-16 05:52:34.612	2026-10-16 05:52:34.612
cmvqmlv0n00touh5858rmij4z	cmvqmlv0i00tmuh58exh5jdxx	cmvqmlssu002puh58xnyf3xxd	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-10-25 07:52:34.629	2026-10-25 07:52:34.629
cmvqmlv0p00tquh58ke13j13m	cmvqmlv0i00tmuh58exh5jdxx	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-10-25 08:04:34.632	2026-10-25 08:04:34.632
cmvqmlv0r00tsuh58c69ubv4k	cmvqmlv0i00tmuh58exh5jdxx	cmvqmlssu002puh58xnyf3xxd	BOOKING_REQUEST		2026-11-08	2026-11-10	ACCEPTED	cmvqmlv0u00tuuh584455pfv9	2026-10-25 09:52:34.634	2026-10-25 09:52:34.634
cmvqmlv1000twuh58pqoxk0vm	cmvqmlv0i00tmuh58exh5jdxx	\N	SYSTEM	Dates confirmed. Riya has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlv0u00tuuh584455pfv9	2026-10-25 09:58:34.643	2026-10-25 09:58:34.643
cmvqmlv1d00u0uh58t0ip4p3h	cmvqmlv0i00tmuh58exh5jdxx	\N	SYSTEM	Booking cancelled by the renter: plans changed.	\N	\N	\N	cmvqmlv0u00tuuh584455pfv9	2026-10-26 11:52:34.656	2026-10-26 11:52:34.656
cmvqmlv1s00u6uh58aore61gu	cmvqmlv1m00u4uh58ceydw2i1	cmvqmlt5j0073uh58go1s5jdm	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-09-12 09:52:34.671	2026-09-12 09:52:34.671
cmvqmlv1v00u8uh58vr5ivubs	cmvqmlv1m00u4uh58ceydw2i1	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-09-12 10:04:34.674	2026-09-12 10:04:34.674
cmvqmlv1y00uauh58fxak7epm	cmvqmlv1m00u4uh58ceydw2i1	cmvqmlt5j0073uh58go1s5jdm	BOOKING_REQUEST		2026-09-17	2026-09-19	ACCEPTED	cmvqmlv2200ucuh58pn16xpu3	2026-09-12 11:52:34.677	2026-09-12 11:52:34.677
cmvqmlv2800ueuh58o7hthk49	cmvqmlv1m00u4uh58ceydw2i1	\N	SYSTEM	Dates confirmed. Arnav has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlv2200ucuh58pn16xpu3	2026-09-12 11:58:34.687	2026-09-12 11:58:34.687
cmvqmlv2b00uguh581qq9icho	cmvqmlv1m00u4uh58ceydw2i1	\N	SYSTEM	Payment of ₹17,400 received — booking KR-2026-481644 is confirmed.	\N	\N	\N	cmvqmlv2200ucuh58pn16xpu3	2026-09-12 12:52:34.69	2026-09-12 12:52:34.69
cmvqmlv3000usuh58wyti2edz	cmvqmlv2v00uquh587quusj0f	cmvqmlsxn004juh58pupe813r	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-09-07 09:52:34.715	2026-09-07 09:52:34.715
cmvqmlv3200uuuh58kyu4lkbg	cmvqmlv2v00uquh587quusj0f	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-09-07 10:04:34.717	2026-09-07 10:04:34.717
cmvqmlv7w00xcuh58cpxiewbi	cmvqmlv7m00x6uh58sddtte5t	cmvqmlt0b005cuh58qerxh6cc	BOOKING_REQUEST		2026-08-23	2026-08-25	ACCEPTED	cmvqmlv7z00xeuh58pg8gzl21	2026-08-18 11:52:34.891	2026-08-18 11:52:34.891
cmvqmlv8500xguh58mk2rp26a	cmvqmlv7m00x6uh58sddtte5t	\N	SYSTEM	Dates confirmed. Isha has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlv7z00xeuh58pg8gzl21	2026-08-18 11:58:34.9	2026-08-18 11:58:34.9
cmvqmlv3400uwuh58kyahunxa	cmvqmlv2v00uquh587quusj0f	cmvqmlsxn004juh58pupe813r	BOOKING_REQUEST		2026-09-12	2026-09-14	ACCEPTED	cmvqmlv3700uyuh58479g5bkp	2026-09-07 11:52:34.719	2026-09-07 11:52:34.719
cmvqmlv3d00v0uh589bzx7uud	cmvqmlv2v00uquh587quusj0f	\N	SYSTEM	Dates confirmed. Gauri has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlv3700uyuh58479g5bkp	2026-09-07 11:58:34.728	2026-09-07 11:58:34.728
cmvqmlv3f00v2uh58i65b03x4	cmvqmlv2v00uquh587quusj0f	\N	SYSTEM	Payment of ₹3,600 received — booking KR-2026-481781 is confirmed.	\N	\N	\N	cmvqmlv3700uyuh58479g5bkp	2026-09-07 12:52:34.73	2026-09-07 12:52:34.73
cmvqmlv4600veuh58xclqjqi3	cmvqmlv4000vcuh58j5xz7m6v	cmvqmlsyp004vuh58azi5rvep	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-09-02 09:52:34.757	2026-09-02 09:52:34.757
cmvqmlv4900vguh58pathmrdg	cmvqmlv4000vcuh58j5xz7m6v	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-09-02 10:04:34.76	2026-09-02 10:04:34.76
cmvqmlv4b00viuh58nk6skfdg	cmvqmlv4000vcuh58j5xz7m6v	cmvqmlsyp004vuh58azi5rvep	BOOKING_REQUEST		2026-09-07	2026-09-09	ACCEPTED	cmvqmlv4e00vkuh58srwhyyiw	2026-09-02 11:52:34.762	2026-09-02 11:52:34.762
cmvqmlv4k00vmuh58p0vj6ixw	cmvqmlv4000vcuh58j5xz7m6v	\N	SYSTEM	Dates confirmed. Ishaan has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlv4e00vkuh58srwhyyiw	2026-09-02 11:58:34.771	2026-09-02 11:58:34.771
cmvqmlv4p00vouh58i11rlc4s	cmvqmlv4000vcuh58j5xz7m6v	\N	SYSTEM	Payment of ₹11,400 received — booking KR-2026-481918 is confirmed.	\N	\N	\N	cmvqmlv4e00vkuh58srwhyyiw	2026-09-02 12:52:34.775	2026-09-02 12:52:34.775
cmvqmlv5f00w0uh58lybyuamy	cmvqmlv5a00vyuh58bif4glrw	cmvqmlt1p005tuh58ci8ax8kc	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-08-28 09:52:34.802	2026-08-28 09:52:34.802
cmvqmlv5i00w2uh584nobwpyb	cmvqmlv5a00vyuh58bif4glrw	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-08-28 10:04:34.805	2026-08-28 10:04:34.805
cmvqmlv5l00w4uh58r8e054lq	cmvqmlv5a00vyuh58bif4glrw	cmvqmlt1p005tuh58ci8ax8kc	BOOKING_REQUEST		2026-09-02	2026-09-04	ACCEPTED	cmvqmlv5o00w6uh58lt5xtn40	2026-08-28 11:52:34.808	2026-08-28 11:52:34.808
cmvqmlv5t00w8uh583elb4qb5	cmvqmlv5a00vyuh58bif4glrw	\N	SYSTEM	Dates confirmed. Ishaan has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlv5o00w6uh58lt5xtn40	2026-08-28 11:58:34.816	2026-08-28 11:58:34.816
cmvqmlv5w00wauh58rdh8zhw1	cmvqmlv5a00vyuh58bif4glrw	\N	SYSTEM	Payment of ₹2,360 received — booking KR-2026-482055 is confirmed.	\N	\N	\N	cmvqmlv5o00w6uh58lt5xtn40	2026-08-28 12:52:34.819	2026-08-28 12:52:34.819
cmvqmlv6l00wmuh584bgrgay7	cmvqmlv6f00wkuh58mubbdkjg	cmvqmlsx8004euh5828xw0y30	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-08-23 09:52:34.843	2026-08-23 09:52:34.843
cmvqmlv6n00wouh58n5jbs9td	cmvqmlv6f00wkuh58mubbdkjg	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-08-23 10:04:34.846	2026-08-23 10:04:34.846
cmvqmlv6p00wquh58r0ky4zlt	cmvqmlv6f00wkuh58mubbdkjg	cmvqmlsx8004euh5828xw0y30	BOOKING_REQUEST		2026-08-28	2026-08-30	ACCEPTED	cmvqmlv6s00wsuh58tncveshu	2026-08-23 11:52:34.848	2026-08-23 11:52:34.848
cmvqmlv6y00wuuh58rbrt588l	cmvqmlv6f00wkuh58mubbdkjg	\N	SYSTEM	Dates confirmed. Ishaan has 12 h to pay — the dates are held until then.	\N	\N	\N	cmvqmlv6s00wsuh58tncveshu	2026-08-23 11:58:34.857	2026-08-23 11:58:34.857
cmvqmlv7100wwuh58a8h3nxn5	cmvqmlv6f00wkuh58mubbdkjg	\N	SYSTEM	Payment of ₹6,600 received — booking KR-2026-482192 is confirmed.	\N	\N	\N	cmvqmlv6s00wsuh58tncveshu	2026-08-23 12:52:34.86	2026-08-23 12:52:34.86
cmvqmlv7r00x8uh580iqmejfv	cmvqmlv7m00x6uh58sddtte5t	cmvqmlt0b005cuh58qerxh6cc	TEXT	Hi! Is this free for those dates?	\N	\N	\N	\N	2026-08-18 09:52:34.886	2026-08-18 09:52:34.886
cmvqmlv7t00xauh586fny8pg8	cmvqmlv7m00x6uh58sddtte5t	cmvqmlssz002quh580lytgi99	TEXT	Yes, it is. Send a booking request.	\N	\N	\N	\N	2026-08-18 10:04:34.888	2026-08-18 10:04:34.888
cmvqmlv8800xiuh58f8hcbfki	cmvqmlv7m00x6uh58sddtte5t	\N	SYSTEM	Payment of ₹4,400 received — booking KR-2026-482329 is confirmed.	\N	\N	\N	cmvqmlv7z00xeuh58pg8gzl21	2026-08-18 12:52:34.903	2026-08-18 12:52:34.903
cmvqmlv9000xuuh58koivw9mm	cmvqmlv8v00xsuh58gsqa131b	cmvqmlst9002tuh580d6oo0zv	TEXT	Hi! Does the Switch come with two controllers?	\N	\N	\N	\N	2026-10-27 10:52:34.931	2026-10-27 10:52:34.931
\.


--
-- Data for Name: OwnerApplication; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OwnerApplication" (id, "userId", name, phone, categories, plans, "termsAt", "submittedAt", "reviewedAt") FROM stdin;
cmvqmlst4002suh58n90byo5x	cmvqmlssz002quh580lytgi99	Arjun Mehta	+91 99000 11223	{CAMERAS,TOOLS,CAMPING,GAMING,MUSIC}	Camera kit, power tools, camping gear, a PS5 and a guitar I rarely use.	2025-12-26 11:52:31.766	2025-12-26 11:52:31.766	2025-12-27 11:52:31.766
cmvqmlstd002vuh586zk4xp1s	cmvqmlst9002tuh580d6oo0zv	Neha Kulkarni	+91 98861 44120	{PARTY,MUSIC}	A party speaker with two mics and fairy lights for house parties.	2026-10-27 09:52:31.776	2026-10-27 09:52:31.776	\N
cmvqmlstv002yuh589eaqkkyr	cmvqmlstr002wuh58kseze9zl	Vikram Singh	+91 90040 55671	{GAMING}	Various electronics.	2026-10-24 11:52:31.794	2026-10-24 11:52:31.794	2026-10-25 11:52:31.794
cmvqmlsu10031uh58osvhco46	cmvqmlsty002zuh580k9mnofo	Kabir Malhotra	+91 97400 31882	{CAMPING,SPORTS}	A 4-person Quechua tent, two sleeping bags and a Btwin hybrid cycle.	2026-10-26 15:52:31.8	2026-10-26 15:52:31.8	\N
\.


--
-- Data for Name: Payout; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payout" (id, "bookingId", "ownerId", amount, status, "paidAt", reference, "createdAt") FROM stdin;
cmvqmluyf00sguh58qd5c2osi	cmvqmlux500ryuh58z4znk79b	cmvqmlssz002quh580lytgi99	2100	PAID	2026-10-13 05:52:34.542	UTR00097781	2026-10-11 05:52:34.542
cmvqmlv0a00tguh58nh8jym11	cmvqmluzb00swuh58hyq63twc	cmvqmlssz002quh580lytgi99	600	PENDING	\N	\N	2026-10-16 05:52:34.612
cmvqmlv2n00ukuh58wp3h29zh	cmvqmlv2200ucuh58pn16xpu3	cmvqmlssz002quh580lytgi99	2400	PAID	2026-09-22 11:52:34.702	UTR9002231	2026-10-27 11:52:34.703
cmvqmlv3r00v6uh58zc7f4ncy	cmvqmlv3700uyuh58479g5bkp	cmvqmlssz002quh580lytgi99	600	PAID	2026-09-17 11:52:34.742	UTR9012231	2026-10-27 11:52:34.743
cmvqmlv5100vsuh5895e4ggxf	cmvqmlv4e00vkuh58srwhyyiw	cmvqmlssz002quh580lytgi99	1400	PAID	2026-09-12 11:52:34.788	UTR9022231	2026-10-27 11:52:34.789
cmvqmlv6700weuh58kxn7b94i	cmvqmlv5o00w6uh58lt5xtn40	cmvqmlssz002quh580lytgi99	360	PAID	2026-09-07 11:52:34.83	UTR9032231	2026-10-27 11:52:34.831
cmvqmlv7d00x0uh58tsh0njfd	cmvqmlv6s00wsuh58tncveshu	cmvqmlssz002quh580lytgi99	600	PAID	2026-09-02 11:52:34.872	UTR9042231	2026-10-27 11:52:34.874
cmvqmlv8k00xmuh581ncqhke0	cmvqmlv7z00xeuh58pg8gzl21	cmvqmlssz002quh580lytgi99	400	PAID	2026-08-28 11:52:34.915	UTR9052231	2026-10-27 11:52:34.917
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, "bookingId", "fromUserId", "toUserId", "itemId", rating, tags, text, "createdAt") FROM stdin;
cmvqmluyn00skuh58d49x5tsx	cmvqmlux500ryuh58z4znk79b	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmlsv3003juh58v3m9py9i	5	{"Item as described","On time",Friendly}	Console was spotless, both controllers charged. Super smooth handover.	2026-10-11 15:52:34.558
cmvqmluyr00smuh58e7mqhgh0	cmvqmlux500ryuh58z4znk79b	cmvqmlssz002quh580lytgi99	cmvqmlssu002puh58xnyf3xxd	\N	5	{"Returned on time","Careful with item"}	Returned everything packed exactly as given.	2026-10-11 16:52:34.562
cmvqmlv0f00tkuh58j85b1suv	cmvqmluzb00swuh58hyq63twc	cmvqmlssu002puh58xnyf3xxd	cmvqmlssz002quh580lytgi99	cmvqmlsui0037uh58cz7y6u77	4	{"Clear instructions"}	Solid tripod. I lost the plate, my bad — sorted fairly.	2026-10-16 15:52:34.622
cmvqmlv2p00umuh58ezwpfia5	cmvqmlv2200ucuh58pn16xpu3	cmvqmlt5j0073uh58go1s5jdm	cmvqmlssz002quh580lytgi99	cmvqmlsua0033uh587uahbdhw	5	{"Item as described","On time"}	Great camera, battery lasted all day.	2026-09-21 11:52:34.704
cmvqmlv2s00uouh58l3f9tfkq	cmvqmlv2200ucuh58pn16xpu3	cmvqmlssz002quh580lytgi99	cmvqmlt5j0073uh58go1s5jdm	\N	5	{"Returned on time"}	Easy renter.	2026-09-21 11:52:34.707
cmvqmlv3u00v8uh58i3wyqcmx	cmvqmlv3700uyuh58479g5bkp	cmvqmlsxn004juh58pupe813r	cmvqmlssz002quh580lytgi99	cmvqmlsuw003fuh58ic927exb	4	{"Item as described","On time"}	Dry all night in the rain.	2026-09-16 11:52:34.745
cmvqmlv3x00vauh58sokk0w1c	cmvqmlv3700uyuh58479g5bkp	cmvqmlssz002quh580lytgi99	cmvqmlsxn004juh58pupe813r	\N	5	{"Returned on time"}	Easy renter.	2026-09-16 11:52:34.748
cmvqmlv5400vuuh58ykld5k6q	cmvqmlv4e00vkuh58srwhyyiw	cmvqmlsyp004vuh58azi5rvep	cmvqmlssz002quh580lytgi99	cmvqmlsv7003luh58zwhz7732	5	{"Item as described","On time"}	Bright enough for an evening screening.	2026-09-11 11:52:34.791
cmvqmlv5700vwuh58vcgm84cf	cmvqmlv4e00vkuh58srwhyyiw	cmvqmlssz002quh580lytgi99	cmvqmlsyp004vuh58azi5rvep	\N	5	{"Returned on time"}	Easy renter.	2026-09-11 11:52:34.794
cmvqmlv6a00wguh58pi4cty03	cmvqmlv5o00w6uh58lt5xtn40	cmvqmlt1p005tuh58ci8ax8kc	cmvqmlssz002quh580lytgi99	cmvqmlsul0039uh583aubhwws	5	{"Item as described","On time"}	Bits in perfect shape.	2026-09-06 11:52:34.833
cmvqmlv6c00wiuh58i3phlj2f	cmvqmlv5o00w6uh58lt5xtn40	cmvqmlssz002quh580lytgi99	cmvqmlt1p005tuh58ci8ax8kc	\N	5	{"Returned on time"}	Easy renter.	2026-09-06 11:52:34.835
cmvqmlv7g00x2uh585x2mabg3	cmvqmlv6s00wsuh58tncveshu	cmvqmlsx8004euh5828xw0y30	cmvqmlssz002quh580lytgi99	cmvqmlsvd003puh58eqapc8zw	4	{"Item as described","On time"}	Smooth gears, comfy saddle.	2026-09-01 11:52:34.875
cmvqmlv7j00x4uh587ofuv0uw	cmvqmlv6s00wsuh58tncveshu	cmvqmlssz002quh580lytgi99	cmvqmlsx8004euh5828xw0y30	\N	5	{"Returned on time"}	Easy renter.	2026-09-01 11:52:34.878
cmvqmlv8n00xouh588t8w476h	cmvqmlv7z00xeuh58pg8gzl21	cmvqmlt0b005cuh58qerxh6cc	cmvqmlssz002quh580lytgi99	cmvqmlsva003nuh58tfn7lvlj	5	{"Item as described","On time"}	Sounds lovely, well looked after.	2026-08-27 11:52:34.918
cmvqmlv8q00xquh58quwin7l0	cmvqmlv7z00xeuh58pg8gzl21	cmvqmlssz002quh580lytgi99	cmvqmlt0b005cuh58qerxh6cc	\N	5	{"Returned on time"}	Easy renter.	2026-08-27 11:52:34.921
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, name, phone, city, area, address, "isAdmin", "isBlocked", "idStatus", "idDocType", "idDocPath", "selfiePath", "idRejectReason", "idSubmittedAt", "idReviewedAt", "ownerCancellations", "createdAt", "ownerRejectReason", "ownerStatus") FROM stdin;
cmvqmyzoi0001uhjwld52ac7z	yogendrapratapsinghdas@gmail.com	Yogendra	\N	Delhi	Dwarka	\N	f	f	NONE	\N	\N	\N	\N	\N	\N	0	2026-10-27 12:02:47.202	\N	NONE
cmvqmltok00cyuh587vw13ax0	tara.hauzkhas@kirayo.test	Tara Nair	+91 9780566234	Delhi	Hauz Khas	126, Hauz Khas, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-09-03 11:52:32.898	2026-09-03 14:52:32.898	0	2026-09-01 11:52:32.898	\N	APPROVED
cmvqmltp000d3uh58ph2u0o76	omkar.hauzkhas2@kirayo.test	Omkar Saxena	+91 9979416510	Delhi	Hauz Khas	139, Hauz Khas, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-01-31 11:52:32.915	2026-01-31 14:52:32.915	0	2026-01-29 11:52:32.915	\N	APPROVED
cmvqmltpi00dauh585zk1nglh	varun.saket@kirayo.test	Varun Das	+91 9837753959	Delhi	Saket	148, Saket, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-01-11 11:52:32.933	2026-01-11 14:52:32.933	0	2026-01-09 11:52:32.933	\N	APPROVED
cmvqmltpz00dhuh58xhzjyd1b	aisha.saket2@kirayo.test	Aisha Chopra	+91 9593921909	Delhi	Saket	27, Saket, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-01-30 11:52:32.95	2026-01-30 14:52:32.95	0	2026-01-28 11:52:32.95	\N	APPROVED
cmvqmltqf00dmuh58qe5rcf8c	isha.saket3@kirayo.test	Isha Shetty	+91 9287054885	Delhi	Saket	20, Saket, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-05-06 11:52:32.965	2025-05-06 14:52:32.965	0	2025-05-04 11:52:32.965	\N	APPROVED
cmvqmltak008tuh58opblqnh7	yash.andheriwest@kirayo.test	Yash Banerjee	+91 9338618630	Mumbai	Andheri West	163, Andheri West, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-07-07 11:52:32.395	2025-07-07 14:52:32.395	0	2025-07-05 11:52:32.395	\N	APPROVED
cmvqmltay008yuh58792klaxd	lavanya.andheriwest2@kirayo.test	Lavanya Pillai	+91 9301579044	Mumbai	Andheri West	25, Andheri West, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-08-21 11:52:32.409	2026-08-21 14:52:32.409	0	2026-08-19 11:52:32.409	\N	APPROVED
cmvqmltbf0095uh584zppa7js	manav.andheriwest3@kirayo.test	Manav Nair	+91 9883950750	Mumbai	Andheri West	84, Andheri West, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-08-28 11:52:32.426	2026-08-28 14:52:32.426	0	2026-08-26 11:52:32.426	\N	APPROVED
cmvqmltby009auh581h149isv	vivek.juhu@kirayo.test	Vivek Patel	+91 9967021417	Mumbai	Juhu	62, Juhu, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-15 11:52:32.444	2026-02-15 14:52:32.444	0	2026-02-13 11:52:32.444	\N	APPROVED
cmvqmltcm009huh58vjzw2064	varun.juhu2@kirayo.test	Varun Sinha	+91 9210065046	Mumbai	Juhu	106, Juhu, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-05-20 11:52:32.469	2025-05-20 14:52:32.469	0	2025-05-18 11:52:32.469	\N	APPROVED
cmvqmltda009ouh58c12lg9p3	ananya.juhu3@kirayo.test	Ananya Jain	+91 9508386817	Mumbai	Juhu	72, Juhu, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-11-22 11:52:32.493	2025-11-22 14:52:32.493	0	2025-11-20 11:52:32.493	\N	APPROVED
cmvqmltdr009tuh584irnqwfc	arnav.bandrawest@kirayo.test	Arnav Saxena	+91 9242943981	Mumbai	Bandra West	41, Bandra West, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-06-15 11:52:32.509	2025-06-15 14:52:32.509	0	2025-06-13 11:52:32.509	\N	APPROVED
cmvqmlte900a0uh58jf6cr92m	ritika.bandrawest2@kirayo.test	Ritika Gupta	+91 9270402910	Mumbai	Bandra West	147, Bandra West, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-28 11:52:32.528	2025-08-28 14:52:32.528	0	2025-08-26 11:52:32.528	\N	APPROVED
cmvqmlteq00a7uh580kcewoln	aarav.bandrawest3@kirayo.test	Aarav Gupta	+91 9120350763	Mumbai	Bandra West	91, Bandra West, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-15 11:52:32.545	2025-12-15 14:52:32.545	0	2025-12-13 11:52:32.545	\N	APPROVED
cmvqmltf800aeuh58c2wi8ogu	omkar.colaba@kirayo.test	Omkar Chopra	+91 9262109719	Mumbai	Colaba	141, Colaba, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-06-10 11:52:32.563	2026-06-10 14:52:32.563	0	2026-06-08 11:52:32.563	\N	APPROVED
cmvqmltft00aluh589bc1uk8v	shreya.colaba2@kirayo.test	Shreya Patel	+91 9664756635	Mumbai	Colaba	199, Colaba, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-06-23 11:52:32.583	2026-06-23 14:52:32.583	0	2026-06-21 11:52:32.583	\N	APPROVED
cmvqmltg900aquh58x99ru7ds	nisha.colaba3@kirayo.test	Nisha Rao	+91 9305068949	Mumbai	Colaba	122, Colaba, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-16 11:52:32.6	2025-12-16 14:52:32.6	0	2025-12-14 11:52:32.6	\N	APPROVED
cmvqmltgn00avuh58ht8sju6f	sneha.rohini@kirayo.test	Sneha Menon	+91 9848401416	Delhi	Rohini	183, Rohini, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-05-10 11:52:32.614	2025-05-10 14:52:32.614	0	2025-05-08 11:52:32.614	\N	APPROVED
cmvqmlth100b0uh58qxxbekbr	kavya.rohini2@kirayo.test	Kavya Shetty	+91 9856867450	Delhi	Rohini	122, Rohini, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-07-01 11:52:32.628	2026-07-01 14:52:32.628	0	2026-06-29 11:52:32.628	\N	APPROVED
cmvqmlthf00b5uh58prd3gj6d	zoya.rohini3@kirayo.test	Zoya Das	+91 9505528878	Delhi	Rohini	136, Rohini, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-09-05 11:52:32.642	2025-09-05 14:52:32.642	0	2025-09-03 11:52:32.642	\N	APPROVED
cmvqmlthx00bcuh589s6xiq5u	ishaan.karolbagh@kirayo.test	Ishaan Banerjee	+91 9322116990	Delhi	Karol Bagh	97, Karol Bagh, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-10-04 11:52:32.66	2025-10-04 14:52:32.66	0	2025-10-02 11:52:32.66	\N	APPROVED
cmvqmltkb00bjuh58548seyu5	ishaan.karolbagh2@kirayo.test	Ishaan Sinha	+91 9767838201	Delhi	Karol Bagh	97, Karol Bagh, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-07-19 11:52:32.746	2025-07-19 14:52:32.746	0	2025-07-17 11:52:32.746	\N	APPROVED
cmvqmltkw00bouh5825rcbswd	zoya.karolbagh3@kirayo.test	Zoya Patel	+91 9908489946	Delhi	Karol Bagh	197, Karol Bagh, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-17 11:52:32.766	2026-02-17 14:52:32.766	0	2026-02-15 11:52:32.766	\N	APPROVED
cmvqmltlc00btuh58x46y8u4p	zoya.connaughtplace@kirayo.test	Zoya Sinha	+91 9410269963	Delhi	Connaught Place	192, Connaught Place, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-09-22 11:52:32.782	2025-09-22 14:52:32.782	0	2025-09-20 11:52:32.782	\N	APPROVED
cmvqmltlv00c0uh5849humzjm	lavanya.connaughtplace2@kirayo.test	Lavanya Chopra	+91 9109334333	Delhi	Connaught Place	175, Connaught Place, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-10-14 11:52:32.801	2025-10-14 14:52:32.801	0	2025-10-12 11:52:32.801	\N	APPROVED
cmvqmltma00c5uh58vh32xqk2	varun.mayurvihar@kirayo.test	Varun Bhat	+91 9906278458	Delhi	Mayur Vihar	179, Mayur Vihar, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-07-22 11:52:32.817	2025-07-22 14:52:32.817	0	2025-07-20 11:52:32.817	\N	APPROVED
cmvqmltmo00cauh586iwaz1lm	rohan.mayurvihar2@kirayo.test	Rohan Saxena	+91 9741319750	Delhi	Mayur Vihar	70, Mayur Vihar, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-01-23 11:52:32.831	2026-01-23 14:52:32.831	0	2026-01-21 11:52:32.831	\N	APPROVED
cmvqmltn300cfuh583vxlblc8	diya.lajpatnagar@kirayo.test	Diya Patel	+91 9140774864	Delhi	Lajpat Nagar	53, Lajpat Nagar, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-01 11:52:32.846	2025-08-01 14:52:32.846	0	2025-07-30 11:52:32.846	\N	APPROVED
cmvqmltnl00cmuh58vqvtwp6h	tanvi.lajpatnagar2@kirayo.test	Tanvi Sinha	+91 9479507040	Delhi	Lajpat Nagar	203, Lajpat Nagar, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-06-09 11:52:32.864	2026-06-09 14:52:32.864	0	2026-06-07 11:52:32.864	\N	APPROVED
cmvqmlto300ctuh58pqcx5zc3	diya.lajpatnagar3@kirayo.test	Diya Kapoor	+91 9735034767	Delhi	Lajpat Nagar	89, Lajpat Nagar, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-08 11:52:32.882	2026-02-08 14:52:32.882	0	2026-02-06 11:52:32.882	\N	APPROVED
cmvqmltr000dtuh5857p2o69t	omkar.dwarka@kirayo.test	Omkar Joshi	+91 9114375174	Delhi	Dwarka	154, Dwarka, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-07-14 11:52:32.987	2025-07-14 14:52:32.987	0	2025-07-12 11:52:32.987	\N	APPROVED
cmvqmltrs00e0uh58x5464vsz	gauri.dwarka2@kirayo.test	Gauri Bose	+91 9281869819	Delhi	Dwarka	93, Dwarka, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-17 11:52:33.014	2025-08-17 14:52:33.014	0	2025-08-15 11:52:33.014	\N	APPROVED
cmvqmltsi00e7uh5866xzv1io	kunal.dwarka3@kirayo.test	Kunal Banerjee	+91 9189374855	Delhi	Dwarka	119, Dwarka, Delhi	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-04-22 11:52:33.04	2026-04-22 14:52:33.04	0	2026-04-20 11:52:33.04	\N	APPROVED
cmvqmltt700eeuh58akrzb54t	ananya.sector18@kirayo.test	Ananya Menon	+91 9511326994	Noida	Sector 18	27, Sector 18, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-07-13 11:52:33.065	2025-07-13 14:52:33.065	0	2025-07-11 11:52:33.065	\N	APPROVED
cmvqmlttp00ejuh58yf1hto01	priya.sector182@kirayo.test	Priya Sharma	+91 9674242414	Noida	Sector 18	136, Sector 18, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-01-26 11:52:33.084	2026-01-26 14:52:33.084	0	2026-01-24 11:52:33.084	\N	APPROVED
cmvqmltuc00equh58jpwzczwr	ishaan.sector50@kirayo.test	Ishaan Reddy	+91 9572956700	Noida	Sector 50	113, Sector 50, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-03-03 11:52:33.107	2026-03-03 14:52:33.107	0	2026-03-01 11:52:33.107	\N	APPROVED
cmvqmltv300exuh58u3iy43o5	arnav.sector502@kirayo.test	Arnav Iyer	+91 9823316786	Noida	Sector 50	118, Sector 50, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-16 11:52:33.133	2026-02-16 14:52:33.133	0	2026-02-14 11:52:33.133	\N	APPROVED
cmvqmltvv00f4uh58rdxb5u81	shreya.sector503@kirayo.test	Shreya Banerjee	+91 9690913644	Noida	Sector 50	131, Sector 50, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-03-08 11:52:33.162	2026-03-08 14:52:33.162	0	2026-03-06 11:52:33.162	\N	APPROVED
cmvqmlud800jvuh58oxqzmh53	aarav.aundh2@kirayo.test	Aarav Patel	+91 9283063025	Pune	Aundh	53, Aundh, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-01 11:52:33.786	2025-12-01 14:52:33.786	0	2025-11-29 11:52:33.786	\N	APPROVED
cmvqmludp00k0uh581by3g1zz	kavya.baner@kirayo.test	Kavya Menon	+91 9807200254	Pune	Baner	102, Baner, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-10-23 11:52:33.804	2025-10-23 14:52:33.804	0	2025-10-21 11:52:33.804	\N	APPROVED
cmvqmlue900k7uh58qpcufnv1	kabir.baner2@kirayo.test	Kabir Deshmukh	+91 9522325190	Pune	Baner	199, Baner, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-10-15 11:52:33.824	2025-10-15 14:52:33.824	0	2025-10-13 11:52:33.824	\N	APPROVED
cmvqmluer00keuh58n98shepi	ishaan.hinjewadi@kirayo.test	Ishaan Sharma	+91 9421581689	Pune	Hinjewadi	137, Hinjewadi, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-05-16 11:52:33.842	2026-05-16 14:52:33.842	0	2026-05-14 11:52:33.842	\N	APPROVED
cmvqmluf800kluh58njmcxlql	gauri.hinjewadi2@kirayo.test	Gauri Bhat	+91 9672924807	Pune	Hinjewadi	160, Hinjewadi, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-18 11:52:33.859	2026-02-18 14:52:33.859	0	2026-02-16 11:52:33.859	\N	APPROVED
cmvqmlty400fbuh58tcjpyl0u	dev.sector62@kirayo.test	Dev Khan	+91 9301148304	Noida	Sector 62	97, Sector 62, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-03 11:52:33.243	2026-02-03 14:52:33.243	0	2026-02-01 11:52:33.243	\N	APPROVED
cmvqmltym00fguh58rmuclrfw	kabir.sector622@kirayo.test	Kabir Sinha	+91 9136029535	Noida	Sector 62	182, Sector 62, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-09-03 11:52:33.261	2025-09-03 14:52:33.261	0	2025-09-01 11:52:33.261	\N	APPROVED
cmvqmltz300fluh58srmku3su	kabir.sector76@kirayo.test	Kabir Khan	+91 9362451747	Noida	Sector 76	100, Sector 76, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-05-17 11:52:33.278	2025-05-17 14:52:33.278	0	2025-05-15 11:52:33.278	\N	APPROVED
cmvqmltzi00fquh589870p6la	aditya.sector762@kirayo.test	Aditya Malhotra	+91 9112529509	Noida	Sector 76	53, Sector 76, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-10-27 11:52:33.293	2025-10-27 14:52:33.293	0	2025-10-25 11:52:33.293	\N	APPROVED
cmvqmltzx00fvuh58ziwhf6b0	ishaan.sector137@kirayo.test	Ishaan Joshi	+91 9546310343	Noida	Sector 137	174, Sector 137, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-06-23 11:52:33.308	2026-06-23 14:52:33.308	0	2026-06-21 11:52:33.308	\N	APPROVED
cmvqmlu0i00g0uh58hgb10z5j	ananya.sector1372@kirayo.test	Ananya Menon	+91 9472990205	Noida	Sector 137	62, Sector 137, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-01 11:52:33.328	2025-12-01 14:52:33.328	0	2025-11-29 11:52:33.328	\N	APPROVED
cmvqmlu1700g7uh580xgy4l17	aisha.greaternoidawest@kirayo.test	Aisha Patel	+91 9571541548	Noida	Greater Noida West	56, Greater Noida West, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-16 11:52:33.353	2025-12-16 14:52:33.353	0	2025-12-14 11:52:33.353	\N	APPROVED
cmvqmlu2500geuh580gm1t9yl	aarav.greaternoidawest2@kirayo.test	Aarav Mehta	+91 9169779932	Noida	Greater Noida West	66, Greater Noida West, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-07-26 11:52:33.387	2025-07-26 14:52:33.387	0	2025-07-24 11:52:33.387	\N	APPROVED
cmvqmlu2v00gluh58rehwbuc9	ishaan.greaternoidawest3@kirayo.test	Ishaan Gill	+91 9377716331	Noida	Greater Noida West	185, Greater Noida West, Noida	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-07-02 11:52:33.414	2025-07-02 14:52:33.414	0	2025-06-30 11:52:33.414	\N	APPROVED
cmvqmlu3c00gquh58tfkensje	sana.palamvihar@kirayo.test	Sana Sharma	+91 9837725123	Gurugram	Palam Vihar	82, Palam Vihar, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-01-05 11:52:33.43	2026-01-05 14:52:33.43	0	2026-01-03 11:52:33.43	\N	APPROVED
cmvqmlu3y00gxuh58umekx9nd	neel.palamvihar2@kirayo.test	Neel Malhotra	+91 9718025421	Gurugram	Palam Vihar	27, Palam Vihar, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-17 11:52:33.453	2025-08-17 14:52:33.453	0	2025-08-15 11:52:33.453	\N	APPROVED
cmvqmlu4f00h2uh586ffqrqgv	kabir.dlfphase3@kirayo.test	Kabir Verma	+91 9814386130	Gurugram	DLF Phase 3	118, DLF Phase 3, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-03-28 11:52:33.469	2026-03-28 14:52:33.469	0	2026-03-26 11:52:33.469	\N	APPROVED
cmvqmlu4x00h7uh58u2v6ityd	kavya.dlfphase32@kirayo.test	Kavya Reddy	+91 9452691844	Gurugram	DLF Phase 3	11, DLF Phase 3, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-27 11:52:33.487	2025-12-27 14:52:33.487	0	2025-12-25 11:52:33.487	\N	APPROVED
cmvqmlu5c00hcuh5849k02f7g	diya.cybercity@kirayo.test	Diya Gill	+91 9228366539	Gurugram	Cyber City	127, Cyber City, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-06-01 11:52:33.503	2025-06-01 14:52:33.503	0	2025-05-30 11:52:33.503	\N	APPROVED
cmvqmlu5s00hhuh58i9pax39i	dev.cybercity2@kirayo.test	Dev Mehta	+91 9747348210	Gurugram	Cyber City	164, Cyber City, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-09-19 11:52:33.518	2025-09-19 14:52:33.518	0	2025-09-17 11:52:33.518	\N	APPROVED
cmvqmlu6c00houh58hkufy4ru	vivek.dlfphase1@kirayo.test	Vivek Nair	+91 9478484594	Gurugram	DLF Phase 1	206, DLF Phase 1, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-11-09 11:52:33.539	2025-11-09 14:52:33.539	0	2025-11-07 11:52:33.539	\N	APPROVED
cmvqmlu6w00hvuh58yw0fgkkp	nisha.dlfphase12@kirayo.test	Nisha Mehta	+91 9362054140	Gurugram	DLF Phase 1	28, DLF Phase 1, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-03-27 11:52:33.559	2026-03-27 14:52:33.559	0	2026-03-25 11:52:33.559	\N	APPROVED
cmvqmlu7f00i0uh58vdq65gz9	omkar.dlfphase13@kirayo.test	Omkar Chopra	+91 9728620532	Gurugram	DLF Phase 1	100, DLF Phase 1, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-09-14 11:52:33.578	2025-09-14 14:52:33.578	0	2025-09-12 11:52:33.578	\N	APPROVED
cmvqmlu7w00i5uh58duyf2jfk	harsh.golfcourseroad@kirayo.test	Harsh Bose	+91 9475647172	Gurugram	Golf Course Road	59, Golf Course Road, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-08-31 11:52:33.594	2026-08-31 14:52:33.594	0	2026-08-29 11:52:33.594	\N	APPROVED
cmvqmlu8h00icuh58qwla4lsa	tanvi.golfcourseroad2@kirayo.test	Tanvi Sharma	+91 9652604158	Gurugram	Golf Course Road	65, Golf Course Road, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-05-27 11:52:33.615	2026-05-27 14:52:33.615	0	2026-05-25 11:52:33.615	\N	APPROVED
cmvqmlu8x00ihuh58tqx77irj	gauri.golfcourseroad3@kirayo.test	Gauri Gill	+91 9209873927	Gurugram	Golf Course Road	12, Golf Course Road, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-06-16 11:52:33.631	2026-06-16 14:52:33.631	0	2026-06-14 11:52:33.631	\N	APPROVED
cmvqmlu9c00imuh58l7xcm2f8	nikhil.sector56@kirayo.test	Nikhil Jain	+91 9834728155	Gurugram	Sector 56	120, Sector 56, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-06 11:52:33.647	2025-08-06 14:52:33.647	0	2025-08-04 11:52:33.647	\N	APPROVED
cmvqmlu9x00ituh58cc9salg3	shreya.sector562@kirayo.test	Shreya Malhotra	+91 9215226780	Gurugram	Sector 56	203, Sector 56, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-06-25 11:52:33.668	2025-06-25 14:52:33.668	0	2025-06-23 11:52:33.668	\N	APPROVED
cmvqmluaf00iyuh58r0y5a574	siddharth.sector563@kirayo.test	Siddharth Nair	+91 9906951951	Gurugram	Sector 56	101, Sector 56, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-10-18 11:52:33.686	2025-10-18 14:52:33.686	0	2025-10-16 11:52:33.686	\N	APPROVED
cmvqmlub400j5uh5857x78qss	neel.sohnaroad@kirayo.test	Neel Iyer	+91 9730641389	Gurugram	Sohna Road	203, Sohna Road, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-04-12 11:52:33.71	2026-04-12 14:52:33.71	0	2026-04-10 11:52:33.71	\N	APPROVED
cmvqmlubs00jcuh5808r6o5a5	manav.sohnaroad2@kirayo.test	Manav Mehta	+91 9221122971	Gurugram	Sohna Road	171, Sohna Road, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-10-11 11:52:33.734	2025-10-11 14:52:33.734	0	2025-10-09 11:52:33.734	\N	APPROVED
cmvqmluc900jjuh58272ep349	sana.sohnaroad3@kirayo.test	Sana Verma	+91 9901617963	Gurugram	Sohna Road	88, Sohna Road, Gurugram	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-07-29 11:52:33.752	2025-07-29 14:52:33.752	0	2025-07-27 11:52:33.752	\N	APPROVED
cmvqmluct00jquh58fj4ci3uy	isha.aundh@kirayo.test	Isha Deshmukh	+91 9298839064	Pune	Aundh	122, Aundh, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-28 11:52:33.772	2026-02-28 14:52:33.772	0	2026-02-26 11:52:33.772	\N	APPROVED
cmvqmlufn00ksuh58mg7kbrgw	kabir.hinjewadi3@kirayo.test	Kabir Deshmukh	+91 9139662115	Pune	Hinjewadi	53, Hinjewadi, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-26 11:52:33.873	2025-08-26 14:52:33.873	0	2025-08-24 11:52:33.873	\N	APPROVED
cmvqmlufy00kxuh582c6l5dkv	priya.kothrud@kirayo.test	Priya Mehta	+91 9184089844	Pune	Kothrud	23, Kothrud, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-11 11:52:33.885	2025-12-11 14:52:33.885	0	2025-12-09 11:52:33.885	\N	APPROVED
cmvqmlugc00l2uh58uhl6n52g	lavanya.kothrud2@kirayo.test	Lavanya Patel	+91 9312314700	Pune	Kothrud	85, Kothrud, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-07-27 11:52:33.899	2026-07-27 14:52:33.899	0	2026-07-25 11:52:33.899	\N	APPROVED
cmvqmlugo00l7uh58zms40d59	aarav.kothrud3@kirayo.test	Aarav Khan	+91 9414466124	Pune	Kothrud	129, Kothrud, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-16 11:52:33.911	2025-08-16 14:52:33.911	0	2025-08-14 11:52:33.911	\N	APPROVED
cmvqmluh000lcuh58eo32ta90	siddharth.koregaonpark@kirayo.test	Siddharth Chopra	+91 9293669192	Pune	Koregaon Park	15, Koregaon Park, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-06-02 11:52:33.923	2025-06-02 14:52:33.923	0	2025-05-31 11:52:33.923	\N	APPROVED
cmvqmluhf00ljuh58oz5h5kpf	vivek.koregaonpark2@kirayo.test	Vivek Kapoor	+91 9901505813	Pune	Koregaon Park	205, Koregaon Park, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-06-01 11:52:33.938	2025-06-01 14:52:33.938	0	2025-05-30 11:52:33.938	\N	APPROVED
cmvqmluhr00louh58zrc4l4sg	kabir.kalyaninagar@kirayo.test	Kabir Iyer	+91 9172387520	Pune	Kalyani Nagar	199, Kalyani Nagar, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-11-28 11:52:33.95	2025-11-28 14:52:33.95	0	2025-11-26 11:52:33.95	\N	APPROVED
cmvqmlui400ltuh58i5cb0h0z	siddharth.kalyaninagar2@kirayo.test	Siddharth Menon	+91 9474590981	Pune	Kalyani Nagar	180, Kalyani Nagar, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-04-15 11:52:33.963	2026-04-15 14:52:33.963	0	2026-04-13 11:52:33.963	\N	APPROVED
cmvqmluim00m0uh589m0137k0	vivek.vimannagar@kirayo.test	Vivek Kulkarni	+91 9899696555	Pune	Viman Nagar	170, Viman Nagar, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-06-25 11:52:33.98	2026-06-25 14:52:33.98	0	2026-06-23 11:52:33.98	\N	APPROVED
cmvqmluj000m5uh58b2g4jzgt	kabir.vimannagar2@kirayo.test	Kabir Chopra	+91 9960779161	Pune	Viman Nagar	87, Viman Nagar, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-28 11:52:33.995	2026-02-28 14:52:33.995	0	2026-02-26 11:52:33.995	\N	APPROVED
cmvqmlujj00mcuh58at04jmdw	rahul.vimannagar3@kirayo.test	Rahul Verma	+91 9342114279	Pune	Viman Nagar	184, Viman Nagar, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-08-09 11:52:34.014	2026-08-09 14:52:34.014	0	2026-08-07 11:52:34.014	\N	APPROVED
cmvqmluk000mjuh58rkrwanau	manav.hadapsar@kirayo.test	Manav Kapoor	+91 9948349788	Pune	Hadapsar	131, Hadapsar, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-25 11:52:34.031	2026-02-25 14:52:34.031	0	2026-02-23 11:52:34.031	\N	APPROVED
cmvqmluki00mquh58yjymyaji	aisha.hadapsar2@kirayo.test	Aisha Khan	+91 9974592819	Pune	Hadapsar	82, Hadapsar, Pune	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-17 11:52:34.049	2025-08-17 14:52:34.049	0	2025-08-15 11:52:34.049	\N	APPROVED
cmvqmlssp002ouh58wjn6jxch	admin@kirayo.test	Kirayo Admin	\N	Bengaluru	Indiranagar	\N	t	f	VERIFIED	\N	\N	\N	\N	\N	\N	0	2025-01-05 00:00:00	\N	NONE
cmvqmlssu002puh58xnyf3xxd	riya@kirayo.test	Riya Sharma	+91 98450 12345	Bengaluru	Indiranagar	Flat 4B, Lakshmi Residency, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru 560008	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-07-29 11:52:31.757	2026-07-29 11:52:31.757	0	2026-07-24 11:52:31.757	\N	NONE
cmvqmlssz002quh580lytgi99	arjun@kirayo.test	Arjun Mehta	+91 99000 11223	Bengaluru	Indiranagar	22, 100 Feet Road, Indiranagar, Bengaluru 560038	f	f	VERIFIED	Driving licence	\N	\N	\N	2025-12-31 11:52:31.762	2025-12-31 11:52:31.762	0	2025-12-21 11:52:31.762	\N	APPROVED
cmvqmlst9002tuh580d6oo0zv	neha@kirayo.test	Neha Kulkarni	\N	Bengaluru	Koramangala	\N	f	f	PENDING	Aadhaar	/api/private/cmvqmlst9002tuh580d6oo0zv/4d35f7040ffc009a4ceea7e3.jpg	/api/private/cmvqmlst9002tuh580d6oo0zv/344d27b212d0164f9b4bbbab.jpg	\N	2026-10-27 08:52:31.772	\N	0	2026-10-25 11:52:31.772	\N	PENDING
cmvqmlsty002zuh580k9mnofo	kabir@kirayo.test	Kabir Malhotra	+91 97400 31882	Bengaluru	HSR Layout	\N	f	f	VERIFIED	Passport	\N	\N	\N	2026-10-21 11:52:31.797	2026-10-21 11:52:31.797	0	2026-10-20 11:52:31.797	\N	PENDING
cmvqmlstr002wuh58kseze9zl	vikram@kirayo.test	Vikram Singh	\N	Mumbai	Bandra West	\N	f	f	REJECTED	PAN	/api/private/cmvqmlstr002wuh58kseze9zl/738c5e02165fd068b1b5da01.jpg	/api/private/cmvqmlstr002wuh58kseze9zl/aae5c5e93757bf966d537cd4.jpg	The photo is blurry — the name and ID number are not readable. Please upload a sharp photo in good light.	2026-10-24 11:52:31.79	2026-10-25 11:52:31.79	0	2026-10-23 11:52:31.79	Please list the actual items you will rent (brand / model), not just “electronics”.	REJECTED
cmvqmlsw30042uh58jsn215ql	nisha.hebbal@kirayo.test	Nisha Sharma	+91 9907094026	Bengaluru	Hebbal	54, Hebbal, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-09-13 11:52:31.873	2025-09-13 14:52:31.873	0	2025-09-11 11:52:31.873	\N	APPROVED
cmvqmlswo0047uh58k9u2g0qg	aarav.hebbal2@kirayo.test	Aarav Sharma	+91 9911242079	Bengaluru	Hebbal	195, Hebbal, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-01-10 11:52:31.895	2026-01-10 14:52:31.895	0	2026-01-08 11:52:31.895	\N	APPROVED
cmvqmlsx8004euh5828xw0y30	ishaan.malleshwaram@kirayo.test	Ishaan Banerjee	+91 9508295574	Bengaluru	Malleshwaram	121, Malleshwaram, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-13 11:52:31.915	2025-08-13 14:52:31.915	0	2025-08-11 11:52:31.915	\N	APPROVED
cmvqmlsxn004juh58pupe813r	gauri.malleshwaram2@kirayo.test	Gauri Kapoor	+91 9588202593	Bengaluru	Malleshwaram	84, Malleshwaram, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-19 11:52:31.93	2025-08-19 14:52:31.93	0	2025-08-17 11:52:31.93	\N	APPROVED
cmvqmlsy7004quh58psli72a0	tanvi.indiranagar@kirayo.test	Tanvi Sharma	+91 9943298234	Bengaluru	Indiranagar	189, Indiranagar, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-11-14 11:52:31.95	2025-11-14 14:52:31.95	0	2025-11-12 11:52:31.95	\N	APPROVED
cmvqmlsyp004vuh58azi5rvep	ishaan.indiranagar2@kirayo.test	Ishaan Bhat	+91 9904507286	Bengaluru	Indiranagar	33, Indiranagar, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-04-24 11:52:31.967	2026-04-24 14:52:31.967	0	2026-04-22 11:52:31.967	\N	APPROVED
cmvqmlsz90050uh58newfnyrc	rahul.indiranagar3@kirayo.test	Rahul Malhotra	+91 9235627461	Bengaluru	Indiranagar	101, Indiranagar, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-09-20 11:52:31.988	2025-09-20 14:52:31.988	0	2025-09-18 11:52:31.988	\N	APPROVED
cmvqmlszv0057uh58ymhloenp	kunal.whitefield@kirayo.test	Kunal Shetty	+91 9954258382	Bengaluru	Whitefield	87, Whitefield, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-28 11:52:32.01	2026-02-28 14:52:32.01	0	2026-02-26 11:52:32.01	\N	APPROVED
cmvqmlt0b005cuh58qerxh6cc	isha.whitefield2@kirayo.test	Isha Chopra	+91 9264003362	Bengaluru	Whitefield	190, Whitefield, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-02-17 11:52:32.026	2026-02-17 14:52:32.026	0	2026-02-15 11:52:32.026	\N	APPROVED
cmvqmlt0q005huh58fkga3tie	varun.whitefield3@kirayo.test	Varun Das	+91 9148796145	Bengaluru	Whitefield	80, Whitefield, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-06-23 11:52:32.04	2025-06-23 14:52:32.04	0	2025-06-21 11:52:32.04	\N	APPROVED
cmvqmlt14005muh58b6d8poq2	karan.koramangala@kirayo.test	Karan Rao	+91 9796298994	Bengaluru	Koramangala	187, Koramangala, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-03-06 11:52:32.055	2026-03-06 14:52:32.055	0	2026-03-04 11:52:32.055	\N	APPROVED
cmvqmlt1p005tuh58ci8ax8kc	ishaan.koramangala2@kirayo.test	Ishaan Nair	+91 9308923002	Bengaluru	Koramangala	115, Koramangala, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-29 11:52:32.076	2025-12-29 14:52:32.076	0	2025-12-27 11:52:32.076	\N	APPROVED
cmvqmlt25005yuh587gq5xrjw	tara.hsrlayout@kirayo.test	Tara Hegde	+91 9242370691	Bengaluru	HSR Layout	184, HSR Layout, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-06-05 11:52:32.092	2026-06-05 14:52:32.092	0	2026-06-03 11:52:32.092	\N	APPROVED
cmvqmlt2n0063uh58po2ufpn7	manav.hsrlayout2@kirayo.test	Manav Saxena	+91 9567736112	Bengaluru	HSR Layout	46, HSR Layout, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-05-20 11:52:32.11	2026-05-20 14:52:32.11	0	2026-05-18 11:52:32.11	\N	APPROVED
cmvqmlt37006auh58ri5igsbt	shreya.hsrlayout3@kirayo.test	Shreya Malhotra	+91 9144948921	Bengaluru	HSR Layout	13, HSR Layout, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-06-26 11:52:32.13	2025-06-26 14:52:32.13	0	2025-06-24 11:52:32.13	\N	APPROVED
cmvqmlt3m006fuh58caglp1ed	zoya.jayanagar@kirayo.test	Zoya Menon	+91 9355013819	Bengaluru	Jayanagar	52, Jayanagar, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-08-05 11:52:32.145	2025-08-05 14:52:32.145	0	2025-08-03 11:52:32.145	\N	APPROVED
cmvqmlt41006kuh58w43g0c9w	nikhil.jayanagar2@kirayo.test	Nikhil Shetty	+91 9455042758	Bengaluru	Jayanagar	201, Jayanagar, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-10-20 11:52:32.16	2025-10-20 14:52:32.16	0	2025-10-18 11:52:32.16	\N	APPROVED
cmvqmlt4f006puh58y07wq6xg	tanvi.jpnagar@kirayo.test	Tanvi Reddy	+91 9536014965	Bengaluru	JP Nagar	170, JP Nagar, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-06-06 11:52:32.174	2025-06-06 14:52:32.174	0	2025-06-04 11:52:32.174	\N	APPROVED
cmvqmlt4z006wuh58w9a8bu8w	tanvi.jpnagar2@kirayo.test	Tanvi Rao	+91 9435247927	Bengaluru	JP Nagar	203, JP Nagar, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-29 11:52:32.194	2025-12-29 14:52:32.194	0	2025-12-27 11:52:32.194	\N	APPROVED
cmvqmlt5j0073uh58go1s5jdm	arnav.jpnagar3@kirayo.test	Arnav Verma	+91 9816580377	Bengaluru	JP Nagar	158, JP Nagar, Bengaluru	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-08-14 11:52:32.214	2026-08-14 14:52:32.214	0	2026-08-12 11:52:32.214	\N	APPROVED
cmvqmlt5y0078uh58zh9uztse	harsh.thanewest@kirayo.test	Harsh Shetty	+91 9706751969	Mumbai	Thane West	40, Thane West, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-16 11:52:32.229	2025-12-16 14:52:32.229	0	2025-12-14 11:52:32.229	\N	APPROVED
cmvqmlt6g007fuh58ia2t4vjs	omkar.thanewest2@kirayo.test	Omkar Kulkarni	+91 9595423028	Mumbai	Thane West	83, Thane West, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-11-17 11:52:32.247	2025-11-17 14:52:32.247	0	2025-11-15 11:52:32.247	\N	APPROVED
cmvqmlt71007muh587qpnbvi1	tara.malad@kirayo.test	Tara Menon	+91 9451072291	Mumbai	Malad	147, Malad, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-07-09 11:52:32.268	2026-07-09 14:52:32.268	0	2026-07-07 11:52:32.268	\N	APPROVED
cmvqmlt7n007tuh58iuvmxe75	kavya.malad2@kirayo.test	Kavya Saxena	+91 9512616591	Mumbai	Malad	42, Malad, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-11-21 11:52:32.29	2025-11-21 14:52:32.29	0	2025-11-19 11:52:32.29	\N	APPROVED
cmvqmlt82007yuh58882gnwhw	harsh.malad3@kirayo.test	Harsh Sharma	+91 9880445378	Mumbai	Malad	67, Malad, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2025-12-31 11:52:32.305	2025-12-31 14:52:32.305	0	2025-12-29 11:52:32.305	\N	APPROVED
cmvqmlt8j0085uh58eduyt6hw	sana.goregaon@kirayo.test	Sana Menon	+91 9647516483	Mumbai	Goregaon	162, Goregaon, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-08-23 11:52:32.322	2026-08-23 14:52:32.322	0	2026-08-21 11:52:32.322	\N	APPROVED
cmvqmlt94008cuh5839etd7ke	gauri.goregaon2@kirayo.test	Gauri Pillai	+91 9573643989	Mumbai	Goregaon	137, Goregaon, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-05-13 11:52:32.343	2026-05-13 14:52:32.343	0	2026-05-11 11:52:32.343	\N	APPROVED
cmvqmlt9l008huh58ezl2ulup	nisha.powai@kirayo.test	Nisha Nair	+91 9247170170	Mumbai	Powai	85, Powai, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-09-04 11:52:32.36	2026-09-04 14:52:32.36	0	2026-09-02 11:52:32.36	\N	APPROVED
cmvqmlta5008ouh58yq1g8w6f	farhan.powai2@kirayo.test	Farhan Banerjee	+91 9437504894	Mumbai	Powai	42, Powai, Mumbai	f	f	VERIFIED	Aadhaar	\N	\N	\N	2026-01-15 11:52:32.38	2026-01-15 14:52:32.38	0	2026-01-13 11:52:32.38	\N	APPROVED
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
89d6618f-6f6f-49de-a1c0-42dd0b859cae	bd4886f9fa6ddc62eecf9a16ca603c2c7afabe5ce9aed1462631f276fe078ec5	2026-10-26 10:57:13.158775+00	0_init		\N	2026-10-26 10:57:13.158775+00	0
536ee606-8b09-4da6-983f-79977864c7d1	cc9a302df12c049278000c4e114422d2ddb355fb0566c4cc3d53552f3142cac7	2026-10-26 11:21:21.873516+00	20261026120000_owner_application	\N	\N	2026-10-26 11:21:21.835397+00	1
\.


--
-- Name: Area Area_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_pkey" PRIMARY KEY (id);


--
-- Name: BlockedDate BlockedDate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlockedDate"
    ADD CONSTRAINT "BlockedDate_pkey" PRIMARY KEY (id);


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: City City_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_pkey" PRIMARY KEY (id);


--
-- Name: Complaint Complaint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_pkey" PRIMARY KEY (id);


--
-- Name: ConditionReport ConditionReport_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConditionReport"
    ADD CONSTRAINT "ConditionReport_pkey" PRIMARY KEY (id);


--
-- Name: ContactMessage ContactMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContactMessage"
    ADD CONSTRAINT "ContactMessage_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: DamageClaim DamageClaim_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DamageClaim"
    ADD CONSTRAINT "DamageClaim_pkey" PRIMARY KEY (id);


--
-- Name: DepositRefund DepositRefund_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepositRefund"
    ADD CONSTRAINT "DepositRefund_pkey" PRIMARY KEY (id);


--
-- Name: EmailOtp EmailOtp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailOtp"
    ADD CONSTRAINT "EmailOtp_pkey" PRIMARY KEY (id);


--
-- Name: ExtensionRequest ExtensionRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExtensionRequest"
    ADD CONSTRAINT "ExtensionRequest_pkey" PRIMARY KEY (id);


--
-- Name: Item Item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Item"
    ADD CONSTRAINT "Item_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: OwnerApplication OwnerApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OwnerApplication"
    ADD CONSTRAINT "OwnerApplication_pkey" PRIMARY KEY (id);


--
-- Name: Payout Payout_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Area_cityId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Area_cityId_name_key" ON public."Area" USING btree ("cityId", name);


--
-- Name: BlockedDate_itemId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BlockedDate_itemId_date_key" ON public."BlockedDate" USING btree ("itemId", date);


--
-- Name: Booking_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Booking_code_key" ON public."Booking" USING btree (code);


--
-- Name: Booking_itemId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Booking_itemId_status_idx" ON public."Booking" USING btree ("itemId", status);


--
-- Name: Booking_ownerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Booking_ownerId_idx" ON public."Booking" USING btree ("ownerId");


--
-- Name: Booking_renterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Booking_renterId_idx" ON public."Booking" USING btree ("renterId");


--
-- Name: City_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "City_name_key" ON public."City" USING btree (name);


--
-- Name: Conversation_itemId_renterId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Conversation_itemId_renterId_key" ON public."Conversation" USING btree ("itemId", "renterId");


--
-- Name: Conversation_ownerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_ownerId_idx" ON public."Conversation" USING btree ("ownerId");


--
-- Name: DamageClaim_bookingId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DamageClaim_bookingId_key" ON public."DamageClaim" USING btree ("bookingId");


--
-- Name: EmailOtp_email_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EmailOtp_email_createdAt_idx" ON public."EmailOtp" USING btree (email, "createdAt");


--
-- Name: Item_city_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Item_city_status_idx" ON public."Item" USING btree (city, status);


--
-- Name: Item_ownerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Item_ownerId_idx" ON public."Item" USING btree ("ownerId");


--
-- Name: Message_conversationId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_conversationId_createdAt_idx" ON public."Message" USING btree ("conversationId", "createdAt");


--
-- Name: OwnerApplication_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OwnerApplication_userId_key" ON public."OwnerApplication" USING btree ("userId");


--
-- Name: Payout_bookingId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payout_bookingId_key" ON public."Payout" USING btree ("bookingId");


--
-- Name: Review_bookingId_fromUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Review_bookingId_fromUserId_key" ON public."Review" USING btree ("bookingId", "fromUserId");


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Area Area_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlockedDate BlockedDate_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlockedDate"
    ADD CONSTRAINT "BlockedDate_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."Item"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Booking Booking_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Booking Booking_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."Item"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_renterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Complaint Complaint_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Complaint Complaint_byUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_byUserId_fkey" FOREIGN KEY ("byUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ConditionReport ConditionReport_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConditionReport"
    ADD CONSTRAINT "ConditionReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConditionReport ConditionReport_byUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConditionReport"
    ADD CONSTRAINT "ConditionReport_byUserId_fkey" FOREIGN KEY ("byUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Conversation Conversation_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."Item"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Conversation Conversation_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Conversation Conversation_renterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DamageClaim DamageClaim_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DamageClaim"
    ADD CONSTRAINT "DamageClaim_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DepositRefund DepositRefund_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepositRefund"
    ADD CONSTRAINT "DepositRefund_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExtensionRequest ExtensionRequest_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExtensionRequest"
    ADD CONSTRAINT "ExtensionRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Item Item_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Item"
    ADD CONSTRAINT "Item_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OwnerApplication OwnerApplication_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OwnerApplication"
    ADD CONSTRAINT "OwnerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payout Payout_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payout Payout_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_fromUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."Item"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Review Review_toUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict sUMMkQ9bDqhNyso9ZJA6R4EZjg378JdhlOLC6JbQLV7jybKMfVV37TczyDYobDA

