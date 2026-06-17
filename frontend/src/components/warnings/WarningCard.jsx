
const getIconForCategory = (category) => {
  switch(category) {
    case 'inventory':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
          <path d="m3.3 7 8.7 5 8.7-5"></path>
          <path d="M12 22V12"></path>
        </svg>
      );
    case 'returns':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
          <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
          <path d="M12 3v6"></path>
        </svg>
      );
    case 'advertising':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 12h8"></path>
          <path d="M12 8v8"></path>
        </svg>
      );
    case 'payments':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
          <line x1="2" x2="22" y1="10" y2="10"></line>
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
  }
};

export default function WarningCard({ warning, isExpanded, onToggle, onRunDeepReview }) {
  const {
    title,
    category,
    severity,
    impact_amount,
    impact_label,
    detected_date,
    why,
    recommended_action,
    action_plan_preview
  } = warning;

  return (
    <div id={`warning-card-${warning.warning_id}`} className={`warning-card ${isExpanded ? 'expanded' : ''} ${isExpanded ? `expanded-${severity.toLowerCase()}` : ''}`} onClick={onToggle}>
      <div className="warning-card-header">
        <div className="warning-card-left">
          <div className="warning-icon">
            {getIconForCategory(category)}
          </div>
          <div className="warning-titles">
            <h3 className="warning-title">{title}</h3>
            <p className="warning-impact-summary">{impact_label}</p>
          </div>
        </div>
        <div className="warning-card-right">
          <span className={`severity-badge severity-${severity.toLowerCase()}`}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </span>
          <div className="expand-icon" onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ cursor: 'pointer' }}>
            {isExpanded ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="warning-separator"></div>
          <div className="warning-details">
            <div className="detail-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757e94" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span className="detail-label">Estimated impact:</span>
              <span className="detail-value impact">${impact_amount.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757e94" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              <span className="detail-label">Detected:</span>
              <span className="detail-value">{new Date(detected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
            </div>
            <div className="detail-row">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757e94" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span className="detail-label">Why:</span>
              <span className="detail-value" style={{fontWeight: 400}}>{why}</span>
            </div>
          </div>
          
          <div className="warning-separator"></div>
          
          <div className="recommended-action-section">
            <h4 className="section-title">Recommended Action</h4>
            <p className="recommended-text">{recommended_action}</p>
          </div>
          
          <div className="action-plan-section">
            <h4 className="section-title" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
              Action plan preview
              <span style={{fontStyle: 'italic', fontWeight: 400, color: '#485f81', fontSize: '14px'}}>(AI will generate full plan)</span>
            </h4>
            
            <table className="action-plan-table">
              <thead>
                <tr>
                  <th>Who</th>
                  <th>What</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {action_plan_preview && action_plan_preview.length > 0 ? (
                  action_plan_preview.map((step, idx) => (
                    <tr key={idx} className="action-plan-row">
                      <td data-label="Who" style={{fontWeight: 500}}>{idx === 0 ? 'Warehouse Ops' : (idx === 1 ? 'Finance' : 'Account Mgr')}</td>
                      <td data-label="What">{step.action}</td>
                      <td data-label="When">{idx === 0 ? 'Today' : 'Tomorrow'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No preview available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="warning-actions">
            <h4 className="section-title">Next step</h4>
            <button className="action-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              Prepare action plan
            </button>
          </div>
        </>
      )}
    </div>
  );
}
