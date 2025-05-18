import { useEffect, useState } from "react";

function App() {
  const [url, setUrl] = useState("Fetching...");

  useEffect(() => {
    // eslint-disable-next-line no-undef
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url) {
        setUrl(currentTab.url);

        fetch("http://localhost:5000/save-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: currentTab.url })
        })
          .then((res) => res.json())
          .then((data) => console.log("Backend says:", data))
          .catch((err) => console.error(err));
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
