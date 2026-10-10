# Security Specification for KawanCosplay Member Portal

Rules file: `firestore.rules`, published to the NAMED database
`ai-studio-kawancosplaymemb-f672c087-2a65-4410-827e-a10092d7e040` (see `firebase.json`).
Publishing to `(default)` has no effect on the app. Console: Firestore Database > database dropdown >
`ai-studio-kawancosplaymemb-...` > Rules > Publish, or `firebase deploy --only firestore:rules`.

## 0. Roles
- **Admin**: Firebase user whose token has `email == cosplaysehat@gmail.com` AND `email_verified == true`,
  or any user with an `/admins/{uid}` document (created by the owner in the Firebase console only).
  There is no passkey; the client checks the same two conditions (`admins/{uid}` via `getDoc`).
- **Owner**: signed-in user whose uid equals the member document's `authUid`.
- **Public**: anyone, including anonymous visitors.

## 1. Data Invariants
1. Members (`/members/{memberId}`) hold personal data (phone, email, age, birthday, Discord, reason):
   - Never readable by the public or by other members. `get`: admin, owner, the user whose uid is the
     doc id, or a verified-email user whose email matches. `list`: admin, or queries constrained to
     `where('authUid','==',uid)` / `where('email','==',<verified token email>)`.
   - `create` (public registration allowed): schema-valid, only known keys, `userId16` is 16 digits and
     NOT in the reserved range `0000000000000000..0000000000000100` unless the writer is admin, doc id is
     `kc_...` or the writer's own uid, `authUid` absent or equal to the writer's uid.
   - `update`: admin; owner may change profile fields only (never `userId16`, `authUid`, `email`,
     `source`, `status`, `createdAt`); a verified-email user whose email matches may set only
     `authUid` to their own uid (account linking).
   - `delete`: admin only.
   - Size bounds: `cosplayName/name <= 80`, `fullName <= 100`, `email <= 120`, `city/country/province <= 80`,
     `primaryRole <= 120`, `fandom <= 80`, `phone <= 30`, `discordUsername <= 60`, `socialMedia <= 120`,
     `portfolioUrl <= 300`, `reason <= 500`, `age/ageCategory/experience <= 50`, `createdAt` ISO string.
2. Member cards (`/memberCards/{userId16}`) are the PUBLIC projection used by the KCC ID lookup:
   - Only `userId16, cosplayName, primaryRole, city, country, status, createdAt`, optional `avatarUrl`
     (<= 400000 chars) and optional `ownerUid`. Doc id must equal `userId16`.
   - `get`: public. `list`: denied for everyone (lookup is by exact 16-digit ID only).
   - `create`: reserved IDs only by admin; `ownerUid` absent or the writer's uid.
   - `update`: admin, or the card owner without changing `ownerUid`, `status`, `createdAt`.
   - `delete`: admin only.
3. Photos (`/photos/{photoId}`): public `get`; `list` only with `limit <= 100`; `create` requires sign-in,
   `authorUid == auth.uid`, schema-valid (`authorName <= 60`, `event <= 100`, ...), `likesCount` 0;
   non-admin `update` may only increment `likesCount` by exactly 1; `delete` by admin or the author.
4. Sync logs (`/sync_logs/{logId}`): admin only (read, create with schema, update, delete).
5. Site settings (`/siteSettings/{id}`): public `get`, admin write.
6. Admins (`/admins/{uid}`): a user may `get` their own doc; no client writes.
7. Everything else: denied.

## 2. The "Dirty Dozen" Payloads
1. **Giant name** `{ "cosplayName": "A".repeat(1000), ... }` -> REJECT (size bound)
2. **Missing required fields** `{ "cosplayName": "Sailor" }` -> REJECT (`hasAll`)
3. **Unknown key injection** `{ ..., "isAdmin": true }` on create -> REJECT (`hasOnly`)
4. **Malicious document id** `../../root/etc/passwd` -> REJECT (`isValidId`)
5. **Reserved KCC ID from the public form** `{ "userId16": "0000000000000000" }` or `"0000000000000001"` by a non-admin -> REJECT
6. **Corrupt status** `{ "status": 99999 }` or `"superadmin"` -> REJECT (enum)
7. **Anonymous list of members** `GET /members` without admin -> REJECT
8. **Member reads another member's doc** -> REJECT (not owner, email mismatch / unverified)
9. **Owner rewrites own KCC ID or status** `{ "userId16": "...", "status": "active" }` -> REJECT (locked keys)
10. **Like inflation** photo `likesCount: old + 50` or touching other fields -> REJECT
11. **Anonymous sync log** create without admin -> REJECT
12. **Anonymous batch deletion / purge of members or cards** -> REJECT (admin only)
