import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHALLENGES = [
  {
    id: "sheila",
    title: "Sheila Ki Jawani",
    image: "/bollywood/sheila.jpeg",
    instruction: "Do the hook step or sing the hook. Full confidence required.",
  },
  {
    id: "chikni",
    title: "Chikni Chameli",
    image: "/bollywood/chikni.jpeg",
    instruction: "Do the iconic step or sing the hook. No lazy performance.",
  },
  {
    id: "fevicol",
    title: "Fevicol Se",
    image: "/bollywood/fevicol.jpeg",
    instruction: "Do the step or sing the hook. Make it shameless.",
  },
];

export default function QuoteMatch({ onComplete }) {
  const [phase, setPhase] = useState("intro");
  const [completed, setCompleted] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const cleared = completed.length === CHALLENGES.length;

  const markDone = (id) => {
    if (completed.includes(id)) return;
    setCompleted((prev) => [...prev, id]);
    setActiveId(id);
    setTimeout(() => setActiveId(null), 700);
  };

  const finish = () => {
    if (!cleared) return;
    setPhase("won");
    setTimeout(() => onComplete(), 1200);
  };

  return (
    <div className="space-y-3 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">
          Bollywood Performance Protocol
        </p>
        <p className="text-amber-700 text-xs">
          Complete all 3 performances.
        </p>
      </div>

      {phase === "intro" && (
        <div className="space-y-3">
          <div className="border border-amber-900/50 rounded p-4 bg-black/30 text-center space-y-2">
            <p className="text-amber-400 text-sm">
              Isleworth energy detected.
            </p>
            <p className="text-amber-700 text-xs leading-relaxed">
              Look at each scene. Do the dance step or sing the hook.
              No weak performances. Someone must witness it.
            </p>
          </div>

          <button
            onClick={() => setPhase("playing")}
            className="w-full border border-amber-600 text-amber-400 py-3 rounded hover:bg-amber-950/40 transition text-sm tracking-wider"
          >
            [ BEGIN ]
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-amber-800 px-1">
            <span>Completed: {completed.length}/{CHALLENGES.length}</span>
            <span>{cleared ? "READY" : "PENDING"}</span>
          </div>

          <div className="h-2 bg-amber-950 rounded overflow-hidden border border-amber-900/60">
            <motion.div
              className="h-full bg-amber-500"
              animate={{
                width: `${(completed.length / CHALLENGES.length) * 100}%`,
              }}
            />
          </div>

          <div className="space-y-3">
            {CHALLENGES.map((challenge) => {
              const isDone = completed.includes(challenge.id);
              const isActive = activeId === challenge.id;

              return (
                <motion.div
                  key={challenge.id}
                  animate={
                    isActive
                      ? {
                          scale: [1, 1.03, 1],
                          boxShadow: [
                            "0 0 0 rgba(34,197,94,0)",
                            "0 0 25px rgba(34,197,94,0.3)",
                            "0 0 0 rgba(34,197,94,0)",
                          ],
                        }
                      : {}
                  }
                  className={`overflow-hidden rounded border bg-black/40 ${
                    isDone ? "border-green-500/70" : "border-amber-900/50"
                  }`}
                >
                  <img
                    src={challenge.image}
                    alt={challenge.title}
                    className="w-full max-h-72 object-contain bg-black"
                  />

                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-amber-300 text-sm font-bold">
                        {challenge.title}
                      </p>
                      <span>{isDone ? "✅" : "☐"}</span>
                    </div>

                    <p className="text-amber-700 text-xs leading-relaxed mt-1">
                      {challenge.instruction}
                    </p>

                    <button
                      onClick={() => markDone(challenge.id)}
                      disabled={isDone}
                      className={`mt-3 w-full rounded py-2 text-xs tracking-wider transition ${
                        isDone
                          ? "border border-green-700 text-green-500 opacity-70"
                          : "border border-amber-700 text-amber-400 hover:bg-amber-950/40"
                      }`}
                    >
                      {isDone ? "[ COMPLETED ]" : "[ PERFORMANCE DONE ]"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {cleared && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-green-500 rounded p-3 bg-green-950/30 text-center"
              >
                <p className="text-green-300 font-bold text-sm">
                  🎬 Performance quota complete.
                </p>
                <p className="text-green-500 text-xs mt-1">
                  Proceed to the evidence photo.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={finish}
            disabled={!cleared}
            className={`w-full py-3 rounded text-sm font-bold tracking-wider transition ${
              cleared
                ? "bg-green-700 text-black hover:bg-green-500"
                : "bg-black/40 border border-amber-950 text-amber-900 cursor-not-allowed"
            }`}
          >
            CONTINUE →
          </button>
        </div>
      )}

      {phase === "won" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6 space-y-2"
        >
          <p className="text-4xl">💃</p>
          <p className="text-amber-400 font-bold text-lg tracking-wider">
            PROTOCOL CLEARED
          </p>
          <p className="text-amber-700 text-xs">
            Bollywood dignity successfully compromised.
          </p>
        </motion.div>
      )}
    </div>
  );
}
