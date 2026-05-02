import { DEV_MODE } from "../config/devmode";
import { FIREBASE_CONFIG } from "../config/firebase";

let db = null;

async function getDb() {
  if (db) return db;
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
    db = getFirestore(app);
    return db;
  } catch (e) {
    console.warn("Firebase unavailable", e);
    return null;
  }
}

/**
 * Marks this player as done for a stage, then waits for the other player.
 * In DEV_MODE, resolves immediately after a short delay.
 * Returns a cleanup function to unsubscribe.
 */
export async function syncAndWait(stageId, playerId, onBothReady) {
  if (DEV_MODE) {
    const t = setTimeout(() => onBothReady(), 800);
    return () => clearTimeout(t);
  }

  try {
    const { doc, setDoc, onSnapshot, serverTimestamp } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );
    const firestore = await getDb();
    if (!firestore) {
      onBothReady();
      return () => {};
    }

    await setDoc(
      doc(firestore, "grad_protocol", "sync", stageId, playerId),
      { done: true, timestamp: serverTimestamp() },
      { merge: true }
    );

    const otherPlayer = playerId === "gupta" ? "gohil" : "gupta";
    const unsub = onSnapshot(
      doc(firestore, "grad_protocol", "sync", stageId, otherPlayer),
      (snap) => {
        if (snap.exists() && snap.data()?.done) {
          onBothReady();
          unsub();
        }
      }
    );
    return unsub;
  } catch (e) {
    console.warn("Sync failed, auto-continuing", e);
    onBothReady();
    return () => {};
  }
}
