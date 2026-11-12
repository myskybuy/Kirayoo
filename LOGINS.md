# Kirayo demo logins

All demo accounts use **email OTP**. In development the 6-digit code is shown on the verify page for every `@kirayo.test` address (and printed in the terminal), so no inbox is needed.

Run `npm run setup` (fresh DB) or `npm run db:reset` to load this data. Dates are relative to the day you seed.

## Start here

| Role | Email | What to try |
|---|---|---|
| Admin · Kirayo Admin (Indiranagar, Bengaluru) · ID verified | `admin@kirayo.test` | Admin panel: approve Kabir’s owner application, approve Neha’s ID, moderate pending listings, decide the disputed lens claim, pay the pending payout, resolve the complaint + contact message. |
| Renter · Riya Sharma (Indiranagar, Bengaluru) · ID verified | `riya@kirayo.test` | Renter with a booking in every state: pay the held projector, show pickup OTP (tent tomorrow), cash-at-pickup drill, in-use guitar (report a problem / extend), overdue bike, answer the speaker claim, review history. |
| Owner · Arjun Mehta (Indiranagar, Bengaluru) · ID verified · owner approved | `arjun@kirayo.test` | Owner with 16 live items in Bengaluru + Mumbai: answer Riya’s camera request, hand over the tent (photos + OTP), check the returned ladder (All OK or claim), see earnings and reviews. |
| Renter · Kabir Malhotra (HSR Layout, Bengaluru) · ID verified · owner pending | `kabir@kirayo.test` | ID verified, owner application PENDING: /owner/apply shows “under review”; once the admin approves, they can list items. |
| Renter · Neha Kulkarni (Koramangala, Bengaluru) · ID pending · owner pending | `neha@kirayo.test` | ID PENDING + owner application PENDING: chat works, but paying and listing are blocked until the admin approves both. |
| Renter · Vikram Singh (Bandra West, Mumbai) · ID rejected · owner rejected | `vikram@kirayo.test` | ID REJECTED and owner application REJECTED, each with a reason: re-upload the ID and resend the application. |

## Every account by city → area

Area owners are approved, ID-verified owners with 2–3 live items each, so every location shows results. Any of them can also rent.

### Bengaluru

**Hebbal**

- `aarav.hebbal2@kirayo.test` — Aarav Sharma, owner (3 items), ID verified · owner approved
- `nisha.hebbal@kirayo.test` — Nisha Sharma, owner (2 items), ID verified · owner approved

**Malleshwaram**

- `gauri.malleshwaram2@kirayo.test` — Gauri Kapoor, owner (3 items), ID verified · owner approved
- `ishaan.malleshwaram@kirayo.test` — Ishaan Banerjee, owner (2 items), ID verified · owner approved

**Indiranagar**

- `admin@kirayo.test` — Kirayo Admin, admin, ID verified — Admin panel: approve Kabir’s owner application, approve Neha’s ID, moderate pending listings, decide the disputed lens claim, pay the pending payout, resolve the complaint + contact message.
- `arjun@kirayo.test` — Arjun Mehta, owner (18 items), ID verified · owner approved — Owner with 16 live items in Bengaluru + Mumbai: answer Riya’s camera request, hand over the tent (photos + OTP), check the returned ladder (All OK or claim), see earnings and reviews.
- `ishaan.indiranagar2@kirayo.test` — Ishaan Bhat, owner (2 items), ID verified · owner approved
- `rahul.indiranagar3@kirayo.test` — Rahul Malhotra, owner (3 items), ID verified · owner approved
- `riya@kirayo.test` — Riya Sharma, renter, ID verified — Renter with a booking in every state: pay the held projector, show pickup OTP (tent tomorrow), cash-at-pickup drill, in-use guitar (report a problem / extend), overdue bike, answer the speaker claim, review history.
- `tanvi.indiranagar@kirayo.test` — Tanvi Sharma, owner (2 items), ID verified · owner approved

**Whitefield**

- `isha.whitefield2@kirayo.test` — Isha Chopra, owner (2 items), ID verified · owner approved
- `kunal.whitefield@kirayo.test` — Kunal Shetty, owner (2 items), ID verified · owner approved
- `varun.whitefield3@kirayo.test` — Varun Das, owner (2 items), ID verified · owner approved

**Koramangala**

- `ishaan.koramangala2@kirayo.test` — Ishaan Nair, owner (2 items), ID verified · owner approved
- `karan.koramangala@kirayo.test` — Karan Rao, owner (3 items), ID verified · owner approved
- `neha@kirayo.test` — Neha Kulkarni, renter, ID pending · owner pending — ID PENDING + owner application PENDING: chat works, but paying and listing are blocked until the admin approves both.

**HSR Layout**

- `kabir@kirayo.test` — Kabir Malhotra, renter, ID verified · owner pending — ID verified, owner application PENDING: /owner/apply shows “under review”; once the admin approves, they can list items.
- `manav.hsrlayout2@kirayo.test` — Manav Saxena, owner (3 items), ID verified · owner approved
- `shreya.hsrlayout3@kirayo.test` — Shreya Malhotra, owner (2 items), ID verified · owner approved
- `tara.hsrlayout@kirayo.test` — Tara Hegde, owner (2 items), ID verified · owner approved

**Jayanagar**

- `nikhil.jayanagar2@kirayo.test` — Nikhil Shetty, owner (2 items), ID verified · owner approved
- `zoya.jayanagar@kirayo.test` — Zoya Menon, owner (2 items), ID verified · owner approved

**JP Nagar**

- `arnav.jpnagar3@kirayo.test` — Arnav Verma, owner (2 items), ID verified · owner approved
- `tanvi.jpnagar2@kirayo.test` — Tanvi Rao, owner (3 items), ID verified · owner approved
- `tanvi.jpnagar@kirayo.test` — Tanvi Reddy, owner (3 items), ID verified · owner approved

### Mumbai

**Thane West**

- `harsh.thanewest@kirayo.test` — Harsh Shetty, owner (3 items), ID verified · owner approved
- `omkar.thanewest2@kirayo.test` — Omkar Kulkarni, owner (3 items), ID verified · owner approved

**Malad**

- `harsh.malad3@kirayo.test` — Harsh Sharma, owner (3 items), ID verified · owner approved
- `kavya.malad2@kirayo.test` — Kavya Saxena, owner (2 items), ID verified · owner approved
- `tara.malad@kirayo.test` — Tara Menon, owner (3 items), ID verified · owner approved

**Goregaon**

- `gauri.goregaon2@kirayo.test` — Gauri Pillai, owner (2 items), ID verified · owner approved
- `sana.goregaon@kirayo.test` — Sana Menon, owner (3 items), ID verified · owner approved

**Powai**

- `farhan.powai2@kirayo.test` — Farhan Banerjee, owner (2 items), ID verified · owner approved
- `nisha.powai@kirayo.test` — Nisha Nair, owner (3 items), ID verified · owner approved

**Andheri West**

- `lavanya.andheriwest2@kirayo.test` — Lavanya Pillai, owner (3 items), ID verified · owner approved
- `manav.andheriwest3@kirayo.test` — Manav Nair, owner (2 items), ID verified · owner approved
- `yash.andheriwest@kirayo.test` — Yash Banerjee, owner (2 items), ID verified · owner approved

**Juhu**

- `ananya.juhu3@kirayo.test` — Ananya Jain, owner (2 items), ID verified · owner approved
- `varun.juhu2@kirayo.test` — Varun Sinha, owner (3 items), ID verified · owner approved
- `vivek.juhu@kirayo.test` — Vivek Patel, owner (3 items), ID verified · owner approved

**Bandra West**

- `aarav.bandrawest3@kirayo.test` — Aarav Gupta, owner (4 items), ID verified · owner approved
- `arnav.bandrawest@kirayo.test` — Arnav Saxena, owner (3 items), ID verified · owner approved
- `ritika.bandrawest2@kirayo.test` — Ritika Gupta, owner (3 items), ID verified · owner approved
- `vikram@kirayo.test` — Vikram Singh, renter, ID rejected · owner rejected — ID REJECTED and owner application REJECTED, each with a reason: re-upload the ID and resend the application.

**Colaba**

- `nisha.colaba3@kirayo.test` — Nisha Rao, owner (2 items), ID verified · owner approved
- `omkar.colaba@kirayo.test` — Omkar Chopra, owner (3 items), ID verified · owner approved
- `shreya.colaba2@kirayo.test` — Shreya Patel, owner (2 items), ID verified · owner approved

### Delhi

**Rohini**

- `kavya.rohini2@kirayo.test` — Kavya Shetty, owner (2 items), ID verified · owner approved
- `sneha.rohini@kirayo.test` — Sneha Menon, owner (2 items), ID verified · owner approved
- `zoya.rohini3@kirayo.test` — Zoya Das, owner (3 items), ID verified · owner approved

**Karol Bagh**

- `ishaan.karolbagh2@kirayo.test` — Ishaan Sinha, owner (2 items), ID verified · owner approved
- `ishaan.karolbagh@kirayo.test` — Ishaan Banerjee, owner (3 items), ID verified · owner approved
- `zoya.karolbagh3@kirayo.test` — Zoya Patel, owner (2 items), ID verified · owner approved

**Connaught Place**

- `lavanya.connaughtplace2@kirayo.test` — Lavanya Chopra, owner (2 items), ID verified · owner approved
- `zoya.connaughtplace@kirayo.test` — Zoya Sinha, owner (3 items), ID verified · owner approved

**Mayur Vihar**

- `rohan.mayurvihar2@kirayo.test` — Rohan Saxena, owner (2 items), ID verified · owner approved
- `varun.mayurvihar@kirayo.test` — Varun Bhat, owner (2 items), ID verified · owner approved

**Lajpat Nagar**

- `diya.lajpatnagar3@kirayo.test` — Diya Kapoor, owner (2 items), ID verified · owner approved
- `diya.lajpatnagar@kirayo.test` — Diya Patel, owner (3 items), ID verified · owner approved
- `tanvi.lajpatnagar2@kirayo.test` — Tanvi Sinha, owner (3 items), ID verified · owner approved

**Hauz Khas**

- `omkar.hauzkhas2@kirayo.test` — Omkar Saxena, owner (3 items), ID verified · owner approved
- `tara.hauzkhas@kirayo.test` — Tara Nair, owner (2 items), ID verified · owner approved

**Saket**

- `aisha.saket2@kirayo.test` — Aisha Chopra, owner (2 items), ID verified · owner approved
- `isha.saket3@kirayo.test` — Isha Shetty, owner (3 items), ID verified · owner approved
- `varun.saket@kirayo.test` — Varun Das, owner (3 items), ID verified · owner approved

**Dwarka**

- `gauri.dwarka2@kirayo.test` — Gauri Bose, owner (3 items), ID verified · owner approved
- `kunal.dwarka3@kirayo.test` — Kunal Banerjee, owner (3 items), ID verified · owner approved
- `omkar.dwarka@kirayo.test` — Omkar Joshi, owner (3 items), ID verified · owner approved

### Noida

**Sector 18**

- `ananya.sector18@kirayo.test` — Ananya Menon, owner (2 items), ID verified · owner approved
- `priya.sector182@kirayo.test` — Priya Sharma, owner (3 items), ID verified · owner approved

**Sector 50**

- `arnav.sector502@kirayo.test` — Arnav Iyer, owner (3 items), ID verified · owner approved
- `ishaan.sector50@kirayo.test` — Ishaan Reddy, owner (3 items), ID verified · owner approved
- `shreya.sector503@kirayo.test` — Shreya Banerjee, owner (3 items), ID verified · owner approved

**Sector 62**

- `dev.sector62@kirayo.test` — Dev Khan, owner (2 items), ID verified · owner approved
- `kabir.sector622@kirayo.test` — Kabir Sinha, owner (2 items), ID verified · owner approved

**Sector 76**

- `aditya.sector762@kirayo.test` — Aditya Malhotra, owner (2 items), ID verified · owner approved
- `kabir.sector76@kirayo.test` — Kabir Khan, owner (2 items), ID verified · owner approved

**Sector 137**

- `ananya.sector1372@kirayo.test` — Ananya Menon, owner (3 items), ID verified · owner approved
- `ishaan.sector137@kirayo.test` — Ishaan Joshi, owner (2 items), ID verified · owner approved

**Greater Noida West**

- `aarav.greaternoidawest2@kirayo.test` — Aarav Mehta, owner (4 items), ID verified · owner approved
- `aisha.greaternoidawest@kirayo.test` — Aisha Patel, owner (3 items), ID verified · owner approved
- `ishaan.greaternoidawest3@kirayo.test` — Ishaan Gill, owner (2 items), ID verified · owner approved

### Gurugram

**Palam Vihar**

- `neel.palamvihar2@kirayo.test` — Neel Malhotra, owner (2 items), ID verified · owner approved
- `sana.palamvihar@kirayo.test` — Sana Sharma, owner (3 items), ID verified · owner approved

**DLF Phase 3**

- `kabir.dlfphase3@kirayo.test` — Kabir Verma, owner (2 items), ID verified · owner approved
- `kavya.dlfphase32@kirayo.test` — Kavya Reddy, owner (2 items), ID verified · owner approved

**Cyber City**

- `dev.cybercity2@kirayo.test` — Dev Mehta, owner (3 items), ID verified · owner approved
- `diya.cybercity@kirayo.test` — Diya Gill, owner (2 items), ID verified · owner approved

**DLF Phase 1**

- `nisha.dlfphase12@kirayo.test` — Nisha Mehta, owner (2 items), ID verified · owner approved
- `omkar.dlfphase13@kirayo.test` — Omkar Chopra, owner (2 items), ID verified · owner approved
- `vivek.dlfphase1@kirayo.test` — Vivek Nair, owner (3 items), ID verified · owner approved

**Golf Course Road**

- `gauri.golfcourseroad3@kirayo.test` — Gauri Gill, owner (2 items), ID verified · owner approved
- `harsh.golfcourseroad@kirayo.test` — Harsh Bose, owner (3 items), ID verified · owner approved
- `tanvi.golfcourseroad2@kirayo.test` — Tanvi Sharma, owner (2 items), ID verified · owner approved

**Sector 56**

- `nikhil.sector56@kirayo.test` — Nikhil Jain, owner (3 items), ID verified · owner approved
- `shreya.sector562@kirayo.test` — Shreya Malhotra, owner (2 items), ID verified · owner approved
- `siddharth.sector563@kirayo.test` — Siddharth Nair, owner (3 items), ID verified · owner approved

**Sohna Road**

- `manav.sohnaroad2@kirayo.test` — Manav Mehta, owner (3 items), ID verified · owner approved
- `neel.sohnaroad@kirayo.test` — Neel Iyer, owner (3 items), ID verified · owner approved
- `sana.sohnaroad3@kirayo.test` — Sana Verma, owner (3 items), ID verified · owner approved

### Pune

**Aundh**

- `aarav.aundh2@kirayo.test` — Aarav Patel, owner (3 items), ID verified · owner approved
- `isha.aundh@kirayo.test` — Isha Deshmukh, owner (2 items), ID verified · owner approved

**Baner**

- `kabir.baner2@kirayo.test` — Kabir Deshmukh, owner (3 items), ID verified · owner approved
- `kavya.baner@kirayo.test` — Kavya Menon, owner (3 items), ID verified · owner approved

**Hinjewadi**

- `gauri.hinjewadi2@kirayo.test` — Gauri Bhat, owner (3 items), ID verified · owner approved
- `ishaan.hinjewadi@kirayo.test` — Ishaan Sharma, owner (3 items), ID verified · owner approved
- `kabir.hinjewadi3@kirayo.test` — Kabir Deshmukh, owner (2 items), ID verified · owner approved

**Kothrud**

- `aarav.kothrud3@kirayo.test` — Aarav Khan, owner (2 items), ID verified · owner approved
- `lavanya.kothrud2@kirayo.test` — Lavanya Patel, owner (2 items), ID verified · owner approved
- `priya.kothrud@kirayo.test` — Priya Mehta, owner (2 items), ID verified · owner approved

**Koregaon Park**

- `siddharth.koregaonpark@kirayo.test` — Siddharth Chopra, owner (3 items), ID verified · owner approved
- `vivek.koregaonpark2@kirayo.test` — Vivek Kapoor, owner (2 items), ID verified · owner approved

**Kalyani Nagar**

- `kabir.kalyaninagar@kirayo.test` — Kabir Iyer, owner (2 items), ID verified · owner approved
- `siddharth.kalyaninagar2@kirayo.test` — Siddharth Menon, owner (3 items), ID verified · owner approved

**Viman Nagar**

- `kabir.vimannagar2@kirayo.test` — Kabir Chopra, owner (3 items), ID verified · owner approved
- `rahul.vimannagar3@kirayo.test` — Rahul Verma, owner (3 items), ID verified · owner approved
- `vivek.vimannagar@kirayo.test` — Vivek Kulkarni, owner (2 items), ID verified · owner approved

**Hadapsar**

- `aisha.hadapsar2@kirayo.test` — Aisha Khan, owner (3 items), ID verified · owner approved
- `manav.hadapsar@kirayo.test` — Manav Kapoor, owner (3 items), ID verified · owner approved
