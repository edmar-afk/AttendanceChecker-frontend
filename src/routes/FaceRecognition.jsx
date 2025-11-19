import React, { useState, useRef, useEffect } from "react";
import api from "../assets/api";
import CircularProgress from "@mui/material/CircularProgress";

export default function FaceRecognition() {
  const [stream, setStream] = useState(null);
  const [matchedUser, setMatchedUser] = useState(null);
  const [attendanceId, setAttendanceId] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loadingTimeIn, setLoadingTimeIn] = useState(false);
  const [timeInSuccess, setTimeInSuccess] = useState(false);
  const [recognizingFace, setRecognizingFace] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.attendanceId) setAttendanceId(data.attendanceId);
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
    if (!attendanceId) return;

    const fetchAttendance = async () => {
      try {
        const { data } = await api.get(`/api/attendance/${attendanceId}/`);
        setAttendanceData(data);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
      }
    };

    fetchAttendance();
  }, [attendanceId]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const uploadTimeIn = async (user) => {
    setLoadingTimeIn(true);
    try {
      const { data } = await api.post(
        `/api/facerecognition-timein/${attendanceId}/${user.name}/`,
        {}
      );
      console.log("Time in uploaded:", data);
      setTimeInSuccess(true);

      await api.post(`/api/history-logs/${data.user}/create/`, {
        title: "Face Recognition Time In",
        subtitle: `You successfully timed in the event ${attendanceData?.event_name}`,
      });

      console.log("History log created");
    } catch (err) {
      console.error("Error uploading time in:", err);
      const status = err.response?.status;
      const statusText = err.response?.statusText;
      const data = JSON.stringify(err.response?.data, null, 2);
      const message = err.message;

      alert(
        `❌ Failed to time in\n\nStatus: ${status || "N/A"} ${
          statusText || ""
        }\nMessage: ${message}\nData: ${data || "No response data"}`
      );
    } finally {
      setLoadingTimeIn(false);
    }
  };

  useEffect(() => {
    if (!cameraStarted || !videoRef.current) return;

    const matchLoop = async () => {
      if (!videoRef.current || matchedUser) return;

      setRecognizingFace(true);
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
          console.log("Face match successful:", data);
          setMatchedUser({ id: data.user_id, name: data.name });
          clearInterval(intervalRef.current);
        } catch (err) {
          console.error("Error matching face:", err);
        } finally {
          setRecognizingFace(false);
        }
      }, "image/jpeg");
    };

    intervalRef.current = setInterval(matchLoop, 1000);
    return () => clearInterval(intervalRef.current);
  }, [cameraStarted, matchedUser]);

  return (
    <div className="p-6 max-w-md mx-auto bg-blue-50 rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 text-center">
        Live Face Match
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
        />
      </div>

      {recognizingFace && !matchedUser && (
        <div className="flex flex-col items-center justify-center mt-4">
          <CircularProgress color="primary" />
          <p className="mt-2 font-medium text-blue-800">
            Recognizing Face, please wait...
          </p>
        </div>
      )}

      {matchedUser && (
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200 text-center">
          <h3 className="text-blue-800 font-semibold">
            Face Matched! User ID: {matchedUser.name} ({matchedUser.id})
          </h3>

          {!timeInSuccess && (
            <button
              onClick={() => uploadTimeIn(matchedUser)}
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

      {cameraStarted && !matchedUser && !recognizingFace && (
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            No user found, please try again
          </button>
        </div>
      )}
    </div>
  );
}
