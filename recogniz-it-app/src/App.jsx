import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile_screen from "./components/services/profiles";
import Dashboard from "./components/common/dashboard";
import Login from "./components/common/login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile_screen />} />
      </Routes>
    </Router>
  );
}

export default App;
