import { useState, useRef, useEffect } from "react";

export default function PhotoCapture({ onComplete }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera failed:", err);
      setCameraError(true);
      stopCamera();
    }
  };

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !streamRef.current) return;

    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch((err) => {
      console.warn("Video play failed:", err);
      setCameraError(true);
    });
  }, [cameraActive]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;

    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(data);
    stopCamera();
  };

  const handleFilePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const confirm = () => {
    if (preview) onComplete(preview);
  };

  const retake = () => {
    setPreview(null);
    setCameraError(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-green-600 text-xs uppercase tracking-wider">
        Photo Proof Required
      </p>

      {!cameraActive && !preview && (
        <div className="space-y-2">
          <button
            onClick={startCamera}
            className="w-full border border-amber-500 text-amber-400 py-3 rounded hover:bg-amber-950/30 transition text-sm tracking-wider"
          >
            [ ACTIVATE CAMERA ]
          </button>

          <label className="block w-full border border-green-700 text-green-400 py-3 rounded hover:bg-green-950/30 transition text-sm tracking-wider text-center cursor-pointer">
            [ TAKE / UPLOAD PHOTO ]
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFilePhoto}
              className="hidden"
            />
          </label>

          {cameraError && (
            <p className="text-red-400 text-xs leading-relaxed">
              Camera preview failed. Use TAKE / UPLOAD PHOTO instead.
            </p>
          )}
        </div>
      )}

      {cameraActive && (
        <div className="space-y-3">
          <div className="border border-green-800 rounded overflow-hidden bg-black min-h-[260px]">
            <video
              ref={videoRef}
              className="w-full min-h-[260px] object-cover"
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

          <button
            onClick={stopCamera}
            className="w-full border border-red-800 text-red-500 py-2 rounded hover:bg-red-950/30 transition text-xs tracking-wider"
          >
            [ CANCEL CAMERA ]
          </button>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="border border-green-800 rounded overflow-hidden">
            <img src={preview} alt="Preview" className="w-full object-cover max-h-64" />
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
