import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function TerminalTyper({ lines = [], speed = 35, onComplete }) {
  const [displayed, setDisplayed] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= lines.length) {
      onComplete?.();
      return;
    }

    const line = lines[currentLine];

    if (currentChar < line.length) {
      const t = setTimeout(() => {
        setDisplayed((prev) => {
          const next = [...prev];
          next[currentLine] = (next[currentLine] || "") + line[currentChar];
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [currentChar, currentLine, lines, speed, onComplete]);

  return (
    <div className="font-mono text-sm space-y-1">
      {displayed.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2"
        >
          <span className="text-green-500 select-none">{">"}</span>
          <span className="text-green-400">{line}</span>
        </motion.div>
      ))}
      {currentLine < lines.length && (
        <div className="flex gap-2">
          <span className="text-green-500 select-none">{">"}</span>
          <span className="text-green-400 after:content-['▌'] after:animate-pulse" />
        </div>
      )}
    </div>
  );
}
