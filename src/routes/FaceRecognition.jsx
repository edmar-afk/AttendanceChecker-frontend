import React, { useState, useRef, useEffect } from "react";
const API_BASE = import.meta.env.VITE_API_URL;

export default function FaceRecognition() {
  const [stream, setStream] = useState(null);
  const [matchedUser, setMatchedUser] = useState(null);
  const [attendanceId, setAttendanceId] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loadingTimeIn, setLoadingTimeIn] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.attendanceId) {
          setAttendanceId(data.attendanceId);
          console.log("Received attendanceId:", data.attendanceId);
        }
      } catch (e) {
        console.error("Invalid message data", e);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setCameraStarted(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Cannot access camera");
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const uploadTimeIn = async () => {
    if (!attendanceId || !matchedUser?.name) return;
    setLoadingTimeIn(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/face-recognition-timein/${attendanceId}/${matchedUser.name}/`,
        { method: "POST" }
      );
      const data = await res.json();
      if (res.ok) {
        console.log("Time in uploaded:", data);
        alert("✅ Time-in successfully recorded!");
      } else {
        alert(data.message || "❌ Failed to time in");
      }
    } catch (err) {
      console.error("Error uploading time in:", err);
    } finally {
      setLoadingTimeIn(false);
    }
  };

  useEffect(() => {
    if (!cameraStarted || !videoRef.current) return;

    const matchLoop = async () => {
      if (!videoRef.current || matchedUser) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "frame.jpg", { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("face_image", file);

        try {
          const res = await fetch(`${API_BASE}/api/match-face/`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json().catch(() => null);

          if (res.ok && data?.match) {
            setMatchedUser({ id: data.user_id, name: data.name });
            clearInterval(intervalRef.current);
            await uploadTimeIn(data.user_id);
          }
        } catch (err) {
          console.error("Error matching face:", err);
        }
      }, "image/jpeg");
    };

    intervalRef.current = setInterval(matchLoop, 1000);
    return () => clearInterval(intervalRef.current);
  }, [cameraStarted, matchedUser]);

  return (
    <div className="p-6 max-w-md mx-auto bg-blue-50 rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 text-center">
        Live Face Match updated 3
      </h1>

      {!cameraStarted ? (
        <button
          onClick={startCamera}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Start Camera
        </button>
      ) : (
        <p className="text-center text-green-600 font-semibold">
          Camera Started
        </p>
      )}

      {attendanceId && (
        <p className="text-center text-blue-700 font-medium">
          Attendance ID: {attendanceId}
        </p>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-lg border border-blue-300"
        ></video>
      </div>

      {matchedUser && (
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200 text-center">
          <h3 className="text-blue-800 font-semibold hidden">
            Face Matched! User ID: {matchedUser.id} - {matchedUser.name}
          </h3>
          {loadingTimeIn ? (
            <p className="text-blue-600 mt-2">Uploading time in...</p>
          ) : (
            <p className="text-green-600 mt-2 font-medium">
              Time-in recorded successfully!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
