import React, { useState, useRef, useEffect } from "react";
const API_BASE = import.meta.env.VITE_API_URL;

export default function FaceRecognition() {
  const [stream, setStream] = useState(null);
  const [matchedUser, setMatchedUser] = useState(null);
  const [attendanceId, setAttendanceId] = useState(null);
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

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
      } catch (err) {
        console.error("Camera error:", err);
        alert("Cannot access camera");
      }
    };

    startCamera();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (!videoRef.current) return;

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
          }
        } catch (err) {
          console.error("Error matching face:", err);
        }
      }, "image/jpeg");
    };

    intervalRef.current = setInterval(matchLoop, 1000);

    return () => clearInterval(intervalRef.current);
  }, [matchedUser]);

  return (
    <div className="p-6 max-w-md mx-auto bg-blue-50 rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 text-center">
        Live Face Match
      </h1>

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
          <h3 className="text-blue-800 font-semibold">
            Face Matched! User ID: {matchedUser.id} - {matchedUser.name}
          </h3>
        </div>
      )}
    </div>
  );
}
