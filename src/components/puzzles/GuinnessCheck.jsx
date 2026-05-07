import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SCAN_LINES = [
  "Analysing pour distribution...",
  "Measuring foam density ratio...",
  "Calculating split accuracy...",
  "Cross-referencing Guinness standards...",
  "Running pixel depth analysis...",
];

export default function GuinnessCheck({ onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro | scanning | failed | penalty
  const [scanLine, setScanLine] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "scanning") return;

    const lineInterval = setInterval(() => {
      setScanLine(prev => {
        if (prev >= SCAN_LINES.length - 1) {
          clearInterval(lineInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setPhase("failed"), 400);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => {
      clearInterval(lineInterval);
      clearInterval(progressInterval);
    };
  }, [phase]);

  return (
    <div className="space-y-3 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Guinness Protocol</p>
        <p className="text-green-700 text-xs">Split the G. Photo proof required.</p>
      </div>

      {phase === "intro" && (
        <div className="space-y-3">
          <div className="border border-amber-900/50 rounded p-4 bg-black/30 text-center space-y-2">
            <p className="text-4xl">🍺</p>
            <p className="text-amber-300 text-sm">Order a Guinness.</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              Split it between two glasses by eye. No measuring. Both glasses must look even.
              Sunglasses mandatory. Take a photo of both glasses side by side.
            </p>
          </div>
          <button
            onClick={() => setPhase("scanning")}
            className="w-full border border-amber-600 text-amber-400 py-3 rounded hover:bg-amber-950/40 transition text-sm tracking-wider"
          >
            [ SUBMIT PHOTO FOR ANALYSIS ]
          </button>
        </div>
      )}

      {phase === "scanning" && (
        <div className="space-y-3">
          <div className="border border-green-900 rounded p-4 bg-black/30 space-y-3">
            <p className="text-green-500 text-xs uppercase tracking-widest text-center animate-pulse">
              Scanning...
            </p>
            <div className="space-y-1.5">
              {SCAN_LINES.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i <= scanLine ? 1 : 0.1 }}
                  className={`text-xs ${i <= scanLine ? "text-green-600" : "text-green-950"}`}
                >
                  {i < scanLine ? "✓ " : i === scanLine ? "> " : "  "}{line}
                </motion.p>
              ))}
            </div>
            <div className="space-y-1">
              <div className="w-full bg-black/40 rounded-full h-1.5 border border-green-900/50">
                <motion.div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-green-800 text-xs text-right">{progress}%</p>
            </div>
          </div>
        </div>
      )}

      {phase === "failed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="border border-red-800 rounded p-4 bg-red-950/10 text-center space-y-2">
            <p className="text-red-400 text-sm font-bold">✗ ANALYSIS FAILED</p>
            <p className="text-red-600 text-xs">Split ratio: 43/57. Unacceptable.</p>
            <p className="text-red-700 text-xs">Guinness standards not met. Disgraceful.</p>
          </div>
          <button
            onClick={() => setPhase("penalty")}
            className="w-full border border-red-700 text-red-400 py-3 rounded hover:bg-red-950/30 transition text-sm tracking-wider"
          >
            [ VIEW PENALTY ]
          </button>
        </motion.div>
      )}

      {phase === "penalty" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="border border-amber-700 rounded p-4 bg-amber-950/10 text-center space-y-2">
            <p className="text-4xl">🥃</p>
            <p className="text-amber-400 text-sm font-bold">PENALTY ISSUED</p>
            <p className="text-amber-500 text-xs font-bold">Get a round of shots. All three of you.</p>
            <p className="text-amber-800 text-xs">Pinto's orders. Non-negotiable.</p>
          </div>
          <button
            onClick={() => onComplete()}
            className="w-full border border-amber-600 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
          >
            [ PENALTY ACCEPTED — PROCEED ]
          </button>
        </motion.div>
      )}
    </div>
  );
}
