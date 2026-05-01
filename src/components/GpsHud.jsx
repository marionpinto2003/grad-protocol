import { motion } from "framer-motion";

export default function GpsHud({ distance, accuracy, inside, scanning }) {
  if (scanning) {
    return (
      <div className="border border-green-900 rounded p-3 bg-black/40 flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-4 h-4 border border-green-500 border-t-transparent rounded-full flex-shrink-0"
        />
        <span className="text-green-600 text-xs font-mono">Acquiring GPS signal...</span>
      </div>
    );
  }

  return (
    <div
      className={`border rounded p-3 bg-black/40 font-mono transition-colors ${
        inside ? "border-green-500" : "border-amber-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={inside ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`w-2 h-2 rounded-full ${inside ? "bg-green-400" : "bg-amber-500"}`}
          />
          <span className={`text-xs ${inside ? "text-green-400" : "text-amber-400"}`}>
            {inside ? "TARGET ZONE REACHED" : "OUTSIDE TARGET ZONE"}
          </span>
        </div>
        {accuracy && (
          <span className="text-green-800 text-xs">+/-{Math.round(accuracy)}m</span>
        )}
      </div>
      {distance !== null && !inside && (
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-green-700 text-xs">Distance to target:</span>
          <span className="text-amber-300 text-xs font-bold">{distance}m</span>
        </div>
      )}
    </div>
  );
}
