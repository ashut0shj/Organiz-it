import { useEffect, useState } from 'react'

function App() {
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/profilenames')
      .then(res => res.json())
      .then(data => {
        if (data.profiles) setProfiles(data.profiles)
      })
  }, [])

  const sendProfile = (name) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url
    fetch('http://127.0.0.1:8000/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: name, url: currentUrl })
    }).finally(() => {
      window.close(); // Close the extension popup
    });
  })
}


  return (
    <div style={{ padding: '10px', width: '250px' }}>
      <h3>Choose Workspace</h3>
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {profiles.map((p) => (
          <button key={p.id} onClick={() => sendProfile(p.name)} style={{ marginBottom: 8, width: '100%' }}>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default App
