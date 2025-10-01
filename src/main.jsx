import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import NetworkDetector from "./utils/NetworkDetector.jsx";
createRoot(document.getElementById("root")).render(
  <NetworkDetector>
    <App />
  </NetworkDetector>
);
