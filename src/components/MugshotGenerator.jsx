import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CRIMES = [
  "Excessive Enjoyment of Freshers Week",
  "Impersonating a Competent Adult",
  "Grand Theft Dissertation (Supervisor's Ideas)",
  "Conspiracy to Avoid Group Project Work",
  "Operating a Student Loan Without a Plan",
  "Possession of Unread Lecture Slides",
  "Resisting the 9am Lecture",
  "First-Degree Procrastination",
  "Unlawful Confidence at Final Exams",
  "Aggravated CV Inflation",
];

export default function MugshotGenerator({ onComplete }) {
  const [phase, setPhase] = useState("capture");
  const [photoData, setPhotoData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [crime] = useState(() => CRIMES[Math.floor(Math.random() * CRIMES.length)]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (e) {
      alert("Camera access denied. Please allow camera access to continue.");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const data = canvas.toDataURL("image/jpeg", 0.9);
    setPhotoData(data);

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);

    setPhase("processing");
    setTimeout(() => setPhase("result"), 2500);
  }, []);

  const handleConfirm = () => {
    onComplete?.(photoData);
  };

  return (
    <div className="font-mono space-y-4">
      <AnimatePresence mode="wait">
        {phase === "capture" && (
          <motion.div
            key="capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="border border-red-500/50 rounded p-3 bg-red-950/20">
              <p className="text-red-400 text-xs tracking-widest uppercase mb-1">
                METROPOLITAN POLICE — DIGITAL BOOKING SYSTEM
              </p>
              <p className="text-red-300 text-sm">
                Subject is required to submit a front-facing photograph for processing.
              </p>
            </div>

            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="w-full border border-amber-500 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
              >
                [ ACTIVATE BOOKING CAMERA ]
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative border border-green-800 rounded overflow-hidden bg-black aspect-square max-w-xs mx-auto">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                    playsInline
                    muted
                  />
                  <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none">
                    {[6, 5, 4, 3].map((n) => (
                      <span key={n} className="text-green-600 text-xs">{n}ft</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={capturePhoto}
                  className="w-full border border-red-500 text-red-400 py-3 rounded hover:bg-red-950/30 transition text-sm tracking-wider"
                >
                  [ CAPTURE MUGSHOT ]
                </button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}

        {phase === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-3 py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto"
            />
            <p className="text-green-400 text-sm">Running facial recognition...</p>
            <p className="text-green-600 text-xs">Cross-referencing criminal database...</p>
            <p className="text-red-400 text-xs animate-pulse">MATCH FOUND</p>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="border-2 border-red-600 rounded-lg overflow-hidden bg-black">
              <div className="bg-red-900 px-4 py-2 text-center">
                <p className="text-white text-xs font-bold tracking-widest uppercase">
                  Metropolitan Police Service
                </p>
                <p className="text-red-200 text-xs">Criminal Booking Record</p>
              </div>

              <div className="p-4 flex gap-4">
                <div className="relative flex-shrink-0 w-28 h-28">
                  {photoData && (
                    <img
                      src={photoData}
                      alt="Mugshot"
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, rgba(0,0,0,0.85) 0px, rgba(0,0,0,0.85) 6px, transparent 6px, transparent 22px)",
                      borderRadius: "4px",
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-center py-0.5">
                    <span className="text-green-400 text-xs font-mono">BOOKED</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div>
                    <p className="text-red-500 text-xs uppercase tracking-wider">Subject</p>
                    <p className="text-white text-sm font-bold">CLASSIFIED</p>
                  </div>
                  <div>
                    <p className="text-red-500 text-xs uppercase tracking-wider">Offence</p>
                    <p className="text-amber-300 text-xs">{crime}</p>
                  </div>
                  <div>
                    <p className="text-red-500 text-xs uppercase tracking-wider">Booking</p>
                    <p className="text-green-400 text-xs">
                      GP-{Date.now().toString(36).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-red-500 text-xs uppercase tracking-wider">Status</p>
                    <p className="text-amber-400 text-xs animate-pulse">RELEASED ON BAIL</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-red-900 px-4 py-2 text-center">
                <p className="text-red-700 text-xs">
                  This record is permanently added to the National Database.
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full border border-green-500 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider"
            >
              [ ACCEPT CHARGES — CONTINUE MISSION ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
