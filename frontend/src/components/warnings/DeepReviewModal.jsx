import { useEffect, useState } from 'react';
import { getWarningDeepReview } from '../../api/client';
import './DeepReviewModal.css';

export default function DeepReviewModal({ warning, onClose }) {
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadScenario() {
      try {
        const data = await getWarningDeepReview(warning.warning_id);
        if (data.scenario) {
          setScenario(data.scenario);
        } else {
          setError(data.message || 'No scenario found.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (warning) {
      loadScenario();
    }
  }, [warning]);

  if (!warning) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Deep Review: {warning.title}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <p>Running AI Consensus Analysis...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : scenario ? (
            <div className="scenario-details">
              <div className="summary-banner">
                <div className="summary-item">
                  <span className="summary-label">Consensus Status:</span>
                  <span className="summary-value" style={{textTransform: 'capitalize'}}>{scenario.consensus_status.replace('_', ' ')}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Confidence:</span>
                  <span className="summary-value">{Math.round(scenario.confidence * 100)}%</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Expected Recovery:</span>
                  <span className="summary-value impact">{scenario.expected_recovery}</span>
                </div>
              </div>
              
              <div className="models-reasoning">
                <h3>AI Agent Consensus Reasoning</h3>
                <div className="models-list">
                  {scenario.model_reasoning.map((mod, idx) => (
                    <div key={idx} className="model-card">
                      <div className="model-header">
                        <h4>{mod.model}</h4>
                        <span className={`verdict-badge ${mod.verdict}`}>{mod.verdict.replace('_', ' ')}</span>
                      </div>
                      <p>{mod.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Dismiss</button>
          <button className="btn-primary" onClick={onClose} disabled={loading}>Execute Plan</button>
        </div>
      </div>
    </div>
  );
}
