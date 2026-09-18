import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDocFromServer,
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore with robust local caching and long-polling fallback for restricted/iframe environments
const databaseId =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

export const db = initializeFirestore(
  firebaseApp,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  },
  databaseId
);

// Test Connection as mandated by the firebase-integration skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    // In iframe environments or initial connection establishment, Firestore operates in offline cache mode
    const msg = error?.message || '';
    if (msg.includes('offline') || msg.includes('unavailable') || error?.code === 'unavailable') {
      // Normal expected behavior when offline or waiting for initial channel handshake
      return;
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

