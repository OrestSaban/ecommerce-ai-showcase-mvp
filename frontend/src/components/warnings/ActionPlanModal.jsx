import { useState, useEffect } from 'react';
import './Warnings.css';

const OWNER_MAP = {
  inventory: 'Inventory / Operations',
  advertising: 'Marketing',
  returns: 'Customer Experience / Product',
  payments: 'Finance / Payments',
  listings: 'Marketplace Operations',
};

function generateActionPlan(warning) {
  const owner = OWNER_MAP[warning.category] || 'Operations';
  const impact = warning.impact_amount
    ? `$${warning.impact_amount.toLocaleString()}`
    : 'the estimated impact amount';

  return {
    warningId: warning.warning_id,
    title: warning.title,
    severity: warning.severity,
    category: warning.category,
    generatedAt: Date.now(),
    goal: `Prevent "${warning.title}" from creating further revenue loss and resolve the underlying root cause within the next 3 business days.`,
    priority: warning.severity === 'High' ? 'Critical — Immediate action required' :
              warning.severity === 'Medium' ? 'High — Action within 24 hours' :
              'Moderate — Action within 3 days',
    steps: [
      {
        step: 1,
        action: `Notify ${owner} team lead and assign a primary owner for this issue.`,
        owner: owner,
        deadline: 'Today',
      },
      {
        step: 2,
        action: warning.recommended_action || 'Review the affected area and identify scope of impact.',
        owner: owner,
        deadline: 'Today',
      },
      {
        step: 3,
        action: `Quantify current exposure and confirm the estimated impact of ${impact}.`,
        owner: 'Finance / Analytics',
        deadline: 'Day 1–2',
      },
      {
        step: 4,
        action: 'Implement the recommended operational fix and validate with a test run.',
        owner: owner,
        deadline: 'Day 2–3',
      },
      {
        step: 5,
        action: 'Set up automated monitoring for the affected metric over the next 7 days.',
        owner: 'Data / Analytics',
        deadline: 'Day 3',
      },
    ],
    expectedOutcome: `Reduce risk exposure by resolving the root cause. Protect ${impact} in potential revenue loss over the next 30 days. Continuous monitoring will ensure the issue does not recur.`,
    owner: owner,
    timeline: 'Today → 3 business days',
  };
}

const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function useActionPlanStore() {
  const [plans, setPlans] = useState(() => {
    try {
      const stored = localStorage.getItem('action_plans');
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      // Prune expired plans
      const now = Date.now();
      const valid = {};
      for (const [id, plan] of Object.entries(parsed)) {
        if (now - plan.generatedAt < EXPIRY_MS) {
          valid[id] = plan;
        }
      }
      return valid;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('action_plans', JSON.stringify(plans));
  }, [plans]);

  const getPlan = (warningId) => {
    const plan = plans[warningId];
    if (!plan) return null;
    if (Date.now() - plan.generatedAt >= EXPIRY_MS) {
      // Expired — remove it
      setPlans(prev => {
        const next = { ...prev };
        delete next[warningId];
        return next;
      });
      return null;
    }
    return plan;
  };

  const storePlan = (warning) => {
    const plan = generateActionPlan(warning);
    setPlans(prev => ({ ...prev, [warning.warning_id]: plan }));
    return plan;
  };

  return { getPlan, storePlan };
}

export default function ActionPlanModal({ plan, onClose }) {
  if (!plan) return null;

  const severityColor = plan.severity === 'High' ? '#da1615' :
                         plan.severity === 'Medium' ? '#e6a817' : '#6b7280';

  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="action-plan-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="action-plan-modal-header">
          <div className="action-plan-modal-header-left">
            <div className="action-plan-modal-ai-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              AI Action Plan
            </div>
            <h2 className="action-plan-modal-title">{plan.title}</h2>
          </div>
          <button className="db-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#474c61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="action-plan-modal-body">
          {/* Overview row */}
          <div className="action-plan-overview">
            <div className="action-plan-overview-item">
              <span className="action-plan-overview-label">Priority</span>
              <span className="action-plan-overview-value" style={{ color: severityColor }}>{plan.priority}</span>
            </div>
            <div className="action-plan-overview-item">
              <span className="action-plan-overview-label">Owner</span>
              <span className="action-plan-overview-value">{plan.owner}</span>
            </div>
            <div className="action-plan-overview-item">
              <span className="action-plan-overview-label">Timeline</span>
              <span className="action-plan-overview-value">{plan.timeline}</span>
            </div>
          </div>

          {/* Goal */}
          <div className="action-plan-section-block">
            <h3 className="action-plan-section-title">Goal</h3>
            <p className="action-plan-section-text">{plan.goal}</p>
          </div>

          {/* Steps */}
          <div className="action-plan-section-block">
            <h3 className="action-plan-section-title">Recommended Steps</h3>
            <div className="action-plan-steps">
              {plan.steps.map((step) => (
                <div key={step.step} className="action-plan-step">
                  <div className="action-plan-step-number">{step.step}</div>
                  <div className="action-plan-step-content">
                    <p className="action-plan-step-action">{step.action}</p>
                    <div className="action-plan-step-meta">
                      <span className="action-plan-step-owner">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/></svg>
                        {step.owner}
                      </span>
                      <span className="action-plan-step-deadline">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {step.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Outcome */}
          <div className="action-plan-section-block">
            <h3 className="action-plan-section-title">Expected Outcome</h3>
            <p className="action-plan-section-text">{plan.expectedOutcome}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
