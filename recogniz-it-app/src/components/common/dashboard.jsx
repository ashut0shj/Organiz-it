import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../stylesheets/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleOpenLinks = async () => {
    setLoading(true);
    setMessage("Fetching backend response...");

    try {
      await window.electronAPI.launchPython();
      const response = await fetch("http://localhost:8000/");
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error calling backend:", error);
      setMessage("Failed to connect to backend.");
    }

    setLoading(false);
  };

  return (
    <div className="page">
      <h1 style={{ color: "black" }}>URL Launcher App</h1>
      <p>Click the button below to open saved URLs in a new Chrome window.</p>
      <button
        onClick={handleOpenLinks}
        disabled={loading}
        className="button"
      >
        {loading ? "Opening..." : "Open Saved Links"}
      </button>

      <button
        onClick={() => (navigate("/profile"))}
        className="button"
      >
        Profile Screen
      </button>

      {message && (
        <p style={{ marginTop: "1rem", color: "#28a745", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Dashboard;
