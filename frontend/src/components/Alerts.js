import React, { useState, useEffect } from 'react';

const Alerts = ({ patientId }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/alerts/${patientId}`);
        const data = await response.json();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();

    const interval = setInterval(fetchAlerts, 5000); // Fetch alerts every 5 seconds

    return () => clearInterval(interval);
  }, [patientId]);

  return (
    <div className="alerts-container">
      <h3>Alerts</h3>
      {alerts.length > 0 ? (
        <ul>
          {alerts.map((alert) => (
            <li key={alert.id} className={`alert-item ${alert.vital.toLowerCase()}`}>
              <strong>{alert.vital}:</strong> {alert.message} ({alert.value}) at {new Date(alert.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No alerts.</p>
      )}
    </div>
  );
};

export default Alerts;