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

      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob((blob) => {
        setCapturedImage(new File([blob], "capture.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 1);
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
        localStorage.setItem("userData", JSON.stringify({ id: data.user_id, first_name: data.name }));
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
    <div style={{ padding: "20px" }}>
      <h1>Face Registration & Verification</h1>

      <h2>Register Face</h2>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {uploadedImage && <p>Uploaded Image: {uploadedImage.name}</p>}
      <button onClick={registerFace}>Register Face</button>

      <h2>Verify Face</h2>
      <button onClick={openCamera}>Open Camera & Capture</button>
      {capturedImage && <p>Captured Image: {capturedImage.name}</p>}
      <button onClick={matchFace}>Match Face</button>

      {userData && (
        <div style={{ marginTop: "20px" }}>
          <h3>Welcome, {userData.first_name} (ID: {userData.id})</h3>
        </div>
      )}
    </div>
  );
}
