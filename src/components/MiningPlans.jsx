import React from 'react';
import './MiningPlans.css';

const plans = [
  {
    name: 'STARTER',
    price: '$5 - $49',
    hashrate: '50 - 490 GH/s',
    dailyProfit: '3.0%',
    totalEarned: 'Covers 100% of $10'
  },
  {
    name: 'BASIC',
    price: '$50 - $199',
    hashrate: '500 - 1990 GH/s',
    dailyProfit: '3.5%',
    totalEarned: '(Investment × 70%) + $4 Bonus',
    recommended: true
  },
  {
    name: 'PRO',
    price: '$200 - $999',
    hashrate: '2.0 - 9.9 TH/s',
    dailyProfit: '4.0%',
    totalEarned: '(Investment × 80%) + $4 Bonus'
  },
  {
    name: 'ELITE',
    price: '$1000 - $3999',
    hashrate: '10.0 - 39.9 TH/s',
    dailyProfit: '4.5%',
    totalEarned: '(Investment × 90%) + $4 Bonus'
  }
];

const MiningPlans = () => {
  return (
    <div className="plans-grid">
      {plans.map((plan, index) => (
        <div key={index} className={`plan-card glass-card ${plan.recommended ? 'popular' : ''}`}>
          {plan.recommended && (
            <div className="recommended-ribbon">
              RECOMMENDED
            </div>
          )}
          <div className="plan-header">
            <span className="plan-name">{plan.name}</span>
            <h3 className="plan-price">{plan.price}</h3>
          </div>
          <div className="plan-info">
            <div className="info-row">
              <span className="info-label">Hashrate</span>
              <span className="info-value">{plan.hashrate}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Daily Profit</span>
              <span className="info-value" style={{ color: 'var(--accent-green)' }}>{plan.dailyProfit}</span>
            </div>
            <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <span className="info-label">20-Day Total Earned (with Bonus)*</span>
              <span className="info-value" style={{ fontSize: '12px', color: 'var(--primary)' }}>{plan.totalEarned}</span>
            </div>
          </div>
          <button className="btn-outline plan-btn">Get Started</button>
        </div>
      ))}
    </div>
  );
};

export default MiningPlans;
