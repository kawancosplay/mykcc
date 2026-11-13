import type { IncomingMessage, ServerResponse } from 'node:http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase for serverless
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const dbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId;

let db: Firestore;
try {
  db = initializeFirestore(app, { ignoreUndefinedProperties: true }, dbId);
} catch {
  db = getFirestore(app, dbId);
}

// Field limits conforming to firestore.rules
const LIMITS = {
  name: 80,
  fullName: 120,
  email: 120,
  phone: 30,
  discordUsername: 40,
  ageCategory: 50,
  age: 30,
  birthday: 30,
  country: 80,
  province: 80,
  city: 80,
  primaryRole: 120,
  fandom: 160,
  experience: 60,
  socialMedia: 500,
  portfolioUrl: 300,
  reason: 1000,
};

function cleanStr(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function normalizeDigits(val: string): string {
  return val.replace(/\D/g, '');
}

function parseNamedValues(data: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    const key = k.toLowerCase().trim();
    const strVal = Array.isArray(v) ? (v[0] ? String(v[0]).trim() : '') : v ? String(v).trim() : '';

    if (!result.name && (key.includes('cosplay') || key.includes('nickname') || key.includes('nama panggung') || key === 'name' || key === 'nama')) {
      result.name = strVal;
    } else if (!result.fullName && (key.includes('lengkap') || key.includes('full name') || key.includes('legal name'))) {
      result.fullName = strVal;
    } else if (!result.phone && (key.includes('whatsapp') || key.includes('wa') || key.includes('telepon') || key.includes('phone') || key.includes('nomor hp'))) {
      result.phone = strVal;
    } else if (!result.email && (key.includes('email') || key.includes('surel'))) {
      result.email = strVal;
    } else if (!result.city && (key.includes('kota') || key.includes('kabupaten') || key.includes('city') || key.includes('domisili'))) {
      result.city = strVal;
    } else if (!result.province && (key.includes('provinsi') || key.includes('province') || key.includes('state'))) {
      result.province = strVal;
    } else if (!result.country && (key.includes('negara') || key.includes('country'))) {
      result.country = strVal;
    } else if (!result.ageCategory && (key.includes('kategori usia') || key.includes('status usia') || key.includes('age category') || key.includes('minor'))) {
      result.ageCategory = strVal;
    } else if (!result.age && (key.includes('usia') || key.includes('umur') || key.includes('age'))) {
      result.age = strVal;
    } else if (!result.birthday && (key.includes('tanggal lahir') || key.includes('tgl lahir') || key.includes('birthday') || key.includes('birth date'))) {
      result.birthday = strVal;
    } else if (!result.primaryRole && (key.includes('peran') || key.includes('role'))) {
      result.primaryRole = strVal;
    } else if (!result.fandom && (key.includes('fandom') || key.includes('anime') || key.includes('game'))) {
      result.fandom = strVal;
    } else if (!result.experience && (key.includes('pengalaman') || key.includes('experience'))) {
      result.experience = strVal;
    } else if (!result.socialMedia && (key.includes('sosial') || key.includes('social') || key.includes('instagram') || key.includes('tiktok') || key.includes('medsos'))) {
      result.socialMedia = strVal;
    } else if (!result.portfolioUrl && (key.includes('portofolio') || key.includes('portfolio') || key.includes('drive'))) {
      result.portfolioUrl = strVal;
    } else if (!result.reason && (key.includes('alasan') || key.includes('harapan') || key.includes('reason'))) {
      result.reason = strVal;
    } else if (!result.discordUsername && (key.includes('discord'))) {
      result.discordUsername = strVal;
    } else if (!result.timestamp && (key.includes('timestamp') || key.includes('waktu'))) {
      result.timestamp = strVal;
    }
  }
  return result;
}

export async function processSyncPayload(body: any): Promise<{
  success: boolean;
  message: string;
  processed: number;
  created: number;
  updated: number;
}> {
  let itemsToSync: Record<string, string>[] = [];

  if (body && typeof body === 'object') {
    if (Array.isArray(body.rows) && body.rows.length > 0) {
      const headers = (body.rows[0] || []).map((h: string) => String(h || '').trim());
      for (let i = 1; i < body.rows.length; i++) {
        const row = body.rows[i];
        if (!Array.isArray(row)) continue;
        const rowObj: Record<string, string> = {};
        headers.forEach((h: string, idx: number) => {
          rowObj[h] = row[idx] ? String(row[idx]).trim() : '';
        });
        itemsToSync.push(parseNamedValues(rowObj));
      }
    } else if (body.data && typeof body.data === 'object') {
      itemsToSync.push(parseNamedValues(body.data));
    } else if (body.namedValues && typeof body.namedValues === 'object') {
      itemsToSync.push(parseNamedValues(body.namedValues));
    } else if (body.phone || body.name) {
      itemsToSync.push(parseNamedValues(body));
    }
  }

  if (itemsToSync.length === 0) {
    return {
      success: true,
      message: 'No records to sync in payload',
      processed: 0,
      created: 0,
      updated: 0,
    };
  }

  let created = 0;
  let updated = 0;

  for (const item of itemsToSync) {
    const rawName = item.name || item.fullName || '';
    const rawPhone = item.phone || '';
    if (!rawName.trim() && !rawPhone.trim()) continue;

    const phoneDigits = normalizeDigits(rawPhone);
    const email = cleanStr(item.email || '', LIMITS.email).toLowerCase();

    // Check for existing member by phone or email
    let existingDoc: { id: string; data: Record<string, any> } | null = null;

    if (phoneDigits) {
      const qPhone = query(collection(db, 'members'), where('phone', '==', cleanStr(rawPhone, LIMITS.phone)));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        existingDoc = { id: snapPhone.docs[0].id, data: snapPhone.docs[0].data() };
      }
    }

    if (!existingDoc && email) {
      const qEmail = query(collection(db, 'members'), where('email', '==', email));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        existingDoc = { id: snapEmail.docs[0].id, data: snapEmail.docs[0].data() };
      }
    }

    if (existingDoc) {
      // Update existing member (age status only fills a blank)
      const patch: Record<string, any> = {};
      const current = existingDoc.data;

      if (!current.ageCategory && item.ageCategory) {
        patch.ageCategory = cleanStr(item.ageCategory, LIMITS.ageCategory);
      }
      if (!current.birthday && item.birthday) {
        patch.birthday = cleanStr(item.birthday, LIMITS.birthday);
      }
      if (!current.age && item.age) {
        patch.age = cleanStr(item.age, LIMITS.age);
      }
      if (item.discordUsername && !current.discordUsername) {
        patch.discordUsername = cleanStr(item.discordUsername, LIMITS.discordUsername);
      }
      if (item.socialMedia && !current.socialMedia) {
        patch.socialMedia = cleanStr(item.socialMedia, LIMITS.socialMedia);
      }
      if (item.portfolioUrl && !current.portfolioUrl) {
        patch.portfolioUrl = cleanStr(item.portfolioUrl, LIMITS.portfolioUrl);
      }
      if (item.reason && !current.reason) {
        patch.reason = cleanStr(item.reason, LIMITS.reason);
      }

      if (Object.keys(patch).length > 0) {
        await updateDoc(doc(db, 'members', existingDoc.id), patch);
        updated++;
      }
    } else {
      // Create new member via counter transaction
      const counterRef = doc(db, 'counters', 'kccId');
      const newDocId = `kc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const memberDocRef = doc(db, 'members', newDocId);

      await runTransaction(db, async (txn) => {
        const counterSnap = await txn.get(counterRef);
        let nextNumber = 101;
        if (counterSnap.exists()) {
          const cData = counterSnap.data();
          nextNumber = (Number(cData.last) || 100) + 1;
        }

        const kccId8 = String(nextNumber).padStart(8, '0');
        const cardDocRef = doc(db, 'memberCards', kccId8);

        const name = cleanStr(rawName, LIMITS.name) || 'KCC Member';
        const fullName = cleanStr(item.fullName || rawName, LIMITS.fullName) || name;
        const phone = cleanStr(rawPhone, LIMITS.phone) || '';
        const city = cleanStr(item.city || 'Worldwide', LIMITS.city) || 'Worldwide';
        const province = cleanStr(item.province || '', LIMITS.province);
        const country = cleanStr(item.country || 'Indonesia', LIMITS.country) || 'Indonesia';
        const primaryRole = cleanStr(item.primaryRole || '', LIMITS.primaryRole);
        const fandom = cleanStr(item.fandom || '', LIMITS.fandom);
        const ageCategory = cleanStr(item.ageCategory || '', LIMITS.ageCategory);
        const age = cleanStr(item.age || '', LIMITS.age);
        const birthday = cleanStr(item.birthday || '', LIMITS.birthday);
        const socialMedia = cleanStr(item.socialMedia || '', LIMITS.socialMedia);
        const portfolioUrl = cleanStr(item.portfolioUrl || '', LIMITS.portfolioUrl);
        const reason = cleanStr(item.reason || '', LIMITS.reason);
        const discordUsername = cleanStr(item.discordUsername || '', LIMITS.discordUsername);
        const experience = cleanStr(item.experience || '', LIMITS.experience);
        const createdAt = item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString();

        const memberPayload: Record<string, any> = {
          userId16: kccId8,
          name,
          cosplayName: name,
          fullName,
          phone,
          city,
          country,
          source: 'google_form_sync',
          status: 'verified',
          createdAt,
        };

        if (email) memberPayload.email = email;
        if (province) memberPayload.province = province;
        if (primaryRole) memberPayload.primaryRole = primaryRole;
        if (fandom) memberPayload.fandom = fandom;
        if (ageCategory) memberPayload.ageCategory = ageCategory;
        if (age) memberPayload.age = age;
        if (birthday) memberPayload.birthday = birthday;
        if (socialMedia) memberPayload.socialMedia = socialMedia;
        if (portfolioUrl) memberPayload.portfolioUrl = portfolioUrl;
        if (reason) memberPayload.reason = reason;
        if (discordUsername) memberPayload.discordUsername = discordUsername;
        if (experience) memberPayload.experience = experience;

        const cardPayload: Record<string, any> = {
          userId16: kccId8,
          name,
          cosplayName: name,
          city,
          country,
          status: 'verified',
          createdAt,
        };
        if (primaryRole) cardPayload.primaryRole = primaryRole;

        // Transaction writes
        txn.set(counterRef, {
          last: nextNumber,
          lastId: kccId8,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        txn.set(memberDocRef, memberPayload);
        txn.set(cardDocRef, cardPayload);
      });

      created++;
    }
  }

  // Record audit in sync_logs
  try {
    const logId = `sync_${Date.now()}`;
    await setDoc(doc(db, 'sync_logs', logId), {
      id: logId,
      syncedAt: new Date().toISOString(),
      status: 'SUCCESS',
      recordsCount: created + updated,
      type: 'AUTO_SYNC',
      details: `Background webhook sync: ${created} created, ${updated} updated from ${itemsToSync.length} items.`,
    });
  } catch (logErr) {
    console.error('Failed to write sync log:', logErr);
  }

  return {
    success: true,
    message: `Background sync processed ${itemsToSync.length} items: ${created} created, ${updated} updated`,
    processed: itemsToSync.length,
    created,
    updated,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const result = await processSyncPayload(req.body);
    return res.status(200).json(result);
  } catch (err: unknown) {
    console.error('Webhook sync processing error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown sync error',
      success: false,
    });
  }
}
