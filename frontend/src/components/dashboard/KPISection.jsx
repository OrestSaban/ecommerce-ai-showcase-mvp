import {
  DotGreen, DotRed, DotOrange,
  ArrowUp, ArrowDown, ArrowWarning,
} from '../../assets/figma_icons';
import './DashboardLayout.css';

// Fallback comparison values when backend doesn't provide them
const FALLBACK_CHANGE = {
  total_sales: '12.4%',
  orders: '8.7%',
  gross_profit: '14.1%',
  ad_spend: '12.5%',
  ad_conversion_rate: '6.7%',
  acos: '3.2pp',
};

function KPICard({ label, value, dot, changeValue, changeDir, changeColor }) {
  let dotIcon = DotGreen;
  if (dot === 'red') dotIcon = DotRed;
  if (dot === 'orange') dotIcon = DotOrange;

  let arrowIcon = ArrowUp;
  if (changeDir === 'down') arrowIcon = ArrowDown;
  if (changeDir === 'warning') arrowIcon = ArrowWarning;

  return (
    <div className="db-kpi-card">
      {/* TOP: title + status dot */}
      <div className="db-kpi-card-top">
        <span className="db-kpi-label">{label}</span>
        <img src={dotIcon} alt="" className="db-kpi-dot" />
      </div>

      {/* MIDDLE: main KPI value */}
      <div className="db-kpi-value">{value}</div>

      {/* BOTTOM: comparison block — two separate lines */}
      <div className="db-kpi-bottom">
        <div className="db-kpi-change-main">
          <img src={arrowIcon} alt="" className="db-kpi-arrow" />
          <span className={`db-kpi-change-pct ${changeColor || changeDir}`}>{changeValue}</span>
        </div>
        <span className="db-kpi-change-text">vs prior period</span>
      </div>
    </div>
  );
}

export default function KPISection({ kpis, rangeLabel }) {
  if (!kpis) return <div className="db-kpi-section">Loading KPIs...</div>;

  return (
    <div className="db-kpi-section">
      <KPICard
        label={rangeLabel}
        value={`€${kpis.total_sales.toLocaleString()}`}
        dot="green"
        changeValue={kpis.total_sales_change ?? FALLBACK_CHANGE.total_sales}
        changeDir="up"
      />
      <KPICard
        label="Orders"
        value={kpis.orders.toLocaleString()}
        dot="green"
        changeValue={kpis.orders_change ?? FALLBACK_CHANGE.orders}
        changeDir="up"
      />
      <KPICard
        label="Gross Profit"
        value={`€${kpis.gross_profit.toLocaleString()}`}
        dot="green"
        changeValue={kpis.gross_profit_change ?? FALLBACK_CHANGE.gross_profit}
        changeDir="up"
      />
      <KPICard
        label="Ad Spend"
        value={`€${kpis.ad_spend.toLocaleString()}`}
        dot="red"
        changeValue={kpis.ad_spend_change ?? FALLBACK_CHANGE.ad_spend}
        changeDir="up"
        changeColor="down"
      />
      <KPICard
        label="Ad Conv. Rate"
        value={`${kpis.ad_conversion_rate}%`}
        dot="green"
        changeValue={kpis.ad_conversion_rate_change ?? FALLBACK_CHANGE.ad_conversion_rate}
        changeDir="up"
      />
      <KPICard
        label="ACOS"
        value={`${(kpis.acos * 100).toFixed(1)}%`}
        dot="orange"
        changeValue={kpis.acos_change ?? FALLBACK_CHANGE.acos}
        changeDir="up"
        changeColor="warning"
      />
    </div>
  );
}
