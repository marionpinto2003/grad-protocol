import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PingPong({ onComplete }) {
  const [phase, setPhase] = useState("briefing");

  return (
    <div className="space-y-4 font-mono">
      <div className="border border-amber-800 rounded p-4 bg-amber-950/10 space-y-2">
        <p className="text-amber-400 text-xs uppercase tracking-widest">
          Table Tennis Redemption
        </p>
        <p className="text-green-300 text-sm leading-relaxed">
          Gupta lost to Trini here. That damage cannot be ignored.
        </p>
        <p className="text-green-700 text-xs">
          Objective: play one real rally/game. Restore honour. Capture proof.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {phase === "briefing" && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="border border-green-900 rounded p-3 bg-black/40 space-y-2">
              <p className="text-green-500 text-xs uppercase tracking-widest">
                Redemption Checklist
              </p>
              <p className="text-green-300 text-xs">□ Find the table tennis table</p>
              <p className="text-green-300 text-xs">□ Play one real rally or mini-game</p>
              <p className="text-green-300 text-xs">□ Declare Trini trauma officially processed</p>
            </div>

            <button
              onClick={() => setPhase("secured")}
              className="w-full border border-amber-500 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
            >
              [ HONOUR RESTORED ]
            </button>
          </motion.div>
        )}

        {phase === "secured" && (
          <motion.div
            key="secured"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-green-500 rounded p-4 bg-green-950/20 text-center space-y-3"
          >
            <p className="text-green-400 text-sm font-bold">
              ✓ Redemption accepted.
            </p>
            <p className="text-green-700 text-xs">
              Proceed to photographic proof.
            </p>

            <button
              onClick={onComplete}
              className="w-full border border-green-600 text-green-400 py-3 rounded hover:bg-green-950/40 transition text-sm tracking-wider"
            >
              [ CONTINUE TO PHOTO PROOF ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
