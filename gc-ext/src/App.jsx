import { useEffect, useState } from "react";

function App() {
  const [url, setUrl] = useState("Fetching...");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url) {
        setUrl(currentTab.url);
      } else {
        setUrl("No active tab or URL found");
      }
    });
  }, []);

  return (
    <div style={{ padding: "1rem", width: "250px" }}>
      <h2>Current Tab URL:</h2>
      <p>{url}</p>
    </div>
  );
}

export default App;
