import React, { useState, useEffect } from "react";

function NetworkDetector({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        background: "#f8d7da", 
        color: "#721c24" 
      }}>
        <h1>No Internet Connection</h1>
        <p>Please check your network and try again.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default NetworkDetector;
