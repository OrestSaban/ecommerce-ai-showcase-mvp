import React, { useState } from 'react';
import '../components/warnings/Warnings.css';

// Reusable modal wrapper
function ControlModalWrapper({ title, onClose, onSave, children }) {
  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="action-plan-modal control-modal" onClick={(e) => e.stopPropagation()}>
        <div className="action-plan-modal-header">
          <div className="action-plan-modal-header-left">
            <h2 className="action-plan-modal-title">{title}</h2>
          </div>
          <button className="db-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#474c61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="action-plan-modal-body control-modal-body">
          {children}
        </div>
        <div className="control-modal-footer">
          <button className="control-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="control-btn-primary" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export function WatchesModal({ settings, onSave, onClose }) {
  const [domains, setDomains] = useState(settings.domains || []);
  const [sensitivity, setSensitivity] = useState(settings.sensitivity || 'Medium');

  const ALL_DOMAINS = ['Inventory', 'Advertising', 'Returns', 'Listings', 'Payments', 'Fulfillment'];
  const SENSITIVITIES = ['Low', 'Medium', 'High'];

  const toggleDomain = (domain) => {
    setDomains(prev => 
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleSave = () => {
    onSave({ domains, sensitivity });
  };

  return (
    <ControlModalWrapper title="What AI Watches" onClose={onClose} onSave={handleSave}>
      <div className="control-form-section">
        <h3>Domains</h3>
        <div className="control-checkbox-group">
          {ALL_DOMAINS.map(d => (
            <label key={d} className="control-checkbox-label">
              <input type="checkbox" checked={domains.includes(d)} onChange={() => toggleDomain(d)} />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="control-form-section">
        <h3>Sensitivity</h3>
        <div className="control-radio-group">
          {SENSITIVITIES.map(s => (
            <label key={s} className="control-radio-label">
              <input type="radio" name="sensitivity" checked={sensitivity === s} onChange={() => setSensitivity(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </div>
    </ControlModalWrapper>
  );
}

export function ChannelsModal({ settings, onSave, onClose }) {
  const [channels, setChannels] = useState(settings.channels || []);
  const [frequency, setFrequency] = useState(settings.frequency || 'Daily');

  const ALL_CHANNELS = ['Email', 'Slack', 'Calendar', 'Teams', 'SMS'];
  const FREQUENCIES = ['Daily', 'Weekly', 'Real-time'];

  const toggleChannel = (channel) => {
    setChannels(prev => 
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const handleSave = () => {
    onSave({ channels, frequency });
  };

  return (
    <ControlModalWrapper title="Channels" onClose={onClose} onSave={handleSave}>
      <div className="control-form-section">
        <h3>Notification channels</h3>
        <div className="control-checkbox-group">
          {ALL_CHANNELS.map(c => (
            <label key={c} className="control-checkbox-label">
              <input type="checkbox" checked={channels.includes(c)} onChange={() => toggleChannel(c)} />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="control-form-section">
        <h3>Digest frequency</h3>
        <div className="control-radio-group">
          {FREQUENCIES.map(f => (
            <label key={f} className="control-radio-label">
              <input type="radio" name="frequency" checked={frequency === f} onChange={() => setFrequency(f)} />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </div>
    </ControlModalWrapper>
  );
}

export function TriggerModal({ settings, onSave, onClose }) {
  const [impact, setImpact] = useState(settings.impact || 2000);
  const [severity, setSeverity] = useState(settings.severity || []);
  const [maxReviews, setMaxReviews] = useState(settings.maxReviews || 10);

  const ALL_SEVERITIES = ['High', 'Medium', 'Low'];

  const toggleSeverity = (sev) => {
    setSeverity(prev => 
      prev.includes(sev) ? prev.filter(s => s !== sev) : [...prev, sev]
    );
  };

  const handleSave = () => {
    onSave({ impact: Number(impact), severity, maxReviews: Number(maxReviews) });
  };

  return (
    <ControlModalWrapper title="Deep Review Trigger" onClose={onClose} onSave={handleSave}>
      <div className="control-form-section">
        <h3>Impact threshold (€)</h3>
        <input 
          type="number" 
          className="control-input" 
          value={impact} 
          onChange={e => setImpact(e.target.value)} 
          step="100"
        />
      </div>
      <div className="control-form-section">
        <h3>Severity</h3>
        <div className="control-checkbox-group">
          {ALL_SEVERITIES.map(s => (
            <label key={s} className="control-checkbox-label">
              <input type="checkbox" checked={severity.includes(s)} onChange={() => toggleSeverity(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="control-form-section">
        <h3>Maximum reviews per day</h3>
        <input 
          type="number" 
          className="control-input" 
          value={maxReviews} 
          onChange={e => setMaxReviews(e.target.value)} 
          min="1"
          max="100"
        />
      </div>
    </ControlModalWrapper>
  );
}

export function FormatModal({ settings, onSave, onClose }) {
  const [format, setFormat] = useState(settings.format || 'Action Plan');
  const [includes, setIncludes] = useState(settings.includes || []);

  const FORMATS = ['Action Plan', 'Executive Summary', 'Investigation Report'];
  const INCLUDES = ['Owners', 'Due dates', 'Estimated impact', 'Recommended actions'];

  const toggleInclude = (inc) => {
    setIncludes(prev => 
      prev.includes(inc) ? prev.filter(i => i !== inc) : [...prev, inc]
    );
  };

  const handleSave = () => {
    onSave({ format, includes });
  };

  return (
    <ControlModalWrapper title="Output Format" onClose={onClose} onSave={handleSave}>
      <div className="control-form-section">
        <h3>Preferred output</h3>
        <div className="control-radio-group">
          {FORMATS.map(f => (
            <label key={f} className="control-radio-label">
              <input type="radio" name="format" checked={format === f} onChange={() => setFormat(f)} />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="control-form-section">
        <h3>Include</h3>
        <div className="control-checkbox-group">
          {INCLUDES.map(i => (
            <label key={i} className="control-checkbox-label">
              <input type="checkbox" checked={includes.includes(i)} onChange={() => toggleInclude(i)} />
              <span>{i}</span>
            </label>
          ))}
        </div>
      </div>
    </ControlModalWrapper>
  );
}

export function DigestModal({ settings, onSave, onClose }) {
  const [time, setTime] = useState(settings.time || '08:00');
  const [days, setDays] = useState(settings.days || []);

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day) => {
    setDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    onSave({ time, days });
  };

  return (
    <ControlModalWrapper title="Daily Digest" onClose={onClose} onSave={handleSave}>
      <div className="control-form-section">
        <h3>Time</h3>
        <input 
          type="time" 
          className="control-input" 
          value={time} 
          onChange={e => setTime(e.target.value)} 
        />
      </div>
      <div className="control-form-section">
        <h3>Days</h3>
        <div className="control-checkbox-group inline-days">
          {DAYS.map(d => (
            <label key={d} className="control-checkbox-label">
              <input type="checkbox" checked={days.includes(d)} onChange={() => toggleDay(d)} />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </div>
    </ControlModalWrapper>
  );
}

export function ModelModal({ settings, onSave, onClose }) {
  const [model, setModel] = useState(settings.model || 'Auto (recommended)');
  const [showConfirm, setShowConfirm] = useState(false);

  const MODELS = ['Auto (recommended)', 'GPT-5', 'Claude Opus', 'Gemini Pro'];

  const handleSave = () => {
    setShowConfirm(true);
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    onClose();
  };

  if (showConfirm) {
    return (
      <div className="db-modal-overlay" onClick={handleConfirmClose}>
        <div className="action-plan-modal control-modal confirm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="action-plan-modal-body">
            <h3 style={{marginTop: 0}}>Model selection requires administrator approval.</h3>
            <p style={{color: '#495a74'}}>Changes queued for approval.</p>
          </div>
          <div className="control-modal-footer">
            <button className="control-btn-primary" onClick={handleConfirmClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ControlModalWrapper title="Model" onClose={onClose} onSave={handleSave}>
      <div className="control-form-section">
        <h3>Available models</h3>
        <div className="control-radio-group">
          {MODELS.map(m => (
            <label key={m} className="control-radio-label">
              <input type="radio" name="model" checked={model === m} onChange={() => setModel(m)} />
              <span>{m}</span>
            </label>
          ))}
        </div>
      </div>
    </ControlModalWrapper>
  );
}
