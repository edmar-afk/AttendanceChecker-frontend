import React, { useState } from "react";
import api from "../../assets/api";

function FingerPrint() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const registerFingerprint = async () => {
    try {
      setLoading(true);
      setStatus("Requesting fingerprint...");

      // Step 1: Begin register (get challenge/options from Django)
      const res = await api.post("/api/fingerprint/begin-register/", {
        email: "test@example.com", // or from logged-in user
      });

      const options = res.data;

      // Convert challenge + user.id from base64 to ArrayBuffer
      options.challenge = Uint8Array.from(atob(options.challenge), (c) =>
        c.charCodeAt(0)
      );
      options.user.id = Uint8Array.from(atob(options.user.id), (c) =>
        c.charCodeAt(0)
      );

      // Step 2: Ask the browser to create a credential
      const cred = await navigator.credentials.create({
        publicKey: options,
      });

      // Prepare credential data for Django
      const credential = {
        id: cred.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(cred.rawId))),
        type: cred.type,
        response: {
          attestationObject: btoa(
            String.fromCharCode(
              ...new Uint8Array(cred.response.attestationObject)
            )
          ),
          clientDataJSON: btoa(
            String.fromCharCode(...new Uint8Array(cred.response.clientDataJSON))
          ),
        },
      };

      // Step 3: Send credential back to Django
      const finishRes = await api.post(
        "/fingerprint/finish-register/",
        credential
      );
      setStatus("Fingerprint registered ✅");
      console.log(finishRes.data);
    } catch (err) {
      console.error(err);
      setStatus("Error registering fingerprint ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center">
      <button
        type="button"
        onClick={registerFingerprint}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {loading ? "Registering..." : "Register Fingerprint"}
      </button>
      {status && <p className="text-sm text-gray-600 mt-2">{status}</p>}
    </div>
  );
}

export default FingerPrint;
