import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [backendStatus, setBackendStatus] = useState('Loading...');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/health');
        if (response.ok) {
          setBackendStatus('Connected');
        } else {
          setBackendStatus('Disconnected');
        }
      } catch (error) {
        setBackendStatus('Disconnected');
      }
    };

    checkBackend();
  }, []);

  return (
    <div>
      <h2>Dashboard Page</h2>
      <p>Backend Status: {backendStatus}</p>
      <p>Placeholder for the dashboard UI.</p>
    </div>
  );
}
