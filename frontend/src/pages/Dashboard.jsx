import { useState, useEffect, useCallback } from 'react';
import {
  fetchKPIs,
  fetchSalesOverTime,
  fetchSalesByCategory,
  fetchTopPriority,
  fetchBusinessHealth,
} from '../api/client';

import HeaderControls from '../components/dashboard/HeaderControls';
import KPISection from '../components/dashboard/KPISection';
import TopPriorityBanner from '../components/dashboard/TopPriorityBanner';
import BusinessHealthBar from '../components/dashboard/BusinessHealthBar';
import ChartsSection from '../components/dashboard/ChartsSection';

import '../components/dashboard/DashboardLayout.css';

export default function Dashboard() {
  const [range, setRange] = useState('last_7_days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [kpis, setKpis] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [topWarning, setTopWarning] = useState(null);
  const [businessHealth, setBusinessHealth] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, sotData, sbcData, tpData, bhData] = await Promise.all([
        fetchKPIs(range),
        fetchSalesOverTime(range),
        fetchSalesByCategory(range),
        fetchTopPriority(),
        fetchBusinessHealth(),
      ]);
      setKpis(kpiData);
      setSalesOverTime(sotData);
      setSalesByCategory(sbcData);
      setTopWarning(tpData.warning);
      setBusinessHealth(bhData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="db-page">
        <div className="db-error">
          <p><strong>Error:</strong> {error}</p>
          <button className="db-header-btn" onClick={loadData} style={{ marginTop: 16 }}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading || !kpis) {
    return (
      <div className="db-page">
        <div className="db-loading">Loading dashboard data…</div>
      </div>
    );
  }

  const rangeLabelMap = {
    last_7_days: 'Last 7 days',
    last_30_days: 'Last 30 days',
    last_90_days: 'Last 90 days',
  };

  return (
    <div className="db-page">
      <div className="db-container">
        <HeaderControls range={range} setRange={setRange} onRefresh={loadData} />
        
        <KPISection kpis={kpis} rangeLabel={rangeLabelMap[range] || range} />
        
        <TopPriorityBanner warning={topWarning} />
        
        <BusinessHealthBar items={businessHealth} />
        
        <ChartsSection salesOverTime={salesOverTime} salesByCategory={salesByCategory} />
      </div>
    </div>
  );
}
