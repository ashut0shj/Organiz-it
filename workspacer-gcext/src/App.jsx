import { useEffect, useState } from 'react'
import './styles/extension.css'

function App() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/profilenames')
      .then(res => res.json())
      .then(data => {
        if (data.profiles) setProfiles(data.profiles)
      })
      .catch(err => console.error('Failed to load profiles:', err))
      .finally(() => setLoading(false))
  }, [])

  const sendProfile = (name) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url
        fetch('http://127.0.0.1:8000/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: name, url: currentUrl })
        }).finally(() => {
          if (window.close) window.close();
        });
      })
    } else {
      // Fallback for development
      console.log('Selected workspace:', name)
    }
  }

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
  }

  if (loading) {
    return (
      <div className={`extension-container ${isDarkTheme ? 'dark' : ''}`}>
        <div className="header">
          <div className="header-content">
            <h3 className="title">Workspacer</h3>
            <button onClick={toggleTheme} className="theme-toggle">
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading workspaces...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`extension-container ${isDarkTheme ? 'dark' : ''}`}>
      <div className="header">
        <div className="header-content">
          <div>
            <h3 className="title">Workspacer</h3>
            <div className="subtitle">Select active workspace</div>
          </div>
          <button onClick={toggleTheme} className="theme-toggle">
            {isDarkTheme ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      
      <div className="profiles-container">
        {profiles.length === 0 ? (
          <div className="empty-state">
            <span>No workspaces found</span>
          </div>
        ) : (
          profiles.map((p) => (
            <button 
              key={p.id} 
              onClick={() => sendProfile(p.name)} 
              className="profile-button"
            >
              <span className="profile-name">{p.name}</span>
              <span className="profile-arrow">→</span>
            </button>
          ))
        )}
      </div>
      
      <div className="footer">
        <span className="status-indicator"></span>
        <span className="status-text">Ready</span>
      </div>
    </div>
  )
}

export default App
