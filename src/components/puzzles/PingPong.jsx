import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

const WIDTH = 300;
const HEIGHT = 400;
const BALL_R = 7;
const PADDLE_W = 60;
const PADDLE_H = 10;
const CPU_SPEED = 3.5;
const BALL_SPEED = 5;

function initState() {
  return {
    ballX: WIDTH / 2, ballY: HEIGHT / 2,
    ballDX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    ballDY: -BALL_SPEED,
    paddleX: WIDTH / 2 - PADDLE_W / 2,
    cpuX: WIDTH / 2 - PADDLE_W / 2,
    playerScore: 0, cpuScore: 0,
  };
}

export default function PingPong({ onComplete }) {
  const [phase, setPhase] = useState("intro");
  const [score, setScore] = useState({ player: 0, cpu: 0 });
  const canvasRef = useRef(null);
  const stateRef = useRef(initState());
  const phaseRef = useRef("intro");
  const animRef = useRef(null);
  const loopRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = stateRef.current;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Centre line
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "#1a2e1a";
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT / 2);
    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // CPU paddle
    ctx.fillStyle = "#b91c1c";
    ctx.beginPath();
    ctx.roundRect(g.cpuX, 20, PADDLE_W, PADDLE_H, 3);
    ctx.fill();

    // Player paddle
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.roundRect(g.paddleX, HEIGHT - 30 - PADDLE_H, PADDLE_W, PADDLE_H, 3);
    ctx.fill();

    // Ball
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(g.ballX, g.ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = "#7f1d1d";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("TRINI", WIDTH / 2, 14);
    ctx.fillStyle = "#14532d";
    ctx.fillText("YOU", WIDTH / 2, HEIGHT - 4);
  }, []);

  const gameLoop = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const g = stateRef.current;

    g.ballX += g.ballDX;
    g.ballY += g.ballDY;

    // Wall bounce
    if (g.ballX - BALL_R <= 0) { g.ballDX = Math.abs(g.ballDX); g.ballX = BALL_R; }
    if (g.ballX + BALL_R >= WIDTH) { g.ballDX = -Math.abs(g.ballDX); g.ballX = WIDTH - BALL_R; }

    // CPU tracks ball
    const cpuCenter = g.cpuX + PADDLE_W / 2;
    if (cpuCenter < g.ballX) g.cpuX = Math.min(g.cpuX + CPU_SPEED, WIDTH - PADDLE_W);
    else g.cpuX = Math.max(g.cpuX - CPU_SPEED, 0);

    // Player paddle collision
    const playerPaddleY = HEIGHT - 30 - PADDLE_H;
    if (
      g.ballY + BALL_R >= playerPaddleY &&
      g.ballY + BALL_R <= playerPaddleY + PADDLE_H + 6 &&
      g.ballX >= g.paddleX &&
      g.ballX <= g.paddleX + PADDLE_W
    ) {
      g.ballDY = -Math.abs(g.ballDY);
      const hit = (g.ballX - g.paddleX) / PADDLE_W;
      g.ballDX = (hit - 0.5) * 10;
    }

    // CPU paddle collision
    if (
      g.ballY - BALL_R <= 20 + PADDLE_H &&
      g.ballY - BALL_R >= 20 - 6 &&
      g.ballX >= g.cpuX &&
      g.ballX <= g.cpuX + PADDLE_W
    ) {
      g.ballDY = Math.abs(g.ballDY);
    }

    // Scoring
    if (g.ballY - BALL_R < 0) {
      g.playerScore += 1;
      setScore({ player: g.playerScore, cpu: g.cpuScore });
      if (g.playerScore >= 3) {
        phaseRef.current = "won";
        setPhase("won");
        draw();
        setTimeout(() => onComplete(), 1400);
        return;
      }
      g.ballX = WIDTH / 2; g.ballY = HEIGHT / 2;
      g.ballDX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
      g.ballDY = -BALL_SPEED;
    }

    if (g.ballY + BALL_R > HEIGHT) {
      g.cpuScore += 1;
      setScore({ player: g.playerScore, cpu: g.cpuScore });
      if (g.cpuScore >= 3) {
        phaseRef.current = "lost";
        setPhase("lost");
        draw();
        return;
      }
      g.ballX = WIDTH / 2; g.ballY = HEIGHT / 2;
      g.ballDX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
      g.ballDY = BALL_SPEED;
    }

    draw();
    animRef.current = requestAnimationFrame(loopRef.current);
  }, [draw, onComplete]);

  loopRef.current = gameLoop;

  const startGame = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    stateRef.current = initState();
    setScore({ player: 0, cpu: 0 });
    phaseRef.current = "playing";
    setPhase("playing");
    animRef.current = requestAnimationFrame(loopRef.current);
  };

  useEffect(() => {
    if (phase === "playing") draw();
  }, [phase, draw]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleMove = (e) => {
    if (phaseRef.current !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left - PADDLE_W / 2;
    stateRef.current.paddleX = Math.max(0, Math.min(WIDTH - PADDLE_W, x));
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

          <div className="relative mx-auto" style={{ width: WIDTH }}>
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              className="border border-green-900 rounded block"
              onMouseMove={handleMove}
              onTouchMove={handleMove}
              style={{ touchAction: "none" }}
            />

            {(phase === "won" || phase === "lost") && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center rounded">
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
