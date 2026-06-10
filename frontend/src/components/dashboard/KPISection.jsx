import {
  DotGreen, DotRed, DotOrange,
  ArrowUp, ArrowDown, ArrowWarning,
  IconInsightStar
} from '../../assets/figma_icons';
import './DashboardLayout.css';

function KPICard({ label, value, dot, changeValue, changeDir, changeColor, insight }) {
  let dotIcon = DotGreen;
  if (dot === 'red') dotIcon = DotRed;
  if (dot === 'orange') dotIcon = DotOrange;

  let arrowIcon = ArrowUp;
  if (changeDir === 'down') arrowIcon = ArrowDown;
  if (changeDir === 'warning') arrowIcon = ArrowWarning;

  return (
    <div className="db-kpi-card">
      <div className="db-kpi-card-top">
        <span className="db-kpi-label">{label}</span>
        <img src={dotIcon} alt="" className="db-kpi-dot" />
      </div>

      <div className="db-kpi-middle">
        <div className="db-kpi-value">{value}</div>
        <div className="db-kpi-change-row">
          <img src={arrowIcon} alt="" className="db-kpi-arrow" />
          <span className={`db-kpi-change-pct ${changeColor || changeDir}`}>{changeValue}</span>
          <span className="db-kpi-change-text">vs prior period</span>
        </div>
      </div>

      {insight && (
        <div className="db-kpi-insight-row">
          <img src={IconInsightStar} alt="" className="db-kpi-insight-icon" />
          <span className="db-kpi-insight-text">{insight}</span>
        </div>
      )}
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
        changeColor="down"
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
        changeColor="warning"
        insight="Google campaigns outperforming Meta"
      />
    </div>
  );
}
