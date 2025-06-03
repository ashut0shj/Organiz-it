import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../stylesheets/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const email = query.get("email");
    const name = query.get("name");
    const picture = query.get("picture");

    if (email && name) {
      setUserInfo({ email, name, picture });
    }
  }, [location]);

  return (
    <div className="page">
      <h1 style={{ color: "black" }}>URL Launcher App</h1>

      {userInfo && (
        <div>
          <img src={userInfo.picture} alt="profile" style={{ borderRadius: "50%", width: 100 }} />
          <h3>{userInfo.name}</h3>
          <p>{userInfo.email}</p>
        </div>
      )}

      <button onClick={() => navigate("/profile")} className="button">
        Profile Screen
      </button>
    </div>
  );
};

export default Dashboard;
