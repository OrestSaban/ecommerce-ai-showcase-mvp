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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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

      <div className="db-dropdown-wrapper">
        <button className="db-header-btn" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="db-header-icon">
            <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
            <path d="M18 21a1 1 0 0 0 1-1 7 7 0 1 0-14 0 1 1 0 0 0 1 1h12Z"></path>
          </svg>
          Michael
          <img src={IconChevronDown} alt="" className="db-header-icon" />
        </button>

        {userDropdownOpen && (
          <div className="db-dropdown-menu">
            <div 
              className="db-dropdown-item active"
              onClick={() => setUserDropdownOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
                <path d="M18 21a1 1 0 0 0 1-1 7 7 0 1 0-14 0 1 1 0 0 0 1 1h12Z"></path>
              </svg>
              Michael
            </div>
            <div 
              className="db-dropdown-item"
              onClick={() => {
                alert("You are not authorised to add new user");
                setUserDropdownOpen(false);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3 11h-2v2a1 1 0 0 1-2 0v-2H9a1 1 0 0 1 0-2h2V9a1 1 0 0 1 2 0v2h2a1 1 0 0 1 0 2Z"></path>
              </svg>
              Add another user
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
