import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile_screen from "./components/profiles";
import Dashboard from "./components/common/dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile_screen />} />
      </Routes>
    </Router>
  );
}

export default App;
