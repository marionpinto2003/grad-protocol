import { motion } from "framer-motion";
import { STAGES } from "../config/locations";

export default function PhotoGallery({ player }) {
  const photos = STAGES.map((stage) => {
    const key = `grad_photo_${player.id}_${stage.id}`;
    const photo = localStorage.getItem(key);
    return { stage, photo };
  }).filter((s) => s.photo);

  if (photos.length === 0) return null;

  return (
    <div className="space-y-3 font-mono">
      <p className="text-green-700 text-xs uppercase tracking-widest text-center">
        Mission Archive — {photos.length} photo{photos.length !== 1 ? "s" : ""} captured
      </p>
      <div className="grid grid-cols-2 gap-2">
        {photos.map(({ stage, photo }, i) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="border border-green-900 rounded overflow-hidden"
          >
            <img
              src={photo}
              alt={stage.id}
              className="w-full object-cover"
              style={{ height: "120px" }}
            />
            <div className="px-2 py-1 bg-black/60">
              <p className="text-green-600 text-xs truncate">
                {stage[player.id]?.missionTitle || stage.id}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
