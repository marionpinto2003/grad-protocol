import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TerminalTyper from "./TerminalTyper";
import GpsHud from "./GpsHud";
import VoucherDisplay from "./VoucherDisplay";
import MugshotGenerator from "./MugshotGenerator";
import ClueReveal from "./ClueReveal";
import PhotoCapture from "./PhotoCapture";
import CaesarCipher from "./puzzles/CaesarCipher";
import PeanutThrow from "./puzzles/PeanutThrow";
import LimescaleScrub from "./puzzles/LimescaleScrub";
import FindJai from "./puzzles/FindJai";
import QuoteMatch from "./puzzles/QuoteMatch";
import PingPong from "./puzzles/PingPong";
import GuinnessCheck from "./puzzles/GuinnessCheck";
import GuinnessPenalty from "./puzzles/GuinnessPenalty";
import MakeOut from "./puzzles/MakeOut";
import { checkGeofence, getCurrentPosition } from "../utils/geofence";
import { markStageComplete } from "../utils/sync";
import { savePhoto } from "../utils/storage";

export default function StageView({ stage, player, onComplete }) {
  const startsWithPuzzle = stage["id"] === "wembley";
  const [phase, setPhase] = useState("booting");
  const [gpsData, setGpsData] = useState({ inside: false, distance: null, accuracy: null });
  const [wordInput, setWordInput] = useState("");
  const [wordError, setWordError] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [puzzleDone, setPuzzleDone] = useState(false);
  const intervalRef = useRef(null);

  const playerData = stage[player["id"]];

  const scanPosition = useCallback(async () => {
    try {
      const pos = await getCurrentPosition();
      const result = checkGeofence(pos, stage);
      setGpsData({ ...result, accuracy: pos.accuracy });
      if (result.inside) {
        setPhase("unlocked");
        clearInterval(intervalRef.current);
      }
    } catch {
      setGpsData({ inside: false, distance: null, accuracy: null, error: true });
    }
  }, [stage]);

  useEffect(() => {
    if (phase !== "scanning") return;
    scanPosition();
    intervalRef.current = setInterval(scanPosition, 5000);
    return () => clearInterval(intervalRef.current);
  }, [phase, scanPosition]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const handleTypingDone = () => setPhase(startsWithPuzzle ? "prePuzzle" : "scanning");

  const markTaskComplete = useCallback(async (photo = null) => {
    if (photo) {
      setCapturedPhoto(photo);
      savePhoto(player["id"], stage["id"], photo);
    }

    if (!playerData.clue) {
      setPhase("complete");
      onComplete(stage.index);
      return;
    }

    markStageComplete(stage["id"]);
    setPhase("clue");
  }, [stage, playerData, player, onComplete]);

  const handleWordSubmit = () => {
    const combined = wordInput.trim().toUpperCase();
    if (combined === stage.unlockWord?.toUpperCase()) {
      setPhase("complete");
      onComplete(stage.index);
    } else {
      setWordError(true);
      setTimeout(() => setWordError(false), 1500);
    }
  };

  const handleStageBack = () => {
    if (phase === "wordUnlock") {
      setPhase("clue");
    }
  };

  // Determine which puzzle to show for this stage + player
  const getPuzzle = () => {
    const id = stage["id"];
    const pid = player["id"];


    if (id === "spoons") {return <GuinnessPenalty onComplete={() => markTaskComplete()} />;}
    if (id === "booker" && pid === "gupta") return <PeanutThrow onComplete={() => setPuzzleDone(true)} />;
    if (id === "booker" && pid === "gohil") return <LimescaleScrub onComplete={() => setPuzzleDone(true)} />;
    if (id === "police" && pid === "gupta") return <FindJai onComplete={() => setPuzzleDone(true)} />;
    if (id === "isleworth") return <QuoteMatch onComplete={() => setPuzzleDone(true)} />;
    if (id === "raul" && pid === "gupta") return <PingPong onComplete={() => setPuzzleDone(true)} />;
    if (id === "raul" && pid === "gohil") return <MakeOut onComplete={() => setPuzzleDone(true)} />;
    return null;
  };

    const hasPuzzle = getPuzzle() !== null;
  const puzzle = getPuzzle();

  return (
    <div className="space-y-4 font-mono">
      <div className="border border-green-900/70 rounded-lg p-4 bg-black/40 shadow-[0_0_18px_rgba(34,197,94,0.08)]">
        <p className="text-green-600 text-xs tracking-widest uppercase mb-1">
          ACTIVE OPERATION · {stage.codename}
        </p>
        <h2 className={`text-xl font-bold ${player["id"] === "gupta" ? "text-green-400" : "text-amber-400"}`}>
          {playerData.missionTitle || stage.label}
        </h2>
        <p className="text-green-800 text-xs mt-2 uppercase tracking-widest">
          Operative {player.codename} · Field mission active
        </p>
      </div>

      {phase === "wordUnlock" && (
        <button
          onClick={handleStageBack}
          className="border border-green-900 text-green-700 text-xs px-3 py-1.5 rounded hover:border-green-700 hover:text-green-500 transition"
        >
          ← BACK TO CLUE
        </button>
      )}

      {phase === "booting" && (
        <div className="bg-black/30 border border-green-900 rounded p-4 min-h-[120px]">
          <TerminalTyper
            lines={[
              `Initializing ${stage.codename}...`,
              ...playerData.terminalLines,
              "Awaiting operative confirmation...",
              "Stand by for objective package...",
            ]}
            onComplete={handleTypingDone}
            speed={30}
          />
        </div>
      )}


      {phase === "prePuzzle" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="border border-amber-900/50 rounded p-4 bg-amber-950/10">
            <p className="text-amber-400 text-xs uppercase tracking-widest mb-3">
              Pre-mission decryption required
            </p>
            <CaesarCipher onComplete={() => setPhase("scanning")} />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {phase !== "booting" && phase !== "prePuzzle" && phase !== "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {phase !== "clue" && phase !== "wordUnlock" && (
              <>
                <div className="bg-black/20 border border-green-900/50 rounded p-3">
                  <p className="text-green-600 text-xs uppercase tracking-widest mb-1">
                    Mission Briefing
                  </p>
                  <p className="text-green-300 text-sm leading-relaxed">
                    {playerData.missionBrief}
                  </p>
                </div>

                <GpsHud
                  distance={gpsData.distance}
                  accuracy={gpsData.accuracy}
                  inside={gpsData.inside || phase !== "scanning"}
                  scanning={phase === "scanning" && !gpsData.distance && !gpsData.error}
                />

                {gpsData.error && (
                  <p className="text-red-500 text-xs">
                    GPS unavailable. Check location permissions.
                  </p>
                )}
              </>
            )}

            {phase === "unlocked" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="border border-green-400 rounded px-3 py-2 bg-green-950/20 text-center">
                  <p className="text-green-400 text-xs tracking-widest uppercase">
                    ✓ GPS Lock Confirmed
                  </p>
                </div>

                {/* Puzzle first if stage has one */}
                {hasPuzzle && !puzzleDone && (
                  <div className="border border-amber-900/50 rounded p-4 bg-amber-950/10">
                    <p className="text-amber-400 text-xs uppercase tracking-widest mb-3">
                      Primary Challenge Required
                    </p>
                    {puzzle}
                  </div>
                )}

                {/* Main validation — only show after puzzle is done */}
                {(!hasPuzzle || puzzleDone) && (
                  <>
                  <div className="bg-black/20 border border-green-900/50 rounded p-3">
                    <p className="text-green-600 text-xs uppercase tracking-widest mb-1">
                      Field Objective
                    </p>
                    <p className="text-green-300 text-sm leading-relaxed">
                      {playerData.task}
                    </p>
                  </div>
                    {stage.validation === "photo" && (
                      <PhotoCapture onComplete={(photo) => markTaskComplete(photo)} />
                    )}

                    {stage.validation === "arrest" && player["id"] === "gupta" && (
                      <BailCodeBrief onComplete={() => markTaskComplete()} />
                    )}

                    {stage.validation === "arrest" && player["id"] === "gohil" && (
                      <BailAuth onComplete={() => markTaskComplete()} stage={stage} />
                    )}

                    {stage.validation === "passcode" && (
                      <PasscodeEntry
                        correctCode={stage.passcode}
                        onComplete={() => markTaskComplete()}
                      />
                    )}
                  </>
                )}
              </motion.div>
            )}

            {phase === "clue" && (
              <ClueReveal
                clue={playerData.clue}
                unlockType={stage.unlockType}
                capturedPhoto={capturedPhoto}
                onProceedToUnlock={() => setPhase("wordUnlock")}
                onProceedToComplete={() => {
                  setPhase("complete");
                  onComplete(stage.index);
                }}
                player={player}
              />
            )}

            {phase === "wordUnlock" && (
              <WordUnlock
                wordInput={wordInput}
                setWordInput={setWordInput}
                wordError={wordError}
                onSubmit={handleWordSubmit}
                player={player}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-3 py-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="w-16 h-16 rounded-full border-2 border-green-400 bg-green-950/30 flex items-center justify-center mx-auto"
          >
            <span className="text-green-400 text-3xl">✓</span>
          </motion.div>
          <p className="text-green-400 font-bold text-lg">STAGE CLEARED</p>
          <p className="text-green-600 text-sm">Proceed to next objective.</p>
        </motion.div>
      )}
    </div>
  );
}

function WordUnlock({ wordInput, setWordInput, wordError, onSubmit, player }) {
  const isGupta = player?.id === "gupta";
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="border border-green-900/50 rounded p-3 bg-black/20">
        <p className="text-green-600 text-xs uppercase tracking-widest mb-1">Combined Key Required</p>
        <p className="text-green-700 text-xs">
          Compare your clue with your partner's. Work out the combined word and enter it below.
        </p>
      </div>
      <input
        type="text"
        value={wordInput}
        onChange={(e) => setWordInput(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="ENTER COMBINED WORD"
        className={`w-full bg-black border rounded px-3 py-2 font-mono text-sm tracking-widest outline-none transition ${
          wordError
            ? "border-red-500 text-red-400"
            : isGupta
            ? "border-green-800 focus:border-green-500 text-green-400"
            : "border-amber-800 focus:border-amber-500 text-amber-400"
        }`}
      />
      {wordError && (
        <p className="text-red-400 text-xs">INCORRECT — Try again.</p>
      )}
      <button
        onClick={onSubmit}
        className={`w-full border py-3 rounded transition text-sm tracking-wider ${
          isGupta
            ? "border-green-400 text-green-400 hover:bg-green-950/40"
            : "border-amber-600 text-amber-400 hover:bg-amber-950/40"
        }`}
      >
        [ SUBMIT KEY ]
      </button>
    </motion.div>
  );
}

function BailCodeBrief({ onComplete }) {
  const bailCode = "230425";

  return (
    <div className="space-y-4">
      <div className="border border-green-500 rounded p-4 bg-green-950/20 text-center">
        <p className="text-green-600 text-xs uppercase tracking-widest mb-2">
          Bail Code Recovered
        </p>
        <p className="text-green-300 text-sm mb-3">
          Send this code to Gohil. He needs it to get released.
        </p>
        <p className="text-green-400 text-3xl font-bold tracking-[0.35em]">
          {bailCode}
        </p>
      </div>

      <button
        onClick={onComplete}
        className="w-full border border-green-600 text-green-400 py-3 rounded hover:bg-green-950/40 transition text-sm tracking-wider"
      >
        [ CODE SENT TO GOHIL ]
      </button>
    </div>
  );
}

function BailAuth({ onComplete, stage }) {
  const bailCode = "230425";
  const [status, setStatus] = useState("waiting");

  const authoriseBail = async () => {
    setStatus("authorising");
    setTimeout(() => {
      setStatus("authorised");
      onComplete();
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <div className="border border-red-800 rounded p-4 bg-red-950/20 space-y-2">
        <p className="text-red-400 text-xs uppercase tracking-widest">⚠ Operative Detained</p>
        <p className="text-red-300 text-sm">
          GOHIL is being processed at Hammersmith. Bail authorisation required immediately.
        </p>
      </div>
      {status === "waiting" && (
        <div className="space-y-3">
          <div className="border border-amber-800 rounded p-3 bg-amber-950/20 text-center">
            <p className="text-amber-400 text-xs uppercase tracking-widest mb-1">Bail Reference</p>
            <p className="text-amber-400 text-2xl font-bold tracking-widest">{bailCode}</p>
            <p className="text-amber-500 text-xs mt-1">Show this to GOHIL</p>
          </div>
          <button
            onClick={authoriseBail}
            className="w-full border border-red-500 text-red-400 py-3 rounded hover:bg-red-950/30 transition text-sm tracking-wider"
          >
            [ AUTHORISE BAIL ]
          </button>
        </div>
      )}
      {status === "authorising" && (
        <div className="text-center py-4 space-y-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-green-400 text-xs">Processing...</p>
        </div>
      )}
      {status === "authorised" && (
        <div className="border border-green-400 rounded p-3 bg-green-950/20 text-center">
          <p className="text-green-400 text-sm">✓ Bail Authorised — GOHIL Released</p>
        </div>
      )}
    </motion.div>
  );
}

function PasscodeEntry({ correctCode, onComplete }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === correctCode.toUpperCase()) {
      onComplete();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-green-600 text-xs uppercase tracking-wider">Enter Passcode</p>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="_ _ _ _"
        className={`w-full bg-black border rounded px-3 py-2 text-green-400 font-mono text-sm tracking-widest outline-none transition ${
          error ? "border-red-500 text-red-400" : "border-green-800 focus:border-green-500"
        }`}
      />
      {error && <p className="text-red-400 text-xs">INVALID — ACCESS DENIED</p>}
      <button
        onClick={handleSubmit}
        className="w-full border border-green-400 text-green-400 py-2 rounded hover:bg-green-950/40 transition text-sm tracking-wider"
      >
        [ SUBMIT ]
      </button>
    </div>
  );
}
