import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./routes/Welcome";
import Home from "./routes/Home";
import Register from "./routes/Register";
import Login from "./routes/Login";
import FaceRecognition from "./routes/FaceRecognition";
import FingerprintRegister from "./routes/FingerprintRegister";
import FaceRecognitionOut from "./routes/FaceRecognitionOut";

function Logout() {
  localStorage.clear();
  return <Navigate to="/" />;
}

function App() {
  // const userData = JSON.parse(localStorage.getItem("userData"));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* <Route
          path="/"
          element={
            userData && userData.id ? <Navigate to="/home" /> : <Welcome />
          }
        /> */}
        <Route path="/" element={<Home />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/face-recognitionOut" element={<FaceRecognitionOut />} />
        <Route path="/fingerprint-register" element={<FingerprintRegister />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
