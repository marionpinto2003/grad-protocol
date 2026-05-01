import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TerminalTyper from "./TerminalTyper";
import GpsHud from "./GpsHud";
import VoucherDisplay from "./VoucherDisplay";
import MugshotGenerator from "./MugshotGenerator";
import MockStripePayment from "./MockStripePayment";
import { checkGeofence, getCurrentPosition } from "../utils/geofence";

export default function StageView({ stage, onComplete }) {
  const [phase, setPhase] = useState("booting");
  const [gpsData, setGpsData] = useState({ inside: false, distance: null, accuracy: null });
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const intervalRef = useRef(null);

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

  const handleTypingDone = () => {
    setPhase("scanning");
  };

  const handlePasscode = () => {
    if (passcodeInput.trim().toUpperCase() === stage.passcode.toUpperCase()) {
      setPhase("complete");
      onComplete(stage.index);
    } else {
      setPasscodeError(true);
      setTimeout(() => setPasscodeError(false), 1500);
    }
  };

  const handlePhotoCapture = () => {
    setPhase("complete");
    onComplete(stage.index);
  };

  const handleVoucherConfirm = () => {
    setPhase("complete");
    onComplete(stage.index);
  };

  const handleStripeConfirm = () => {
    setPhase("voucher");
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-green-900 pb-3">
        <p className="text-green-600 text-xs tracking-widest uppercase mb-1">
          {stage.codename}
        </p>
        <h2 className="text-green-400 text-xl font-bold">{stage.label}</h2>
      </div>

      {phase === "booting" && (
        <div className="bg-black/30 border border-green-900 rounded p-4 min-h-[120px]">
          <TerminalTyper
            lines={[
              `Initializing ${stage.codename}...`,
              ...stage.terminalLines,
              "Awaiting operative confirmation...",
            ]}
            onComplete={handleTypingDone}
            speed={30}
          />
        </div>
      )}

      <AnimatePresence>
        {(phase === "scanning" || phase === "unlocked" || phase === "voucher") && (
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
                {stage.missionBrief}
              </p>
            </div>

            <GpsHud
              distance={gpsData.distance}
              accuracy={gpsData.accuracy}
              inside={gpsData.inside || phase === "unlocked" || phase === "voucher"}
              scanning={phase === "scanning" && !gpsData.distance && !gpsData.error}
            />

            {gpsData.error && (
              <p className="text-red-500 text-xs">
                GPS unavailable. Check location permissions.
              </p>
            )}

            {(phase === "unlocked" || phase === "voucher") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="border border-green-600 rounded px-3 py-2 bg-green-950/20 text-center">
                  <p className="text-green-400 text-xs tracking-widest uppercase">
                    Location Confirmed — Validation Required
                  </p>
                </div>

                {stage.validation === "passcode" && (
                  <div className="space-y-2">
                    <p className="text-green-600 text-xs uppercase tracking-wider">
                      Enter Site Passcode
                    </p>
                    <input
                      type="text"
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handlePasscode()}
                      placeholder="_ _ _ _"
                      className={`w-full bg-black border rounded px-3 py-2 text-green-400 font-mono text-sm tracking-widest outline-none transition ${
                        passcodeError
                          ? "border-red-500 text-red-400"
                          : "border-green-800 focus:border-green-500"
                      }`}
                    />
                    {passcodeError && (
                      <p className="text-red-400 text-xs">
                        INVALID PASSCODE — ACCESS DENIED
                      </p>
                    )}
                    <button
                      onClick={handlePasscode}
                      className="w-full border border-green-600 text-green-400 py-2 rounded hover:bg-green-950/40 transition text-sm tracking-wider"
                    >
                      [ SUBMIT PASSCODE ]
                    </button>
                  </div>
                )}

                {stage.validation === "mugshot" && (
                  <MugshotGenerator onComplete={handlePhotoCapture} />
                )}

                {stage.validation === "photo" && (
                  <PhotoCapture onComplete={handlePhotoCapture} />
                )}

                {stage.validation === "voucher" && phase === "unlocked" && (
                  <MockStripePayment
                    amount="£0.00"
                    merchant={stage.label}
                    onConfirm={handleStripeConfirm}
                  />
                )}

                {stage.validation === "voucher" && phase === "voucher" && (
                  <div className="space-y-3">
                    <VoucherDisplay
                      title={stage.voucherTitle}
                      code={stage.voucherCode}
                      stageLabel={stage.label}
                    />
                    <button
                      onClick={handleVoucherConfirm}
                      className="w-full border border-green-500 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider"
                    >
                      [ VOUCHER USED — PROCEED ]
                    </button>
                  </div>
                )}
              </motion.div>
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

function PhotoCapture({ onComplete }) {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
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
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onComplete();
  };

  return (
    <div className="space-y-3">
      <p className="text-green-600 text-xs uppercase tracking-wider">
        Photo Proof Required
      </p>
      {!cameraActive ? (
        <button
          onClick={startCamera}
          className="w-full border border-amber-500 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
        >
          [ ACTIVATE CAMERA ]
        </button>
      ) : (
        <div className="space-y-3">
          <div className="border border-green-800 rounded overflow-hidden aspect-video bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          </div>
          <button
            onClick={capture}
            className="w-full border border-green-500 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider"
          >
            [ CAPTURE AND CONFIRM ]
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
