import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PARAGRAPH = [
  { letter: "B", rest: "efore the PS5 was even unboxed, the smell of paneer butter masala had already filled the kitchen." },
  { letter: "E", rest: "very sleepover here started the same way — nobody planned it, but nobody left either." },
  { letter: "C", rest: "OD was always next, TMKOC always in the background, volume just low enough to pretend it wasn't on." },
  { letter: "K", rest: "itchens like this one don't exist everywhere — the kind where food tastes better because of who made it." },
  { letter: "E", rest: "nding the night here never really felt like ending anything." },
  { letter: "N", rest: "obody said it out loud, but everyone knew this place was home." },
  { letter: "D", rest: "ays like these don't come back. That's what makes them worth remembering." },
];

const ANSWER = "BACKEND";

export default function HiddenWord({ onComplete }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === ANSWER) {
      setSolved(true);
      setTimeout(() => onComplete(), 1000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Hidden Message</p>
        <p className="text-green-700 text-xs">A word is hidden in this passage. Find it.</p>
      </div>

      {/* Paragraph */}
      <div className="border border-green-900 rounded p-4 bg-black/30 space-y-2">
        {PARAGRAPH.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="text-green-300 text-xs leading-relaxed"
          >
            <span className={`font-bold text-sm ${hintUsed ? "text-amber-400" : "text-green-300"}`}>
              {line.letter}
            </span>
            <span>{line.rest}</span>
          </motion.p>
        ))}
      </div>

      {!hintUsed && (
        <button
          onClick={() => setHintUsed(true)}
          className="w-full border border-green-900 text-green-800 py-1.5 rounded hover:border-green-700 hover:text-green-600 transition text-xs tracking-wider"
        >
          [ HINT ]
        </button>
      )}

      {hintUsed && (
        <p className="text-green-700 text-xs text-center">
          The first letter of each sentence spells the word.
        </p>
      )}

      <AnimatePresence>
        {!solved ? (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="ENTER HIDDEN WORD"
              className={`w-full bg-black border rounded px-3 py-2 font-mono text-sm tracking-widest outline-none transition ${
                error ? "border-red-500 text-red-400" : "border-green-800 focus:border-green-500 text-green-400"
              }`}
            />
            {error && <p className="text-red-400 text-xs">Not quite — look more carefully.</p>}
            <button
              onClick={handleSubmit}
              className="w-full border border-green-600 text-green-400 py-2 rounded hover:bg-green-950/40 transition text-sm tracking-wider"
            >
              [ SUBMIT ]
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-green-500 rounded p-3 bg-green-950/20 text-center"
          >
            <p className="text-green-400 text-sm">✓ BACKEND — Found it.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
