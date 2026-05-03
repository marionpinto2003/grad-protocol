import { useState, useRef, useEffect } from "react";

export default function PhotoCapture({ onComplete }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      try {
        // fallback to any camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        setCameraActive(true);
      } catch {
        alert("Camera access required. Please allow camera permissions.");
      }
    }
  };

  // Attach stream AFTER video element renders
  useEffect(() => {
    if (!cameraActive || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(console.warn);
  }, [cameraActive]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 300;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const data = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(data);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const confirm = () => onComplete(preview);

  const retake = () => {
    setPreview(null);
    startCamera();
  };

  return (
    <div className="space-y-3">
      <p className="text-green-600 text-xs uppercase tracking-wider">
        Photo Proof Required
      </p>

      {!cameraActive && !preview && (
        <button
          onClick={startCamera}
          className="w-full border border-amber-500 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
        >
          [ ACTIVATE CAMERA ]
        </button>
      )}

      {cameraActive && (
        <div className="space-y-3">
          <div className="border border-green-800 rounded overflow-hidden bg-black" style={{ minHeight: "200px" }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
          </div>
          <button
            onClick={capture}
            className="w-full border border-green-500 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider"
          >
            [ CAPTURE ]
          </button>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="border border-green-800 rounded overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full object-cover max-h-64"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={retake}
              className="border border-amber-700 text-amber-500 py-2 rounded text-xs tracking-wider hover:bg-amber-950/30 transition"
            >
              [ RETAKE ]
            </button>
            <button
              onClick={confirm}
              className="border border-green-500 text-green-400 py-2 rounded text-xs tracking-wider hover:bg-green-950/30 transition"
            >
              [ CONFIRM ✓ ]
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
