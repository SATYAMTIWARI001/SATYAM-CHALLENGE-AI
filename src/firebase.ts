import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocFromServer,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
// CRITICAL: Must use the firestoreDatabaseId from the configuration if available, otherwise default
const databaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');

export let cachedAccessToken: string | null = null;
export let authenticatedUser: User | null = null;

export const signInWithGoogleGmail = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    authenticatedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In with Gmail scope failed:', error);
    throw error;
  }
};

export async function sendCertificateEmail(recipient: string, name: string, certId: string, turns: number, dateString: string) {
  if (!cachedAccessToken) {
    throw new Error('No active Gmail authorization. Please authorize first.');
  }
  
  const emailLines = [
    `To: ${recipient}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent('👑 Your Official Elite Supporter Certificate has been Secured!')))}?=`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    `
    <div style="font-family: Arial, sans-serif; background-color: #09051d; color: #ffffff; padding: 40px; border-radius: 20px; max-width: 600px; margin: 0 auto; border: 2px solid #fbbf24;">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 50px;">👑</span>
        <h2 style="color: #fbbf24; margin-top: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">The Satyam Challenge</h2>
        <p style="color: #a78bfa; font-size: 11px; font-weight: bold; letter-spacing: 2px;">ELITE CREDENTIAL VERIFICATION SYSTEM</p>
      </div>
      
      <div style="background-color: #050512; padding: 30px; border-radius: 15px; border: 1px solid rgba(251, 191, 36, 0.2); margin-bottom: 30px; text-align: center; position: relative; overflow: hidden;">
        <p style="color: #fbbf24; font-size: 10px; font-family: monospace; letter-spacing: 1px; margin-bottom: 15px; font-weight: bold;">THIS HONORARY DOCUMENT OFFICIALLY CERTIFIES</p>
        <h1 style="color: #ffffff; font-size: 30px; font-weight: 900; margin: 10px 0; letter-spacing: 1px; text-shadow: 0 0 10px rgba(251, 191, 36, 0.3); text-transform: uppercase;">${name}</h1>
        <div style="width: 150px; height: 2px; background-color: #fbbf24; margin: 15px auto;"></div>
        <p style="color: #e2e8f0; font-size: 13px; line-height: 1.6; margin-top: 15px;">
          who has successfully passed every logic-defying stage of <strong>The Satyam Challenge</strong> with divine trust & absolute perseverance. They have formally established their immortal loyalty and been verified as an elite advocate in the sacred archives of creator <strong>Satyam Tiwari</strong>.
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; font-family: monospace;">
        <tr>
          <td style="color: #94a3b8; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">REGISTRY SEQUENCE:</td>
          <td style="color: #fbbf24; text-align: right; font-weight: bold; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">${certId}</td>
        </tr>
        <tr>
          <td style="color: #94a3b8; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">POWER LEVEL:</td>
          <td style="color: #c084fc; text-align: right; font-weight: bold; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">9999+</td>
        </tr>
        <tr>
          <td style="color: #94a3b8; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">INTEGRITY CHECK:</td>
          <td style="color: #34d399; text-align: right; font-weight: bold; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">100% SECURE</td>
        </tr>
        <tr>
          <td style="color: #94a3b8; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">TIMESTAMP SECURED:</td>
          <td style="color: #38bdf8; text-align: right; font-weight: bold; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">${dateString}</td>
        </tr>
      </table>

      <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px; font-size: 11px; display: table; width: 100%;">
        <div style="display: table-cell; width: 50%; text-align: left;">
          <p style="color: #fbbf24; font-weight: bold; margin: 0; text-transform: uppercase;">Candidate Account</p>
          <p style="color: #e2e8f0; margin: 2px 0 0 0; font-family: monospace;">${recipient}</p>
        </div>
        <div style="display: table-cell; width: 50%; text-align: right;">
          <p style="color: #c084fc; font-weight: bold; margin: 0; text-transform: uppercase;">Issuing Authority</p>
          <p style="color: #fbbf24; font-weight: bold; font-family: monospace; font-size: 13px; margin: 2px 0 0 0;">Satyam Tiwari</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 35px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px;">
        <p style="color: #64748b; font-size: 10px; margin-bottom: 0;">This email was securely delivered utilizing official Google Gmail APIs.</p>
      </div>
    </div>
    `
  ];
  
  const rawBase64 = btoa(unescape(encodeURIComponent(emailLines.join('\r\n'))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: rawBase64,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gmail Send API returned error: ${errText}`);
  }

  return response.json();
}

// Trigger anonymous auth in the background immediately
signInAnonymously(auth)
  .then((userCredential) => {
    console.log('Anonymous login successful:', userCredential.user.uid);
  })
  .catch((error) => {
    if (error && error.code === 'auth/admin-restricted-operation') {
      console.warn('Anonymous login restricted as expected. Users will sign in via Google OAuth for sending emails.');
    } else {
      console.warn('Optional anonymous login bypassed:', error?.message || error);
    }
  });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Global robust error handler with required JSON-stringified structure for system diagnostics
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connectivity immediately upon initialization
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'supporters', 'connection_tester'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your database connectivity or offline state:", error.message);
    }
  }
}
testConnection();

// Supporter definition including requested schema fields
export interface SupporterRecord {
  id?: string;
  name: string;
  email: string;
  turns: number;
  respectRank: string;
  powerLevel: string;
  rank: string;
  score: number;
  completedAt: string; // ISO String representation
  certificateId: string;
  createdAt: any; // Firestore serverTimestamp or Date string
}

// Write a supporter record with a clean secure deterministic random id to prevent path character poisoning
export async function registerSupporter(supporter: Omit<SupporterRecord, 'createdAt'>) {
  const customId = `sup_${Math.random().toString(36).substring(2, 15)}`;
  const docRef = doc(db, 'supporters', customId);
  const pathForWrite = `supporters/${customId}`;
  
  try {
    await setDoc(docRef, {
      ...supporter,
      createdAt: serverTimestamp(),
    });
    return customId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathForWrite);
  }
}

// Stream the actual global supporters list in real-time
export function subscribeToSupporters(callback: (supporters: SupporterRecord[]) => void) {
  const pathForQuery = 'supporters';
  const q = query(collection(db, 'supporters'), orderBy('createdAt', 'desc'), limit(100));
  
  return onSnapshot(q, (snapshot) => {
    const list: SupporterRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        turns: Number(data.turns) || 0,
        respectRank: data.respectRank || 'Maximum',
        powerLevel: data.powerLevel || '9999+',
        rank: data.rank || 'Elite Level',
        score: Number(data.score) || 100,
        completedAt: data.completedAt || '',
        certificateId: data.certificateId || '',
        createdAt: data.createdAt,
      });
    });
    callback(list);
  }, (error) => {
    console.warn('Real-time sync paused or restricted: ', error.message);
    callback([]);
  });
}
