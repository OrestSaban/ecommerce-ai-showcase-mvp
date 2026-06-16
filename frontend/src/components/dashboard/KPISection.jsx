import {
  DotGreen, DotRed, DotOrange,
  ArrowUp, ArrowDown, ArrowWarning,
} from '../../assets/figma_icons';
import './DashboardLayout.css';

function formatChange(val, isPP = false) {
  if (val == null) return '0%';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}${isPP ? 'pp' : '%'}`;
}

function getKPIProps(changeVal, type = 'positive') {
  // Safe default for zero or missing data: flat green up arrow.
  if (changeVal == null || Math.abs(changeVal) < 0.01) {
    return {
      changeDir: 'up',
      dot: 'green',
      changeColor: 'up' // green
    };
  }
  
  const isIncrease = changeVal > 0;
  
  if (type === 'cost') {
    return {
      changeDir: isIncrease ? 'up' : 'down',
      dot: isIncrease ? 'red' : 'green',
      changeColor: isIncrease ? 'down' : 'up' // down maps to red, up maps to green
    };
  } else if (type === 'cost-warning') {
    return {
      changeDir: isIncrease ? 'up' : 'down',
      dot: isIncrease ? 'orange' : 'green',
      changeColor: isIncrease ? 'warning' : 'up' // warning maps to orange, up maps to green
    };
  }
  
  // Default positive KPIs
  return {
    changeDir: isIncrease ? 'up' : 'down',
    dot: isIncrease ? 'green' : 'red',
    changeColor: isIncrease ? 'up' : 'down' // up maps to green, down maps to red
  };
}

function KPICard({ label, value, dot, changeValue, changeDir, changeColor }) {
  let dotIcon = DotGreen;
  if (dot === 'red') dotIcon = DotRed;
  if (dot === 'orange') dotIcon = DotOrange;

  let arrowIcon = ArrowUp;
  if (changeDir === 'down') arrowIcon = ArrowDown;
  if (changeDir === 'warning') arrowIcon = ArrowWarning;

  // colorClass drives both arrow tint and percentage text color
  const colorClass = changeColor || changeDir;

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
          <img src={arrowIcon} alt="" className={`db-kpi-arrow db-kpi-arrow--${colorClass}`} />
          <span className={`db-kpi-change-pct ${colorClass}`}>{changeValue}</span>
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
        value={`€${kpis.total_sales?.toLocaleString() ?? 0}`}
        changeValue={formatChange(kpis.total_sales_change)}
        {...getKPIProps(kpis.total_sales_change, 'positive')}
      />
      <KPICard
        label="Orders"
        value={kpis.orders?.toLocaleString() ?? 0}
        changeValue={formatChange(kpis.orders_change)}
        {...getKPIProps(kpis.orders_change, 'positive')}
      />
      <KPICard
        label="Gross Profit"
        value={`€${kpis.gross_profit?.toLocaleString() ?? 0}`}
        changeValue={formatChange(kpis.gross_profit_change)}
        {...getKPIProps(kpis.gross_profit_change, 'positive')}
      />
      <KPICard
        label="Ad Spend"
        value={`€${kpis.ad_spend?.toLocaleString() ?? 0}`}
        changeValue={formatChange(kpis.ad_spend_change)}
        {...getKPIProps(kpis.ad_spend_change, 'cost')}
      />
      <KPICard
        label="Ad Conv. Rate"
        value={`${kpis.ad_conversion_rate}%`}
        changeValue={formatChange(kpis.ad_conversion_rate_change, true)}
        {...getKPIProps(kpis.ad_conversion_rate_change, 'positive')}
      />
      <KPICard
        label="ACOS"
        value={`${((kpis.acos || 0) * 100).toFixed(1)}%`}
        changeValue={formatChange(kpis.acos_change, true)}
        {...getKPIProps(kpis.acos_change, 'cost-warning')}
      />
    </div>
  );
}
