import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = {
  both: [
    {
      id: "got",
      question: "What is the name of the dragon Daenerys loses beyond the Wall?",
      options: ["DROGON", "RHAEGAL", "VISERION", "BALERION"],
      answer: "VISERION",
      flavour: "Night King's greatest weapon. You both know this.",
    },
  ],
  gupta: [
    {
      id: "cricket",
      question: "How many Test centuries has Virat Kohli scored?",
      options: ["28", "29", "30", "31"],
      answer: "30",
      flavour: "Your GOAT. Don't embarrass yourself.",
    },
  ],
  gohil: [
    {
      id: "titans",
      question: "Who captained Gujarat Titans in their first IPL winning season?",
      options: ["SHUBMAN GILL", "HARDIK PANDYA", "DAVID MILLER", "RASHID KHAN"],
      answer: "HARDIK PANDYA",
      flavour: "Your team. Your season. Easy.",
    },
  ],
};

export default function Trivia({ player, onComplete }) {
  const questions = [...QUESTIONS.both, ...(QUESTIONS[player.id] || [])];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [wrong, setWrong] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const q = questions[current];

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    const correct = option === q.answer;
    setResult(correct ? "correct" : "wrong");
    if (!correct) setWrong((w) => w + 1);

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setAllDone(true);
        setTimeout(() => onComplete(), 1200);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setResult(null);
      }
    }, 1200);
  };

  const isGupta = player.id === "gupta";

  return (
    <div className="space-y-4 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">Final Debrief</p>
        <p className="text-green-700 text-xs">
          Question {current + 1} of {questions.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!allDone ? (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <div className="border border-amber-800 rounded p-4 bg-amber-950/10">
              <p className="text-amber-300 text-sm leading-relaxed">{q.question}</p>
              <p className="text-amber-700 text-xs mt-2 italic">{q.flavour}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {q.options.map((option) => {
                let style = "border-green-900 text-green-700 hover:border-green-600 hover:text-green-400";
                if (selected) {
                  if (option === q.answer) style = "border-green-500 text-green-400 bg-green-950/30";
                  else if (option === selected && option !== q.answer) style = "border-red-600 text-red-400 bg-red-950/20";
                  else style = "border-green-900 text-green-900 opacity-40";
                }
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`border rounded px-3 py-2 text-xs tracking-wider transition ${style}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {result && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs text-center ${result === "correct" ? "text-green-400" : "text-red-400"}`}
              >
                {result === "correct" ? "✓ Correct." : `✗ It was ${q.answer}.`}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="border border-green-500 rounded p-4 bg-green-950/20 text-center space-y-2">
              <p className="text-green-400 text-lg font-bold">✓ Debrief Complete</p>
              <p className="text-green-600 text-sm">
                {wrong === 0
                  ? "Perfect score. Respect."
                  : wrong === 1
                  ? "One wrong. We'll let it slide."
                  : "Disappointing. But we move."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
