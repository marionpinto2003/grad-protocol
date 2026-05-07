import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PeanutThrow({ onComplete }) {
  const [score, setScore] = useState({ in: 0, out: 0 });
  const [throwing, setThrowing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [peanutPos, setPeanutPos] = useState({ x: 150, y: 280 });
  const [showPeanut, setShowPeanut] = useState(false);
  const [done, setDone] = useState(false);
  const total = score.in + score.out;
  const remaining = 5 - total;

  useEffect(() => {
    if (score.in >= 3) {
      setDone(true);
      setTimeout(() => onComplete(), 2500);
    } else if (total === 5 && score.in < 3) {
      setTimeout(() => {
        setScore({ in: 0, out: 0 });
        setLastResult(null);
      }, 1500);
    }
  }, [score, total]);

  const throwPeanut = () => {
    if (throwing || total >= 5 || done) return;
    setThrowing(true);
    setShowPeanut(true);
    const success = Math.random() < 0.6;
    const targetX = success ? 150 + (Math.random() * 20 - 10) : 150 + (Math.random() > 0.5 ? 60 : -60);
    const targetY = success ? 80 : 100 + Math.random() * 40;
    setPeanutPos({ x: targetX, y: targetY });
    setTimeout(() => {
      setLastResult(success ? "in" : "out");
      setScore((prev) => ({ in: prev.in + (success ? 1 : 0), out: prev.out + (success ? 0 : 1) }));
      setShowPeanut(false);
      setPeanutPos({ x: 150, y: 280 });
      setThrowing(false);
    }, 800);
  };

  return (
    <div className="space-y-3 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Peanut Toss</p>
        <p className="text-green-700 text-xs">Get 3 in the basket. Best of 5.</p>
      </div>
      <div className="flex justify-center gap-6">
        <div className="text-center">
          <p className="text-green-400 text-2xl font-bold">{score.in}</p>
          <p className="text-green-700 text-xs">IN</p>
        </div>
        <div className="text-center">
          <p className="text-green-600 text-xs mt-2">/ 5</p>
        </div>
        <div className="text-center">
          <p className="text-red-400 text-2xl font-bold">{score.out}</p>
          <p className="text-red-700 text-xs">MISS</p>
        </div>
      </div>
      <div
        className="relative mx-auto border border-green-900 rounded bg-black/40"
        style={{ width: "300px", height: "320px" }}
        onClick={throwPeanut}
      >
        <div className="absolute" style={{ left: "50%", top: "60px", transform: "translateX(-50%)" }}>
          <div className="text-4xl text-center">🧺</div>
          <div className="w-16 h-1 bg-amber-700 rounded mx-auto mt-1" />
        </div>
        <AnimatePresence>
          {showPeanut && (
            <motion.div
              className="absolute text-2xl"
              initial={{ x: 135, y: 260 }}
              animate={{ x: peanutPos.x - 15, y: peanutPos.y }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ position: "absolute" }}
            >
              🥜
            </motion.div>
          )}
        </AnimatePresence>
        {!throwing && !done && remaining > 0 && (
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <motion.p
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-green-600 text-xs"
            >
              TAP TO THROW
            </motion.p>
            <p className="text-green-800 text-xs mt-1">{remaining} throw{remaining !== 1 ? "s" : ""} remaining</p>
          </div>
        )}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              key={total}
              initial={{ opacity: 1, y: 140 }}
              animate={{ opacity: 0, y: 80 }}
              transition={{ duration: 0.8 }}
              className="absolute left-0 right-0 text-center pointer-events-none"
            >
              <p className={`text-lg font-bold ${lastResult === "in" ? "text-green-400" : "text-red-400"}`}>
                {lastResult === "in" ? "IN! 🎯" : "MISS"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-green-500 rounded p-3 bg-green-950/20 text-center">
          <p className="text-green-400 text-sm">✓ Peanut supremacy confirmed.</p>
        </motion.div>
      )}
    </div>
  );
}
