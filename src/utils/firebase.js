let db = null;

export async function initFirebase(config) {
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );
    const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    db = getFirestore(app);
    console.log("[GradProtocol] Firebase connected.");
  } catch (e) {
    console.warn("[GradProtocol] Firebase unavailable — running offline.", e);
  }
}

export async function pingStageComplete(stageId, stageIndex, label) {
  if (!db) {
    console.log(`[GradProtocol][OFFLINE] Stage cleared: ${stageId}`);
    return;
  }
  try {
    const { doc, setDoc, serverTimestamp } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );
    await setDoc(
      doc(db, "grad_protocol", "pr
rm src/utils/firebase.js
cat > src/utils/firebase.js << 'EOF'
let db = null;

export async function initFirebase(config) {
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );
    const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    db = getFirestore(app);
    console.log("[GradProtocol] Firebase connected.");
  } catch (e) {
    console.warn("[GradProtocol] Firebase unavailable — running offline.", e);
  }
}

export async function pingStageComplete(stageId, stageIndex, label) {
  if (!db) {
    console.log(`[GradProtocol][OFFLINE] Stage cleared: ${stageId}`);
    return;
  }
  try {
    const { doc, setDoc, serverTimestamp } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );
    await setDoc(
      doc(db, "grad_protocol", "progress", "stages", stageId),
      {
        stageIndex,
        label,
        completedAt: serverTimestamp(),
        device: navigator.userAgent,
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("[GradProtocol] Firebase write failed:", e);
  }
}

export async function pingSessionStart(sessionId) {
  if (!db) return;
  try {
    const { doc, setDoc, serverTimestamp } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );
    await setDoc(
      doc(db, "grad_protocol", "sessions", sessionId),
      {
        startedAt: serverTimestamp(),
        device: navigator.userAgent,
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("[GradProtocol] Session ping failed:", e);
  }
}
