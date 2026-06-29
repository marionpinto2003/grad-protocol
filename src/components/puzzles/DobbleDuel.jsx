import { useState } from "react";
import { motion } from "framer-motion";

export default function DobbleDuel({ player, onComplete }) {
  const [taxAccepted, setTaxAccepted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-green-500/40 bg-black/80 p-5 rounded-xl space-y-5"
    >
      <div>
        <p className="text-xs text-green-400 tracking-[0.3em] uppercase">
          BONUS PROTOCOL
        </p>

        <h2 className="text-2xl font-black text-green-300 mt-2">
          DOBBLE DUEL CLEARANCE
        </h2>
      </div>

      <div className="space-y-3 text-green-100 text-sm leading-relaxed">
        <p>
          Funky Chips protocol complete. Before Royale Leisure clearance is
          granted, challenge Pinto to one official round of Dobble.
        </p>

        <div className="border border-green-500/30 bg-green-500/10 p-4 rounded-lg">
          <p className="text-green-300 font-bold uppercase text-xs mb-1">
            Objective
          </p>
          <p>Defeat Pinto at Dobble.</p>
        </div>

        <div className="border border-yellow-500/40 bg-yellow-500/10 p-4 rounded-lg">
          <p className="text-yellow-300 font-bold uppercase text-xs mb-1">
            Failure Condition
          </p>

          <p>
            If Pinto wins, Arcade Tax is applied:{" "}
            <span className="font-bold">
              {player?.codename || "the operative"} owes Pinto one arcade game
              of her choice at Royale Leisure Park.
            </span>
          </p>
        </div>
      </div>

      {!taxAccepted ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={onComplete}
            className="border border-green-400 bg-green-500/20 hover:bg-green-500/30 text-green-100 font-bold py-3 rounded-lg"
          >
            PINTO DEFEATED
          </button>

          <button
            onClick={() => setTaxAccepted(true)}
            className="border border-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 font-bold py-3 rounded-lg"
          >
            ARCADE TAX APPLIED
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-yellow-200 text-sm">
            Arcade Tax accepted. Pinto may redeem one arcade game at Royale
            Leisure Park.
          </p>

          <button
            onClick={onComplete}
            className="w-full border border-green-400 bg-green-500/20 hover:bg-green-500/30 text-green-100 font-bold py-3 rounded-lg"
          >
            TAX ACCEPTED — UNLOCK ROYALE
          </button>
        </div>
      )}
    </motion.div>
  );
}
