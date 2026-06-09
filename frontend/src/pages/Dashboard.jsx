import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  fetchKPIs,
  fetchSalesOverTime,
  fetchSalesByCategory,
  fetchTopPriority,
  fetchBusinessHealth,
} from '../api/client';
import './Dashboard.css';

const DATE_RANGES = [
  { key: 'last_7_days', label: 'Last 7 days' },
  { key: 'last_30_days', label: 'Last 30 days' },
  { key: 'last_90_days', label: 'Last 90 days' },
];

/* ════════════════════════════════════════════
   KPI Card Component
   ════════════════════════════════════════════ */
function KPICard({ label, value, dot, changeValue, changeDir, insight }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-label">{label}</span>
        <span className={`kpi-dot ${dot}`} />
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-change">
        <span className={`kpi-change-arrow ${changeDir}`}>
          {changeDir === 'up' ? '↑' : '↓'}
        </span>
        <span className={`kpi-change-value ${changeDir}`}>{changeValue}</span>
        <span>vs prior period</span>
      </div>
      {insight && (
        <div className="kpi-insight">
          <span className="kpi-insight-icon">✦</span>
          <span>{insight}</span>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   Top Priority Banner Component
   ════════════════════════════════════════════ */
function TopPriorityBanner({ warning }) {
  if (!warning) return null;

  return (
    <div className="top-priority-banner">
      {/* Col 1: Identity */}
      <div className="tp-col tp-col-identity">
        <div className="tp-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="8" x2="12" y2="13" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </div>
        <div>
          <div className="tp-label">Top priority · AI Detected</div>
          <div className="tp-title">{warning.title}</div>
        </div>
      </div>

      {/* Col 2: Impact */}
      <div className="tp-col tp-col-impact">
        <div className="tp-section-label">Estimated impact</div>
        <div className="tp-impact-value">{warning.impact_label?.match(/€[\d,]+/)?.[0] || '—'}</div>
        <div className="tp-impact-sub">Over next 30 days</div>
      </div>

      {/* Col 3: Root Cause */}
      <div className="tp-col tp-col-text">
        <div className="tp-section-label">Root Cause</div>
        <div className="tp-section-value">{warning.why?.substring(0, 120) || '—'}</div>
      </div>

      {/* Col 4: Recommended Action */}
      <div className="tp-col tp-col-text">
        <div className="tp-section-label">Recommended Action</div>
        <div className="tp-section-value">{warning.recommended_action?.substring(0, 120) || '—'}</div>
      </div>

      {/* Col 5: Buttons */}
      <div className="tp-col tp-col-actions">
        <button className="btn-deep-review">Run Deep Review</button>
        <button className="btn-dismiss">Dismiss</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Business Health Bar Component
   ════════════════════════════════════════════ */
function BusinessHealthBar({ items }) {
  const statusIcon = (status) => {
    if (status === 'healthy') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
    // warning or critical — triangle exclamation
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="12" cy="16" r="0.5" fill="currentColor" />
      </svg>
    );
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
    <div className="business-health-section">
      <span className="bh-title">Business Health</span>
      <div className="bh-items">
        {items.map((bh) => (
          <div className="bh-tooltip-wrapper bh-item" key={bh.domain}>
            <div className={`bh-status-icon ${bh.status}`}>
              {statusIcon(bh.status)}
            </div>
            <div>
              <div className="bh-label">{domainLabels[bh.domain] || bh.domain}</div>
              <div className="bh-status-text">{bh.status.charAt(0).toUpperCase() + bh.status.slice(1)}</div>
            </div>
            <svg className="bh-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <circle cx="12" cy="8" r="0.5" fill="currentColor" />
            </svg>
            <div className="bh-tooltip">
              <div className="bh-tooltip-title">{bh.tooltip_title}</div>
              <div>{bh.tooltip_description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Sales Over Time Chart Component
   ════════════════════════════════════════════ */
function SalesOverTimeChart({ data }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Calculate max for Y-axis percentage display
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">Sales Over Time</span>
        <div className="chart-dropdown">
          Total Sales (€) <ChevronDown />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.round((v / maxRev) * 100)}%`}
          />
          <Tooltip
            formatter={(val) => [`€${val.toLocaleString()}`, 'Revenue']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ════════════════════════════════════════════
   Sales By Category Chart Component
   ════════════════════════════════════════════ */
function SalesByCategoryChart({ data }) {
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const formatted = data.map((d) => ({
    ...d,
    pct: Math.round((d.revenue / total) * 100),
    displayLabel: `€${d.revenue.toLocaleString()}\n(${Math.round((d.revenue / total) * 100)}%)`,
  }));

  const CustomBarLabel = ({ x, y, width, value, index }) => {
    const item = formatted[index];
    if (!item) return null;
    return (
      <g>
        <text x={x + width / 2} y={y - 14} textAnchor="middle" fontSize={11} fontWeight={600} fill="#111827">
          €{item.revenue.toLocaleString()}
        </text>
        <text x={x + width / 2} y={y - 2} textAnchor="middle" fontSize={10} fill="#6B7280">
          ({item.pct}%)
        </text>
      </g>
    );
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">Sales by Category</span>
        <div className="chart-dropdown">
          Total Sales (€) <ChevronDown />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={formatted} margin={{ top: 30, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              const maxRev = Math.max(...formatted.map((d) => d.revenue), 1);
              return `${Math.round((v / maxRev) * 100)}%`;
            }}
          />
          <Tooltip
            formatter={(val) => [`€${val.toLocaleString()}`, 'Revenue']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
          />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]} label={<CustomBarLabel />}>
            {formatted.map((entry, i) => (
              <Cell key={i} fill={i === 0 ? '#DC2626' : '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ════════════════════════════════════════════
   Chevron Down icon
   ════════════════════════════════════════════ */
function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ════════════════════════════════════════════
   Calendar icon
   ════════════════════════════════════════════ */
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/* ════════════════════════════════════════════
   Refresh icon
   ════════════════════════════════════════════ */
function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

/* ════════════════════════════════════════════
   Main Dashboard Page
   ════════════════════════════════════════════ */
export default function Dashboard() {
  const [range, setRange] = useState('last_7_days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [kpis, setKpis] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [topWarning, setTopWarning] = useState(null);
  const [businessHealth, setBusinessHealth] = useState([]);

  const [rangeOpen, setRangeOpen] = useState(false);

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
    loadData();
  }, [loadData]);

  const currentRangeLabel = DATE_RANGES.find((d) => d.key === range)?.label || range;

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <p><strong>Error:</strong> {error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading || !kpis) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">Loading dashboard data…</div>
      </div>
    );
  }

  const rangeLabelMap = {
    last_7_days: 'Last 7 days',
    last_30_days: 'Last 30 days',
    last_90_days: 'Last 90 days',
  };

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div style={{ position: 'relative' }}>
          <button className="header-btn" onClick={() => setRangeOpen(!rangeOpen)}>
            <CalendarIcon />
            {currentRangeLabel}
            <ChevronDown />
          </button>
          {rangeOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20, minWidth: 160,
            }}>
              {DATE_RANGES.map((dr) => (
                <div
                  key={dr.key}
                  onClick={() => { setRange(dr.key); setRangeOpen(false); }}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', fontSize: 14,
                    background: range === dr.key ? '#F3F4F6' : '#fff',
                    fontWeight: range === dr.key ? 600 : 400,
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.target.style.background = range === dr.key ? '#F3F4F6' : '#fff'}
                >
                  {dr.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="header-btn" onClick={() => { loadData(); }}>
          <RefreshIcon /> Refresh
        </button>
        <button className="header-btn">
          Michael <ChevronDown />
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-row">
        <KPICard
          label={rangeLabelMap[range] || range}
          value={`€${kpis.total_sales.toLocaleString()}`}
          dot="green"
          changeValue="—"
          changeDir="up"
          insight="Revenue trending above baseline"
        />
        <KPICard
          label="Orders"
          value={kpis.orders.toLocaleString()}
          dot="green"
          changeValue="—"
          changeDir="up"
          insight="Order velocity steady"
        />
        <KPICard
          label="Gross Profit"
          value={`€${kpis.gross_profit.toLocaleString()}`}
          dot="green"
          changeValue="—"
          changeDir="up"
          insight="Gross margin improving with stronger product mix"
        />
        <KPICard
          label="Ad Spend"
          value={`€${kpis.ad_spend.toLocaleString()}`}
          dot="red"
          changeValue="—"
          changeDir="up"
          insight="Meta spend increased to support targeting push"
        />
        <KPICard
          label="Ad Conversion Rate"
          value={`${kpis.ad_conversion_rate}%`}
          dot="green"
          changeValue="—"
          changeDir="up"
          insight="Paid traffic converting above weekly baseline"
        />
        <KPICard
          label="ACOS"
          value={`${(kpis.acos * 100).toFixed(1)}%`}
          dot="orange"
          changeValue="—"
          changeDir="up"
          insight="Google campaigns outperforming Meta"
        />
      </div>

      {/* ── Top Priority Warning ── */}
      <TopPriorityBanner warning={topWarning} />

      {/* ── Business Health ── */}
      <BusinessHealthBar items={businessHealth} />

      {/* ── Charts ── */}
      <div className="charts-row">
        <SalesOverTimeChart data={salesOverTime} />
        <SalesByCategoryChart data={salesByCategory} />
      </div>
    </div>
  );
}
