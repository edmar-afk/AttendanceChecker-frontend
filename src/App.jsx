import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./routes/Welcome";
import Home from "./routes/Home";

function Logout() {
  localStorage.clear();
  return <Navigate to="/" />;
}

function App() {
  const userData = JSON.parse(localStorage.getItem("userData"));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/"
          element={
            userData && userData.id ? <Navigate to="/home" /> : <Welcome />
          }
        />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
