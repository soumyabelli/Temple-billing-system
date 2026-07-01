import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import { FiCamera, FiCheckCircle, FiXCircle } from "react-icons/fi";
import axios from "axios";

const FaceRegistration = ({ employee, onComplete }) => {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState(null);
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const streamRef = useRef(null);

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
      } catch (err) {
        console.error("Error loading models", err);
        setMessage("Failed to load face recognition models.");
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        setStream(currentStream);
        streamRef.current = currentStream;
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam", err);
        setMessage("Unable to access camera.");
      });
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  };

  useEffect(() => {
    return () => stopVideo();
  }, []);

  const captureAndRegister = async () => {
    if (!videoRef.current || !modelsLoaded) return;
    setIsRegistering(true);
    setMessage("Detecting face...");
    try {
      const detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
      if (!detection) {
        setMessage("No face detected. Please ensure your face is clearly visible.");
        setIsRegistering(false);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      const photo = canvas.toDataURL("image/jpeg", 0.7);

      setMessage("Registering face...");
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/employees/${employee._id || employee.id}/register-face`, {
        faceDescriptor: Array.from(detection.descriptor),
        profilePhoto: photo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage("Face registered successfully!");
        setTimeout(() => {
          stopVideo();
          if (onComplete) onComplete(res.data.employee);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "An error occurred during registration.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-bold mb-4">Face Registration</h3>
      {employee.faceRegistered ? (
        <div className="mb-4 rounded-xl bg-green-50 p-4 text-green-700">
          <p className="font-semibold">Face is already registered for this employee.</p>
          <p className="text-sm">You can re-register by capturing a new face below.</p>
        </div>
      ) : (
        <div className="mb-4 rounded-xl bg-amber-50 p-4 text-amber-700">
          <p className="font-semibold">No face registered yet.</p>
        </div>
      )}
      <div className="flex flex-col items-center">
        {message && <p className="mb-4 text-sm font-semibold text-slate-700">{message}</p>}
        {!stream && modelsLoaded && (
          <button onClick={startVideo} className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-800">
            <FiCamera /> Start Camera
          </button>
        )}
        {!modelsLoaded && <p>Loading face models...</p>}
        <div className="relative mt-4">
          <video ref={videoRef} autoPlay muted className={`rounded-xl shadow ${stream ? "block" : "hidden"}`} style={{ width: "400px", height: "auto" }} />
        </div>
        {stream && (
          <div className="mt-4 flex gap-4">
            <button onClick={captureAndRegister} disabled={isRegistering} className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-white transition hover:bg-green-500 disabled:opacity-50">
              <FiCheckCircle /> {isRegistering ? "Registering..." : "Capture & Register"}
            </button>
            <button onClick={stopVideo} className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-slate-700 transition hover:bg-slate-50">
              <FiXCircle /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceRegistration;
