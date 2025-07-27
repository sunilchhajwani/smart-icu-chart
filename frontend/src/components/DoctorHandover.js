import React, { useState, useEffect } from 'react';

const DoctorHandover = ({ patientId }) => {
  const [handoverText, setHandoverText] = useState('');
  const [handoverBy, setHandoverBy] = useState('');
  const [handovers, setHandovers] = useState([]);

  const fetchHandovers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/patients/${patientId}/doctor-handovers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHandovers(data);
    } catch (error) {
      console.error('Error fetching doctor handovers:', error);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/patients/${patientId}/doctor-handovers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ handoverText, handoverBy }),
      });

      if (response.ok) {
        setHandoverText('');
        setHandoverBy('');
        fetchHandovers(); // Refresh the list of handovers
      } else {
        console.error('Failed to submit doctor handover');
      }
    } catch (error) {
      console.error('Error submitting doctor handover:', error);
    }
  };

  return (
    <div className="doctor-handover-container">
      <h3>Doctor Handovers</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Handover Text:</label>
          <textarea value={handoverText} onChange={(e) => setHandoverText(e.target.value)} required></textarea>
        </div>
        <div className="form-group">
          <label>Handover By:</label>
          <input type="text" value={handoverBy} onChange={(e) => setHandoverBy(e.target.value)} required />
        </div>
        <button type="submit">Submit Handover</button>
      </form>

      <div className="handovers-list">
        <h4>Previous Handovers</h4>
        {handovers.length > 0 ? (
          <ul>
            {handovers.map((handover) => (
              <li key={handover.id}>
                <p>{handover.handoverText}</p>
                <small>By: {handover.handoverBy} on {new Date(handover.handoverDate).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No doctor handovers recorded.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorHandover;