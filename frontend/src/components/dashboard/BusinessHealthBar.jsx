import { BhHealthy, BhWarning, BhInfo, DotRed } from '../../assets/figma_icons';
import './DashboardLayout.css';

export default function BusinessHealthBar({ items }) {
  if (!items || items.length === 0) return null;

  const getStatusIcon = (status) => {
    if (status === 'critical') return DotRed; // Using red dot as fallback since Figma didn't have a critical icon
    if (status === 'warning') return BhWarning;
    return BhHealthy;
  };

  const domainLabels = {
    store: 'Store',
    payments: 'Payments',
    inventory: 'Inventory',
    fulfillment: 'Fulfillment',
    advertising: 'Advertising',
    listings: 'Listings',
    customer_feedback: 'Feedback',
    returns: 'Returns',
  };

  return (
    <div className="db-health-bar">
      <span className="db-health-title">Business Health</span>

      {items.map((bh) => (
        <div key={bh.domain} style={{ display: 'contents' }}>
          <div className="db-health-divider" />
          <div className="db-tooltip-container db-health-item">
            <img src={getStatusIcon(bh.status)} alt={bh.status} className="db-health-icon" />
            <div className="db-health-text-col">
              <div className="db-health-label-row">
                <span className="db-health-label">{domainLabels[bh.domain] || bh.domain}</span>
                <img src={BhInfo} alt="Info" className="db-health-info" />
              </div>
              <span className="db-health-status">
                {bh.status.charAt(0).toUpperCase() + bh.status.slice(1)}
              </span>
            </div>
            <div className="db-tooltip-popup">
              <div className="db-tooltip-title">{bh.tooltip_title}</div>
              <div>{bh.tooltip_description}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
