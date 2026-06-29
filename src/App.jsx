import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nin: ''
  });
  
  const [status, setStatus] = useState('idle');
  const [matchScore, setMatchScore] = useState(0);
  const [conflictingRecord, setConflictingRecord] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.nin) {
      alert("Please fill out all fields.");
      return;
    }
    if (formData.nin.length !== 11 || isNaN(formData.nin)) {
      alert("NIN must be exactly 11 digits.");
      return;
    }

    setStatus('loading');   

    try {
      const response = await fetch('https://sim-anomaly-api.onrender.com/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          nin: formData.nin
        })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      setStatus(data.status);
      
      if (data.status === 'error_nin' || data.status === 'error_fuzzy') {
        setConflictingRecord(data.conflictingRecord);
        if (data.matchScore) {
          setMatchScore(data.matchScore);
        }
      }
      
    } catch (error) {
      console.error("Error communicating with AI engine:", error);
      alert("Failed to connect to the backend AI engine. Is the Python server running?");
      setStatus('idle');
    }
  };

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', nin: '' });
    setStatus('idle');
  };

  return (
    <div className="app-layout">
      <div className="enterprise-card">
        
        <div className="card-header">
          <svg className="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <h1 className="title">SIM Registration Portal</h1>
          <p className="subtitle">National Security & Demographic Verification Engine</p>
        </div>

        <div className="card-body">
          {status === 'idle' && (
            <form onSubmit={handleRegister} className="registration-form">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" placeholder="e.g. Aminu" required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-input" placeholder="e.g., Abdulazeez" required />
              </div>
              <div className="form-group">
                <label className="form-label">National Identification Number (NIN)</label>
                <input type="text" name="nin" value={formData.nin} onChange={handleInputChange} maxLength={11} className="form-input" placeholder="Enter 11-digit identity number" required />
              </div>
              <button type="submit" className="btn-primary">Authenticate & Register</button>
            </form>
          )}

          {status === 'loading' && (
            <div className="loading-state">
              <div className="custom-spinner"></div>
              <h3 className="loading-title">Analyzing Demographics</h3>
              <p className="loading-text">Cross-referencing TF-IDF vectors with central database...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="status-banner banner-success">
              <div className="banner-icon">✓</div>
              <h3>Registration Approved</h3>
              <p>Unique Identity Verified. No suspicious anomalies or duplicate entries found.</p>
              <button onClick={resetForm} className="btn-outline-success">Process Next Customer</button>
            </div>
          )}

          {status === 'error_nin' && (
            <div className="status-banner banner-danger">
              <div className="banner-icon">!</div>
              <h3>Identity Fraud Blocked</h3>
              <p>Deterministic match failed. The provided NIN is already mapped to an active user profile.</p>
              <div className="conflict-box">
                <span className="conflict-label">Conflicting Record:</span>
                <span className="conflict-data">{conflictingRecord?.name} | NIN: {conflictingRecord?.nin}</span>
              </div>
              <button onClick={resetForm} className="btn-outline-danger">Acknowledge & Return</button>
            </div>
          )}

          {status === 'error_fuzzy' && (
            <div className="status-banner banner-danger">
               <div className="banner-icon">!</div>
              <h3>Fuzzy Duplicate Blocked</h3>
              <p>Machine learning pattern triggered. High semantic similarity detected indicating potential credential manipulation.</p>
              <div className="match-score">Anomaly Match Score: {matchScore}%</div>
              <div className="conflict-box">
                <span className="conflict-label">Target Profile:</span>
                <span className="conflict-data">{conflictingRecord?.name} | NIN: {conflictingRecord?.nin}</span>
              </div>
              <button onClick={resetForm} className="btn-outline-danger">Acknowledge & Return</button>
            </div>
          )}
        </div>

        <div className="card-footer">
          B.Tech Final Year Project | Federal University of Technology, Minna<br/>
          <strong>Student: Abdulazeez Aminu</strong>
        </div>
      </div>
    </div>
  );
}

export default App;