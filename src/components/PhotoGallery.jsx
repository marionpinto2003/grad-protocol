import { motion } from "framer-motion";
import { STAGES } from "../config/locations";

function safeFileName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split("\n");
  const lines = [];

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push("");
      return;
    }

    const words = paragraph.split(" ");
    let line = "";

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    lines.push(line);
  });

  return lines;
}

function downloadMessageAsPng(player) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = 1200;
  const padding = 90;
  const lineHeight = 42;
  const titleHeight = 150;

  canvas.width = width;

  ctx.font = "28px Georgia, serif";
  const lines = wrapText(ctx, player.finalMessage || "", width - padding * 2);
  canvas.height = titleHeight + lines.length * lineHeight + padding;

  // Background
  ctx.fillStyle = "#fff7e8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = "#b98b5d";
  ctx.lineWidth = 8;
  ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

  ctx.strokeStyle = "#d8b98f";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  // Heading
  ctx.fillStyle = "#9b3f2f";
  ctx.font = "bold 26px Georgia, serif";
  ctx.fillText("FINAL TRANSMISSION", padding, 95);

  ctx.fillStyle = "#1f3d5a";
  ctx.font = "bold 42px Georgia, serif";
  ctx.fillText(player.fullName, padding, 145);

  // Message
  ctx.fillStyle = "#263238";
  ctx.font = "28px Georgia, serif";

  let y = 215;
  lines.forEach((line) => {
    ctx.fillText(line, padding, y);
    y += line ? lineHeight : lineHeight * 0.8;
  });

  const dataUrl = canvas.toDataURL("image/png");
  downloadDataUrl(dataUrl, `grad-protocol-${safeFileName(player.id)}-final-message.png`);
}

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

          <button
            onClick={() => downloadMessageAsPng(player)}
            className="w-full border border-amber-600 text-amber-400 py-2 rounded hover:bg-amber-950/30 transition text-xs tracking-wider"
          >
            [ SAVE MESSAGE AS PNG ]
          </button>
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

                <div className="px-2 py-2 bg-black/70 space-y-2">
                  <p className="text-green-600 text-xs truncate">
                    {title}
                  </p>

                  <button
                    onClick={() =>
                      downloadDataUrl(
                        photo,
                        `grad-protocol-${safeFileName(player.id)}-${safeFileName(stage.id)}.png`
                      )
                    }
                    className="w-full border border-green-800 text-green-500 py-1.5 rounded hover:bg-green-950/30 transition text-[10px] tracking-wider"
                  >
                    [ SAVE PHOTO ]
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
