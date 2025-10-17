import React, { useState, useRef, useEffect, useCallback } from "react";
import api from "../assets/api";

export default function Home() {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data) {
          setUserData(data.user || data);
          localStorage.setItem("userData", JSON.stringify(data.user || data));
        }
      } catch (e) {
        console.error("Failed to parse message from React Native:", e);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
      setCameraStarted(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Cannot access camera");
    }
  }, []);

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setCapturedImage(file);
    }, "image/jpeg");
  };

  const registerFace = async () => {
    if (!capturedImage) return alert("No image captured");
    const formData = new FormData();
    formData.append("face_image", capturedImage);

    try {
      const res = await api.post(
        `/api/register-face/${userData?.id}/`,
        formData
      );
      if (res.status === 200) alert("Face registered successfully!");
      else alert("Registration failed");
    } catch (err) {
      console.error(err);
      alert("Error registering face");
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-green-50 rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-green-800 text-center">
        Face Registration & Verification
      </h1>

      {userData && (
        <p className="text-center font-extralight text-gray-500">
          Welcome: {userData.first_name} (ID: {userData.id})
        </p>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-green-700">Live Camera</h2>

        {!cameraStarted ? (
          <button
            onClick={startCamera}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Start Camera
          </button>
        ) : !capturedImage ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-lg border border-green-300"
            />
            <button
              onClick={captureImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition"
            >
              Capture
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-green-700 font-semibold">Preview</h3>
            <img
              src={URL.createObjectURL(capturedImage)}
              alt="captured"
              className="w-full rounded-lg border border-green-300"
            />
            <div className="flex space-x-2">
              <button
                onClick={registerFace}
                className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition"
              >
                Register Face
              </button>
            </div>
            <button
              onClick={() => {
                setCapturedImage(null);
                startCamera();
              }}
              className="w-full bg-green-200 text-green-800 font-semibold py-2 px-4 rounded-lg hover:bg-green-300 transition"
            >
              Retake
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
