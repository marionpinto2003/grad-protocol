import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhotoCapture from "../PhotoCapture";

export default function GuinnessPenalty({ onComplete }) {
  const [step, setStep] = useState("photo");
  const [photo, setPhoto] = useState(null);

  const handlePhoto = (img) => {
    setPhoto(img);
    setStep("analysing");

    setTimeout(() => {
      setStep("failed");
    }, 2500);
  };

  return (
    <div className="space-y-4 font-mono">
      <AnimatePresence mode="wait">
        {step === "photo" && (
          <motion.div
            key="photo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="border border-amber-800 rounded p-4 bg-amber-950/10">
              <p className="text-amber-400 text-xs uppercase tracking-widest mb-2">
                Guinness Split Challenge
              </p>
              <p className="text-green-300 text-sm">
                Split the G perfectly between two glasses. Take a photo for proof.
              </p>
            </div>

            <PhotoCapture onComplete={handlePhoto} />
          </motion.div>
        )}

        {step === "analysing" && (
          <motion.div
            key="analysing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-3 py-8"
          >
            {photo && (
              <img
                src={photo}
                alt="Guinness proof"
                className="w-full max-h-56 object-cover rounded border border-green-900"
              />
            )}

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto"
            />

            <p className="text-green-400 text-sm">Running G balance analyser...</p>
            <p className="text-green-700 text-xs">Checking foam ratio, glass symmetry, and Pinto tolerance...</p>
          </motion.div>
        )}

        {step === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="border-2 border-red-600 rounded p-4 bg-red-950/20 text-center space-y-2">
              <p className="text-red-400 text-xs uppercase tracking-widest">
                Challenge Failed
              </p>
              <p className="text-red-300 text-sm">
                Guinness distribution unacceptable.
              </p>
              <p className="text-amber-400 text-sm font-bold">
                Penalty: buy a round of shots.
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full border border-amber-500 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
            >
              [ PENALTY COMPLETED — CONTINUE ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
