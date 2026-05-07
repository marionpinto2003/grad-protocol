import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const WIDTH = 300;
const HEIGHT = 400;
const BALL_SIZE = 12;
const PADDLE_W = 60;
const PADDLE_H = 10;
const CPU_SPEED = 4;
const INITIAL_SPEED = 5;

export default function PingPong({ onComplete }) {
  const [phase, setPhase] = useState("intro");
  const [renderTick, setRenderTick] = useState(0);
  const [score, setScore] = useState({ player: 0, cpu: 0 });
  const gameRef = useRef(null);
  const animRef = useRef(null);
  const phaseRef = useRef("intro");

  const s = useRef({
    ballX: WIDTH / 2, ballY: HEIGHT / 2,
    ballDX: INITIAL_SPEED, ballDY: -INITIAL_SPEED,
    paddleX: WIDTH / 2 - PADDLE_W / 2,
    cpuPaddleX: WIDTH / 2 - PADDLE_W / 2,
    score: { player: 0, cpu: 0 },
  });

  const resetBall = (scoredBy) => {
    s.current.ballX = WIDTH / 2;
    s.current.ballY = HEIGHT / 2;
    s.current.ballDX = INITIAL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    s.current.ballDY = scoredBy === "player" ? -INITIAL_SPEED : INITIAL_SPEED;
  };

  const gameLoop = () => {
    if (phaseRef.current !== "playing") return;
    const g = s.current;

    g.ballX += g.ballDX;
    g.ballY += g.ballDY;

    // Wall bounce X
    if (g.ballX <= 0 || g.ballX >= WIDTH - BALL_SIZE) {
      g.ballDX *= -1;
      g.ballX = g.ballX <= 0 ? 0 : WIDTH - BALL_SIZE;
    }

    // CPU tracks ball
    const cpuCenter = g.cpuPaddleX + PADDLE_W / 2;
    if (cpuCenter < g.ballX + BALL_SIZE / 2) {
      g.cpuPaddleX = Math.min(g.cpuPaddleX + CPU_SPEED, WIDTH - PADDLE_W);
    } else {
      g.cpuPaddleX = Math.max(g.cpuPaddleX - CPU_SPEED, 0);
    }

    // Player paddle collision (bottom)
    if (
      g.ballY + BALL_SIZE >= HEIGHT - 30 - PADDLE_H &&
      g.ballY + BALL_SIZE <= HEIGHT - 20 &&
      g.ballX + BALL_SIZE >= g.paddleX &&
      g.ballX <= g.paddleX + PADDLE_W
    ) {
      g.ballDY = -Math.abs(g.ballDY);
      const hitPos = (g.ballX + BALL_SIZE / 2 - g.paddleX) / PADDLE_W;
      g.ballDX = (hitPos - 0.5) * 10;
    }

    // CPU paddle collision (top)
    if (
      g.ballY <= 30 + PADDLE_H &&
      g.ballY >= 20 &&
      g.ballX + BALL_SIZE >= g.cpuPaddleX &&
      g.ballX <= g.cpuPaddleX + PADDLE_W
    ) {
      g.ballDY = Math.abs(g.ballDY);
    }

    // Player scores (ball past CPU)
    if (g.ballY < 0) {
      g.score.player += 1;
      const snap = { ...g.score };
      if (snap.player >= 3) {
        phaseRef.current = "won";
        setPhase("won");
        setScore(snap);
        setTimeout(() => onComplete(), 1200);
        return;
      }
      setScore(snap);
      resetBall("player");
    }

    // CPU scores (ball past player)
    if (g.ballY > HEIGHT) {
      g.score.cpu += 1;
      const snap = { ...g.score };
      if (snap.cpu >= 3) {
        phaseRef.current = "lost";
        setPhase("lost");
        setScore(snap);
        return;
      }
      setScore(snap);
      resetBall("cpu");
    }

    setRenderTick(t => t + 1);
    animRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    s.current = {
      ballX: WIDTH / 2, ballY: HEIGHT / 2,
      ballDX: INITIAL_SPEED, ballDY: -INITIAL_SPEED,
      paddleX: WIDTH / 2 - PADDLE_W / 2,
      cpuPaddleX: WIDTH / 2 - PADDLE_W / 2,
      score: { player: 0, cpu: 0 },
    };
    setScore({ player: 0, cpu: 0 });
    phaseRef.current = "playing";
    setPhase("playing");
    animRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleTouch = (e) => {
    if (phaseRef.current !== "playing") return;
    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches?.[0] || e;
    const x = touch.clientX - rect.left - PADDLE_W / 2;
    s.current.paddleX = Math.max(0, Math.min(WIDTH - PADDLE_W, x));
  };

  const g = s.current;

  return (
    <div className="space-y-3 font-mono">
      <div className="text-center space-y-1">
        <p className="text-amber-400 text-xs uppercase tracking-widest">TT Redemption</p>
        <p className="text-green-700 text-xs">First to 3. Beat Trini. Restore your honour.</p>
      </div>

      {phase === "intro" && (
        <div className="space-y-3">
          <div className="border border-green-900 rounded p-3 bg-black/30 text-center space-y-1">
            <p className="text-green-600 text-xs">You lost to Trini at this table.</p>
            <p className="text-green-600 text-xs">Trini, who looks at Pinto like she's the main character.</p>
            <p className="text-amber-400 text-xs font-bold">Win 3 points to continue.</p>
          </div>
          <button onClick={startGame} className="w-full border border-green-600 text-green-400 py-3 rounded hover:bg-green-950/40 transition text-sm tracking-wider">
            [ SERVE ]
          </button>
        </div>
      )}

      {(phase === "playing" || phase === "won" || phase === "lost") && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs px-2">
            <span className="text-red-400">TRINI: {score.cpu}</span>
            <span className="text-green-400">YOU: {score.player}</span>
          </div>

          <div
            ref={gameRef}
            className="relative mx-auto border border-green-900 bg-black/60 overflow-hidden select-none"
            style={{ width: `${WIDTH}px`, height: `${HEIGHT}px` }}
            onTouchMove={handleTouch}
            onMouseMove={handleTouch}
          >
            <div className="absolute left-0 right-0 border-t border-dashed border-green-900" style={{ top: HEIGHT / 2 }} />
            <div className="absolute top-2 left-0 right-0 text-center"><span className="text-red-800 text-xs">TRINI</span></div>
            <div className="absolute bottom-2 left-0 right-0 text-center"><span className="text-green-800 text-xs">YOU</span></div>

            {/* CPU Paddle */}
            <div className="absolute bg-red-700 rounded" style={{ width: PADDLE_W, height: PADDLE_H, left: g.cpuPaddleX, top: 20 }} />

            {/* Player Paddle */}
            <div className="absolute bg-green-500 rounded" style={{ width: PADDLE_W, height: PADDLE_H, left: g.paddleX, bottom: 30 }} />

            {/* Ball */}
            <div className="absolute bg-white rounded-full" style={{ width: BALL_SIZE, height: BALL_SIZE, left: g.ballX, top: g.ballY }} />

            {(phase === "won" || phase === "lost") && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center space-y-2 px-4">
                  {phase === "won" ? (
                    <>
                      <p className="text-green-400 text-lg font-bold">✓ WINNER</p>
                      <p className="text-green-600 text-xs">Trini has been defeated. Finally.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-400 text-lg font-bold">DEFEATED</p>
                      <p className="text-red-500 text-xs font-bold mt-1">PENALTY: Ask a random girl in the building for her number.</p>
                      <p className="text-red-700 text-xs">Proof required. Then proceed.</p>
                      <button
                        onClick={() => onComplete()}
                        className="border border-amber-600 text-amber-400 px-4 py-1.5 rounded text-xs tracking-wider hover:bg-amber-950/30 transition mt-2"
                      >
                        [ PENALTY ACCEPTED — PROCEED ]
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          {phase === "playing" && <p className="text-green-800 text-xs text-center">Move your finger to control the paddle</p>}
        </div>
      )}
    </div>
  );
}
