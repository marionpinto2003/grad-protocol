import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function PingPong({ onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro | playing | won | lost
  const [ballX, setBallX] = useState(150);
  const [ballY, setBallY] = useState(200);
  const [ballDX, setBallDX] = useState(3);
  const [ballDY, setBallDY] = useState(-3);
  const [paddleX, setPaddleX] = useState(125);
  const [score, setScore] = useState({ player: 0, cpu: 0 });
  const [cpuPaddleX, setCpuPaddleX] = useState(125);
  const gameRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    ballX: 150, ballY: 200,
    ballDX: 3, ballDY: -3,
    paddleX: 125, cpuPaddleX: 125,
    score: { player: 0, cpu: 0 },
  });

  const WIDTH = 300;
  const HEIGHT = 400;
  const BALL_SIZE = 12;
  const PADDLE_W = 60;
  const PADDLE_H = 10;
  const CPU_SPEED = 2.5;

  const resetBall = (scoredBy) => {
    stateRef.current.ballX = WIDTH / 2;
    stateRef.current.ballY = HEIGHT / 2;
    stateRef.current.ballDX = scoredBy === "player" ? 3 : -3;
    stateRef.current.ballDY = scoredBy === "player" ? -3 : 3;
  };

  const gameLoop = () => {
    const s = stateRef.current;

    // Move ball
    s.ballX += s.ballDX;
    s.ballY += s.ballDY;

    // Wall bounce X
    if (s.ballX <= 0 || s.ballX >= WIDTH - BALL_SIZE) {
      s.ballDX *= -1;
    }

    // CPU paddle follows ball
    const cpuCenter = s.cpuPaddleX + PADDLE_W / 2;
    if (cpuCenter < s.ballX) s.cpuPaddleX = Math.min(s.cpuPaddleX + CPU_SPEED, WIDTH - PADDLE_W);
    else s.cpuPaddleX = Math.max(s.cpuPaddleX - CPU_SPEED, 0);

    // Player paddle collision (bottom)
    if (
      s.ballY + BALL_SIZE >= HEIGHT - 30 - PADDLE_H &&
      s.ballY + BALL_SIZE <= HEIGHT - 20 &&
      s.ballX + BALL_SIZE >= s.paddleX &&
      s.ballX <= s.paddleX + PADDLE_W
    ) {
      s.ballDY = -Math.abs(s.ballDY) - 0.3;
      const hitPos = (s.ballX + BALL_SIZE / 2 - s.paddleX) / PADDLE_W;
      s.ballDX = (hitPos - 0.5) * 8;
    }

    // CPU paddle collision (top)
    if (
      s.ballY <= 30 + PADDLE_H &&
      s.ballY >= 20 &&
      s.ballX + BALL_SIZE >= s.cpuPaddleX &&
      s.ballX <= s.cpuPaddleX + PADDLE_W
    ) {
      s.ballDY = Math.abs(s.ballDY) + 0.2;
    }

    // Score — ball passes CPU paddle (top) → player scores
    if (s.ballY < 0) {
      s.score.player += 1;
      if (s.score.player >= 3) {
        setPhase("won");
        setTimeout(() => onComplete(), 1200);
        setScore({ ...s.score });
        return;
      }
      setScore({ ...s.score });
      resetBall("player");
    }

    // Score — ball passes player paddle (bottom) → cpu scores
    if (s.ballY > HEIGHT) {
      s.score.cpu += 1;
      if (s.score.cpu >= 3) {
        setPhase("lost"); // cpu wins
        setScore({ ...s.score });
        return;
      }
      setScore({ ...s.score });
      resetBall("cpu");
    }

    // Sync state to React
    setBallX(s.ballX);
    setBallY(s.ballY);
    setCpuPaddleX(s.cpuPaddleX);

    animRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    stateRef.current = {
      ballX: WIDTH / 2, ballY: HEIGHT / 2,
      ballDX: 3, ballDY: -3,
      paddleX: WIDTH / 2 - PADDLE_W / 2,
      cpuPaddleX: WIDTH / 2 - PADDLE_W / 2,
      score: { player: 0, cpu: 0 },
    };
    setScore({ player: 0, cpu: 0 });
    setPaddleX(WIDTH / 2 - PADDLE_W / 2);
    setPhase("playing");
    animRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleTouch = (e) => {
    if (phase !== "playing") return;
    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches?.[0] || e;
    const x = touch.clientX - rect.left - PADDLE_W / 2;
    const clamped = Math.max(0, Math.min(WIDTH - PADDLE_W, x));
    stateRef.current.paddleX = clamped;
    setPaddleX(clamped);
  };

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
          <button
            onClick={startGame}
            className="w-full border border-green-600 text-green-400 py-3 rounded hover:bg-green-950/40 transition text-sm tracking-wider"
          >
            [ SERVE ]
          </button>
        </div>
      )}

      {(phase === "playing" || phase === "won" || phase === "lost") && (
        <div className="space-y-2">
          {/* Score */}
          <div className="flex justify-between text-xs px-2">
            <span className="text-red-400">TRINI: {score.cpu}</span>
            <span className="text-green-400">YOU: {score.player}</span>
          </div>

          {/* Game canvas */}
          <div
            ref={gameRef}
            className="relative mx-auto border border-green-900 bg-black/60 overflow-hidden select-none"
            style={{ width: `${WIDTH}px`, height: `${HEIGHT}px` }}
            onTouchMove={handleTouch}
            onMouseMove={handleTouch}
          >
            {/* Centre line */}
            <div className="absolute left-0 right-0 border-t border-dashed border-green-900" style={{ top: HEIGHT / 2 }} />

            {/* CPU label */}
            <div className="absolute top-2 left-0 right-0 text-center">
              <span className="text-red-800 text-xs">TRINI</span>
            </div>

            {/* Player label */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="text-green-800 text-xs">YOU</span>
            </div>

            {/* CPU Paddle */}
            <div
              className="absolute bg-red-700 rounded"
              style={{
                width: PADDLE_W,
                height: PADDLE_H,
                left: cpuPaddleX,
                top: 20,
              }}
            />

            {/* Player Paddle */}
            <div
              className="absolute bg-green-500 rounded"
              style={{
                width: PADDLE_W,
                height: PADDLE_H,
                left: paddleX,
                bottom: 30,
              }}
            />

            {/* Ball */}
            <div
              className="absolute bg-white rounded-full"
              style={{
                width: BALL_SIZE,
                height: BALL_SIZE,
                left: ballX,
                top: ballY,
              }}
            />

            {/* Game over overlay */}
            {(phase === "won" || phase === "lost") && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center space-y-2">
                  {phase === "won" ? (
                    <>
                      <p className="text-green-400 text-lg font-bold">✓ WINNER</p>
                      <p className="text-green-600 text-xs">Trini has been defeated.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-400 text-lg font-bold">DEFEATED</p>
                      <p className="text-red-600 text-xs">Trini wins again.</p>
                      <button
                        onClick={startGame}
                        className="border border-amber-600 text-amber-400 px-4 py-1.5 rounded text-xs tracking-wider hover:bg-amber-950/30 transition mt-2"
                      >
                        [ REMATCH ]
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {phase === "playing" && (
            <p className="text-green-800 text-xs text-center">Move your finger to control the paddle</p>
          )}
        </div>
      )}
    </div>
  );
}
