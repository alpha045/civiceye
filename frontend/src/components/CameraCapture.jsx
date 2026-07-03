import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, X, Check } from "lucide-react";

export default function CameraCapture({ onImageCaptured, onCancel }) {
  const [stream, setStream] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto-start camera when modal opens
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Watch stream state and safely bind it to video element
  useEffect(() => {
    if (stream && videoRef.current && !image) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error("Video play failed:", err));
    }
  }, [stream, image]);

  const startCamera = async () => {
    setError("");
    setImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      setStream(mediaStream);
    } catch (err) {
      setError("Camera permission denied or device busy! Please check browser settings.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Check if video is actually ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("Camera is still loading, please wait a second.");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `civiceye_capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setImage(URL.createObjectURL(blob));
          stopCamera();
          onImageCaptured(file); 
        }
      }, "image/jpeg", 0.85);
    }
  };

  const closeAll = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-9999 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
        
        {/* Header */}
        <div className="p-4 bg-zinc-800/80 flex justify-between items-center border-b border-zinc-800">
          <span className="text-sm font-semibold text-zinc-200">Live Infrastructure Capture</span>
          <button type="button" onClick={closeAll} className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Display Box (Fixed Height & Visibility) */}
        <div className="relative w-full min-h-80 bg-black flex items-center justify-center overflow-hidden aspect-4/3">
          {error && <p className="text-xs text-red-500 text-center px-6 font-medium z-10">{error}</p>}
          
          <canvas ref={canvasRef} className="hidden" />

          {/* Condition 1: Live Streaming */}
          {stream && !image && (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="absolute inset-0 w-full h-full object-cover block bg-black" 
            />
          )}

          {/* Condition 2: Preview Snap */}
          {image && (
            <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover block" />
          )}

          {/* Condition 3: Loading state */}
          {!stream && !image && !error && (
            <div className="text-zinc-400 text-sm animate-pulse flex flex-col items-center gap-2">
              <Camera className="w-6 h-6 text-zinc-500" />
              <span>Initializing Camera Hardware...</span>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-5 bg-zinc-950 flex justify-center items-center border-t border-zinc-800/80 gap-4 min-h-24">
          {stream && !image && (
            <button 
              type="button" 
              onClick={capturePhoto} 
              className="w-16 h-16 bg-white hover:bg-zinc-200 active:scale-95 rounded-full flex items-center justify-center border-4 border-zinc-700 shadow-xl transition-all"
            >
              <div className="w-12 h-12 rounded-full border-2 border-zinc-900 bg-white" />
            </button>
          )}

          {image && (
            <div className="flex w-full gap-3">
              <button 
                type="button" 
                onClick={() => { setImage(null); startCamera(); }} 
                className="flex-1 bg-zinc-800 text-zinc-300 hover:text-white py-2.5 rounded-xl border border-zinc-700 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retake
              </button>
              <button 
                type="button" 
                onClick={closeAll} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Use This Photo
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}