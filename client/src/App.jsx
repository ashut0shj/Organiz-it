import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProfileLauncher from "./components/profiles";

function App() {
  return (
        <Router>
          <Routes>
            <Route path="/" element={<ProfileLauncher />} />
          </Routes>
        </Router>
  );
}

export default App;
