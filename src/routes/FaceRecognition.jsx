import React, { useState, useRef, useEffect } from "react";
const API_BASE = import.meta.env.VITE_API_URL;

export default function FaceRecognition() {
  const [stream, setStream] = useState(null);
  const [matchedUser, setMatchedUser] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const intervalRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        console.error("Camera error:", err);
        alert("Cannot access camera");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      clearInterval(intervalRef.current);
    };
  }, []);

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

    intervalRef.current = setInterval(matchLoop, 1000); // try every 1 second

    return () => clearInterval(intervalRef.current);
  }, [matchedUser]);

  return (
    <div className="p-6 max-w-md mx-auto bg-blue-50 rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 text-center">
        Live Face Match
      </h1>

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
