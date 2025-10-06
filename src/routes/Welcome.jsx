import React, { useState } from "react";

export default function FaceApp({ userId }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [userData, setUserData] = useState(null);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
    }
  };

  const registerFace = async () => {
    if (!uploadedImage) {
      alert("Please upload an image to register.");
      return;
    }

    const formData = new FormData();
    formData.append("face_image", uploadedImage);

    try {
      const res = await fetch(`/api/register-face/${userData.id}/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        alert(`Face registered successfully! User ID: ${data.id}`);
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error registering face");
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera API not supported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      stream.getTracks().forEach((track) => track.stop());

      canvas.toBlob(
        (blob) => {
          setCapturedImage(
            new File([blob], "capture.jpg", { type: "image/jpeg" })
          );
        },
        "image/jpeg",
        1
      );
    } catch (err) {
      console.error(err);
      alert("Camera error");
    }
  };

  const matchFace = async () => {
    if (!capturedImage) {
      alert("Please capture an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("face_image", capturedImage);

    try {
      const res = await fetch(`/api/match-face/?user_id=${userId}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.match) {
        localStorage.setItem(
          "userData",
          JSON.stringify({ id: data.user_id, first_name: data.name })
        );
        setUserData({ id: data.user_id, first_name: data.name });
        alert("Face matched successfully!");
      } else {
        alert("No match found");
      }
    } catch (err) {
      console.error(err);
      alert("Error matching face");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-green-50 rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-green-800 text-center">
        Face Registration & Verification
      </h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-green-700">Register Face</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="block w-full text-green-800 border border-green-300 rounded-lg p-2 bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        {uploadedImage && (
          <p className="text-green-700">Uploaded Image: {uploadedImage.name}</p>
        )}
        <button
          onClick={registerFace}
          className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition"
        >
          Register Face
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-green-700">Verify Face</h2>
        <button
          onClick={openCamera}
          className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition"
        >
          Open Camera & Capture
        </button>
        {capturedImage && (
          <p className="text-green-700">Captured Image: {capturedImage.name}</p>
        )}
        <button
          onClick={matchFace}
          className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition"
        >
          Match Face
        </button>
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
