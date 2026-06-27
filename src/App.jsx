import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadState, completeStage, resetState } from "./utils/storage";
import { STAGES, PLAYERS } from "./config/locations";
import StageView from "./components/StageView";
import MissionMap from "./components/MissionMap";
import PhotoGallery from "./components/PhotoGallery";

const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD;

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const attempt = () => {
    if (input.trim().toLowerCase() === SITE_PASSWORD?.toLowerCase()) {
      onUnlock();
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#030a03] text-green-400 font-mono flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6 text-center"
      >
        <div className="space-y-1">
          <p className="text-green-600 text-xs uppercase tracking-widest">CLASSIFIED SYSTEM</p>
          <p className="text-green-300 text-lg font-bold">THE GRAD PROTOCOL</p>
          <p className="text-green-800 text-xs">Authorised personnel only.</p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && attempt()}
            placeholder="Enter access code"
            className={`w-full bg-black/40 border rounded px-4 py-3 text-green-300 text-sm text-center tracking-widest placeholder-green-900 outline-none transition ${
              error ? "border-red-500" : "border-green-900 focus:border-green-400"
            }`}
          />
          {error && <p className="text-red-500 text-xs">Access denied.</p>}
          <button
            onClick={attempt}
            className="w-full border border-green-800 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider"
          >
            [ AUTHENTICATE ]
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("grad_auth") === "1");
  const [player, setPlayer] = useState(null);
  const [appState, setAppState] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [finalScreen, setFinalScreen] = useState(false);

  useEffect(() => {
    if (!player) return;
    const state = loadState(player.id);
    setAppState(state);
  }, [player]);

  useEffect(() => {
    if (!appState) return;
    if (appState.completedStages.length === STAGES.length) {
      setFinalScreen(true);
    }
  }, [appState]);

  const handleStageComplete = useCallback(async (stageIndex) => {
    const newState = completeStage(appState, stageIndex, player.id, STAGES.length);
    setAppState(newState);
  }, [appState, player]);

  const handleReset = () => {
    const typed = window.prompt(
      "DANGER: This will erase all saved mission progress and photos for this operative.\n\nType RESET to confirm."
    );

    if (typed === "RESET") {
      setAppState(resetState(player.id));
      setFinalScreen(false);
    }
  };

  const handleBack = () => {
    if (showProgress) {
      setShowProgress(false);
      return;
    }

    if (finalScreen) {
      setFinalScreen(false);
      return;
    }

    setPlayer(null);
  };

  if (!unlocked) {
    return <PasswordGate onUnlock={() => { sessionStorage.setItem("grad_auth", "1"); setUnlocked(true); }} />;
  }

  if (!player) {
    return <PlayerSelect onSelect={setPlayer} />;
  }

  if (!appState) return null;

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
          <button
            onClick={handleBack}
            className="mb-2 border border-green-900 text-green-700 text-xs px-3 py-1.5 rounded hover:border-green-700 hover:text-green-500 transition"
          >
            ← BACK
          </button>

          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`text-xs ${player.id === "gupta" ? "text-[#cba135]" : "text-[#87ceeb]"}`}
            >
              ●
            </motion.span>
            <span className={`text-sm font-bold tracking-widest uppercase ${player.id === "gupta" ? "text-[#d71920]" : "text-[#d4af37]"}`}>
              OPERATIVE {player.codename}
            </span>
          </div>
          <p className="text-green-800 text-xs mt-0.5">
            {appState.completedStages.length}/{STAGES.length} STAGES CLEARED
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="border border-green-900 text-green-700 text-xs px-3 py-1.5 rounded hover:border-green-800 hover:text-green-600 transition"
          >
            {showProgress ? "[ HIDE ]" : "[ MAP ]"}
          </button>
          <button
            onClick={() => setPlayer(null)}
            className="border border-green-900 text-green-700 text-xs px-2 py-1.5 rounded hover:border-green-800 hover:text-green-600 transition"
          >
            ⇄
          </button>
          <button
            onClick={handleReset}
            className="border border-red-900 text-red-800 text-xs px-2 py-1.5 rounded hover:border-red-700 hover:text-red-600 transition"
          >
            ↺
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
              <MissionMap
                completedStages={appState.completedStages}
                currentStage={appState.currentStage}
                player={player}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {finalScreen ? (
          <FinalScreen player={player} startedAt={appState.startedAt} />
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
                player={player}
                onComplete={handleStageComplete}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <p className="text-green-900 text-xs text-center tracking-widest pb-4">
          GRAD_PROTOCOL v2.1 CLUEFIX · EYES ONLY
        </p>
      </main>
    </div>
  );
}

function PlayerSelect({ onSelect }) {
  return (
    <div className="min-h-screen bg-[#030a03] flex flex-col items-center justify-center px-6 font-mono">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,255,100,0.15) 0px, transparent 1px, transparent 2px)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        <div className="text-center space-y-2">
          <motion.p
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-green-600 text-xs tracking-widest uppercase"
          >
            Initialising...
          </motion.p>
          <h1 className="text-green-400 text-2xl font-bold tracking-widest uppercase">
            The Grad Protocol
          </h1>
          <p className="text-green-700 text-xs tracking-wider">
            Identify yourself, Operative.
          </p>
        </div>

        <div className="space-y-3">
          {Object.values(PLAYERS).map((p) => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(p)}
              className={`w-full border rounded-lg px-6 py-4 text-left transition space-y-1 ${
                p.id === "gupta"
                  ? "border-[#d71920] hover:border-[#cba135] hover:bg-[#d71920]/20"
                  : "border-[#1c3f94] hover:border-[#87ceeb] hover:bg-[#1c3f94]/25"
              }`}
            >
              <p className={`text-sm font-bold tracking-widest ${p.id === "gupta" ? "text-[#d71920]" : "text-[#d4af37]"}`}>
                OPERATIVE {p.codename}
              </p>
              <p className="text-green-700 text-xs">{p.fullName}</p>
            </motion.button>
          ))}
        </div>

        <p className="text-green-900 text-xs text-center">
          Select your identity to begin.
        </p>
      </motion.div>
    </div>
  );
}

function FinalScreen({ player, startedAt }) {
  const [showArchive, setShowArchive] = useState(false);
  const elapsed = startedAt
    ? Math.round((Date.now() - startedAt) / 60000)
    : null;

  useEffect(() => {
    const timer = setTimeout(() => setShowArchive(true), 4200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-amber-600 rounded-lg p-6 bg-black/60 text-center space-y-5"
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
          FINAL DEBRIEF
        </p>
        <h1 className="text-white text-2xl font-bold">Mission Accomplished</h1>
        <p className="text-green-600 text-sm mt-2">
          All 9 stages cleared, Operative {player.codename}.
        </p>
      </div>

      <div className="border border-green-900 rounded p-4 bg-black/40 text-left font-mono text-xs space-y-2">
        {[
          "FINAL KEY ACCEPTED",
          "CUMLAUDE VERIFIED",
          "ALL FIELD MISSIONS COMPLETE",
          "GENERATING MEMORY ARCHIVE...",
        ].map((line, index) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.75 }}
            className="text-green-400 tracking-widest"
          >
            &gt; {line}
          </motion.p>
        ))}
      </div>

      {elapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2 }}
          className="border border-green-900 rounded px-4 py-2 bg-black/30 inline-block"
        >
          <p className="text-green-600 text-xs">Total mission time</p>
          <p className="text-green-400 font-bold">
            {elapsed >= 60
              ? `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`
              : `${elapsed}m`}
          </p>
        </motion.div>
      )}

      {showArchive ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PhotoGallery player={player} />
        </motion.div>
      ) : (
        <motion.p
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-green-700 text-xs uppercase tracking-widest"
        >
          Archive loading...
        </motion.p>
      )}
    </motion.div>
  );
}
