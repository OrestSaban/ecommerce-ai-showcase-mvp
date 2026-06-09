import { useState, useEffect, useCallback } from 'react';
import {
  fetchKPIs,
  fetchSalesOverTime,
  fetchSalesByCategory,
  fetchTopPriority,
  fetchBusinessHealth,
} from '../api/client';

const DATE_RANGES = [
  { key: 'last_7_days', label: 'Last 7 Days' },
  { key: 'last_30_days', label: 'Last 30 Days' },
  { key: 'last_90_days', label: 'Last 90 Days' },
];

export default function Dashboard() {
  const [range, setRange] = useState('last_30_days');
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
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Dashboard</h2>
        <div style={{ color: '#c0392b', background: '#fdecea', padding: 16, borderRadius: 8 }}>
          <strong>Error:</strong> {error}
        </div>
        <button onClick={loadData} style={{ marginTop: 12 }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header row: title, date range, refresh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {DATE_RANGES.map((dr) => (
            <button
              key={dr.key}
              onClick={() => setRange(dr.key)}
              style={{
                padding: '6px 14px',
                border: '1px solid #ccc',
                borderRadius: 6,
                background: range === dr.key ? '#2d3436' : '#fff',
                color: range === dr.key ? '#fff' : '#333',
                cursor: 'pointer',
              }}
            >
              {dr.label}
            </button>
          ))}
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{ padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}
        >
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {loading && <p>Loading dashboard data…</p>}

      {!loading && kpis && (
        <>
          {/* ── KPI Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            <KPICard label="Total Sales" value={`€${kpis.total_sales.toLocaleString()}`} />
            <KPICard label="Orders" value={kpis.orders.toLocaleString()} />
            <KPICard label="Gross Profit" value={`€${kpis.gross_profit.toLocaleString()}`} />
            <KPICard label="Ad Spend" value={`€${kpis.ad_spend.toLocaleString()}`} />
            <KPICard label="Ad Conversion Rate" value={`${kpis.ad_conversion_rate}%`} />
            <KPICard label="ACoS" value={`${(kpis.acos * 100).toFixed(1)}%`} />
          </div>

          {/* ── Business Health ── */}
          <Section title="Business Health">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {businessHealth.map((bh) => (
                <div
                  key={bh.domain}
                  title={`${bh.tooltip_title}: ${bh.tooltip_description}`}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: bh.status === 'healthy' ? '#d4edda'
                      : bh.status === 'warning' ? '#fff3cd'
                      : '#f8d7da',
                    fontSize: 13,
                    cursor: 'default',
                  }}
                >
                  <strong>{bh.domain}</strong>: {bh.status}
                </div>
              ))}
            </div>
          </Section>

          {/* ── Top Priority Warning ── */}
          <Section title="Top Priority Warning">
            {topWarning ? (
              <div style={{
                padding: 16,
                background: topWarning.severity === 'high' || topWarning.severity === 'critical' ? '#fdecea' : '#fff3cd',
                borderRadius: 8,
              }}>
                <strong>{topWarning.title}</strong>
                <span style={{ marginLeft: 8, fontSize: 12, textTransform: 'uppercase' }}>
                  [{topWarning.severity}]
                </span>
                <p style={{ margin: '8px 0 4px' }}>{topWarning.why}</p>
                <p style={{ margin: 0, fontStyle: 'italic' }}>
                  ↳ {topWarning.recommended_action}
                </p>
              </div>
            ) : (
              <p style={{ color: '#888' }}>No active warnings.</p>
            )}
          </Section>

          {/* ── Sales Over Time ── */}
          <Section title={`Sales Over Time (${kpis.start_date} → ${kpis.end_date})`}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesOverTime.map((row) => (
                  <tr key={row.date}>
                    <td style={tdStyle}>{row.date}</td>
                    <td style={tdStyle}>€{row.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* ── Sales By Category ── */}
          <Section title="Sales by Category">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Revenue</th>
                  <th style={thStyle}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {salesByCategory.map((row) => (
                  <tr key={row.category}>
                    <td style={tdStyle}>{row.category}</td>
                    <td style={tdStyle}>€{row.revenue.toLocaleString()}</td>
                    <td style={tdStyle}>{row.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </>
      )}
    </div>
  );
}

/* ── Small helper components ── */

function KPICard({ label, value }) {
  return (
    <div style={{
      padding: 16,
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      background: '#fafafa',
    }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  );
}

const thStyle = { textAlign: 'left', borderBottom: '2px solid #ddd', padding: '6px 10px' };
const tdStyle = { borderBottom: '1px solid #eee', padding: '6px 10px' };
