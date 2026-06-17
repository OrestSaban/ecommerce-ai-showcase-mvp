import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSalesOverTime } from '../../api/client';
import { IconChevronDown } from '../../assets/figma_icons';
import './DashboardLayout.css';

const metricLabelMap = {
  revenue: 'Revenue',
  orders: 'Orders',
  gross_profit: 'Gross Profit',
  ad_spend: 'Ad Spend'
};

const formatAxisTick = (val, metric) => {
  if (metric === 'orders') {
    return val >= 1000 ? `${(val / 1000).toFixed(1).replace(/\.0$/, '')}k` : val;
  }
  if (val >= 1000) {
    return `€${(val / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `€${val}`;
};

function ExpandedChartModal({ isOpen, onClose, initialData }) {
  const [metric, setMetric] = useState('revenue');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [zoom, setZoom] = useState(1);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSalesOverTime(dateRange)
      .then((res) => {
        if (active) {
          const formatted = res.map(d => ({
            ...d,
            label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }));
          setData(formatted);
          setError(null);
          setLoading(false);
          setZoom(1);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [dateRange]);

  const slicePercent = 1 - ((zoom - 1) / 99) * 0.8;
  const sliceLength = Math.max(1, Math.floor(data.length * slicePercent));
  const displayData = data.slice(-sliceLength);

  const visualRange = zoom > 1 ? 'custom' : dateRange;

  if (!isOpen) return null;

  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="db-modal-header">
          <h2 className="db-modal-title">Sales Over Time - Detailed Analysis</h2>
          <div className="db-modal-filters">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#474c61', fontWeight: 500 }}>Zoom</span>
              <input
                type="range" min="1" max="100" value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: '100px' }}
              />
              <button
                onClick={() => setZoom(1)}
                style={{
                  visibility: zoom > 1 ? 'visible' : 'hidden',
                  fontSize: '12px', padding: '4px 8px', background: '#f3f4f6',
                  border: '1px solid #dcdfe5', borderRadius: '4px', cursor: 'pointer',
                  color: '#474c61'
                }}
              >
                Reset view
              </button>
            </div>
            <select
              value={visualRange}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  setDateRange(e.target.value);
                }
              }}
              className="db-modal-select"
            >
              {visualRange === 'custom' && <option value="custom">Custom</option>}
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="ytd">YTD</option>
              <option value="last_12_months">Last 12 Months</option>
            </select>
            <select value={metric} onChange={(e) => setMetric(e.target.value)} className="db-modal-select">
              <option value="revenue">Revenue</option>
              <option value="orders">Orders</option>
              <option value="gross_profit">Gross Profit</option>
              <option value="ad_spend">Ad Spend</option>
            </select>
            <button className="db-modal-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#474c61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="db-modal-body" style={{ position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <span style={{ fontWeight: 600, color: '#3b82f6' }}>Loading...</span>
            </div>
          )}
          {error && !loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <span style={{ color: '#da1615' }}>Error: {error}</span>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 20, right: 30, bottom: 10, left: 20 }}>
              <defs>
                <linearGradient id="colorMetricModal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eaebef" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 13, fill: '#474c61', fontFamily: 'Inter' }} axisLine={{ stroke: '#eaebef' }} tickLine={false} tickMargin={12} />
              <YAxis tick={{ fontSize: 13, fill: '#474c61', fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickMargin={12} tickFormatter={(v) => formatAxisTick(v, metric)} />
              <Tooltip formatter={(val) => [`${metric === 'orders' ? '' : '€'}${val?.toLocaleString() ?? 0}`, metricLabelMap[metric]]} contentStyle={{ borderRadius: 8, border: '1px solid #dcdfe5', fontFamily: 'Inter', color: '#000', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey={metric} stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMetricModal)" activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function ChartsSection({ salesOverTime, salesByCategory }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeMetric, setTimeMetric] = useState('revenue');
  const [catMetric, setCatMetric] = useState('revenue');

  // Format line chart data
  const lineData = (salesOverTime || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Format bar chart data
  const totalBar = (salesByCategory || []).reduce((s, d) => s + (d[catMetric] || 0), 0);
  const barData = (salesByCategory || []).map((d) => ({
    ...d,
    pct: totalBar > 0 ? Math.round(((d[catMetric] || 0) / totalBar) * 100) : 0,
  }));

  const renderCustomBarLabel = (props) => {
    const { x, y, width, index } = props;
    const item = barData[index];
    if (!item) return null;
    return (
      <g>
        <text x={x + width / 2} y={y - 16} textAnchor="middle" fontSize={14} fontWeight={600} fill="#000000" fontFamily="Inter">
          {catMetric === 'orders' ? '' : '€'}{item[catMetric]?.toLocaleString() || 0}
        </text>
        <text x={x + width / 2} y={y - 2} textAnchor="middle" fontSize={13} fill="#474c61" fontFamily="Inter">
          ({item.pct}%)
        </text>
      </g>
    );
  };

  return (
    <div className="db-charts-row">
      <div className="db-chart-card">
        <div className="db-chart-header">
          <span className="db-chart-title">Sales Over Time</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select
              value={timeMetric}
              onChange={(e) => setTimeMetric(e.target.value)}
              className="db-modal-select"
            >
              <option value="revenue">Revenue</option>
              <option value="orders">Orders</option>
              <option value="gross_profit">Gross Profit</option>
              <option value="ad_spend">Ad Spend</option>
            </select>
            <button className="db-chart-expand-btn" onClick={() => setIsModalOpen(true)} title="Expand Chart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#474c61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="db-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="colorMetricDashboard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcdfe5" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 14, fill: '#000000', fontFamily: 'Inter' }} axisLine={{ stroke: '#dcdfe5' }} tickLine={false} />
              <YAxis tick={{ fontSize: 14, fill: '#000000', fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatAxisTick(v, timeMetric)} />
              <Tooltip formatter={(val) => [`${timeMetric === 'orders' ? '' : '€'}${val?.toLocaleString() ?? 0}`, metricLabelMap[timeMetric]]} contentStyle={{ borderRadius: 8, border: '1px solid #dcdfe5', fontFamily: 'Inter', color: '#000' }} />
              <Area type="monotone" dataKey={timeMetric} stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMetricDashboard)" dot={{ r: 4, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="db-chart-card">
        <div className="db-chart-header">
          <span className="db-chart-title">Sales by Category</span>
          <select
            value={catMetric}
            onChange={(e) => setCatMetric(e.target.value)}
            className="db-modal-select"
          >
            <option value="revenue">Revenue</option>
            <option value="orders">Orders</option>
            <option value="gross_profit">Gross Profit</option>
          </select>
        </div>
        <div className="db-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 35, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcdfe5" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 14, fill: '#000000', fontFamily: 'Inter' }} axisLine={{ stroke: '#dcdfe5' }} tickLine={false} />
              <YAxis tick={{ fontSize: 14, fill: '#000000', fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatAxisTick(v, catMetric)} />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={(val) => [`${catMetric === 'orders' ? '' : '€'}${val?.toLocaleString() ?? 0}`, metricLabelMap[catMetric]]} contentStyle={{ borderRadius: 8, border: '1px solid #dcdfe5', fontFamily: 'Inter', color: '#000' }} />
              <Bar dataKey={catMetric} fill="#3b82f6" maxBarSize={48} radius={[4, 4, 0, 0]} label={renderCustomBarLabel} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ExpandedChartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={lineData}
      />
    </div>
  );
}
