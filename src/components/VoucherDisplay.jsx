import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function VoucherDisplay({ title, code, stageLabel }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (typeof window.QRCode === "undefined") return;

    canvasRef.current.innerHTML = "";
    new window.QRCode(canvasRef.current, {
      text: `GRAD_PROTOCOL:${code}:${Date.now()}`,
      width: 180,
      height: 180,
      colorDark: "#00ff88",
      colorLight: "#0a0a0a",
      correctLevel: window.QRCode.CorrectLevel.H,
    });
  }, [code]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="border border-green-500 rounded-lg p-6 bg-black/80 flex flex-col items-center gap-4"
    >
      <div className="text-center">
        <p className="text-amber-400 font-mono text-xs tracking-widest uppercase mb-1">
          CLASSIFIED VOUCHER
        </p>
        <p className="text-green-400 font-mono text-lg font-bold">{title}</p>
        <p className="text-green-600 font-mono text-xs mt-1">{stageLabel}</p>
      </div>

      <div
        ref={canvasRef}
        className="border border-green-800 rounded p-3 bg-[#0a0a0a]"
      />

      <div className="border border-green-800 rounded px-4 py-2 bg-green-950/30">
        <p className="text-green-300 font-mono text-sm tracking-widest">{code}</p>
      </div>

      <p className="text-green-700 font-mono text-xs text-center max-w-xs">
        Show this QR code to the operative at the counter. One-time use only.
      </p>
    </motion.div>
  );
}
