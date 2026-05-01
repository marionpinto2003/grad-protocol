import { motion } from "framer-motion";
import { STAGES } from "../config/locations";

export default function MissionProgress({ completedStages, currentStage }) {
  return (
    <div className="font-mono">
      <p className="text-green-700 text-xs uppercase tracking-widest mb-3">
        Mission Progress
      </p>
      <div className="space-y-1">
        {STAGES.map((stage, i) => {
          const isCompleted = completedStages.includes(i);
          const isCurrent = currentStage === i;
          const isLocked = !isCompleted && !isCurrent;

          return (
            <motion.div
              key={stage.id}
              initial={false}
              animate={{ opacity: isLocked ? 0.35 : 1 }}
              className={`flex items-center gap-2 text-xs py-1 px-2 rounded transition-colors ${
                isCurrent
                  ? "bg-green-950/50 border border-green-800"
                  : "border border-transparent"
              }`}
            >
              <span
                className={`w-4 h-4 flex-shrink-0 flex items-center justify-center text-xs border rounded-sm ${
                  isCompleted
                    ? "border-green-500 text-green-400 bg-green-950/50"
                    : isCurrent
                    ? "border-amber-500 text-amber-400"
                    : "border-green-900 text-green-900"
                }`}
              >
                {isCompleted ? "✓" : i + 1}
              </span>
              <span
                className={
                  isCompleted
                    ? "text-green-600 line-through"
                    : isCurrent
                    ? "text-amber-400"
                    : "text-green-900"
                }
              >
                {isLocked ? "████████" : stage.label}
              </span>
              {isCurrent && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-amber-400 ml-auto"
                >
                  ◄
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
