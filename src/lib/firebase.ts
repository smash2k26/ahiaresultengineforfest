import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  memoryLocalCache,
  doc,
  getDocFromServer,
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence benign Firestore internal connection probe warnings in iframe sandbox
try {
  setLogLevel('error');
} catch {}

// Clean up any stale Firestore mutation keys in localStorage from previous multi-tab manager sessions to prevent QuotaExceededError
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith('firestore_mutations_') || key.startsWith('firestore_clients_') || key.startsWith('firestore_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {}
    });
  }
} catch (e) {
  // Ignore
}

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore with memory local cache and forced long polling for robust iframe sandbox connectivity
const databaseId =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

export const db = initializeFirestore(
  firebaseApp,
  {
    localCache: memoryLocalCache(),
    experimentalForceLongPolling: true,
  },
  databaseId
);

// Test Connection as mandated by the firebase-integration skill
async function testConnection() {
  try {
    if (typeof window !== 'undefined' && navigator.onLine) {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore operating in offline cache mode.');
    }
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection();
  }, 1000);
}

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

export interface DeletionRecord {
  id: string;
  itemType?: string;
  programId?: string;
  participantId?: string;
  chestNo?: string;
  deletedAt: string;
}

/**
 * Persists a deleted record marker to Firestore so that all devices, accounts,
 * and background merges instantly recognize the deletion and never resurrect it.
 */
export async function persistRemoteDeletion(record: DeletionRecord): Promise<boolean> {
  try {
    const safeId = encodeURIComponent(record.id).replace(/%/g, '_');
    const deletionDocRef = doc(db, 'deletions', safeId);
    await setDoc(deletionDocRef, {
      id: record.id,
      itemType: record.itemType || 'result_mark',
      programId: record.programId || '',
      participantId: record.participantId || '',
      chestNo: record.chestNo || '',
      deletedAt: record.deletedAt || new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to persist deletion to Firestore:', err);
    return false;
  }
}

/**
 * Removes a remote deletion tombstone so a newly created/entered record can persist cleanly.
 */
export async function removeRemoteDeletion(id: string): Promise<boolean> {
  try {
    const safeId = encodeURIComponent(id).replace(/%/g, '_');
    const deletionDocRef = doc(db, 'deletions', safeId);
    await deleteDoc(deletionDocRef);
    return true;
  } catch (err) {
    console.warn('Failed to remove remote deletion from Firestore:', err);
    return false;
  }
}

/**
 * Real-time listener for all deletions in Firestore.
 * Notifies subscriber with the complete list of deleted IDs across all devices.
 */
export function listenToDeletions(callback: (deletedRecords: DeletionRecord[]) => void): () => void {
  const deletionsColRef = collection(db, 'deletions');
  return onSnapshot(
    deletionsColRef,
    (snapshot) => {
      const records: DeletionRecord[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as DeletionRecord;
        if (data && data.id) {
          records.push(data);
        }
      });
      callback(records);
    },
    (err) => {
      console.warn('Deletions real-time listener note:', err);
    }
  );
}

export interface LiveProgramResultData {
  programId: string;
  programCode?: string;
  resultsJson: string;
  publishStatus?: string;
  updatedAt: string;
}

/**
 * Broadcasts updated program results (including deletions or edits) in real time to all accounts.
 */
export async function persistLiveProgramResult(
  programId: string,
  programCode: string,
  results: any[],
  publishStatus = 'Published'
): Promise<boolean> {
  try {
    const safeId = encodeURIComponent(programId).replace(/%/g, '_');
    const resultDocRef = doc(db, 'live_results', safeId);
    const payload: LiveProgramResultData = {
      programId,
      programCode: programCode || '',
      resultsJson: JSON.stringify(results || []),
      publishStatus,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(resultDocRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to persist live program result to Firestore:', err);
    return false;
  }
}

/**
 * Real-time listener for live program results across all devices and accounts.
 */
export function listenToLiveResults(
  callback: (resultsMap: Map<string, { results: any[]; publishStatus?: string }>) => void
): () => void {
  const liveColRef = collection(db, 'live_results');
  return onSnapshot(
    liveColRef,
    (snapshot) => {
      const map = new Map<string, { results: any[]; publishStatus?: string }>();
      snapshot.forEach((d) => {
        const data = d.data() as LiveProgramResultData;
        if (data && data.programId) {
          try {
            const parsed = typeof data.resultsJson === 'string' ? JSON.parse(data.resultsJson) : data.resultsJson;
            map.set(data.programId, {
              results: Array.isArray(parsed) ? parsed : [],
              publishStatus: data.publishStatus,
            });
            if (data.programCode) {
              map.set(data.programCode, {
                results: Array.isArray(parsed) ? parsed : [],
                publishStatus: data.publishStatus,
              });
            }
          } catch (e) {
            console.warn('Failed to parse resultsJson from live_results:', e);
          }
        }
      });
      callback(map);
    },
    (err) => {
      console.warn('Live results real-time listener note:', err);
    }
  );
}

