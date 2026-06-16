import { IconTopPriorityAlert } from '../../assets/figma_icons';
import './DashboardLayout.css';

export default function TopPriorityBanner({ warning }) {
  if (!warning) return null;

  return (
    <div className="db-priority-banner">
      <div className="db-priority-red-stripe" />
      
      <div className="db-priority-col-identity">
        <img src={IconTopPriorityAlert} alt="Alert" className="db-priority-icon" />
        <div className="db-priority-identity-text">
          <span className="db-priority-label">Top priority - AI Detected</span>
          <span className="db-priority-title">{warning.title}</span>
        </div>
      </div>

      <div className="db-priority-divider" />

      <div className="db-priority-col-impact">
        <span className="db-priority-col-label">Estimated impact</span>
        <span className="db-priority-impact-val">{warning.impact_label?.match(/€[\d,.]+/)?.[0] || '—'}</span>
        <span className="db-priority-impact-sub">Over next 30 days</span>
      </div>

      <div className="db-priority-divider" />

      <div className="db-priority-col-text">
        <span className="db-priority-col-label">Root Cause</span>
        <span className="db-priority-text-val" title={warning.why}>{warning.why || '—'}</span>
      </div>

      <div className="db-priority-divider" />

      <div className="db-priority-col-actions">
        <button className="db-priority-btn-primary">Show in warnings</button>
        <button className="db-priority-btn-secondary">Dismiss</button>
      </div>
    </div>
  );
}
