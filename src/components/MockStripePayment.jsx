import { useState } from "react";
import { motion } from "framer-motion";

export default function MockStripePayment({ amount = "£0.00", merchant, onConfirm }) {
  const [status, setStatus] = useState("idle");

  const handlePay = () => {
    setStatus("processing");
    setTimeout(() => setStatus("success"), 1800);
  };

  return (
    <div className="font-mono">
      {status === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="border border-green-800 rounded-lg overflow-hidden bg-[#0a0f0a]">
            <div className="bg-[#635bff] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-white text-xs font-semibold tracking-wide">
                  Stripe Checkout
                </span>
              </div>
              <span className="text-white/70 text-xs">Secure</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-green-600 text-xs uppercase tracking-widest mb-1">Paying</p>
                <p className="text-white text-2xl font-bold">{amount}</p>
                <p className="text-green-600 text-xs">{merchant}</p>
              </div>
              <div className="space-y-2">
                <div className="border border-green-900 rounded px-3 py-2 bg-black/30">
                  <p className="text-green-700 text-xs mb-1">Card number</p>
                  <p className="text-green-400 text-sm tracking-widest">.... .... .... 4242</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-green-900 rounded px-3 py-2 bg-black/30">
                    <p className="text-green-700 text-xs mb-1">Expiry</p>
                    <p className="text-green-400 text-sm">12/27</p>
                  </div>
                  <div className="border border-green-900 rounded px-3 py-2 bg-black/30">
                    <p className="text-green-700 text-xs mb-1">CVC</p>
                    <p className="text-green-400 text-sm">...</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePay}
                className="w-full bg-[#635bff] text-white py-3 rounded text-sm hover:bg-[#5148e0] transition font-semibold"
              >
                Pay {amount}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {status === "processing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 space-y-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#635bff] border-t-transparent rounded-full mx-auto"
          />
          <p className="text-green-400 text-sm">Processing payment...</p>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 py-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto"
          >
            <span className="text-green-400 text-3xl">✓</span>
          </motion.div>
          <div>
            <p className="text-white text-lg font-bold">Payment Successful</p>
            <p className="text-green-600 text-sm mt-1">{amount} charged to card ending 4242</p>
          </div>
          <button
            onClick={onConfirm}
            className="w-full border border-green-500 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider"
          >
            [ CONTINUE MISSION ]
          </button>
        </motion.div>
      )}
    </div>
  );
}
