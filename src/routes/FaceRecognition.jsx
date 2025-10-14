import React, { useState, useRef, useEffect } from "react";
import api from "../assets/api";

export default function FaceRecognition() {
  const [stream, setStream] = useState(null);
  const [matchedUser, setMatchedUser] = useState(null);
  const [attendanceId, setAttendanceId] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loadingTimeIn, setLoadingTimeIn] = useState(false);
  const [timeInSuccess, setTimeInSuccess] = useState(false);
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
    console.log("uploadTimeIn called");
    setLoadingTimeIn(true);
    try {
      const { data } = await api.post(`/api/facerecognition-timein/${attendanceId}/${matchedUser.name}/`, {});
      // ${attendanceId}
      // ${matchedUser.name}
      console.log("Time in uploaded:", data);
      setTimeInSuccess(true);
    } catch (err) {
      console.error("Error uploading time in:", err);
      alert(err.response?.data?.error || "❌ Failed to time in");
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
          const { data } = await api.post("/api/match-face/", formData);
          console.log("Face match successful, showing time-in button...");
          setMatchedUser({ id: data.user_id, name: data.name });
          clearInterval(intervalRef.current);
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
        Live Face Match updated 15
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
          <h3 className="text-blue-800 font-semibold">
            Face Matched! User ID: {matchedUser.name}
          </h3>

          {!timeInSuccess && (
            <button
              onClick={uploadTimeIn}
              disabled={loadingTimeIn}
              className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {loadingTimeIn ? "Uploading..." : "Submit Time In"}
            </button>
          )}

          {timeInSuccess && (
            <p className="text-green-600 mt-2 font-medium">
              Time in recorded successfully! 
            </p>
          )}
        </div>
      )}
    </div>
  );
}
