# Security Specification for KawanCosplay Member Portal

Rules file: `firestore.rules`, published to the NAMED database
`ai-studio-kawancosplaymemb-f672c087-2a65-4410-827e-a10092d7e040` (see `firebase.json`).
Publishing to `(default)` has no effect on the app. Console: Firestore Database > database dropdown >
`ai-studio-kawancosplaymemb-...` > Rules > Publish, or `firebase deploy --only firestore:rules`.

Sprint 3 rules (8-digit KCC ID, admin management, dashboard lock, audit log) are written so they can be
published BEFORE the sprint-3 code goes live: the sprint-2 code keeps working until the 8-digit switch.
Deploy order: (1) publish these rules, (2) then promote/merge the sprint-3 build (a sprint-3 build on older rules
fails: admin panel, dashboard lock, audit log, 8-digit registration), (3) reload every admin device, (4) admin run
order: merge duplicates -> fix registration dates -> switch to 8-digit KCC IDs. Never roll the site back to a
sprint-2 build after the switch (its registration is denied and its ID repair treats 8-digit IDs as invalid).

## 0. Roles
- **Main account**: Firebase user whose token has `email == cosplaysehat@gmail.com` AND `email_verified == true`.
  Always admin; cannot be removed; the only account that may write `adminSettings/dashboardLock`.
- **Admin**: the main account, or any user with an `/admins/{uid}` document. Any admin may add or remove
  admins from the app (strict schema, see 1.9). There is no passkey; the client checks the same two conditions
  (`admins/{uid}` via `getDoc`).
- **Owner**: signed-in user whose uid equals the member document's `authUid`.
- **Public**: anyone, including anonymous visitors.

## 1. Data Invariants

### KCC ID (stored in the field `userId16` on members, memberCards and photos)
- 8 digits (current): `00000000` main account, `00000001`..`00000100` admin range, members from `00000101`,
  issued by `/counters/kccId`. 16 digits (legacy): `0000000000000000`..`0000000000000100` reserved.
- Reserved IDs (both formats) are written by admins only.
- **The 8-digit switch** = `/counters/kccId` exists. Before it, public registrations use 16-digit IDs (never
  `00000000xxxxxxxx`). After it, nobody (also no admin) may write a NEW 16-digit ID: member create, a changed
  member `userId16`, card create.
- A public 8-digit ID is valid only when the counter moves to exactly that ID in the same write
  (`getAfter(counter).lastId == id && get(counter).lastId != id`), and the counter moves only by +1 together with
  the creation of that ID's card (`!exists(card) && existsAfter(card)`).

1. Members (`/members/{memberId}`) hold personal data (phone, email, age, birthday, Discord, reason):
   - Never readable by the public or by other members. `get`: admin, owner, the user whose uid is the
     doc id, or a verified-email user whose email matches. `list`: admin, or queries constrained to
     `where('authUid','==',uid)` / `where('email','==',<verified token email>)`.
   - `create`: admin (any schema-valid doc, reserved IDs allowed, no new 16-digit ID after the switch), or
     public registration: schema-valid, only known keys (no `legacyUserId16`), KCC ID not reserved and claimed
     as described above, doc id is `kc_...` or the writer's own uid, `authUid` absent or equal to the writer's uid.
   - `update`: admin (no new 16-digit `userId16` after the switch); owner may change profile fields only (never
     `userId16`, `legacyUserId16`, `authUid`, `email`, `source`, `status`, `createdAt`); a verified-email user
     whose email matches may set only `authUid` to their own uid (account linking).
   - `delete`: admin only.
   - Size bounds: `cosplayName/name <= 80`, `fullName <= 100`, `email <= 120`, `city/country/province <= 80`,
     `primaryRole <= 120`, `fandom <= 80`, `phone <= 30`, `phone2 <= 30`, `additionalPhones` a list of at
     most 3 strings of `<= 30` each, `discordUsername <= 60`, `socialMedia <= 120`,
     `portfolioUrl <= 300`, `reason <= 500`, `age/ageCategory/experience <= 50`, `createdAt` ISO string,
     `userId16` 8 or 16 digits, `legacyUserId16` 16 digits (admin migration only).
     `phone2` and `additionalPhones` are owner-editable profile fields.
2. Member cards (`/memberCards/{kccId}`) are the PUBLIC projection used by the KCC ID lookup:
   - Only `userId16, cosplayName, primaryRole, city, country, status, createdAt`, optional `avatarUrl`
     (<= 400000 chars) and optional `ownerUid`. Doc id must equal `userId16` (8 or 16 digits).
   - `get`: public. `list`: denied for everyone (lookup is by exact ID only).
   - `create`: admin (no new 16-digit card after the switch); public: not reserved, claimed as above,
     `ownerUid` absent or the writer's uid.
   - `update`: admin, or the card owner without changing `ownerUid`, `status`, `createdAt`.
   - `delete`: admin only.
3. Card aliases (`/memberCardAliases/{old16}` = `{ kccId: 8 digits, createdAt }`): public `get`, `list` denied,
   admin create/update/delete. Written by the 8-digit migration for every old 16-digit ID.
4. Counter (`/counters/kccId` = `{ last: int 100..99999999, lastId: last zero-padded to 8 digits, planEnd?: int <=
   last, updatedAt?: string }`): public `get`, `list` denied; `create`: admin; `update`: admin (never backwards) or
   the bound +1 claim (only `last`, `lastId`, `updatedAt` change); `delete`: nobody (console only — deleting it
   would reopen the 16-digit path).
5. Photos (`/photos/{photoId}`): public `get`; `list` only with `limit <= 100` (paged queries use `startAfter`);
   `create` requires sign-in, `authorUid == auth.uid`, schema-valid (`authorName` 1..100,
   `character/series <= 100`, `event <= 120`, `photographer <= 100`, `caption <= 1000`, `title <= 120`, ...),
   `likesCount` 0; non-admin `update` may only increment `likesCount` by exactly 1; `delete` by admin or the author.
6. Sync logs (`/sync_logs/{logId}`): admin only (read, create with schema, update, delete).
7. Site settings (`/siteSettings/{id}`): public `get`, admin write.
8. Admin settings (`/adminSettings/dashboardLock` = `{ algorithm: 'PBKDF2-SHA256', hash: base64 32 bytes,
   salt: base64 >= 16 bytes, iterations: int 100000..2000000, updatedAt == request.time, updatedBy == auth.uid }`):
   admin `get`, `list` denied, create/update/delete by the main account only. Other ids under `adminSettings`
   are denied. The dashboard lock is a convenience lock for unattended devices; these rules are the real protection.
9. Admins (`/admins/{uid}`): `get` own doc or any admin; `list` admin; `create` any admin with exactly
   `{ memberId, email?, name?, addedBy == auth.uid, addedByEmail? == token email, addedAt == request.time }` where
   `members/{memberId}.authUid == uid`; `update` denied; `delete` any admin. The main account is admin by email
   and has no removable doc.
10. Admin logs (`/adminLogs/{logId}`): admin `get`/`list`; admin `create` with `action` from the fixed list,
    `actorUid == auth.uid`, `actorEmail` absent or the token email, `at == request.time`, optional `targetType`
    (`member|admin|photo|settings|bulk`), `targetId <= 128`, `targetLabel <= 120`, `details <= 1000`, `count` int
    >= 0; `update`/`delete` denied (append-only). Logs are written by the acting admin's client (best effort).
11. Everything else: denied.

### Rules cost limits
At most 10 `exists()/get()/getAfter()` per operation and 20 per request. `isAdmin()` costs one `exists()` for an
`admins/{uid}` admin (0 for the main account) and is evaluated first wherever the non-admin branch reads documents.
Admin batches stay at <= 15 operations (`ADMIN_BATCH_SIZE`). A public 8-digit registration (counter + card + member)
costs 6 calls (9 when signed in).

## 2. The "Dirty Dozen" Payloads (+ sprint 3)
1. **Giant name** `{ "cosplayName": "A".repeat(1000), ... }` -> REJECT (size bound)
2. **Missing required fields** `{ "cosplayName": "Sailor" }` -> REJECT (`hasAll`)
3. **Unknown key injection** `{ ..., "isAdmin": true }` on create -> REJECT (`hasOnly`)
4. **Malicious document id** `../../root/etc/passwd` -> REJECT (`isValidId`)
5. **Reserved KCC ID from the public form** `{ "userId16": "0000000000000000" }`, `"0000000000000001"`,
   `"00000000"`, `"00000042"` by a non-admin -> REJECT
6. **Corrupt status** `{ "status": 99999 }` or `"superadmin"` -> REJECT (enum)
7. **Anonymous list of members** `GET /members` without admin -> REJECT
8. **Member reads another member's doc** -> REJECT (not owner, email mismatch / unverified)
9. **Owner rewrites own KCC ID or status** `{ "userId16": "...", "status": "active" }` -> REJECT (locked keys)
10. **Like inflation** photo `likesCount: old + 50` or touching other fields -> REJECT
11. **Anonymous sync log** create without admin -> REJECT
12. **Anonymous batch deletion / purge of members or cards** -> REJECT (admin only)
13. **Chosen 8-digit ID without the counter** public create of member/card `"00000777"` without moving the counter
    to `00000777` in the same write -> REJECT
14. **Counter jump / burn** non-admin counter update `last + 2`, or `+1` without creating the card of the new ID,
    or changing `planEnd`, or `lastId` not equal to `last` -> REJECT; counter delete by anyone -> REJECT
15. **16-digit ID after the switch** (counter exists) public or admin create of `"2026101312000001"`, or an admin
    update that sets a member's `userId16` to a new 16-digit value -> REJECT
16. **Shadow ID** public 16-digit `"0000000000000777"` (would shadow `00000777`) -> REJECT
17. **Alias forgery** non-admin create of `memberCardAliases/{x}`; any `list` on aliases -> REJECT
18. **Self-promotion** non-admin create of `admins/{ownUid}`; admin create with `addedBy` of someone else, a client
    `addedAt`, extra keys, or a `memberId` whose `authUid` is not the new admin's uid; any `update` -> REJECT
19. **Lock takeover** non-main admin writes `adminSettings/dashboardLock`; main account writes a plain password or
    extra keys, `iterations < 100000`, or another `adminSettings` id -> REJECT
20. **Audit log tampering** update/delete of `adminLogs/*`; create with someone else's `actorUid`, a client
    timestamp, an unknown action, or by a non-admin -> REJECT
