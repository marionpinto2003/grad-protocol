import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DARE_TEXT = "You failed to catch Jay. Just like last time. Post an embarrassing photo on your story and keep it up for 1 hour. Tap 'I posted it' to continue.";

export default function FindJay({ onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro | playing | won | dare
  const [jaiPosition, setJayPosition] = useState(1); // 0, 1, 2
  const [shuffling, setShuffling] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const round = 1;
  const timerRef = useRef(null);
  const shuffleRef = useRef(null);

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("dare");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startGame = () => {
    setPhase("playing");
    setTimeLeft(30);
    setJayPosition(Math.floor(Math.random() * 3));
    setShuffling(false);
    setRevealed(false);
    setSelectedPillar(null);
    startShuffling();
  };

  const startShuffling = () => {
    let count = 0;
    const maxShuffles = 6 + Math.floor(Math.random() * 4);
    shuffleRef.current = setInterval(() => {
      setShuffling(true);
      setJayPosition((prev) => {
        const options = [0, 1, 2].filter((p) => p !== prev);
        return options[Math.floor(Math.random() * options.length)];
      });
      count++;
      if (count >= maxShuffles) {
        clearInterval(shuffleRef.current);
        setShuffling(false);
      }
    }, 400);
  };

  const handlePillarTap = (index) => {
    if (shuffling || revealed || phase !== "playing") return;
    clearInterval(timerRef.current);
    setSelectedPillar(index);
    setRevealed(true);
    if (index === jaiPosition) {
      setTimeout(() => {
        setPhase("won");
        setTimeout(() => onComplete(), 2200);
      }, 1000);
    } else {
      setTimeout(() => setPhase("dare"), 2200);
    }
  };

  const getPillarEmoji = (index) => {
    if (!revealed) return "🏛️";
    if (index === jaiPosition) return "🏃";
    return "🏛️";
  };

  const getPillarLabel = (index) => {
    if (!revealed) return "???";
    if (index === jaiPosition) return "JAY!";
    return "empty";
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="text-center space-y-1">
        <p className="text-red-400 text-xs uppercase tracking-widest">Find Jay</p>
        <p className="text-green-700 text-xs">CCTV is unstable. Track the runner before he disappears again.</p>
      </div>

      {phase === "intro" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="border border-red-800 rounded p-4 bg-red-950/10 space-y-2">
            <p className="text-red-300 text-sm">Jay robbed a Sainsbury's and fled to India.</p>
            <p className="text-red-300 text-sm">Before he left — he hid behind 3 pillars.</p>
            <p className="text-amber-400 text-sm font-bold">Find him in 30 seconds or face the consequences.</p>
          </div>
          <button
            onClick={startGame}
            className="w-full border border-red-600 text-red-400 py-3 rounded hover:bg-red-950/30 transition text-sm tracking-wider"
          >
            [ START MANHUNT ]
          </button>
        </motion.div>
      )}

      {phase === "playing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="border border-green-900 rounded bg-black/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-green-700 text-xs">One chance</span>
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
                {timeLeft}s
              </div>
              <span className="text-green-700 text-xs">
                {shuffling ? "CCTV scrambling..." : "pick now"}
              </span>
            </div>

            <div className="h-2 bg-green-950 rounded overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                animate={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>

            <p className="text-green-800 text-xs text-center">
              {shuffling ? "Suspect movement detected behind pillars..." : "Signal locked. Choose a pillar."}
            </p>
          </div>

          {/* Pillars */}
          <div className="relative border border-green-900 rounded p-4 bg-black/40 overflow-hidden">
            <motion.div
              animate={{ opacity: [0.12, 0.32, 0.12] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(34,197,94,0.16)_50%)] bg-[length:100%_6px] pointer-events-none"
            />

            <div className="flex justify-around items-end py-4 relative z-10">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={shuffling && jaiPosition === i ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => handlePillarTap(i)}
              >
                <AnimatePresence>
                  {revealed && i === selectedPillar && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs font-bold ${
                        selectedPillar === jaiPosition ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {selectedPillar === jaiPosition ? "GOT HIM!" : "WRONG ONE"}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div
                  className={`text-5xl transition-all ${
                    revealed
                      ? i === jaiPosition
                        ? "filter-none"
                        : "opacity-40"
                      : selectedPillar === i
                      ? "scale-110"
                      : "hover:scale-105"
                  }`}
                >
                  {getPillarEmoji(i)}
                </div>
                <div className={`text-xs ${revealed && i === jaiPosition ? "text-red-400" : "text-green-800"}`}>
                  {revealed ? getPillarLabel(i) : `Pillar ${i + 1}`}
                </div>
              </motion.div>
            ))}
            </div>
          </div>

          {revealed && selectedPillar === jaiPosition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-green-500 rounded p-3 bg-green-950/20 text-center"
            >
              <p className="text-green-400 text-sm">✓ Found him. Somehow.</p>
            </motion.div>
          )}

          {revealed && selectedPillar !== jaiPosition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-red-800 rounded p-3 bg-red-950/20 text-center"
            >
              <p className="text-red-400 text-sm">Wrong pillar. He got away. Again.</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {phase === "won" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-green-500 rounded p-4 bg-green-950/20 text-center space-y-2"
        >
          <p className="text-green-400 text-lg font-bold">✓ Jay Caught</p>
          <p className="text-green-600 text-xs">Unlike real life.</p>
        </motion.div>
      )}

      {phase === "dare" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <div className="border-2 border-red-600 rounded p-4 bg-red-950/20 space-y-2">
            <p className="text-red-400 text-xs uppercase tracking-widest">⚠ Penalty Activated</p>
            <p className="text-red-300 text-sm leading-relaxed">{DARE_TEXT}</p>
          </div>
          <button
            onClick={() => onComplete()}
            className="w-full border border-red-500 text-red-400 py-3 rounded hover:bg-red-950/30 transition text-sm tracking-wider"
          >
            [ I POSTED IT — CONTINUE ]
          </button>
        </motion.div>
      )}
    </div>
  );
}
