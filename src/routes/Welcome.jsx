import React, { useEffect, useState } from "react";

export default function Welcome() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    function handleMessage(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.id && data.first_name) {
          localStorage.setItem("userData", JSON.stringify(data));
          setUserData(data);
          console.log("User data saved in localStorage:", data);
        }
      } catch (error) {
        console.error("Invalid data received from WebView:", event.data);
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div>
      <h1>ReactJS WebView App</h1>
      {userData ? (
        <p>Welcome, {userData.first_name} (ID: {userData.id})</p>
      ) : (
        <p>No user data received yet.</p>
      )}
    </div>
  );
}
