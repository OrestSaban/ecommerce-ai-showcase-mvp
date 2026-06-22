import React, { useState, useEffect } from 'react';
import DrawerPanel from '../components/common/DrawerPanel';
import { 
  WatchesModal, 
  ChannelsModal, 
  TriggerModal, 
  FormatModal, 
  DigestModal, 
  ModelModal 
} from './ControlModals';
import './Control.css';

const DEFAULT_SETTINGS = {
  watches: {
    domains: ['Inventory', 'Advertising', 'Returns', 'Listings', 'Payments', 'Fulfillment'],
    sensitivity: 'Medium'
  },
  channels: {
    channels: ['Email', 'Slack', 'Calendar'],
    frequency: 'Real-time'
  },
  trigger: {
    impact: 2000,
    severity: ['High', 'Medium'],
    maxReviews: 10
  },
  format: {
    format: 'Action Plan',
    includes: ['Owners', 'Due dates']
  },
  digest: {
    time: '08:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  },
  model: {
    model: 'Auto (best available)'
  }
};

export default function Control() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('control_settings');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    localStorage.setItem('control_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setActiveModal(null);
  };

  const handleGlobalReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <DrawerPanel closeEventName="close-control" returnPath="/" maxWidth="640px">
        <div className="control-container">
          <div className="control-header">
            <h2 className="control-title">Control center</h2>
            <p className="control-subtitle">Adjust how AI works, where it watches, and how it delivers</p>
          </div>
          
          <hr className="control-divider" />
          
          <div className="control-grid">
            {/* Card 1: What AI watches */}
            <div className="control-card">
              <div className="control-card-content">
                <div className="control-icon-wrapper icon-blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div className="control-text">
                  <h3>What AI watches</h3>
                  <p>{settings.watches.domains.length} domains<br/>Sensitivity: <span className="text-orange">{settings.watches.sensitivity}</span></p>
                </div>
              </div>
              <button className="reset-btn" onClick={() => setActiveModal('watches')}>Configure</button>
            </div>

            {/* Card 2: Channels */}
            <div className="control-card">
              <div className="control-card-content">
                <div className="control-icon-wrapper icon-green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                    <path d="M3 6h18"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <div className="control-text">
                  <h3>Channels</h3>
                  <p>{settings.channels.channels.length} active<br/>{settings.channels.channels.join(', ') || 'None'}</p>
                </div>
              </div>
              <button className="reset-btn" onClick={() => setActiveModal('channels')}>Configure</button>
            </div>

            {/* Card 3: Deep Review trigger */}
            <div className="control-card">
              <div className="control-card-content">
                <div className="control-icon-wrapper icon-purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                </div>
                <div className="control-text">
                  <h3>Deep Review trigger</h3>
                  <p>{settings.trigger.severity.length === 3 ? 'All priorities' : settings.trigger.severity.join(', ') || 'None'}<br/>&gt; ${settings.trigger.impact.toLocaleString()} impact</p>
                </div>
              </div>
              <button className="reset-btn" onClick={() => setActiveModal('trigger')}>Configure</button>
            </div>

            {/* Card 4: Output format */}
            <div className="control-card">
              <div className="control-card-content">
                <div className="control-icon-wrapper icon-yellow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div className="control-text">
                  <h3>Output format</h3>
                  <p>{settings.format.format}<br/>{settings.format.includes.length > 0 ? `With ${settings.format.includes.map(i => i.toLowerCase()).join(' & ')}` : 'Standard'}</p>
                </div>
              </div>
              <button className="reset-btn" onClick={() => setActiveModal('format')}>Configure</button>
            </div>

            {/* Card 5: Daily digest */}
            <div className="control-card">
              <div className="control-card-content">
                <div className="control-icon-wrapper icon-pink">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="control-text">
                  <h3>Daily digest</h3>
                  <p>{settings.digest.time} AM<br/>{settings.digest.days.length === 5 && !settings.digest.days.includes('Sat') && !settings.digest.days.includes('Sun') ? 'Weekdays' : settings.digest.days.length === 7 ? 'Every day' : settings.digest.days.join(', ') || 'Disabled'}</p>
                </div>
              </div>
              <button className="reset-btn" onClick={() => setActiveModal('digest')}>Configure</button>
            </div>

            {/* Card 6: Model */}
            <div className="control-card">
              <div className="control-card-content">
                <div className="control-icon-wrapper icon-gray">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </div>
                <div className="control-text">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3>Model</h3>
                    <span className="badge-gray" style={{ marginTop: 0 }}>Advanced users only</span>
                  </div>
                  <p>{settings.model.model}</p>
                </div>
              </div>
              <button className="reset-btn" onClick={() => setActiveModal('model')}>Configure</button>
            </div>
          </div>

          <div className="control-footer">
            <div className="control-footer-text">
              <h3>System settings</h3>
              <p>Reset all settings to their default values</p>
            </div>
            <button className="reset-btn" onClick={handleGlobalReset}>Reset to default</button>
          </div>
        </div>
      </DrawerPanel>

      {activeModal === 'watches' && <WatchesModal settings={settings.watches} onSave={(val) => updateSetting('watches', val)} onClose={closeModal} />}
      {activeModal === 'channels' && <ChannelsModal settings={settings.channels} onSave={(val) => updateSetting('channels', val)} onClose={closeModal} />}
      {activeModal === 'trigger' && <TriggerModal settings={settings.trigger} onSave={(val) => updateSetting('trigger', val)} onClose={closeModal} />}
      {activeModal === 'format' && <FormatModal settings={settings.format} onSave={(val) => updateSetting('format', val)} onClose={closeModal} />}
      {activeModal === 'digest' && <DigestModal settings={settings.digest} onSave={(val) => updateSetting('digest', val)} onClose={closeModal} />}
      {activeModal === 'model' && <ModelModal settings={settings.model} onSave={(val) => updateSetting('model', val)} onClose={closeModal} />}
    </>
  );
}
