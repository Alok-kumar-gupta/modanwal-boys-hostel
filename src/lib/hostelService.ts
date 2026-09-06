import { doc, collection, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { BookingInquiry, HostelConfig, Testimonial, MaintenanceLog } from '../types';

const CONFIG_DOC_PATH = 'config/settings';
const SYSTEM_STATE_DOC = 'config/system_state';
const BOOKINGS_COLLECTION = 'bookings';
const TESTIMONIALS_COLLECTION = 'testimonials';
const MAINTENANCE_COLLECTION = 'maintenance-logs';

/**
 * Recursively strips undefined values from an object or array to avoid
 * Firestore "Function setDoc() called with invalid data. Unsupported field value: undefined" errors.
 */
export function cleanFirestorePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanFirestorePayload(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestorePayload(value);
      }
    }
    return cleaned;
  }
  return obj;
}

// In-memory flags to prevent deleted records from reappearing when collection becomes empty
let bookingsInitializedInMemory = false;
let testimonialsInitializedInMemory = false;
let maintenanceInitializedInMemory = false;

/**
 * Subscribes to real-time updates of the hostel configuration.
 * If no configuration exists in the database, it initializes it with the default values.
 */
export function subscribeToHostelConfig(
  defaultConfig: HostelConfig,
  onUpdate: (config: HostelConfig) => void
): () => void {
  const docRef = doc(db, CONFIG_DOC_PATH);

  return onSnapshot(docRef, async (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data() as HostelConfig);
    } else {
      // Initialize with default config if missing in DB
      try {
        await setDoc(docRef, cleanFirestorePayload(defaultConfig));
        onUpdate(defaultConfig);
      } catch (err) {
        console.error('Failed to initialize default config in Firestore:', err);
      }
    }
  });
}

/**
 * Subscribes to real-time updates of all booking inquiries and student records.
 * NEVER automatically resurrects records when user deletes them.
 */
export function subscribeToBookings(
  seedBookings: BookingInquiry[],
  onUpdate: (bookings: BookingInquiry[]) => void
): () => void {
  const colRef = collection(db, BOOKINGS_COLLECTION);

  return onSnapshot(colRef, async (snapshot) => {
    if (!snapshot.empty) {
      bookingsInitializedInMemory = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mbh_bookings_seeded', 'true');
      }
      const bookingsList: BookingInquiry[] = [];
      snapshot.forEach((docSnap) => {
        bookingsList.push({ id: docSnap.id, ...docSnap.data() } as BookingInquiry);
      });
      // Sort by timestamp or ID to keep latest on top if timestamp exists
      bookingsList.sort((a, b) => {
        const timeA = new Date(a.timestamp || '').getTime() || 0;
        const timeB = new Date(b.timestamp || '').getTime() || 0;
        return timeB - timeA; // Descending
      });
      onUpdate(bookingsList);
    } else {
      // The collection is empty.
      // Check if user has already initialized the system or deleted all records.
      const isLocallyInitialized = typeof window !== 'undefined' && localStorage.getItem('mbh_bookings_seeded') === 'true';

      if (bookingsInitializedInMemory || isLocallyInitialized) {
        // User intentionally deleted records or register is empty. Keep it empty!
        onUpdate([]);
        return;
      }

      // Check Firestore system state document
      try {
        const stateDocRef = doc(db, SYSTEM_STATE_DOC);
        const stateSnap = await getDoc(stateDocRef);
        if (stateSnap.exists() && stateSnap.data()?.bookingsSeeded) {
          // Already seeded previously in Firestore! User deleted all records.
          bookingsInitializedInMemory = true;
          if (typeof window !== 'undefined') {
            localStorage.setItem('mbh_bookings_seeded', 'true');
          }
          onUpdate([]);
          return;
        }

        // Only on a completely fresh, uninitialized deployment
        await setDoc(stateDocRef, { bookingsSeeded: true, seededAt: new Date().toISOString() }, { merge: true });
        bookingsInitializedInMemory = true;
        if (typeof window !== 'undefined') {
          localStorage.setItem('mbh_bookings_seeded', 'true');
        }
        for (const seed of seedBookings) {
          const docRef = doc(db, BOOKINGS_COLLECTION, seed.id);
          await setDoc(docRef, cleanFirestorePayload(seed));
        }
        onUpdate(seedBookings);
      } catch (err) {
        console.error('Failed to handle empty bookings:', err);
        onUpdate([]);
      }
    }
  });
}

/**
 * Saves/updates the global hostel configuration.
 */
export async function saveHostelConfig(config: HostelConfig): Promise<void> {
  const docRef = doc(db, CONFIG_DOC_PATH);
  await setDoc(docRef, cleanFirestorePayload(config), { merge: true });
}

/**
 * Saves/adds a new booking inquiry.
 */
export async function addBookingInquiry(booking: BookingInquiry): Promise<void> {
  bookingsInitializedInMemory = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mbh_bookings_seeded', 'true');
  }
  const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
  await setDoc(docRef, cleanFirestorePayload(booking));
}

/**
 * Updates an existing booking inquiry or student record.
 */
export async function updateBookingInquiry(booking: BookingInquiry): Promise<void> {
  bookingsInitializedInMemory = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mbh_bookings_seeded', 'true');
  }
  const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
  await setDoc(docRef, cleanFirestorePayload(booking), { merge: true });
}

/**
 * Deletes a booking inquiry or student record permanently.
 */
export async function deleteBookingInquiry(id: string): Promise<void> {
  bookingsInitializedInMemory = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mbh_bookings_seeded', 'true');
  }
  const docRef = doc(db, BOOKINGS_COLLECTION, id);
  await deleteDoc(docRef);

  // Mark system state as seeded so empty collection never auto-resurrects deleted records
  try {
    const stateDocRef = doc(db, SYSTEM_STATE_DOC);
    await setDoc(stateDocRef, { bookingsSeeded: true }, { merge: true });
  } catch (err) {
    // non-fatal
  }
}

/**
 * Subscribes to real-time updates of testimonials.
 */
export function subscribeToTestimonials(
  seedTestimonials: Testimonial[],
  onUpdate: (testimonials: Testimonial[]) => void
): () => void {
  const colRef = collection(db, TESTIMONIALS_COLLECTION);

  return onSnapshot(colRef, async (snapshot) => {
    if (!snapshot.empty) {
      testimonialsInitializedInMemory = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mbh_testimonials_seeded', 'true');
      }
      const testimonialsList: Testimonial[] = [];
      snapshot.forEach((docSnap) => {
        testimonialsList.push({ id: docSnap.id, ...docSnap.data() } as Testimonial);
      });
      // Sort: newest first
      testimonialsList.sort((a, b) => {
        const timeA = new Date(a.timestamp || '').getTime() || 0;
        const timeB = new Date(b.timestamp || '').getTime() || 0;
        return timeB - timeA;
      });
      onUpdate(testimonialsList);
    } else {
      const isLocallyInitialized = typeof window !== 'undefined' && localStorage.getItem('mbh_testimonials_seeded') === 'true';
      if (testimonialsInitializedInMemory || isLocallyInitialized) {
        onUpdate([]);
        return;
      }

      try {
        const stateDocRef = doc(db, SYSTEM_STATE_DOC);
        const stateSnap = await getDoc(stateDocRef);
        if (stateSnap.exists() && stateSnap.data()?.testimonialsSeeded) {
          testimonialsInitializedInMemory = true;
          if (typeof window !== 'undefined') localStorage.setItem('mbh_testimonials_seeded', 'true');
          onUpdate([]);
          return;
        }

        await setDoc(stateDocRef, { testimonialsSeeded: true }, { merge: true });
        testimonialsInitializedInMemory = true;
        if (typeof window !== 'undefined') localStorage.setItem('mbh_testimonials_seeded', 'true');
        for (const seed of seedTestimonials) {
          const docRef = doc(db, TESTIMONIALS_COLLECTION, seed.id);
          await setDoc(docRef, cleanFirestorePayload(seed));
        }
        onUpdate(seedTestimonials);
      } catch (err) {
        console.error('Failed to handle empty testimonials:', err);
        onUpdate([]);
      }
    }
  });
}

/**
 * Saves/adds a new testimonial.
 */
export async function addTestimonial(testimonial: Testimonial): Promise<void> {
  testimonialsInitializedInMemory = true;
  const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonial.id);
  await setDoc(docRef, cleanFirestorePayload(testimonial));
}

/**
 * Deletes a testimonial from Firestore.
 */
export async function deleteTestimonial(id: string): Promise<void> {
  testimonialsInitializedInMemory = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mbh_testimonials_seeded', 'true');
  }
  const docRef = doc(db, TESTIMONIALS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Subscribes to real-time updates of maintenance logs.
 */
export function subscribeToMaintenanceLogs(
  seedLogs: MaintenanceLog[],
  onUpdate: (logs: MaintenanceLog[]) => void
): () => void {
  const colRef = collection(db, MAINTENANCE_COLLECTION);

  return onSnapshot(colRef, async (snapshot) => {
    if (!snapshot.empty) {
      maintenanceInitializedInMemory = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mbh_maintenance_seeded', 'true');
      }
      const logsList: MaintenanceLog[] = [];
      snapshot.forEach((docSnap) => {
        logsList.push({ id: docSnap.id, ...docSnap.data() } as MaintenanceLog);
      });
      // Sort: newest reported date first
      logsList.sort((a, b) => {
        const timeA = new Date(a.reportedDate).getTime() || 0;
        const timeB = new Date(b.reportedDate).getTime() || 0;
        return timeB - timeA;
      });
      onUpdate(logsList);
    } else {
      const isLocallyInitialized = typeof window !== 'undefined' && localStorage.getItem('mbh_maintenance_seeded') === 'true';
      if (maintenanceInitializedInMemory || isLocallyInitialized) {
        onUpdate([]);
        return;
      }

      try {
        const stateDocRef = doc(db, SYSTEM_STATE_DOC);
        const stateSnap = await getDoc(stateDocRef);
        if (stateSnap.exists() && stateSnap.data()?.maintenanceSeeded) {
          maintenanceInitializedInMemory = true;
          if (typeof window !== 'undefined') localStorage.setItem('mbh_maintenance_seeded', 'true');
          onUpdate([]);
          return;
        }

        await setDoc(stateDocRef, { maintenanceSeeded: true }, { merge: true });
        maintenanceInitializedInMemory = true;
        if (typeof window !== 'undefined') localStorage.setItem('mbh_maintenance_seeded', 'true');
        for (const seed of seedLogs) {
          const docRef = doc(db, MAINTENANCE_COLLECTION, seed.id);
          await setDoc(docRef, cleanFirestorePayload(seed));
        }
        onUpdate(seedLogs);
      } catch (err) {
        console.error('Failed to handle empty maintenance logs:', err);
        onUpdate([]);
      }
    }
  });
}

/**
 * Saves/adds a new maintenance log.
 */
export async function addMaintenanceLog(log: MaintenanceLog): Promise<void> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, log.id);
  await setDoc(docRef, cleanFirestorePayload(log));
}

/**
 * Updates an existing maintenance log.
 */
export async function updateMaintenanceLog(log: MaintenanceLog): Promise<void> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, log.id);
  await setDoc(docRef, cleanFirestorePayload(log), { merge: true });
}

/**
 * Deletes a maintenance log.
 */
export async function deleteMaintenanceLog(id: string): Promise<void> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, id);
  await deleteDoc(docRef);
}

// ----------------- TOKENS MANAGEMENT -----------------
const TOKENS_COLLECTION = 'tokens';

export function subscribeToTokens(
  onUpdate: (tokens: any[]) => void
): () => void {
  const colRef = collection(db, TOKENS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    list.sort((a, b) => (new Date(b.generatedAt || 0).getTime()) - (new Date(a.generatedAt || 0).getTime()));
    onUpdate(list);
  }, (err) => {
    console.error('Tokens subscription error:', err);
    onUpdate([]);
  });
}

export async function addStudentToken(token: any): Promise<void> {
  const docRef = doc(db, TOKENS_COLLECTION, token.id);
  await setDoc(docRef, cleanFirestorePayload(token));
}

export async function updateStudentToken(token: any): Promise<void> {
  const docRef = doc(db, TOKENS_COLLECTION, token.id);
  await setDoc(docRef, cleanFirestorePayload(token), { merge: true });
}

export async function deleteStudentToken(id: string): Promise<void> {
  const docRef = doc(db, TOKENS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ----------------- NOTICE BOARD MANAGEMENT -----------------
const NOTICES_COLLECTION = 'notices';

export function subscribeToNotices(
  onUpdate: (notices: any[]) => void
): () => void {
  const colRef = collection(db, NOTICES_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
    });
    onUpdate(list);
  }, (err) => {
    console.error('Notices subscription error:', err);
    onUpdate([]);
  });
}

export async function addNotice(notice: any): Promise<void> {
  const docRef = doc(db, NOTICES_COLLECTION, notice.id);
  await setDoc(docRef, cleanFirestorePayload(notice));
}

export async function updateNotice(notice: any): Promise<void> {
  const docRef = doc(db, NOTICES_COLLECTION, notice.id);
  await setDoc(docRef, cleanFirestorePayload(notice), { merge: true });
}

export async function deleteNotice(id: string): Promise<void> {
  const docRef = doc(db, NOTICES_COLLECTION, id);
  await deleteDoc(docRef);
}


