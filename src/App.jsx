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
      // Send the data to your Python FastAPI backend!
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

      // Update the UI based on Python's decision
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
    <div className="app-container">
      <div className="card">
        
        <div className="header">
          <div className="header-icon">📡</div>
          <h1 className="title">AI-Driven SIM Registration Portal</h1>
          <p className="subtitle">National Security & Demographic Verification Engine</p>
        </div>

        {status === 'idle' && (
          <form onSubmit={handleRegister}>
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
            <button type="submit" className="btn btn-primary">Verify & Register SIM</button>
          </form>
        )}

        {status === 'loading' && (
          <div className="spinner">
            <div className="spin-icon">🔄</div>
            <p>Analyzing demographics across central database...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="alert-success">
            <h3 style={{margin: '0 0 10px 0'}}>✅ Registration Approved</h3>
            <p><strong>Status:</strong> Unique Identity Verified.</p>
            <p>No suspicious similarities or duplicate entries found in the national directory. The SIM profile has been provisioned successfully.</p>
            <button onClick={resetForm} className="btn btn-success">Register Another SIM</button>
          </div>
        )}

        {status === 'error_nin' && (
          <div className="alert-error">
            <h3 style={{margin: '0 0 10px 0'}}>❌ Registration Blocked: Identity Fraud</h3>
            <p><strong>Reason:</strong> Deterministic match failed. The provided National Identification Number (NIN) is already mapped to an active user profile.</p>
            <div style={{marginTop: '10px'}}>
              <strong>Conflicting Central Record:</strong>
              <div className="code-block">
                Name: {conflictingRecord?.name}<br />
                NIN: {conflictingRecord?.nin}
              </div>
            </div>
            <button onClick={resetForm} className="btn btn-danger">Return to Form</button>
          </div>
        )}

        {status === 'error_fuzzy' && (
          <div className="alert-error">
            <h3 style={{margin: '0 0 10px 0'}}>❌ Registration Blocked: Fuzzy Duplicate</h3>
            <p><strong>Reason:</strong> Machine learning pattern match triggered. A high semantic similarity was detected, indicating an attempt to bypass validation rules using modified variations of existing credentials.</p>
            <p style={{margin: '10px 0 5px 0'}}><strong>AI Anomaly Match Score:</strong> {matchScore}% Similarity</p>
            <div>
              <strong>Suspected Existing Target Profile:</strong>
              <div className="code-block">
                Name: {conflictingRecord?.name}<br />
                NIN: {conflictingRecord?.nin}
              </div>
            </div>
            <button onClick={resetForm} className="btn btn-danger">Return to Form</button>
          </div>
        )}

        <div className="footer">
          B.Tech Final Year Project | Federal University of Technology, Minna | Student: Abdulazeez Aminu
        </div>
      </div>
    </div>
  );
}

export default App;