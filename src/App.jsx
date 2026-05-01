import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadState, completeStage, resetState } from "./utils/storage";
import { STAGES } from "./config/locations";
import StageView from "./components/StageView";
import MissionProgress from "./components/MissionProgress";

export default function App() {
  const [appState, setAppState] = useState(() => loadState());
  const [showProgress, setShowProgress] = useState(false);
  const [finalScreen, setFinalScreen] = useState(false);

  useEffect(() => {
    if (appState.completedStages.length === STAGES.length) {
      setFinalScreen(true);
    }
  }, [appState.completedStages]);

  const handleStageComplete = useCallback(async (stageIndex) => {
    const newState = completeStage(appState, stageIndex);
    setAppState(newState);
  }, [appState]);

  const handleReset = () => {
    if (window.confirm("RESET PROTOCOL? All progress will be lost.")) {
      setAppState(resetState());
      setFinalScreen(false);
    }
  };

  const currentStage = STAGES[appState.currentStage];

  return (
    <div className="min-h-screen bg-[#030a03] text-green-400 font-mono relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,255,100,0.15) 0px, transparent 1px, transparent 2px)",
        }}
      />

      <header className="border-b border-green-900 px-4 py-3 flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-green-500 text-xs"
            >
              ●
            </motion.span>
            <span className="text-green-400 text-sm font-bold tracking-widest uppercase">
              THE GRAD PROTOCOL
            </span>
          </div>
          <p className="text-green-800 text-xs mt-0.5">
            {appState.completedStages.length}/{STAGES.length} STAGES CLEARED
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="border border-green-900 text-green-700 text-xs px-3 py-1.5 rounded hover:border-green-700 hover:text-green-500 transition"
          >
            {showProgress ? "[ HIDE MAP ]" : "[ MISSION MAP ]"}
          </button>
          <button
            onClick={handleReset}
            className="border border-red-900 text-red-800 text-xs px-2 py-1.5 rounded hover:border-red-700 hover:text-red-600 transition"
          >
            RESET
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-4">
        <AnimatePresence>
          {showProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-green-900 rounded-lg p-4 bg-black/40 overflow-hidden"
            >
              <MissionProgress
                completedStages={appState.completedStages}
                currentStage={appState.currentStage}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {finalScreen ? (
          <FinalScreen startedAt={appState.startedAt} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="border border-green-900 rounded-lg p-4 bg-black/40"
            >
              <StageView
                stage={currentStage}
                onComplete={handleStageComplete}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <p className="text-green-900 text-xs text-center tracking-widest pb-4">
          GRAD_PROTOCOL v1.0 · EYES ONLY
        </p>
      </main>
    </div>
  );
}

function FinalScreen({ startedAt }) {
  const elapsed = startedAt
    ? Math.round((Date.now() - startedAt) / 60000)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-amber-600 rounded-lg p-6 bg-black/60 text-center space-y-4"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-6xl"
      >
        🎓
      </motion.div>
      <div>
        <p className="text-amber-400 text-xs tracking-widest uppercase mb-2">
          PROTOCOL COMPLETE
        </p>
        <h1 className="text-white text-2xl font-bold">Mission Accomplished</h1>
        <p className="text-green-500 text-sm mt-2">
          All 8 stages cleared. You have graduated, Operative.
        </p>
      </div>
      {elapsed && (
        <div className="border border-green-900 rounded px-4 py-2 bg-black/30 inline-block">
          <p className="text-green-600 text-xs">Total mission time</p>
          <p className="text-green-400 font-bold">
            {elapsed >= 60
              ? `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`
              : `${elapsed}m`}
          </p>
        </div>
      )}
    </motion.div>
  );
}
