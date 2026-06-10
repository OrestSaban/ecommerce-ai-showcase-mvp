import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IconChevronDown } from '../../assets/figma_icons';
import './DashboardLayout.css';

export default function ChartsSection({ salesOverTime, salesByCategory }) {
  
  // Format line chart data
  const lineData = (salesOverTime || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));
  const maxLineRev = Math.max(...(salesOverTime || []).map((d) => d.revenue), 1);

  // Format bar chart data
  const totalBar = (salesByCategory || []).reduce((s, d) => s + d.revenue, 0);
  const barData = (salesByCategory || []).map((d) => ({
    ...d,
    pct: Math.round((d.revenue / totalBar) * 100),
  }));

  const renderCustomBarLabel = (props) => {
    const { x, y, width, index } = props;
    const item = barData[index];
    if (!item) return null;
    return (
      <g>
        <text x={x + width / 2} y={y - 16} textAnchor="middle" fontSize={14} fontWeight={600} fill="#000000" fontFamily="Inter">
          €{item.revenue.toLocaleString()}
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
          <button className="db-chart-dropdown">
            Total Sales (€)
            <img src={IconChevronDown} alt="" />
          </button>
        </div>
        <div className="db-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcdfe5" />
              <XAxis dataKey="label" tick={{ fontSize: 14, fill: '#000000', fontFamily: 'Inter' }} axisLine={{ stroke: '#dcdfe5' }} tickLine={false} />
              <YAxis tick={{ fontSize: 14, fill: '#000000', fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round((v / maxLineRev) * 100)}%`} />
              <Tooltip formatter={(val) => [`€${val.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #dcdfe5', fontFamily: 'Inter', color: '#000' }} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="db-chart-card">
        <div className="db-chart-header">
          <span className="db-chart-title">Sales by Category</span>
          <button className="db-chart-dropdown">
            Total Sales (€)
            <img src={IconChevronDown} alt="" />
          </button>
        </div>
        <div className="db-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 35, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcdfe5" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 14, fill: '#000000', fontFamily: 'Inter' }} axisLine={{ stroke: '#dcdfe5' }} tickLine={false} />
              <YAxis tick={{ fontSize: 14, fill: '#000000', fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => {
                const maxBarRev = Math.max(...barData.map((d) => d.revenue), 1);
                return `${Math.round((v / maxBarRev) * 100)}%`;
              }} />
              <Tooltip formatter={(val) => [`€${val.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #dcdfe5', fontFamily: 'Inter', color: '#000' }} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} label={renderCustomBarLabel}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? '#da1615' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
