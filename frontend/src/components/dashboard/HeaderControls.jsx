import { useState } from 'react';
import { IconCalendar, IconChevronDown, IconRefresh } from '../../assets/figma_icons';
import './DashboardLayout.css';

const DATE_RANGES = [
  { key: 'last_7_days', label: 'Last 7 days' },
  { key: 'last_30_days', label: 'Last 30 days' },
  { key: 'last_90_days', label: 'Last 90 days' },
];

export default function HeaderControls({ range, setRange, onRefresh }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentLabel = DATE_RANGES.find(d => d.key === range)?.label || 'Last 7 days';

  return (
    <div className="db-header">
      <div className="db-dropdown-wrapper">
        <button className="db-header-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <img src={IconCalendar} alt="" className="db-header-icon" />
          {currentLabel}
          <img src={IconChevronDown} alt="" className="db-header-icon" />
        </button>

        {dropdownOpen && (
          <div className="db-dropdown-menu">
            {DATE_RANGES.map((dr) => (
              <div
                key={dr.key}
                className={`db-dropdown-item ${range === dr.key ? 'active' : ''}`}
                onClick={() => {
                  setRange(dr.key);
                  setDropdownOpen(false);
                }}
              >
                {dr.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="db-header-btn" onClick={onRefresh}>
        <img src={IconRefresh} alt="" className="db-header-icon" />
        Refresh
      </button>

      <button className="db-header-btn">
        Michael
        <img src={IconChevronDown} alt="" className="db-header-icon" />
      </button>
    </div>
  );
}
