import DobbleDuel from "./puzzles/DobbleDuel";
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
  const startsWithPuzzle = false;
  const [phase, setPhase] = useState("booting");
  const [gpsData, setGpsData] = useState({ inside: false, distance: null, accuracy: null });
  const [wordInput, setWordInput] = useState("");
  const [wordError, setWordError] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [puzzleDone, setPuzzleDone] = useState(false);
  const intervalRef = useRef(null);

  const playerData = stage[player["id"]];

  const showRouteCard = () => {
    setPhase("routeCard");
  };

  const finishStage = () => {
    setPhase("complete");
    onComplete(stage.index);
  };

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
      showRouteCard();
      return;
    }

    markStageComplete(stage["id"]);
    setPhase("clue");
  }, [stage, playerData, player, onComplete]);

  const handleWordSubmit = () => {
    const combined = wordInput.trim().toUpperCase();

    if (combined === stage.unlockWord?.toUpperCase()) {
      if (stage.id === "wembley") {
        setPhase("dobbleDuel");
      } else {
        showRouteCard();
      }
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
        <h2 className={`text-xl font-bold ${player["id"] === "gupta" ? "text-[#d71920]" : "text-[#d4af37]"}`}>
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
        {phase !== "booting" && phase !== "prePuzzle" && phase !== "dobbleDuel" && phase !== "routeCard" && phase !== "complete" && (
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
                      <GohilReleaseFlow onComplete={() => markTaskComplete()} />
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
                onProceedToComplete={showRouteCard}
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

      {phase === "dobbleDuel" && (
        <DobbleDuel
          player={player}
          onComplete={() => setPhase("routeCard")}
        />
      )}

      {phase === "routeCard" && (
        <RouteCard
          stage={stage}
          player={player}
          onComplete={finishStage}
        />
      )}

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
          <p className="text-green-400 font-bold text-lg">LEG COMPLETE</p>
          <p className="text-green-600 text-sm">
            {playerData.completeText || "Proceed to next objective."}
          </p>
        </motion.div>
      )}
    </div>
  );
}




function RouteCard({ stage, player, onComplete }) {
  const routeCards = {
    temple: {
      leg: "LEG 02 · HIGH ROAD SECTOR",
      title: "J.J. MOON'S UNLOCKED",
      subtitle: "Blessings secured · First checkpoint open",
      clearance: "Darshan complete. Spiritual clearance approved.",
      destination: "Make your way to J.J. Moon's on Wembley High Road.",
      nextLeg: player?.id === "gohil"
        ? "Date-night tradition. Strongbow Dark Fruit. Sticky-floor diplomacy."
        : "Guinness protocol. Moon-coded pub. One abandoned Maverick costume."
    },
    spoons: {
      leg: "LEG 03 · WEMBLEY FUEL SECTOR",
      title: "FUNKY CHIPS UNLOCKED",
      subtitle: "Pub protocol cleared · Emergency food route open",
      clearance: player?.id === "gohil"
        ? "Strongbow protocol complete. Pinto date-spot checkpoint cleared."
        : "Guinness protocol complete. Moon landing successfully survived.",
      destination: "Proceed to Funky Chips for masala chips, cheese, and Pinto-funded damage control.",
      nextLeg: "Fuel stop. Photo proof. Then the NAVRATRI key comes online."
    },
    wembley: {
      leg: "LEG 04 · ROYALE LEISURE PARK",
      title: "ARCADE SECTOR UNLOCKED",
      subtitle: "NAVRATRI accepted · Dobble Detour resolved",
      clearance: "NAVRATRI key accepted. Pinto has approved onward travel.",
      destination: "Make your way west to Royale Leisure Park, Western Avenue.",
      nextLeg: "Pool tables. Punch machine. Reclining seats. One skipped lecture that the film absolutely did not deserve."
    },
    tenpin: {
      leg: "LEG 05 · BOOKER SECTOR",
      title: "BOOKER UNLOCKED",
      subtitle: "Royale Rumble cleared · Emergency supply route open",
      clearance: "Pool table survived. Punch-machine evidence accepted. Cinema judgement remains pending.",
      destination: "Proceed to Booker — the only place where one mission can involve both limescale warfare and peanut evidence.",
      nextLeg: "Nirali has been forgiven. The bathroom evidence has not."
    },
    booker: {
      leg: "LEG 06 · HAMMERSMITH CASE FILE",
      title: "BAIL PROTOCOL UNLOCKED",
      subtitle: "Booker evidence cleared · Custody file opening",
      clearance: "Limescale neutralised. Peanut evidence processed. Pinto's domestic incident archive remains classified.",
      destination: "Proceed to Hammersmith, where one operative enters the system and the other becomes the only hope of release.",
      nextLeg: "Mugshot first. Bail code second. Paneer cheese butter if both operatives cooperate."
    },
    police: {
      leg: "LEG 07 · TW7 QUOTE PROTOCOL",
      title: "ISLEWORTH UNLOCKED",
      subtitle: "Bail operation cleared · Quote archive opening",
      clearance: "Custody resolved. Bail authorised. Both operatives have been released under strict Pinto supervision.",
      destination: "Proceed to the TW7 memory sector — where too many quotes were said with too much confidence.",
      nextLeg: "Identify the speaker. Survive the allegations. Unlock the archive."
    },
    isleworth: {
      leg: "LEG 08 · RAUL CAMPUS",
      title: "RAUL UNLOCKED",
      subtitle: "Quote archive cleared · Campus route open",
      clearance: "Quote protocol accepted. The archive confirms that nobody in this group has ever spoken normally.",
      destination: "Proceed to RAUL — where the degree became real, the chaos became official, and everyone somehow survived.",
      nextLeg: "Campus evidence. Final university protocol. One last academic side quest."
    },
    raul: {
      leg: "LEG 09 · FINAL APPROACH",
      title: "PEMBROKE LODGE UNLOCKED",
      subtitle: "RAUL protocol cleared · Final route open",
      clearance: "Campus evidence accepted. Degree unlocked. Emotional damage levels rising.",
      destination: "Proceed to Pembroke Lodge — final checkpoint, final key, final proof that Richmond was never just about the degree.",
      nextLeg: "One last unlock. One final debrief. Memory archive generation begins."
    },
  };

  const card = routeCards[stage.id] || {
    leg: "FINAL LEG",
    title: "FINAL ROUTE UNLOCKED",
    subtitle: "All field evidence accepted",
    clearance: "Mission evidence verified. Final archive generation authorised.",
    destination: "Proceed to the final objective.",
    nextLeg: "Final debrief and memory archive."
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-green-500/40 bg-black/80 rounded-xl p-5 space-y-5"
    >
      <div className="text-center space-y-2">
        <p className="text-green-500 text-xs uppercase tracking-[0.35em]">
          Route Card Received
        </p>

        <h2 className="text-2xl font-black text-green-300">
          {card.leg}
        </h2>

        <p className="text-green-700 text-xs uppercase tracking-widest">
          {card.subtitle}
        </p>
      </div>

      <div className="border border-green-900/60 bg-green-950/10 rounded-lg p-4 space-y-4 text-sm text-green-100 leading-relaxed">
        <div>
          <p className="text-green-500 text-xs uppercase tracking-widest mb-1">
            Clearance Summary
          </p>
          <p>{card.clearance}</p>
        </div>

        <div>
          <p className="text-green-500 text-xs uppercase tracking-widest mb-1">
            Destination
          </p>
          <p>
            <span className="font-bold text-green-300">{card.title}</span>
            <br />
            {card.destination}
          </p>
        </div>

        <div>
          <p className="text-green-500 text-xs uppercase tracking-widest mb-1">
            Next Leg
          </p>
          <p>{card.nextLeg}</p>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full border border-green-400 text-green-300 hover:bg-green-950/40 py-3 rounded font-bold tracking-wider"
      >
        ACCEPT ROUTE CARD
      </button>
    </motion.div>
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

function GohilReleaseFlow({ onComplete }) {
  const [mugshotDone, setMugshotDone] = useState(false);

  if (!mugshotDone) {
    return (
      <div className="space-y-3">
        <div className="border border-red-800 rounded p-4 bg-red-950/20 space-y-2">
          <p className="text-red-400 text-xs uppercase tracking-widest">⚠ Operative Detained</p>
          <p className="text-red-300 text-sm">
            Mugshot required before bail can be processed. Document the crime, then obtain the bail code from GUPTA.
          </p>
        </div>

        <MugshotGenerator onComplete={() => setMugshotDone(true)} />
      </div>
    );
  }

  return <BailAuth onComplete={onComplete} />;
}

function BailAuth({ onComplete }) {
  const bailCode = "230425";
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("waiting");

  const authoriseBail = () => {
    if (input.trim() !== bailCode) {
      setStatus("denied");
      setTimeout(() => setStatus("waiting"), 1200);
      return;
    }

    setStatus("authorising");
    setTimeout(() => {
      setStatus("authorised");
      onComplete();
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <div className="border border-red-800 rounded p-4 bg-red-950/20 space-y-2">
        <p className="text-red-400 text-xs uppercase tracking-widest">⚠ Bail Code Required</p>
        <p className="text-red-300 text-sm">
          GUPTA has recovered the bail reference. Enter the code he gives you to complete release.
        </p>
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
        onKeyDown={(e) => e.key === "Enter" && authoriseBail()}
        placeholder="ENTER BAIL CODE"
        className="w-full bg-black border border-amber-800 focus:border-amber-500 text-amber-400 rounded px-3 py-3 font-mono text-center text-lg tracking-[0.35em] outline-none"
      />

      {status === "denied" && (
        <p className="text-red-400 text-xs text-center">✕ Bail reference rejected.</p>
      )}

      {status === "waiting" && (
        <button
          onClick={authoriseBail}
          className="w-full border border-red-500 text-red-400 py-3 rounded hover:bg-red-950/30 transition text-sm tracking-wider"
        >
          [ AUTHORISE RELEASE ]
        </button>
      )}

      {status === "authorising" && (
        <div className="text-center py-4 space-y-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-green-400 text-xs">Processing release...</p>
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
