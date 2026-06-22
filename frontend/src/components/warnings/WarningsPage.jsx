import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getWarnings } from '../../api/client';
import WarningCard from './WarningCard';
import DeepReviewModal from './DeepReviewModal';
import ActionPlanModal, { useActionPlanStore } from './ActionPlanModal';
import DrawerPanel from '../common/DrawerPanel';
import './Warnings.css';

const FILTERS = ['All', 'Ads', 'Inventory', 'Refunds', 'Listings'];

export default function WarningsPage() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedWarningForReview, setSelectedWarningForReview] = useState(null);
  const [minutesSinceUpdate, setMinutesSinceUpdate] = useState(15);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [preparingIds, setPreparingIds] = useState(new Set());
  const [selectedActionPlan, setSelectedActionPlan] = useState(null);
  
  const { getPlan, storePlan } = useActionPlanStore();
  
  const navigate = useNavigate();
  const location = useLocation();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getWarnings();
      setWarnings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (warnings.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const expandId = searchParams.get('expand');
      if (expandId) {
        setActiveFilter('All');
        setExpandedId(expandId);
        
        // Use a short timeout to let the DOM render the expanded card and filter reset
        setTimeout(() => {
          const el = document.getElementById(`warning-card-${expandId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

        // Clean up URL without triggering re-render
        navigate('/warnings', { replace: true });
      }
    }
  }, [location.search, warnings, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesSinceUpdate(prev => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsUpdating(true);
    try {
      const data = await getWarnings();
      setWarnings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
        setMinutesSinceUpdate(0);
      }, 600); // Add a small visual delay for the animation
    }
  };

  useEffect(() => {
    if (minutesSinceUpdate >= 15 && !isUpdating) {
      handleRefresh();
    }
  }, [minutesSinceUpdate, isUpdating]);

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleRunDeepReview = (warning) => {
    setSelectedWarningForReview(warning);
  };

  const handlePrepareActionPlan = (warning) => {
    const existingPlan = getPlan(warning.warning_id);
    if (existingPlan) {
      setSelectedActionPlan(existingPlan);
      return;
    }

    setPreparingIds((prev) => {
      const next = new Set(prev);
      next.add(warning.warning_id);
      return next;
    });

    setTimeout(() => {
      const newPlan = storePlan(warning);
      setPreparingIds((prev) => {
        const next = new Set(prev);
        next.delete(warning.warning_id);
        return next;
      });
      setSelectedActionPlan(newPlan);
    }, 1500);
  };

  const filteredWarnings = warnings.filter(w => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Ads' && w.category === 'advertising') return true;
    if (activeFilter === 'Inventory' && w.category === 'inventory') return true;
    if (activeFilter === 'Refunds' && w.category === 'returns') return true;
    if (activeFilter === 'Listings' && w.category === 'listings') return true;
    return false;
  });

  return (
    <>
      <DrawerPanel closeEventName="close-warnings" returnPath="/" maxWidth="870px">
        {loading ? (
          <div className="warnings-container">Loading warnings...</div>
        ) : error ? (
          <div className="warnings-container">Error loading warnings: {error}</div>
        ) : (
          <div className="warnings-container">
            <div className="warnings-header">
          <div className="warnings-header-left">
            <h2 className="warnings-title">WARNINGS</h2>
          </div>
          <div className="warnings-header-right">
            <span>Last updated: {minutesSinceUpdate === 0 ? 'just now' : `${minutesSinceUpdate} min ago`}</span>
            <svg 
              className={`refresh-icon ${isUpdating ? 'spinning' : ''}`} 
              onClick={handleRefresh}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </div>
        </div>

        <div className="warnings-filters">
          {FILTERS.map(filter => (
            <button 
              key={filter} 
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="warnings-list">
          {filteredWarnings.map(warning => (
            <WarningCard 
              key={warning.warning_id} 
              warning={warning} 
              isExpanded={expandedId === warning.warning_id}
              onToggle={() => handleToggle(warning.warning_id)}
              onRunDeepReview={handleRunDeepReview}
              onPrepareActionPlan={handlePrepareActionPlan}
              actionPlanReady={!!getPlan(warning.warning_id)}
              isPreparingPlan={preparingIds.has(warning.warning_id)}
            />
          ))}
        </div>
        
      </div>
      
        )}
      </DrawerPanel>
      
      {selectedWarningForReview && (
        <DeepReviewModal 
          warning={selectedWarningForReview} 
          onClose={() => setSelectedWarningForReview(null)} 
        />
      )}
      
      <ActionPlanModal 
        plan={selectedActionPlan}
        onClose={() => setSelectedActionPlan(null)}
      />
    </>
  );
}
