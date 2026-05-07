import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const TOTAL_SCRUBS = 20;
const WINDOW = 400; // ms window for valid scrub

export default function LimescaleScrub({ onComplete }) {
  const [scrubs, setScrubs] = useState(0);
  const [limescale, setLimescale] = useState(100);
  const [phase, setPhase] = useState("intro"); // intro | scrubbing | done | fail
  const [feedback, setFeedback] = useState(null);
  const [flashGreen, setFlashGreen] = useState(false);
  const lastTap = useRef(null);
  const attempts = useRef(0);

  const progress = Math.max(0, limescale);

  const handleScrub = () => {
    if (phase !== "scrubbing") return;
    const now = Date.now();

    if (lastTap.current && now - lastTap.current < 150) {
      // Too fast
      setFeedback("Too fast!");
      setTimeout(() => setFeedback(null), 600);
      lastTap.current = now;
      return;
    }

    lastTap.current = now;

    const reduction = Math.random() * 4 + 3; // 3-7% per scrub
    setLimescale((prev) => {
      const next = Math.max(0, prev - reduction);
      if (next === 0) {
        setPhase("done");
        setTimeout(() => onComplete(), 2500);
      }
      return next;
    });

    setScrubs((s) => s + 1);
    setFlashGreen(true);
    setTimeout(() => setFlashGreen(false), 150);
    setFeedback("SCRUB!");
    setTimeout(() => setFeedback(null), 300);
  };

  const reset = () => {
    attempts.current += 1;
    setScrubs(0);
    setLimescale(100);
    setPhase("scrubbing");
    setFeedback(null);
    lastTap.current = null;
  };

  const getLimescaleColor = () => {
    if (progress > 66) return "#78350f";
    if (progress > 33) return "#a16207";
    return "#ca8a04";
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Descale the Kettle</p>
        <p className="text-green-700 text-xs">
          {phase === "intro"
            ? "Your roommate used descaler water for rice. Clean the evidence."
            : phase === "scrubbing"
            ? "TAP rapidly to scrub the limescale off"
            : phase === "done"
            ? "Kettle clean. Rice trauma resolved."
            : ""}
        </p>
      </div>

      {/* Kettle */}
      <div
        className="relative mx-auto cursor-pointer select-none"
        style={{ width: "200px", height: "200px" }}
        onClick={handleScrub}
      >
        {/* Kettle body */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-36 h-36 rounded-full border-4 border-green-800 flex items-center justify-center transition-colors duration-150 ${
              flashGreen ? "bg-green-950/60" : "bg-black/60"
            }`}
          >
            <span className="text-6xl">🫖</span>
          </div>
        </div>

        {/* Limescale overlay */}
        {progress > 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: progress / 100 }}
          >
            <div
              className="w-36 h-36 rounded-full"
              style={{
                background: `radial-gradient(circle, ${getLimescaleColor()}88 0%, transparent 70%)`,
              }}
            />
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <motion.div
            key={scrubs}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="absolute top-2 left-0 right-0 text-center pointer-events-none"
          >
            <span className="text-green-400 text-xs font-bold">{feedback}</span>
          </motion.div>
        )}

        {phase === "scrubbing" && !feedback && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute bottom-2 left-0 right-0 text-center"
          >
            <span className="text-green-700 text-xs">TAP TO SCRUB</span>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      {phase === "scrubbing" && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-green-700">
            <span>Limescale</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-green-950 rounded overflow-hidden">
            <motion.div
              className="h-full rounded"
              style={{ backgroundColor: getLimescaleColor() }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          {attempts.current > 0 && (
            <p className="text-green-800 text-xs text-right">Attempt {attempts.current + 1}</p>
          )}
        </div>
      )}

      {phase === "intro" && (
        <button
          onClick={() => setPhase("scrubbing")}
          className="w-full border border-amber-600 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
        >
          [ START SCRUBBING ]
        </button>
      )}

      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-green-500 rounded p-3 bg-green-950/20 text-center"
        >
          <p className="text-green-400 text-sm">✓ Kettle descaled. Jai forgiven. Mostly.</p>
        </motion.div>
      )}
    </div>
  );
}
