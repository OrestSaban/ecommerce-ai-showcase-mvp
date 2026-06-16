import React, { useRef, useState, useEffect } from 'react';
import { BhHealthy, BhWarning, BhInfo, BhCritical, IconChevronDown } from '../../assets/figma_icons';
import './DashboardLayout.css';

export default function BusinessHealthBar({ items }) {
  if (!items || items.length === 0) return null;

  const scrollRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftFade(scrollLeft > 0);
    // 1px tolerance for rounding issues
    setShowRightFade(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  const getStatusIcon = (status) => {
    if (status === 'critical') return BhCritical;
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

      <div className="db-health-scroll-wrapper">
        {showLeftFade && (
          <div className="db-health-fade-left">
            <img src={IconChevronDown} alt="" className="db-health-scroll-arrow db-health-scroll-arrow--left" />
          </div>
        )}
        <div className="db-health-items-scroll" ref={scrollRef} onScroll={checkScroll}>

      {items.map((bh, idx) => (
        <div key={bh.domain} style={{ display: 'contents' }}>
          <div className="db-health-divider" />
          <div className="db-health-item">
            <img src={getStatusIcon(bh.status)} alt={bh.status} className="db-health-icon" />
            <div className="db-health-text-col">
              <div className="db-health-label-row">
                <span className="db-health-label">{domainLabels[bh.domain] || bh.domain}</span>
                
                <div className="db-tooltip-container">
                  <img src={BhInfo} alt="Info" className="db-health-info" />
                  <div className={`db-tooltip-popup ${idx === items.length - 1 ? 'db-tooltip-popup--last' : ''}`}>
                    <div className="db-tooltip-title">{bh.tooltip_title}</div>
                    <div>{bh.tooltip_description}</div>
                  </div>
                </div>

              </div>
              <span className="db-health-status">
                {bh.status.charAt(0).toUpperCase() + bh.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
        </div>
        {showRightFade && (
          <div className="db-health-fade-right">
            <img src={IconChevronDown} alt="" className="db-health-scroll-arrow db-health-scroll-arrow--right" />
          </div>
        )}
      </div>
    </div>
  );
}
