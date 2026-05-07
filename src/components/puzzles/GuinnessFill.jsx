import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TARGET_MIN = 65;
const TARGET_MAX = 69;

export default function GuinnessFill({ onComplete }) {
  const [filling, setFilling] = useState(false);
  const [level, setLevel] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!filling || stopped) return;
    intervalRef.current = setInterval(() => {
      setLevel((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          handleStop(100);
          return 100;
        }
        return prev + 0.8;
      });
    }, 30);
    return () => clearInterval(intervalRef.current);
  }, [filling, stopped]);

  const handleStop = (finalLevel) => {
    if (stopped) return;
    clearInterval(intervalRef.current);
    setStopped(true);
    const l = finalLevel ?? level;
    const success = l >= TARGET_MIN && l <= TARGET_MAX;
    setResult(success ? "success" : "fail");
    if (success) setTimeout(() => onComplete(), 1200);
  };

  const reset = () => {
    setLevel(0);
    setFilling(false);
    setStopped(false);
    setResult(null);
    setAttempts((a) => a + 1);
  };

  const getColor = () => {
    if (level < TARGET_MIN) return "#1a1a2e";
    if (level <= TARGET_MAX) return "#1b4332";
    return "#7f1d1d";
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Split the Guinness</p>
        <p className="text-green-700 text-xs">Tap STOP when the glass hits the perfect pour line</p>
      </div>
      <div className="flex justify-center">
        <div className="relative w-24" style={{ height: "180px" }}>
          <div className="absolute inset-0 border-2 border-green-700 rounded-b-lg overflow-hidden">
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              style={{ height: `${level}%`, backgroundColor: getColor() }}
            />
            {level > 5 && (
              <div className="absolute left-0 right-0 h-3 bg-white/20" style={{ bottom: `${level}%` }} />
            )}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400 opacity-70"
              style={{ bottom: `${TARGET_MIN}%` }}
            />
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400 opacity-70"
              style={{ bottom: `${TARGET_MAX}%` }}
            />
          </div>
          <div className="absolute -right-8 top-0 bottom-0 flex items-center">
            <span className="text-green-600 text-xs">{Math.round(level)}%</span>
          </div>
        </div>
      </div>
      {!filling && !stopped && (
        <button
          onClick={() => setFilling(true)}
          className="w-full border border-amber-600 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
        >
          [ START POUR ]
        </button>
      )}
      {filling && !stopped && (
        <button
          onClick={() => handleStop(level)}
          className="w-full border border-green-500 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider animate-pulse"
        >
          [ STOP ]
        </button>
      )}
      {result === "success" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-green-500 rounded p-3 bg-green-950/20 text-center"
        >
          <p className="text-green-400 text-sm">✓ Perfect pour. Sláinte.</p>
        </motion.div>
      )}
      {result === "fail" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="border border-red-800 rounded p-3 bg-red-950/20 text-center">
            <p className="text-red-400 text-sm">
              {level < TARGET_MIN ? "Too little. Guinness deserves respect." : "Overflow. Jethalal would be disappointed."}
            </p>
            {attempts >= 1 && <p className="text-red-500 text-xs font-bold mt-2">PENALTY: Buy a round of shots for the table.</p>}
          </div>
          {attempts >= 1 ? (
            <button
              onClick={() => onComplete()}
              className="w-full border border-amber-600 text-amber-400 py-2 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
            >
              [ PENALTY ACCEPTED — PROCEED ]
            </button>
          ) : (
            <button
              onClick={reset}
              className="w-full border border-amber-600 text-amber-400 py-2 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
            >
              [ TRY AGAIN ]
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
