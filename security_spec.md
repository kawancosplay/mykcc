# Security Specification for KawanCosplay Member Portal

## 1. Data Invariants
1. Members collection (`/members/{memberId}`):
   - Public can submit registration to become a member (create operation) with valid fields conforming to constraints.
   - Any read must return valid member listings, while write / update / deletion operations are restricted to admin or the owner.
   - Admin (`cosplaysehat@gmail.com`) can verify, update, or delete member records.
   - Input fields must enforce strict size bounds (`fullName <= 100`, `cosplayName <= 60`, `email <= 120`, `city <= 60`).
2. Sync logs collection (`/sync_logs/{logId}`):
   - Logs can be created upon synchronizing Google Forms / Google Sheets data.
   - Read is open for the community dashboard / admin sync status.
   - No unauthorized deletion or tampering.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1: Giant FullName Injection (DoS attack)**
   `{ "fullName": "A".repeat(1000), "email": "test@test.com", "cosplayName": "Hero" }` -> REJECT
2. **Payload 2: Missing Required Email**
   `{ "fullName": "Cosplayer One", "cosplayName": "Sailor" }` -> REJECT
3. **Payload 3: Giant Cosplay Name**
   `{ "fullName": "Valid Name", "cosplayName": "C".repeat(500), "email": "a@b.com" }` -> REJECT
4. **Payload 4: Invalid Member Document ID with malicious characters**
   Doc ID `../../root/etc/passwd` or illegal characters -> REJECT
5. **Payload 5: Attempting to assign unverified role injection**
   `{ "isAdmin": true, "role": "superadmin" }` -> REJECT
6. **Payload 6: Corrupted Status State Shortcutting**
   `{ "status": 99999 }` -> REJECT
7. **Payload 7: Giant Phone Number Payload**
   `{ "phone": "0812".repeat(100) }` -> REJECT
8. **Payload 8: Non-string Member Number**
   `{ "memberNumber": ["KC-001", "KC-002"] }` -> REJECT
9. **Payload 9: Giant Avatar URL Buffer Overflow attempt**
   `{ "avatarUrl": "data:image/png;base64," + "A".repeat(50000) }` -> REJECT
10. **Payload 10: SyncLog Negative Count**
    `{ "importedCount": -999, "source": "fake" }` -> REJECT
11. **Payload 11: SyncLog Missing Timestamp**
    `{ "importedCount": 10, "source": "test" }` -> REJECT
12. **Payload 12: Unauthorized Batch Deletion of All Members by Anonymous User**
    DELETE `/members/KC-1` without auth/admin rights -> REJECT
