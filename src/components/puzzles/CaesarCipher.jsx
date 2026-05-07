import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CaesarCipher({ onComplete }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [solved, setSolved] = useState(false);
  const ANSWER = "FUNKYCHIPS";

  const handleSubmit = () => {
    const cleaned = input.trim().toUpperCase().replace(/\s/g, "");
    if (cleaned === ANSWER) {
      setSolved(true);
      setTimeout(() => onComplete(), 1000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="border border-amber-800 rounded p-4 bg-amber-950/10">
        <p className="text-amber-500 text-xs uppercase tracking-widest mb-2">Encrypted Message</p>
        <p className="text-amber-300 text-2xl font-bold tracking-widest text-center py-2">
          SPIHC YKNUF
        </p>
        <p className="text-amber-700 text-xs text-center mt-2">
          Each word has been reversed. Decode it.
        </p>
      </div>
      <AnimatePresence>
        {!solved ? (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="ENTER DECODED MESSAGE"
              className={`w-full bg-black border rounded px-3 py-2 font-mono text-sm tracking-widest outline-none transition ${
                error ? "border-red-500 text-red-400" : "border-green-800 focus:border-green-500 text-green-400"
              }`}
            />
            {error && <p className="text-red-400 text-xs">INCORRECT — Try again.</p>}
            <button
              onClick={handleSubmit}
              className="w-full border border-green-600 text-green-400 py-2 rounded hover:bg-green-950/40 transition text-sm tracking-wider"
            >
              [ DECODE ]
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-green-500 rounded p-3 bg-green-950/20 text-center"
          >
            <p className="text-green-400 text-sm">✓ DECRYPTED — FUNKY CHIPS</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
