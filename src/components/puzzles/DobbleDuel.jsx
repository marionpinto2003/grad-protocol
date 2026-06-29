import { useState } from "react";
import { motion } from "framer-motion";

export default function DobbleDuel({ player, onComplete }) {
  const [penaltyAccepted, setPenaltyAccepted] = useState(false);

  const isGohil = player?.id === "gohil";

  const penaltyTitle = isGohil ? "PINTO PECK PENALTY" : "REFRESHMENT TAX";
  const penaltyText = isGohil
    ? "Gohil must give Pinto one victory peck before the arcade sector opens."
    : "Gupta must buy Pinto and Gohil one drink before the arcade sector opens.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-green-500/40 bg-black/80 p-5 rounded-xl space-y-5"
    >
      <div className="text-center space-y-2">
        <p className="text-xs text-green-400 tracking-[0.35em] uppercase">
          DETOUR CARD
        </p>

        <h2 className="text-2xl font-black text-green-300">
          SPOT IT OR SUBMIT
        </h2>

        <p className="text-green-700 text-xs uppercase tracking-widest">
          Funky Chips sector cleared · Arcade route locked
        </p>
      </div>

      <div className="border border-green-900/60 bg-green-950/10 rounded-lg p-4 space-y-3 text-sm text-green-100 leading-relaxed">
        <p>
          Before Royale Leisure clearance is granted, Pinto issues one final
          reflex test.
        </p>

        <p>
          Challenge Pinto to one official round of Dobble. No excuses, no
          lighting complaints, no blaming the cards.
        </p>
      </div>

      <div className="grid gap-3">
        <div className="border border-green-500/30 bg-green-500/10 p-4 rounded-lg">
          <p className="text-green-300 font-bold uppercase text-xs mb-1">
            Success Condition
          </p>
          <p className="text-green-100 text-sm">
            Defeat Pinto. Royale Leisure route card unlocks immediately.
          </p>
        </div>

        <div className="border border-yellow-500/40 bg-yellow-500/10 p-4 rounded-lg">
          <p className="text-yellow-300 font-bold uppercase text-xs mb-1">
            Failure Condition · {penaltyTitle}
          </p>
          <p className="text-yellow-100 text-sm">{penaltyText}</p>
        </div>
      </div>

      {!penaltyAccepted ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={onComplete}
            className="border border-green-400 bg-green-500/20 hover:bg-green-500/30 text-green-100 font-bold py-3 rounded-lg"
          >
            PINTO DEFEATED
          </button>

          <button
            onClick={() => setPenaltyAccepted(true)}
            className="border border-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 font-bold py-3 rounded-lg"
          >
            PINTO WON
          </button>
        </div>
      ) : (
        <div className="space-y-3 border border-yellow-500/40 bg-yellow-500/10 rounded-lg p-4">
          <p className="text-yellow-200 text-sm">
            {penaltyTitle} accepted. Penalty must be paid before the next leg
            begins.
          </p>

          <button
            onClick={onComplete}
            className="w-full border border-green-400 bg-green-500/20 hover:bg-green-500/30 text-green-100 font-bold py-3 rounded-lg"
          >
            PENALTY PAID — UNLOCK ROUTE CARD
          </button>
        </div>
      )}
    </motion.div>
  );
}
