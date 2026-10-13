# Kirayo demo logins

All demo accounts use **email OTP**. In development the 6-digit code is shown on the verify page for every `@kirayo.test` address (and printed in the terminal), so no inbox is needed.

Run `npm run setup` (fresh DB) or `npm run db:reset` to load this data. Dates are relative to the day you seed.

## Start here

| Role | Email | What to try |
|---|---|---|
| Admin · Kirayo Admin (Indiranagar, Bengaluru) · ID verified | `admin@kirayo.test` | Admin panel: approve Neha’s ID, approve pending listings, decide the disputed lens claim, pay the pending payout, resolve the complaint + contact message. |
| Renter · Riya Sharma (Indiranagar, Bengaluru) · ID verified | `riya@kirayo.test` | Renter with a booking in every state: pay the held projector, show pickup OTP (tent tomorrow), cash-at-pickup drill, in-use guitar (report a problem / extend), overdue bike, answer the speaker claim, review history. |
| Owner · Arjun Mehta (Indiranagar, Bengaluru) · ID verified | `arjun@kirayo.test` | Owner with 16 live items in Bengaluru + Mumbai: answer Riya’s camera request, hand over the tent (photos + OTP), check the returned ladder (All OK or claim), see earnings and reviews. |
| Renter · Neha Kulkarni (Koramangala, Bengaluru) · ID pending | `neha@kirayo.test` | ID PENDING: chat works, but paying and listing are blocked until the admin approves. |
| Renter · Vikram Singh (Bandra West, Mumbai) · ID rejected | `vikram@kirayo.test` | ID REJECTED with a reason: see the rejected screen and re-upload. |

## Every account by city → area

Area owners are ID-verified with 2–3 live items each, so every location shows results. Any of them can also rent.

### Bengaluru

**Hebbal**

- `aarav.hebbal2@kirayo.test` — Aarav Sharma, owner (3 items), ID verified
- `nisha.hebbal@kirayo.test` — Nisha Sharma, owner (2 items), ID verified

**Malleshwaram**

- `gauri.malleshwaram2@kirayo.test` — Gauri Kapoor, owner (3 items), ID verified
- `ishaan.malleshwaram@kirayo.test` — Ishaan Banerjee, owner (2 items), ID verified

**Indiranagar**

- `admin@kirayo.test` — Kirayo Admin, admin, ID verified — Admin panel: approve Neha’s ID, approve pending listings, decide the disputed lens claim, pay the pending payout, resolve the complaint + contact message.
- `arjun@kirayo.test` — Arjun Mehta, owner (18 items), ID verified — Owner with 16 live items in Bengaluru + Mumbai: answer Riya’s camera request, hand over the tent (photos + OTP), check the returned ladder (All OK or claim), see earnings and reviews.
- `ishaan.indiranagar2@kirayo.test` — Ishaan Bhat, owner (2 items), ID verified
- `rahul.indiranagar3@kirayo.test` — Rahul Malhotra, owner (3 items), ID verified
- `riya@kirayo.test` — Riya Sharma, renter, ID verified — Renter with a booking in every state: pay the held projector, show pickup OTP (tent tomorrow), cash-at-pickup drill, in-use guitar (report a problem / extend), overdue bike, answer the speaker claim, review history.
- `tanvi.indiranagar@kirayo.test` — Tanvi Sharma, owner (2 items), ID verified

**Whitefield**

- `isha.whitefield2@kirayo.test` — Isha Chopra, owner (2 items), ID verified
- `kunal.whitefield@kirayo.test` — Kunal Shetty, owner (2 items), ID verified
- `varun.whitefield3@kirayo.test` — Varun Das, owner (2 items), ID verified

**Koramangala**

- `ishaan.koramangala2@kirayo.test` — Ishaan Nair, owner (2 items), ID verified
- `karan.koramangala@kirayo.test` — Karan Rao, owner (3 items), ID verified
- `neha@kirayo.test` — Neha Kulkarni, renter, ID pending — ID PENDING: chat works, but paying and listing are blocked until the admin approves.

**HSR Layout**

- `manav.hsrlayout2@kirayo.test` — Manav Saxena, owner (3 items), ID verified
- `shreya.hsrlayout3@kirayo.test` — Shreya Malhotra, owner (2 items), ID verified
- `tara.hsrlayout@kirayo.test` — Tara Hegde, owner (2 items), ID verified

**Jayanagar**

- `nikhil.jayanagar2@kirayo.test` — Nikhil Shetty, owner (2 items), ID verified
- `zoya.jayanagar@kirayo.test` — Zoya Menon, owner (2 items), ID verified

**JP Nagar**

- `arnav.jpnagar3@kirayo.test` — Arnav Verma, owner (2 items), ID verified
- `tanvi.jpnagar2@kirayo.test` — Tanvi Rao, owner (3 items), ID verified
- `tanvi.jpnagar@kirayo.test` — Tanvi Reddy, owner (3 items), ID verified

### Mumbai

**Thane West**

- `harsh.thanewest@kirayo.test` — Harsh Shetty, owner (3 items), ID verified
- `omkar.thanewest2@kirayo.test` — Omkar Kulkarni, owner (3 items), ID verified

**Malad**

- `harsh.malad3@kirayo.test` — Harsh Sharma, owner (3 items), ID verified
- `kavya.malad2@kirayo.test` — Kavya Saxena, owner (2 items), ID verified
- `tara.malad@kirayo.test` — Tara Menon, owner (3 items), ID verified

**Goregaon**

- `gauri.goregaon2@kirayo.test` — Gauri Pillai, owner (2 items), ID verified
- `sana.goregaon@kirayo.test` — Sana Menon, owner (3 items), ID verified

**Powai**

- `farhan.powai2@kirayo.test` — Farhan Banerjee, owner (2 items), ID verified
- `nisha.powai@kirayo.test` — Nisha Nair, owner (3 items), ID verified

**Andheri West**

- `lavanya.andheriwest2@kirayo.test` — Lavanya Pillai, owner (3 items), ID verified
- `manav.andheriwest3@kirayo.test` — Manav Nair, owner (2 items), ID verified
- `yash.andheriwest@kirayo.test` — Yash Banerjee, owner (2 items), ID verified

**Juhu**

- `ananya.juhu3@kirayo.test` — Ananya Jain, owner (2 items), ID verified
- `varun.juhu2@kirayo.test` — Varun Sinha, owner (3 items), ID verified
- `vivek.juhu@kirayo.test` — Vivek Patel, owner (3 items), ID verified

**Bandra West**

- `aarav.bandrawest3@kirayo.test` — Aarav Gupta, owner (4 items), ID verified
- `arnav.bandrawest@kirayo.test` — Arnav Saxena, owner (3 items), ID verified
- `ritika.bandrawest2@kirayo.test` — Ritika Gupta, owner (3 items), ID verified
- `vikram@kirayo.test` — Vikram Singh, renter, ID rejected — ID REJECTED with a reason: see the rejected screen and re-upload.

**Colaba**

- `nisha.colaba3@kirayo.test` — Nisha Rao, owner (2 items), ID verified
- `omkar.colaba@kirayo.test` — Omkar Chopra, owner (3 items), ID verified
- `shreya.colaba2@kirayo.test` — Shreya Patel, owner (2 items), ID verified

### Delhi

**Rohini**

- `kavya.rohini2@kirayo.test` — Kavya Shetty, owner (2 items), ID verified
- `sneha.rohini@kirayo.test` — Sneha Menon, owner (2 items), ID verified
- `zoya.rohini3@kirayo.test` — Zoya Das, owner (3 items), ID verified

**Karol Bagh**

- `ishaan.karolbagh2@kirayo.test` — Ishaan Sinha, owner (2 items), ID verified
- `ishaan.karolbagh@kirayo.test` — Ishaan Banerjee, owner (3 items), ID verified
- `zoya.karolbagh3@kirayo.test` — Zoya Patel, owner (2 items), ID verified

**Connaught Place**

- `lavanya.connaughtplace2@kirayo.test` — Lavanya Chopra, owner (2 items), ID verified
- `zoya.connaughtplace@kirayo.test` — Zoya Sinha, owner (3 items), ID verified

**Mayur Vihar**

- `rohan.mayurvihar2@kirayo.test` — Rohan Saxena, owner (2 items), ID verified
- `varun.mayurvihar@kirayo.test` — Varun Bhat, owner (2 items), ID verified

**Lajpat Nagar**

- `diya.lajpatnagar3@kirayo.test` — Diya Kapoor, owner (2 items), ID verified
- `diya.lajpatnagar@kirayo.test` — Diya Patel, owner (3 items), ID verified
- `tanvi.lajpatnagar2@kirayo.test` — Tanvi Sinha, owner (3 items), ID verified

**Hauz Khas**

- `omkar.hauzkhas2@kirayo.test` — Omkar Saxena, owner (3 items), ID verified
- `tara.hauzkhas@kirayo.test` — Tara Nair, owner (2 items), ID verified

**Saket**

- `aisha.saket2@kirayo.test` — Aisha Chopra, owner (2 items), ID verified
- `isha.saket3@kirayo.test` — Isha Shetty, owner (3 items), ID verified
- `varun.saket@kirayo.test` — Varun Das, owner (3 items), ID verified

**Dwarka**

- `gauri.dwarka2@kirayo.test` — Gauri Bose, owner (3 items), ID verified
- `kunal.dwarka3@kirayo.test` — Kunal Banerjee, owner (3 items), ID verified
- `omkar.dwarka@kirayo.test` — Omkar Joshi, owner (3 items), ID verified

### Noida

**Sector 18**

- `ananya.sector18@kirayo.test` — Ananya Menon, owner (2 items), ID verified
- `priya.sector182@kirayo.test` — Priya Sharma, owner (3 items), ID verified

**Sector 50**

- `arnav.sector502@kirayo.test` — Arnav Iyer, owner (3 items), ID verified
- `ishaan.sector50@kirayo.test` — Ishaan Reddy, owner (3 items), ID verified
- `shreya.sector503@kirayo.test` — Shreya Banerjee, owner (3 items), ID verified

**Sector 62**

- `dev.sector62@kirayo.test` — Dev Khan, owner (2 items), ID verified
- `kabir.sector622@kirayo.test` — Kabir Sinha, owner (2 items), ID verified

**Sector 76**

- `aditya.sector762@kirayo.test` — Aditya Malhotra, owner (2 items), ID verified
- `kabir.sector76@kirayo.test` — Kabir Khan, owner (2 items), ID verified

**Sector 137**

- `ananya.sector1372@kirayo.test` — Ananya Menon, owner (3 items), ID verified
- `ishaan.sector137@kirayo.test` — Ishaan Joshi, owner (2 items), ID verified

**Greater Noida West**

- `aarav.greaternoidawest2@kirayo.test` — Aarav Mehta, owner (4 items), ID verified
- `aisha.greaternoidawest@kirayo.test` — Aisha Patel, owner (3 items), ID verified
- `ishaan.greaternoidawest3@kirayo.test` — Ishaan Gill, owner (2 items), ID verified

### Gurugram

**Palam Vihar**

- `neel.palamvihar2@kirayo.test` — Neel Malhotra, owner (2 items), ID verified
- `sana.palamvihar@kirayo.test` — Sana Sharma, owner (3 items), ID verified

**DLF Phase 3**

- `kabir.dlfphase3@kirayo.test` — Kabir Verma, owner (2 items), ID verified
- `kavya.dlfphase32@kirayo.test` — Kavya Reddy, owner (2 items), ID verified

**Cyber City**

- `dev.cybercity2@kirayo.test` — Dev Mehta, owner (3 items), ID verified
- `diya.cybercity@kirayo.test` — Diya Gill, owner (2 items), ID verified

**DLF Phase 1**

- `nisha.dlfphase12@kirayo.test` — Nisha Mehta, owner (2 items), ID verified
- `omkar.dlfphase13@kirayo.test` — Omkar Chopra, owner (2 items), ID verified
- `vivek.dlfphase1@kirayo.test` — Vivek Nair, owner (3 items), ID verified

**Golf Course Road**

- `gauri.golfcourseroad3@kirayo.test` — Gauri Gill, owner (2 items), ID verified
- `harsh.golfcourseroad@kirayo.test` — Harsh Bose, owner (3 items), ID verified
- `tanvi.golfcourseroad2@kirayo.test` — Tanvi Sharma, owner (2 items), ID verified

**Sector 56**

- `nikhil.sector56@kirayo.test` — Nikhil Jain, owner (3 items), ID verified
- `shreya.sector562@kirayo.test` — Shreya Malhotra, owner (2 items), ID verified
- `siddharth.sector563@kirayo.test` — Siddharth Nair, owner (3 items), ID verified

**Sohna Road**

- `manav.sohnaroad2@kirayo.test` — Manav Mehta, owner (3 items), ID verified
- `neel.sohnaroad@kirayo.test` — Neel Iyer, owner (3 items), ID verified
- `sana.sohnaroad3@kirayo.test` — Sana Verma, owner (3 items), ID verified

### Pune

**Aundh**

- `aarav.aundh2@kirayo.test` — Aarav Patel, owner (3 items), ID verified
- `isha.aundh@kirayo.test` — Isha Deshmukh, owner (2 items), ID verified

**Baner**

- `kabir.baner2@kirayo.test` — Kabir Deshmukh, owner (3 items), ID verified
- `kavya.baner@kirayo.test` — Kavya Menon, owner (3 items), ID verified

**Hinjewadi**

- `gauri.hinjewadi2@kirayo.test` — Gauri Bhat, owner (3 items), ID verified
- `ishaan.hinjewadi@kirayo.test` — Ishaan Sharma, owner (3 items), ID verified
- `kabir.hinjewadi3@kirayo.test` — Kabir Deshmukh, owner (2 items), ID verified

**Kothrud**

- `aarav.kothrud3@kirayo.test` — Aarav Khan, owner (2 items), ID verified
- `lavanya.kothrud2@kirayo.test` — Lavanya Patel, owner (2 items), ID verified
- `priya.kothrud@kirayo.test` — Priya Mehta, owner (2 items), ID verified

**Koregaon Park**

- `siddharth.koregaonpark@kirayo.test` — Siddharth Chopra, owner (3 items), ID verified
- `vivek.koregaonpark2@kirayo.test` — Vivek Kapoor, owner (2 items), ID verified

**Kalyani Nagar**

- `kabir.kalyaninagar@kirayo.test` — Kabir Iyer, owner (2 items), ID verified
- `siddharth.kalyaninagar2@kirayo.test` — Siddharth Menon, owner (3 items), ID verified

**Viman Nagar**

- `kabir.vimannagar2@kirayo.test` — Kabir Chopra, owner (3 items), ID verified
- `rahul.vimannagar3@kirayo.test` — Rahul Verma, owner (3 items), ID verified
- `vivek.vimannagar@kirayo.test` — Vivek Kulkarni, owner (2 items), ID verified

**Hadapsar**

- `aisha.hadapsar2@kirayo.test` — Aisha Khan, owner (3 items), ID verified
- `manav.hadapsar@kirayo.test` — Manav Kapoor, owner (3 items), ID verified
