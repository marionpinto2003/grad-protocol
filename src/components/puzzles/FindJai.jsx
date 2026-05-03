import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DARE_TEXT = "You failed to catch Jai. Just like last time. Post an embarrassing photo on your story and keep it up for 1 hour. Tap 'I posted it' to continue.";

export default function FindJai({ onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro | playing | won | dare
  const [jaiPosition, setJaiPosition] = useState(1); // 0, 1, 2
  const [shuffling, setShuffling] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [round, setRound] = useState(1);
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
    setJaiPosition(Math.floor(Math.random() * 3));
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
      setJaiPosition((prev) => {
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
        if (round >= 2) {
          setPhase("won");
          setTimeout(() => onComplete(), 1200);
        } else {
          setRound((r) => r + 1);
          setTimeout(() => startGame(), 1500);
        }
      }, 1000);
    } else {
      setTimeout(() => setPhase("dare"), 1000);
    }
  };

  const getPillarEmoji = (index) => {
    if (!revealed) return "🏛️";
    if (index === jaiPosition) return "🏃";
    return "🏛️";
  };

  const getPillarLabel = (index) => {
    if (!revealed) return "???";
    if (index === jaiPosition) return "JAI!";
    return "empty";
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="text-center space-y-1">
        <p className="text-red-400 text-xs uppercase tracking-widest">Find Jai</p>
        <p className="text-green-700 text-xs">He's hiding behind one of the pillars. Track him.</p>
      </div>

      {phase === "intro" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="border border-red-800 rounded p-4 bg-red-950/10 space-y-2">
            <p className="text-red-300 text-sm">Jai robbed a Sainsbury's and fled to India.</p>
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
          {/* Timer */}
          <div className="flex items-center justify-between">
            <span className="text-green-700 text-xs">Round {round}/2</span>
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
              {timeLeft}s
            </div>
            <span className="text-green-700 text-xs">
              {shuffling ? "shuffling..." : "pick now"}
            </span>
          </div>

          {/* Pillars */}
          <div className="flex justify-around items-end py-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={shuffling && jaiPosition === i ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => handlePillarTap(i)}
              >
                <AnimatePresence>
                  {revealed && i === jaiPosition && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 font-bold"
                    >
                      GOT HIM!
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

          {revealed && selectedPillar === jaiPosition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-green-500 rounded p-3 bg-green-950/20 text-center"
            >
              <p className="text-green-400 text-sm">✓ Found him. Round {round} complete.</p>
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
          <p className="text-green-400 text-lg font-bold">✓ Jai Caught</p>
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
            onClick={() => {
              setPhase("won");
              setTimeout(() => onComplete(), 800);
            }}
            className="w-full border border-red-500 text-red-400 py-3 rounded hover:bg-red-950/30 transition text-sm tracking-wider"
          >
            [ I POSTED IT ]
          </button>
        </motion.div>
      )}
    </div>
  );
}
