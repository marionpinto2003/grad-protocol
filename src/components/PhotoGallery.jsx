import { motion } from "framer-motion";
import { STAGES } from "../config/locations";

export default function PhotoGallery({ player }) {
  const photos = STAGES.map((stage) => {
    const key = `grad_photo_${player.id}_${stage.id}`;
    const photo = localStorage.getItem(key);

    return {
      stage,
      photo,
      title: stage[player.id]?.missionTitle || stage.codename,
    };
  }).filter((s) => s.photo);

  if (photos.length === 0 && !player.finalMessage) return null;

  return (
    <div className="space-y-5 font-mono text-left">
      {player.finalMessage && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-amber-700 rounded-lg p-4 bg-amber-950/20 space-y-3"
        >
          <p className="text-amber-400 text-xs uppercase tracking-widest">
            Final Transmission
          </p>
          <p className="text-green-300 text-sm leading-relaxed whitespace-pre-line">
            {player.finalMessage}
          </p>
        </motion.div>
      )}

      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="text-center space-y-1">
            <p className="text-green-700 text-xs uppercase tracking-widest">
              Classified Memory Archive
            </p>
            <p className="text-green-500 text-xs">
              {photos.length} recovered field photograph{photos.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {photos.map(({ stage, photo, title }, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="border border-green-900 rounded overflow-hidden bg-black/50"
              >
                <img
                  src={photo}
                  alt={stage.id}
                  className="w-full object-cover"
                  style={{ height: "130px" }}
                />
                <div className="px-2 py-1 bg-black/70">
                  <p className="text-green-600 text-xs truncate">
                    {title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
