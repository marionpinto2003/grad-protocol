import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_CLASSROOMS = 3;
const TAP_TARGET = 20;

export default function MakeOut({ onComplete }) {
  const [phase, setPhase] = useState("intro");
  const [currentRoom, setCurrentRoom] = useState(0);
  const [taps, setTaps] = useState(0);
  const [unlocked, setUnlocked] = useState([]);
  const [showHearts, setShowHearts] = useState(false);
  const heartsTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(heartsTimer.current);
  }, []);

  const handleTap = () => {
    if (phase !== "playing" || showHearts) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= TAP_TARGET) {
      const newUnlocked = [...unlocked, currentRoom];
      setUnlocked(newUnlocked);
      setShowHearts(true);
      heartsTimer.current = setTimeout(() => {
        setShowHearts(false);
        if (newUnlocked.length >= TOTAL_CLASSROOMS) {
          setPhase("won");
          setTimeout(() => onComplete(), 1400);
        } else {
          setCurrentRoom(currentRoom + 1);
          setTaps(0);
        }
      }, 1600);
    }
  };

  const progress = Math.min((taps / TAP_TARGET) * 100, 100);
  const roomLabels = ["Room 201", "Room 304", "Room 115"];

  return (
    <div className="space-y-3 font-mono select-none">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Classified Operations</p>
        <p className="text-amber-700 text-xs">Unlock all 3 classrooms. You know the drill.</p>
      </div>

      {phase === "intro" && (
        <div className="space-y-3">
          <div className="border border-amber-900/50 rounded p-4 bg-amber-950/10 space-y-2 text-center">
            <p className="text-amber-400 text-sm">🚪 Sneaking Protocol Initiated</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              Security guard is on patrol. Tap rapidly to pick the lock before he catches you. 3 classrooms. Don't get caught.
            </p>
          </div>
          <button
            onClick={() => setPhase("playing")}
            className="w-full border border-amber-600 text-amber-400 py-3 rounded hover:bg-amber-950/40 transition text-sm tracking-wider"
          >
            [ INITIATE OPERATION ]
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div className="space-y-3">
          <div className="flex gap-2 justify-center">
            {roomLabels.map((label, i) => (
              <div
                key={i}
                className={`text-xs px-2 py-1 rounded border transition ${
                  unlocked.includes(i)
                    ? "border-amber-500 text-amber-400 bg-amber-950/30"
                    : i === currentRoom
                    ? "border-amber-700 text-amber-600"
                    : "border-green-950 text-green-900"
                }`}
              >
                {unlocked.includes(i) ? "✓" : i === currentRoom ? label : "???"}
              </div>
            ))}
          </div>

          <motion.button
            onTouchStart={handleTap}
            onClick={handleTap}
            whileTap={{ scale: 0.96 }}
            className={`w-full border-2 rounded-xl bg-black/40 flex flex-col items-center justify-center gap-3 py-10 transition ${
              showHearts ? "border-amber-400" : "border-amber-800 active:border-amber-500"
            }`}
            style={{ minHeight: "180px" }}
          >
            <AnimatePresence mode="wait">
              {showHearts ? (
                <motion.div
                  key="hearts"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-4xl space-x-2"
                >
                  <span>💕</span><span>✨</span><span>💕</span>
                </motion.div>
              ) : (
                <motion.div
                  key="door"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-2"
                >
                  <div className="text-4xl">🚪</div>
                  <p className="text-amber-600 text-xs uppercase tracking-widest">{roomLabels[currentRoom]}</p>
                  <p className="text-amber-800 text-xs">TAP TO PICK LOCK</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {!showHearts && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-amber-800">
                <span>Lock status</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 border border-amber-900/50">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.05 }}
                />
              </div>
            </div>
          )}

          {showHearts && (
            <p className="text-amber-400 text-xs text-center tracking-widest uppercase animate-pulse">
              Access Granted — {TOTAL_CLASSROOMS - unlocked.length} remaining
            </p>
          )}
        </div>
      )}

      {phase === "won" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6 space-y-3"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="text-5xl"
          >
            💕
          </motion.div>
          <p className="text-amber-400 font-bold text-lg tracking-wider">OPERATION COMPLETE</p>
          <p className="text-amber-700 text-xs">All 3 classrooms accessed. The security guard saw nothing.</p>
        </motion.div>
      )}
    </div>
  );
}
