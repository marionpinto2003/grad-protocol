import { motion } from "framer-motion";

const MAP_POINTS = [
  { id: "temple", label: "Mandir", icon: "🛕", x: 7, y: 52, labelPos: "bottom" },
  { id: "wembley", label: "Funky Chips", icon: "🍟", x: 15, y: 38, labelPos: "top" },
  { id: "spoons", label: "Spoons", icon: "🍺", x: 28, y: 42, labelPos: "bottom" },
  { id: "tenpin", label: "Tenpin", icon: "🎱", x: 38, y: 55, labelPos: "bottom" },
  { id: "booker", label: "Booker", icon: "🥜", x: 47, y: 43, labelPos: "bottom" },
  { id: "police", label: "Hammersmith", icon: "🚔", x: 55, y: 57, labelPos: "bottom" },
  { id: "isleworth", label: "TW7", icon: "🏠", x: 65, y: 46, labelPos: "bottom" },
  { id: "raul", label: "RAUL", icon: "🎓", x: 76, y: 35, labelPos: "top" },
  { id: "richmond", label: "Richmond Park", icon: "🌳", x: 81, y: 59, labelPos: "bottom" },
];

const ROUTE_PATH = MAP_POINTS.map((p, i) =>
  `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`
).join(" ");

export default function MissionMap({ player, currentStageIndex = 0 }) {
  const codename = player?.codename || player?.name || "Agent";

  return (
    <section className="mission-map-card">
      <div className="mission-map-header">
        <p className="eyebrow">Mission Map</p>
        <h2>{codename}'s London Trail</h2>
      </div>

      <div className="mission-map">
        <svg
          className="mission-map-bg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Rough Greater London outline */}
          <path
            d="M14 27.3
              L16 37.6
              L14 52.1
              L29.8 64.5
              L28.8 72.8
              L34.7 65.5
              L37.7 68.6
              L37.7 72.8
              L40.6 71.7
              L45.6 79
              L54.4 71.7
              L58.4 77.9
              L63.3 79
              L69.2 69.7
              L70.2 57.3
              L74.2 53.1
              L76.1 45.9
              L85 39.7
              L77.1 27.3
              L69.2 27.3
              L62.3 30.4
              L52.5 18
              L43.6 18
              L33.7 25.2
              L22.9 29.4
              Z"
            fill="rgba(255,255,255,0.045)"
            stroke="rgba(255,255,255,0.24)"
            strokeWidth="1.4"
            strokeLinejoin="round"
            transform="translate(50 50) scale(1.35 1.25) translate(-50 -50)"
          />

          {/* Thames-style background curve */}
          <path
            d="M11 56 C20 47, 30 52, 38 44 C46 36, 51 56, 58 45 C65 34, 72 55, 81 42 C87 34, 90 40, 88 52 C86 62, 88 69, 86 75"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Exact route through pin centres */}
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="rgba(120,255,160,0.42)"
            strokeWidth="1.4"
            strokeDasharray="2 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {MAP_POINTS.map((point, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isLocked = index > currentStageIndex;

          const label = isLocked ? "???" : isCurrent ? "CURRENT" : point.label;
          const icon = isLocked ? "?" : point.icon;

          return (
            <motion.div
              key={point.id}
              className={[
                "mission-map-pin",
                isCompleted ? "completed" : "",
                isCurrent ? "current" : "",
                isLocked ? "locked" : "",
              ].join(" ")}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.04 }}
            >
              <div className="mission-map-icon">{icon}</div>
              <div className={`mission-map-label ${point.labelPos}`}>
                {label}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
