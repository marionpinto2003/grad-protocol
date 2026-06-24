import { motion } from "framer-motion";

export default function ClueReveal({
  clue,
  unlockType,
  onProceedToUnlock,
  onProceedToComplete,
  player,
  capturedPhoto,
}) {
  const isGupta = player?.id === "gupta";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {capturedPhoto && (
        <div className="border border-green-800 rounded overflow-hidden">
          <img src={capturedPhoto} alt="Captured" className="w-full object-cover max-h-64" />
          <p className="text-green-600 text-xs text-center py-1">✓ Photo captured</p>
        </div>
      )}

      <div className="border border-green-600 rounded px-3 py-2 bg-green-950/20 text-center">
        <p className="text-green-400 text-xs tracking-widest uppercase">
          ✓ Clue Unlocked
        </p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <div className="border border-amber-700 rounded p-4 bg-amber-950/10">
          <p className="text-amber-300 text-sm leading-relaxed italic">
            "{clue}"
          </p>
        </div>

        {unlockType === "wordSplit" ? (
          <button
            onClick={onProceedToUnlock}
            className={`w-full border py-3 rounded transition text-sm tracking-wider ${
              isGupta
                ? "border-green-500 text-green-400 hover:bg-green-950/30"
                : "border-amber-500 text-amber-400 hover:bg-amber-950/30"
            }`}
          >
            [ ENTER COMBINED WORD ]
          </button>
        ) : (
          <button
            onClick={onProceedToComplete}
            className={`w-full border py-3 rounded transition text-sm tracking-wider ${
              isGupta
                ? "border-green-500 text-green-400 hover:bg-green-950/30"
                : "border-amber-500 text-amber-400 hover:bg-amber-950/30"
            }`}
          >
            [ UNDERSTOOD — MOVE ON ]
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
