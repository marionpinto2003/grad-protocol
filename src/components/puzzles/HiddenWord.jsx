import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = [
  { letter: "B", rest: "etween the kitchen and the living room, something happened here that defies explanation.", highlight: false },
  { letter: "u", rest: "nder the glow of the TV, TMKOC played on loop while nobody admitted they were watching.", highlight: false },
  { letter: "E", rest: "very plate came back clean — paneer butter masala has that effect on people.", highlight: false },
  { letter: "v", rest: "oices got louder as the night went on, COD lobbies filling with noise.", highlight: false },
  { letter: "C", rest: "onsole controllers were passed around like they belonged to everyone.", highlight: false },
  { letter: "a", rest: "nd somehow, nobody ever left when they said they would.", highlight: false },
  { letter: "K", rest: "itchens like this one are rare. The kind that feel like home even when they aren't yours.", highlight: false },
  { letter: "w", rest: "aiting for the next visit became the default state of being.", highlight: false },
  { letter: "E", rest: "nding the night here never really felt like an ending.", highlight: false },
  { letter: "r", rest: "ealising that later is always the hardest part.", highlight: false },
  { letter: "N", rest: "obody said it out loud, but everyone felt it.", highlight: false },
  { letter: "o", rest: "nly when it was over did you understand what it meant.", highlight: false },
  { letter: "D", rest: "ays like these are the ones you chase forever.", highlight: false },
];

const ANSWER = "BACKEND";
// First letter of every odd-indexed line (0,2,4,6,8,10,12) = B,E,C,K,E,N,D

export default function HiddenWord({ onComplete }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === ANSWER) {
      setSolved(true);
      setTimeout(() => onComplete(), 2000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Hidden Message</p>
        <p className="text-green-700 text-xs">A 7-letter word is hidden in this passage.</p>
      </div>

      <div className="border border-green-900 rounded p-4 bg-black/30 space-y-1.5 max-h-64 overflow-y-auto">
        {LINES.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="text-xs leading-relaxed"
          >
            <span className={`font-bold ${
              hintLevel >= 2 && i % 2 === 0
                ? "text-amber-400 text-sm"
                : hintLevel >= 1 && i % 2 === 0
                ? "text-green-400"
                : "text-green-300"
            }`}>
              {line.letter}
            </span>
            <span className="text-green-700">{line.rest}</span>
          </motion.p>
        ))}
      </div>

      <div className="flex gap-2">
        {hintLevel < 1 && (
          <button
            onClick={() => setHintLevel(1)}
            className="flex-1 border border-green-900 text-green-800 py-1.5 rounded hover:border-green-700 hover:text-green-600 transition text-xs"
          >
            [ HINT 1 ]
          </button>
        )}
        {hintLevel === 1 && (
          <>
            <p className="flex-1 text-green-700 text-xs text-center py-1.5">
              Hint: Look at the first letter of certain sentences.
            </p>
            <button
              onClick={() => setHintLevel(2)}
              className="border border-green-900 text-green-800 px-3 py-1.5 rounded hover:border-green-700 hover:text-green-600 transition text-xs"
            >
              [ HINT 2 ]
            </button>
          </>
        )}
        {hintLevel >= 2 && (
          <p className="flex-1 text-amber-700 text-xs text-center py-1.5">
            Hint: Every other sentence. First letters only.
          </p>
        )}
      </div>

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
                error
                  ? "border-red-500 text-red-400"
                  : "border-green-800 focus:border-green-500 text-green-400"
              }`}
            />
            {error && <p className="text-red-400 text-xs">Not quite — keep looking.</p>}
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
            className="border border-green-500 rounded p-3 bg-green-950/20 text-center space-y-1"
          >
            <p className="text-green-400 text-sm font-bold">✓ BACKEND</p>
            <p className="text-green-600 text-xs">Now you know where to go next.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
