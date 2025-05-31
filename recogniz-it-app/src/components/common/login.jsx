import React from "react";

const Login = () => {
  const handleGoogleLogin = () => {
    window.open("http://localhost:8000/login", "_self");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h1>Login with Google</h1>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4285F4",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
