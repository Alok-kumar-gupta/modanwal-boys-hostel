import { doc, collection, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { BookingInquiry, HostelConfig, Testimonial, MaintenanceLog } from '../types';

const CONFIG_DOC_PATH = 'config/settings';
const BOOKINGS_COLLECTION = 'bookings';
const TESTIMONIALS_COLLECTION = 'testimonials';
const MAINTENANCE_COLLECTION = 'maintenance-logs';

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
        await setDoc(docRef, defaultConfig);
        onUpdate(defaultConfig);
      } catch (err) {
        console.error('Failed to initialize default config in Firestore:', err);
      }
    }
  });
}

/**
 * Subscribes to real-time updates of all booking inquiries and student records.
 */
export function subscribeToBookings(
  seedBookings: BookingInquiry[],
  onUpdate: (bookings: BookingInquiry[]) => void
): () => void {
  const colRef = collection(db, BOOKINGS_COLLECTION);

  return onSnapshot(colRef, async (snapshot) => {
    if (!snapshot.empty) {
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
      // If the collection is completely empty, populate it with seeds
      try {
        for (const seed of seedBookings) {
          const docRef = doc(db, BOOKINGS_COLLECTION, seed.id);
          await setDoc(docRef, seed);
        }
        onUpdate(seedBookings);
      } catch (err) {
        console.error('Failed to seed bookings in Firestore:', err);
      }
    }
  });
}

/**
 * Saves/updates the global hostel configuration.
 */
export async function saveHostelConfig(config: HostelConfig): Promise<void> {
  const docRef = doc(db, CONFIG_DOC_PATH);
  await setDoc(docRef, config, { merge: true });
}

/**
 * Saves/adds a new booking inquiry.
 */
export async function addBookingInquiry(booking: BookingInquiry): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
  await setDoc(docRef, booking);
}

/**
 * Updates an existing booking inquiry or student record.
 */
export async function updateBookingInquiry(booking: BookingInquiry): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
  await setDoc(docRef, booking, { merge: true });
}

/**
 * Deletes a booking inquiry or student record.
 */
export async function deleteBookingInquiry(id: string): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Subscribes to real-time updates of testimonials.
 * Seeds with default ones if empty.
 */
export function subscribeToTestimonials(
  seedTestimonials: Testimonial[],
  onUpdate: (testimonials: Testimonial[]) => void
): () => void {
  const colRef = collection(db, TESTIMONIALS_COLLECTION);

  return onSnapshot(colRef, async (snapshot) => {
    if (!snapshot.empty) {
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
      // Seed testimonials in Firestore if missing
      try {
        for (const seed of seedTestimonials) {
          const docRef = doc(db, TESTIMONIALS_COLLECTION, seed.id);
          await setDoc(docRef, seed);
        }
        onUpdate(seedTestimonials);
      } catch (err) {
        console.error('Failed to seed testimonials in Firestore:', err);
        // Fallback to offline seeds
        onUpdate(seedTestimonials);
      }
    }
  });
}

/**
 * Saves/adds a new testimonial.
 */
export async function addTestimonial(testimonial: Testimonial): Promise<void> {
  const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonial.id);
  await setDoc(docRef, testimonial);
}

/**
 * Subscribes to real-time updates of maintenance logs.
 * Seeds with default logs if collection is empty.
 */
export function subscribeToMaintenanceLogs(
  seedLogs: MaintenanceLog[],
  onUpdate: (logs: MaintenanceLog[]) => void
): () => void {
  const colRef = collection(db, MAINTENANCE_COLLECTION);

  return onSnapshot(colRef, async (snapshot) => {
    if (!snapshot.empty) {
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
      // Seed maintenance logs if missing
      try {
        for (const seed of seedLogs) {
          const docRef = doc(db, MAINTENANCE_COLLECTION, seed.id);
          await setDoc(docRef, seed);
        }
        onUpdate(seedLogs);
      } catch (err) {
        console.error('Failed to seed maintenance logs in Firestore:', err);
        onUpdate(seedLogs);
      }
    }
  });
}

/**
 * Saves/adds a new maintenance log.
 */
export async function addMaintenanceLog(log: MaintenanceLog): Promise<void> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, log.id);
  await setDoc(docRef, log);
}

/**
 * Updates an existing maintenance log.
 */
export async function updateMaintenanceLog(log: MaintenanceLog): Promise<void> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, log.id);
  await setDoc(docRef, log, { merge: true });
}

/**
 * Deletes a maintenance log.
 */
export async function deleteMaintenanceLog(id: string): Promise<void> {
  const docRef = doc(db, MAINTENANCE_COLLECTION, id);
  await deleteDoc(docRef);
}


