import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhotoCapture from "../PhotoCapture";

const ANALYSIS_STEPS = [
  "Uploading Guinness proof...",
  "Detecting glass edges...",
  "Measuring foam distribution...",
  "Checking G-line alignment...",
  "Comparing pint symmetry...",
  "Running Pinto tolerance model...",
  "Final verdict loading...",
];

export default function GuinnessPenalty({ onComplete }) {
  const [step, setStep] = useState("photo");
  const [photo, setPhoto] = useState(null);
  const [analysisIndex, setAnalysisIndex] = useState(0);
  const [score, setScore] = useState(null);

  const handlePhoto = (img) => {
    setPhoto(img);
    setStep("analysing");
    setAnalysisIndex(0);
    setScore(null);
  };

  useEffect(() => {
    if (step !== "analysing") return;

    if (analysisIndex < ANALYSIS_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setAnalysisIndex((prev) => prev + 1);
      }, 700);

      return () => clearTimeout(timer);
    }

    const verdictTimer = setTimeout(() => {
      setScore(Math.floor(Math.random() * 18) + 31); // 31–48%
      setStep("failed");
    }, 900);

    return () => clearTimeout(verdictTimer);
  }, [step, analysisIndex]);

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
              <p className="text-green-700 text-xs mt-2">
                Warning: the analyser is extremely strict and emotionally biased.
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
            className="space-y-4 py-4"
          >
            {photo && (
              <div className="relative">
                <img
                  src={photo}
                  alt="Guinness proof"
                  className="w-full max-h-64 object-cover rounded border border-green-900 opacity-80"
                />

                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: ["0%", "98%", "0%"] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1 bg-green-400/80 shadow-[0_0_16px_rgba(74,222,128,0.95)]"
                />
              </div>
            )}

            <div className="border border-green-900 rounded p-3 bg-black/40 space-y-2">
              <p className="text-green-400 text-xs uppercase tracking-widest">
                G-Balance Analysis
              </p>

              <div className="w-full h-2 bg-green-950 rounded overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${((analysisIndex + 1) / ANALYSIS_STEPS.length) * 100}%`,
                  }}
                  className="h-full bg-green-500"
                />
              </div>

              <p className="text-green-300 text-sm">
                {ANALYSIS_STEPS[analysisIndex]}
              </p>

              <p className="text-green-700 text-xs">
                Confidence: {Math.min(99, 42 + analysisIndex * 9)}%
              </p>
            </div>
          </motion.div>
        )}

        {step === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {photo && (
              <img
                src={photo}
                alt="Failed Guinness proof"
                className="w-full max-h-56 object-cover rounded border border-red-900 opacity-80"
              />
            )}

            <div className="border-2 border-red-600 rounded p-4 bg-red-950/20 text-center space-y-2">
              <p className="text-red-400 text-xs uppercase tracking-widest">
                Challenge Failed
              </p>
              <p className="text-red-300 text-sm">
                Guinness distribution unacceptable.
              </p>
              {score && (
                <p className="text-red-500 text-xs">
                  Certified G-balance score: {score}%
                </p>
              )}
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
