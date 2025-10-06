import React from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function FingerprintRegister() {
  const handleFingerprintRegister = async () => {
    const userId = localStorage.getItem("userData.id");
    if (!userId) return alert("User not found in localStorage");

    try {
      // Trigger fingerprint prompt
      const publicKeyCredentialRequestOptions = {
        challenge: new Uint8Array([0x8C, 0x7A, 0x3C, 0xFC]),
        timeout: 60000,
        userVerification: "required",
      };

      await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });

      // Call backend to register fingerprint
      const response = await fetch(`${API_BASE}/fingerprints/${userId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // no need to send device_id
      });

      if (!response.ok) {
        const errorData = await response.json();
        return alert(`Error: ${errorData.detail}`);
      }

      const data = await response.json();
      console.log("Fingerprint registered:", data);
      alert("Fingerprint registered successfully!");
    } catch (err) {
      console.error("Fingerprint scan failed", err);
      alert("Fingerprint scan failed or cancelled.");
    }
  };

  return (
    <button
      onClick={handleFingerprintRegister}
      className="px-4 py-2 bg-green-500 text-white rounded"
    >
      Register Fingerprint
    </button>
  );
}
