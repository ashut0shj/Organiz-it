import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile_screen from "./components/profiles";

function App() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleOpenLinks = async () => {
    setLoading(true);
    setMessage("Opening links...");

    try {
      await window.electronAPI.launchPython();
      setMessage("Links successfully opened in a new Chrome window!");
    } catch (error) {
      console.error("Error launching Python script:", error);
      setMessage("Failed to open links.");
    }

    setLoading(false);
  };

  const Home_screen = () => (
    <div
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        height: "100vh",
      }}
    >
      <h1 style={{ color: 'black' }}>URL Launcher App</h1>
      <p>Click the button below to open saved URLs in a new Chrome window.</p>
      <button
        onClick={handleOpenLinks}
        disabled={loading}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          marginTop: "1rem",
        }}
      >
        {loading ? "Opening..." : "Open Saved Links"}
      </button>

      <button
        onClick={() => window.location.href = "/profile"}>
          Profile Screen
      </button>
        
      {message && (
        <p style={{ marginTop: "1rem", color: "#28a745", fontWeight: "bold" }}>
          {message}
        </p>
      )}
      
    </div>
    
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home_screen />} />
        <Route path="/profile" element={<Profile_screen />} />
      </Routes>
    </Router>
  );
}

export default App;
