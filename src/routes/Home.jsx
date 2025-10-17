import React, { useState, useRef, useEffect } from "react";
const API_BASE = import.meta.env.VITE_API_URL;

export default function Home() {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Cannot access camera");
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setUserData(data.user || data);
        localStorage.setItem("userData", JSON.stringify(data.user || data));
      } catch (err) {
        console.error("Failed to parse message from React Native:", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setCapturedImage(file);
      },
      "image/jpeg",
      1
    );
  };

  const registerFace = async () => {
    if (!userData || !userData.id) return alert("User data not loaded yet.");

    const formData = new FormData();
    formData.append("face_image", capturedImage);

    try {
      const res = await fetch(`${API_BASE}/api/register-face/${userData.id}/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (res.ok) alert("Face registered successfully!");
      else alert((data && data.message) || "Registration failed");
    } catch (err) {
      console.error(err);
      alert("Error registering face");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-green-50 rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-green-800 text-center">
        Face Registration & Verification
      </h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-green-700">Live Camera</h2>
        {!capturedImage && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-lg border border-green-300"
            ></video>
            <button
              onClick={captureImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition"
            >
              Capture
            </button>
          </div>
        )}

        {capturedImage && (
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
              onClick={() => window.location.reload()}
              className="w-full bg-green-200 text-green-800 font-semibold py-2 px-4 rounded-lg hover:bg-green-300 transition"
            >
              Retake
            </button>
          </div>
        )}
      </div>

      {userData && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
          <h3 className="text-green-800 font-semibold">
            Welcome, {userData.first_name} (ID: {userData.id})
          </h3>
        </div>
      )}
    </div>
  );
}
