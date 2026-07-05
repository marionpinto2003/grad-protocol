import { useState } from "react";
import { motion } from "framer-motion";

export default function MakeOut({ onComplete }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="space-y-3 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Classified Operations</p>
        <p className="text-amber-700 text-xs">Building 12 — Active Search</p>
      </div>

      <div className="border border-amber-900/50 rounded p-4 bg-amber-950/10 space-y-3 text-center">
        <p className="text-4xl">🚪</p>
        <p className="text-amber-300 text-sm leading-relaxed">
          After Gupta plays the match with you, look for the hearts hidden around the classrooms. Follow the heart trail carefully — it leads to your Math Award.
        </p>
        <p className="text-amber-700 text-xs leading-relaxed">
          It's hidden somewhere in Building 12. Check the classrooms — you know them better than anyone. Find it.
        </p>
      </div>

      {!confirmed ? (
        <button
          onClick={() => setConfirmed(true)}
          className="w-full border border-amber-600 text-amber-400 py-3 rounded hover:bg-amber-950/40 transition text-sm tracking-wider"
        >
          [ I FOUND IT ]
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="border border-green-700 rounded p-3 bg-green-950/20 text-center">
            <p className="text-green-400 text-sm">🏆 Math Award Located</p>
            <p className="text-green-700 text-xs mt-1">David should have given you this years ago.</p>
          </div>
          <button
            onClick={() => onComplete()}
            className="w-full border border-green-600 text-green-400 py-3 rounded hover:bg-green-950/40 transition text-sm tracking-wider"
          >
            [ PROCEED ]
          </button>
        </motion.div>
      )}
    </div>
  );
}
