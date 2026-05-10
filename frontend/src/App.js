import React, { useState, useEffect } from 'react';

function App() {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/fetch-alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error("Backend connection failed!", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>🛡️ IDPC Threat Dashboard</h1>
      <table border="1" style={{ width: '100%', textAlign: 'left', marginTop: '20px', borderColor: '#444' }}>
        <thead>
          <tr style={{ backgroundColor: '#333' }}>
            <th>Timestamp</th>
            <th>Alert Message</th>
            <th>Source IP</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length > 0 ? alerts.map((alert, index) => (
            <tr key={index}>
              <td>{alert.timestamp || "N/A"}</td>
              <td>{alert.alert_message || "Security Alert"}</td>
              <td>{alert.source_ip || "127.0.0.1"}</td>
              <td style={{ color: alert.severity === 'High' ? 'red' : 'yellow' }}>
                {alert.severity || "Medium"}
              </td>
            </tr>
          )) : (
            <tr><td colSpan="4">Waiting for incoming threats...</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
