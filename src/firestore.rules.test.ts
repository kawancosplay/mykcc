/**
 * Test specification for firestore.rules
 * Evaluates Dirty Dozen payloads against rule logic
 */
export const testDirtyDozenCases = [
  { name: 'Oversized FullName', payload: { fullName: 'A'.repeat(1000) }, expected: 'PERMISSION_DENIED' },
  { name: 'Missing Required Email', payload: { fullName: 'Cosplayer One' }, expected: 'PERMISSION_DENIED' },
  { name: 'Oversized Cosplay Name', payload: { cosplayName: 'C'.repeat(500) }, expected: 'PERMISSION_DENIED' },
  { name: 'Illegal ID characters', id: '../../root/id', expected: 'PERMISSION_DENIED' },
  { name: 'Illegal Role Escalation', payload: { isAdmin: true }, expected: 'PERMISSION_DENIED' },
  { name: 'Corrupt Status Type', payload: { status: 99999 }, expected: 'PERMISSION_DENIED' },
];
