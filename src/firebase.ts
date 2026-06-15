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
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
// CRITICAL: Must use the firestoreDatabaseId from the configuration or fallback
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
    authInfo: {}, // Public sandbox flows have empty auth info
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

// Supporter definition
export interface SupporterRecord {
  id?: string;
  name: string;
  email: string;
  turns: number;
  respectRank: string;
  powerLevel: string;
  rank: string;
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
  const q = query(collection(db, 'supporters'), orderBy('createdAt', 'desc'), limit(15));
  
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
        createdAt: data.createdAt,
      });
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, pathForQuery);
  });
}
