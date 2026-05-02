import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TerminalTyper from "./TerminalTyper";
import GpsHud from "./GpsHud";
import VoucherDisplay from "./VoucherDisplay";
import MugshotGenerator from "./MugshotGenerator";
import MockStripePayment from "./MockStripePayment";
import { checkGeofence, getCurrentPosition } from "../utils/geofence";
import { syncAndWait } from "../utils/sync";

export default function StageView({ stage, player, onComplete }) {
  const [phase, setPhase] = useState("booting");
  const [gpsData, setGpsData] = useState({ inside: false, distance: null, accuracy: null });
  const [wordInput, setWordInput] = useState("");
  const [wordError, setWordError] = useState(false);
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [myHalfWord, setMyHalfWord] = useState(null);
  const intervalRef = useRef(null);
  const cleanupSyncRef = useRef(null);

  const playerData = stage[player.id];

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
      cleanupSyncRef.current?.();
    };
  }, []);

  const handleTypingDone = () => setPhase("scanning");

  const markTaskComplete = useCallback(async () => {
    if (!playerData.clue) {
      setPhase("complete");
      onComplete(stage.index);
      return;
    }

    if (stage.unlockType === "wordSplit") {
      setMyHalfWord(playerData.wordHalf);
    }

    setWaitingForPartner(true);

    const cleanup = await syncAndWait(stage.id, player.id, () => {
      setWaitingForPartner(false);
      setPhase("clue");
    });

    cleanupSyncRef.current = cleanup;
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

  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-green-900 pb-3">
        <p className="text-green-600 text-xs tracking-widest uppercase mb-1">
          {stage.codename}
        </p>
        <h2 className={`text-xl font-bold ${player.id === "gupta" ? "text-green-400" : "text-amber-400"}`}>
          {stage.label}
        </h2>
        {playerData.missionTitle && (
          <p className="text-green-600 text-xs mt-1 italic">
            "{playerData.missionTitle}"
          </p>
        )}
      </div>

      {phase === "booting" && (
        <div className="bg-black/30 border border-green-900 rounded p-4 min-h-[120px]">
          <TerminalTyper
            lines={[
              `Initializing ${stage.codename}...`,
              ...playerData.terminalLines,
              "Awaiting operative confirmation...",
            ]}
            onComplete={handleTypingDone}
            speed={30}
          />
        </div>
      )}

      <AnimatePresence>
        {phase !== "booting" && phase !== "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-black/20 border border-green-900/50 rounded p-3">
              <p className="text-green-600 text-xs uppercase tracking-widest mb-1">
                Mission Brief
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

            {phase === "unlocked" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="border border-green-600 rounded px-3 py-2 bg-green-950/20 text-center">
                  <p className="text-green-400 text-xs tracking-widest uppercase">
                    ✓ Location Confirmed
                  </p>
                </div>

                <div className="bg-black/20 border border-green-900/50 rounded p-3">
                  <p className="text-green-600 text-xs uppercase tracking-widest mb-1">
                    Your Task
                  </p>
                  <p className="text-green-300 text-sm leading-relaxed">
                    {playerData.task}
                  </p>
                </div>

                {stage.validation === "photo" && (
                  <PhotoCapture onComplete={(photo) => {
                    markTaskComplete();
                  }} />
                )}

                {stage.validation === "voucher" && (
                  <MockStripePayment
                    amount="£0.00"
                    merchant={stage.label}
                    onConfirm={() => setPhase("voucher")}
                  />
                )}

                {stage.validation === "arrest" && player.id === "gohil" && (
                  <MugshotGenerator onComplete={markTaskComplete} />
                )}

                {stage.validation === "arrest" && player.id === "gupta" && (
                  <BailAuth onComplete={markTaskComplete} stage={stage} />
                )}

                {stage.validation === "passcode" && (
                  <PasscodeEntry
                    correctCode={stage.passcode}
                    onComplete={markTaskComplete}
                  />
                )}
              </motion.div>
            )}

            {phase === "voucher" && (
              <div className="space-y-3">
                <VoucherDisplay
                  title={playerData.voucherTitle}
                  code={stage.voucherCode}
                  stageLabel={stage.label}
                />
                <button
                  onClick={markTaskComplete}
                  className="w-full border border-green-500 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider"
                >
                  [ VOUCHER USED — PROCEED ]
                </button>
              </div>
            )}

            {(phase === "clue" || waitingForPartner) && (
              <ClueReveal
                clue={playerData.clue}
                wordHalf={myHalfWord}
                unlockType={stage.unlockType}
                waitingForPartner={waitingForPartner}
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

function ClueReveal({ clue, wordHalf, unlockType, waitingForPartner, onProceedToUnlock, onProceedToComplete, player }) {
  const [revealed, setRevealed] = useState(false);
  const isGupta = player?.id === "gupta";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {waitingForPartner ? (
        <div className="border border-amber-800 rounded p-3 bg-amber-950/20 flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-4 h-4 border border-amber-500 border-t-transparent rounded-full flex-shrink-0"
          />
          <span className="text-amber-400 text-xs">
            Waiting for your partner to complete their task...
          </span>
        </div>
      ) : (
        <>
          <div className="border border-green-600 rounded px-3 py-2 bg-green-950/20 text-center">
            <p className="text-green-400 text-xs tracking-widest uppercase">
              ✓ Both Operatives Ready — Clue Unlocked
            </p>
          </div>

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full border border-amber-500 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
            >
              [ REVEAL CLUE ]
            </button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="border border-amber-700 rounded p-4 bg-amber-950/10">
                <p className="text-amber-300 text-sm leading-relaxed italic">
                  "{clue}"
                </p>
              </div>

              {wordHalf && (
                <div className="border border-green-800 rounded p-3 bg-green-950/20 text-center">
                  <p className="text-green-600 text-xs uppercase tracking-widest mb-1">
                    Your Half of the Key
                  </p>
                  <p className={`text-2xl font-bold tracking-widest ${isGupta ? "text-green-400" : "text-amber-400"}`}>
                    {wordHalf}
                  </p>
                </div>
              )}

              {unlockType === "wordSplit" ? (
                <button
                  onClick={onProceedToUnlock}
                  className={`w-full border py-3 rounded transition text-sm tracking-wider ${
                    isGupta
                      ? "border-green-500 text-green-400 hover:bg-green-950/30"
                      : "border-amber-500 text-amber-400 hover:bg-amber-950/30"
                  }`}
                >
                  [ ENTER COMBINED WORD ]
                </button>
              ) : (
                <button
                  onClick={onProceedToComplete}
                  className={`w-full border py-3 rounded transition text-sm tracking-wider ${
                    isGupta
                      ? "border-green-500 text-green-400 hover:bg-green-950/30"
                      : "border-amber-500 text-amber-400 hover:bg-amber-950/30"
                  }`}
                >
                  [ UNDERSTOOD — MOVE ON ]
                </button>
              )}
            </motion.div>
          )}
        </>
      )}
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
          Compare your half with your partner's. Enter the combined word to unlock the next stage.
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
        <p className="text-red-400 text-xs">INCORRECT — Check your halves and try again.</p>
      )}
      <button
        onClick={onSubmit}
        className={`w-full border py-3 rounded transition text-sm tracking-wider ${
          isGupta
            ? "border-green-600 text-green-400 hover:bg-green-950/40"
            : "border-amber-600 text-amber-400 hover:bg-amber-950/40"
        }`}
      >
        [ SUBMIT KEY ]
      </button>
    </motion.div>
  );
}

function BailAuth({ onComplete, stage }) {
  const [bailCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
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
            <p className="text-amber-600 text-xs uppercase tracking-widest mb-1">Bail Reference</p>
            <p className="text-amber-400 text-2xl font-bold tracking-widest">{bailCode}</p>
            <p className="text-amber-700 text-xs mt-1">Show this to GOHIL</p>
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
        <div className="border border-green-600 rounded p-3 bg-green-950/20 text-center">
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
        className="w-full border border-green-600 text-green-400 py-2 rounded hover:bg-green-950/40 transition text-sm tracking-wider"
      >
        [ SUBMIT ]
      </button>
    </div>
  );
}

function PhotoCapture({ onComplete }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      alert("Camera access required. Please allow camera permissions.");
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 300;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const data = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(data);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const confirm = () => onComplete(preview);
  const retake = () => { setPreview(null); startCamera(); };

  return (
    <div className="space-y-3">
      <p className="text-green-600 text-xs uppercase tracking-wider">Photo Proof Required</p>

      {!cameraActive && !preview && (
        <button
          onClick={startCamera}
          className="w-full border border-amber-500 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
        >
          [ ACTIVATE CAMERA ]
        </button>
      )}

      {cameraActive && (
        <div className="space-y-3">
          <div className="border border-green-800 rounded overflow-hidden aspect-video bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          </div>
          <button
            onClick={capture}
            className="w-full border border-green-500 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider"
          >
            [ CAPTURE ]
          </button>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="border border-green-800 rounded overflow-hidden">
            <img src={preview} alt="Preview" className="w-full object-cover max-h-64" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={retake}
              className="border border-amber-700 text-amber-500 py-2 rounded text-xs tracking-wider hover:bg-amber-950/30 transition"
            >
              [ RETAKE ]
            </button>
            <button
              onClick={confirm}
              className="border border-green-500 text-green-400 py-2 rounded text-xs tracking-wider hover:bg-green-950/30 transition"
            >
              [ CONFIRM ✓ ]
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
