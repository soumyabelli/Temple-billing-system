import { useEffect, useRef, useState, useMemo } from "react";
import * as faceapi from "face-api.js";
import { FiCamera, FiMapPin, FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import { markAttendance } from "../../services/attendanceService";

const StaffAttendanceFlow = ({ staffId, staffName, staffEmail, action, onComplete, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  
  const [statusMsg, setStatusMsg] = useState("Loading modules...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  
  const [deviceInfo, setDeviceInfo] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");
  const [ipAddress, setIpAddress] = useState("");

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatusMsg("Models loaded. Fetching location...");
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load face detection models.");
      }
    };
    loadModels();
  }, []);

  // Get Device and IP Info
  useEffect(() => {
    const fetchMeta = async () => {
      setDeviceInfo(navigator.userAgent);
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
      setBrowserInfo(isChrome ? "Chrome" : isSafari ? "Safari" : "Other Browser");
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setIpAddress(data.ip);
      } catch (e) {
        setIpAddress("Unknown IP");
      }
    };
    fetchMeta();
  }, []);

  // Fetch Location
  useEffect(() => {
    if (!modelsLoaded) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setStatusMsg("Location found. Starting camera...");
          startCamera();
        },
        (err) => {
          console.error(err);
          setLocationError("Location access denied or unavailable.");
          setErrorMsg("GPS location is required for attendance.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setErrorMsg("GPS location is required for attendance.");
    }
  }, [modelsLoaded]);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setStatusMsg("Please look at the camera to verify your face.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Face Detection Loop
  useEffect(() => {
    if (!cameraActive) return;
    
    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setFaceDetected(true);
        setFaceDescriptor(Array.from(detection.descriptor));
        
        // Optionally draw to canvas
        if (canvasRef.current) {
          const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resizedResult = faceapi.resizeResults(detection, dims);
          faceapi.draw.drawDetections(canvasRef.current, resizedResult);
        }
      } else {
        setFaceDetected(false);
        setFaceDescriptor(null);
        if (canvasRef.current) {
           const ctx = canvasRef.current.getContext("2d");
           ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [cameraActive]);

  const captureFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7); // compress slightly
  };

  const handleSubmit = async () => {
    if (!faceDetected || !faceDescriptor) {
      setErrorMsg("Face not detected. Please look clearly at the camera.");
      return;
    }
    if (!location) {
      setErrorMsg("GPS location not available.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg("");
    setStatusMsg("Verifying and submitting attendance...");

    const photoBase64 = captureFrame();

    try {
      await markAttendance({
        staffId,
        staffName,
        staffEmail,
        action,
        latitude: location.latitude,
        longitude: location.longitude,
        deviceInfo,
        browser: browserInfo,
        ipAddress,
        photo: photoBase64,
        faceDescriptor
      });
      
      stopCamera();
      onComplete();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 space-y-6">
      
      <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-4">
         <h3 className="font-bold text-slate-800 text-lg mb-2 text-center">Verify Identity & Location</h3>
         <p className="text-sm text-slate-600 text-center mb-4">{statusMsg}</p>
         
         {/* Camera View */}
         <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
              </>
            ) : (
              <div className="text-slate-500 flex flex-col items-center gap-2">
                 <FiCamera size={32} />
                 <span>{errorMsg ? "Camera Error" : "Starting Camera..."}</span>
              </div>
            )}
            
            {/* Status Overlays */}
            {cameraActive && faceDetected && (
              <div className="absolute top-3 right-3 bg-emerald-500/90 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                <FiCheckCircle /> Face Detected
              </div>
            )}
         </div>
      </div>

      {/* Conditions Checklist */}
      <div className="w-full space-y-3">
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${location ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
           {location ? <FiCheckCircle className="text-emerald-500 text-xl" /> : locationError ? <FiXCircle className="text-rose-500 text-xl" /> : <FiLoader className="text-slate-400 text-xl animate-spin" />}
           <div className="flex-1">
             <p className="font-semibold text-sm">GPS Location</p>
             <p className="text-xs opacity-80">{location ? `Lat: ${location.latitude.toFixed(5)}, Lng: ${location.longitude.toFixed(5)}` : locationError || "Detecting..."}</p>
           </div>
        </div>
        
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${faceDetected ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
           {faceDetected ? <FiCheckCircle className="text-emerald-500 text-xl" /> : <FiCamera className="text-slate-400 text-xl" />}
           <div className="flex-1">
             <p className="font-semibold text-sm">Live Face Match</p>
             <p className="text-xs opacity-80">{faceDetected ? "Face captured and ready" : "Awaiting face detection..."}</p>
           </div>
        </div>
      </div>

      {errorMsg && (
        <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div className="w-full flex gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-full hover:bg-slate-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!faceDetected || !location || isSubmitting}
          className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-full hover:bg-emerald-500 transition disabled:opacity-50 disabled:bg-slate-300 shadow-lg"
        >
          {isSubmitting ? "Verifying..." : `Confirm ${action === "check-in" ? "Check In" : "Check Out"}`}
        </button>
      </div>

    </div>
  );
};

export default StaffAttendanceFlow;
