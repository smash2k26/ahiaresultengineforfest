import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

// Test Connection as mandated by the firebase-integration skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or waiting for initial connection.');
    }
  }
}
testConnection();

export interface CelebrationRecord {
  celebrationMode: boolean;
  updatedAt: string;
  updatedBy: string;
  source?: string;
  activeUntil?: string | null;
}

/**
 * Stores celebration mode state and writes a persistent audit record into Firestore.
 */
export async function persistCelebrationMode(enabled: boolean, updatedBy = 'Festival Controller'): Promise<boolean> {
  try {
    const celebrationDocRef = doc(db, 'settings', 'celebration');
    const payload: CelebrationRecord = {
      celebrationMode: enabled,
      updatedAt: new Date().toISOString(),
      updatedBy,
      source: 'web_admin',
    };

    // Store in primary settings document
    await setDoc(celebrationDocRef, payload, { merge: true });

    // Also record an immutable event log in celebration_history collection
    const historyColRef = collection(db, 'celebration_history');
    await addDoc(historyColRef, {
      ...payload,
      timestamp: serverTimestamp(),
    });

    return true;
  } catch (err) {
    console.error('Failed to store celebration mode in database:', err);
    return false;
  }
}

/**
 * Real-time listener for celebration mode changes in Firestore.
 */
export function listenToCelebrationMode(callback: (enabled: boolean, record?: CelebrationRecord) => void): () => void {
  const celebrationDocRef = doc(db, 'settings', 'celebration');
  return onSnapshot(
    celebrationDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as CelebrationRecord;
        if (typeof data.celebrationMode === 'boolean') {
          callback(data.celebrationMode, data);
        }
      }
    },
    (err) => {
      console.warn('Celebration mode real-time listener note:', err);
    }
  );
}
