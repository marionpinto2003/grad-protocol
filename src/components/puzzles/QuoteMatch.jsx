import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  {
    quote: "A Lannister always pays his debts.",
    answer: "Tyrion Lannister",
    options: ["Tyrion Lannister", "Cersei Lannister", "Jon Snow", "Varys"],
  },
  {
    quote: "Babita ji... aap toh kamaal karti hain.",
    answer: "Jethalal Gada",
    options: ["Jethalal Gada", "Taarak Mehta", "Bhide", "Popatlal"],
  },
  {
    quote: "Chaos isn't a pit. Chaos is a ladder.",
    answer: "Littlefinger",
    options: ["Littlefinger", "Varys", "Tyrion Lannister", "Cersei Lannister"],
  },
  {
    quote: "Ae Daya! Darvaazo tod do!",
    answer: "Jethalal Gada",
    options: ["Jethalal Gada", "Taarak Mehta", "Popatlal", "Bhide"],
  },
  {
    quote: "The night is dark and full of terrors.",
    answer: "Melisandre",
    options: ["Melisandre", "Cersei Lannister", "Sansa Stark", "Daenerys"],
  },
  {
    quote: "Mein aur meri tanhaai... aksar yeh baatein karte hain.",
    answer: "Popatlal",
    options: ["Popatlal", "Jethalal Gada", "Bhide", "Taarak Mehta"],
  },
  {
    quote: "Dracarys.",
    answer: "Daenerys",
    options: ["Daenerys", "Melisandre", "Cersei Lannister", "Sansa Stark"],
  },
  {
    quote: "Nonsense! Bilkul nonsense!",
    answer: "Bapuji",
    options: ["Bapuji", "Jethalal Gada", "Popatlal", "Taarak Mehta"],
  },
];

const PASS_SCORE = 6;

function shuffleOptions(options) {
  return [...options].sort(() => Math.random() - 0.5);
}

export default function QuoteMatch({ onComplete }) {
  const [phase, setPhase] = useState("intro");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong"

  const shuffledQuotes = useMemo(() => {
    return QUOTES.map((quote) => ({
      ...quote,
      options: shuffleOptions(quote.options),
    }));
  }, []);

  const q = shuffledQuotes[current];

  const handleAnswer = (option) => {
    if (feedback) return;
    setSelected(option);
    const correct = option === q.answer;
    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => {
      const newScore = correct ? score + 1 : score;
      setScore(newScore);
      setFeedback(null);
      setSelected(null);

      if (current + 1 >= shuffledQuotes.length) {
        if (newScore >= PASS_SCORE) {
          setPhase("won");
          setTimeout(() => onComplete(), 1400);
        } else {
          setPhase("lost");
        }
      } else {
        setCurrent(current + 1);
      }
    }, 900);
  };

  const retry = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setPhase("playing");
  };

  return (
    <div className="space-y-3 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Quote Protocol</p>
        <p className="text-amber-700 text-xs">TMKOC or GOT — who said it?</p>
      </div>

      {phase === "intro" && (
        <div className="space-y-3">
          <div className="border border-amber-900/50 rounded p-4 bg-black/30 text-center space-y-2">
            <p className="text-amber-400 text-sm">Two worlds. Eight quotes.</p>
            <p className="text-amber-700 text-xs">Gokuldham Society meets Westeros. Match the quote to the character.</p>
            <p className="text-amber-600 text-xs font-bold">Get {PASS_SCORE}/8 to proceed.</p>
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
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-amber-800 px-1">
              <span>Question {current + 1} / {shuffledQuotes.length}</span>
              <span>Score: {score}</span>
            </div>
            <div className="h-2 bg-amber-950 rounded overflow-hidden border border-amber-900/60">
              <motion.div
                className="h-full bg-amber-500"
                animate={{ width: `${((current + 1) / shuffledQuotes.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="border border-amber-900/50 rounded p-5 bg-black/40 text-center min-h-24 flex flex-col items-center justify-center space-y-2">
            <p className="text-amber-700 text-[10px] uppercase tracking-widest">
              Incoming quote
            </p>
            <p className="text-amber-300 text-base italic leading-relaxed">"{q.quote}"</p>
          </div>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded p-2 text-center text-xs font-bold tracking-widest ${
                feedback === "correct"
                  ? "border-green-500 text-green-400 bg-green-950/20"
                  : "border-red-500 text-red-400 bg-red-950/20"
              }`}
            >
              {feedback === "correct" ? "✓ CORRECT" : `✕ WRONG — IT WAS ${q.answer.toUpperCase()}`}
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt) => {
              let style = "border-amber-900/50 text-amber-700 hover:border-amber-600 hover:text-amber-400";
              if (selected === opt) {
                style = feedback === "correct"
                  ? "border-green-500 text-green-400 bg-green-950/30"
                  : "border-red-500 text-red-400 bg-red-950/30";
              } else if (feedback && opt === q.answer) {
                style = "border-green-500 text-green-400 bg-green-950/30";
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`border rounded px-2 py-3 text-xs transition text-left leading-tight ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === "won" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6 space-y-2"
        >
          <p className="text-4xl">👑</p>
          <p className="text-amber-400 font-bold text-lg tracking-wider">PROTOCOL CLEARED</p>
          <p className="text-amber-700 text-xs">{score}/8 — You know your people.</p>
        </motion.div>
      )}

      {phase === "lost" && (
        <div className="text-center py-4 space-y-3">
          <p className="text-red-400 font-bold">FAILED — {score}/8</p>
          <p className="text-red-700 text-xs">Bapuji is disappointed. Even Popatlal got more right.</p>
          <p className="text-red-500 text-xs font-bold mt-1">PENALTY: Chug a BuzzBall. Right now.</p>
          <button
            onClick={() => onComplete()}
            className="border border-amber-600 text-amber-400 px-4 py-2 rounded text-xs tracking-wider hover:bg-amber-950/30 transition"
          >
            [ PENALTY ACCEPTED — PROCEED ]
          </button>
        </div>
      )}
    </div>
  );
}
