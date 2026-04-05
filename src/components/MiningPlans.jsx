import React from 'react';
import './MiningPlans.css';

const plans = [
  {
    name: 'STARTER',
    price: '$49.99',
    hashrate: '150 TH/s',
    duration: '5 Hours',
    fee: '$45.80'
  },
  {
    name: 'PRO',
    price: '$499.99',
    hashrate: '820 MH/s',
    duration: '5 Hours',
    fee: '$48.99',
    popular: true
  },
  {
    name: 'ELITE',
    price: '$1,999.99',
    hashrate: '1,900 GH/s',
    duration: '20 Hours',
    fee: '$1,999.99'
  }
];

const MiningPlans = () => {
  return (
    <div className="plans-grid">
      {plans.map((plan, index) => (
        <div key={index} className={`plan-card glass-card ${plan.popular ? 'popular' : ''}`}>
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
              <span className="info-label">Duration</span>
              <span className="info-value">{plan.duration}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Maintenance Fee</span>
              <span className="info-value">{plan.fee}</span>
            </div>
          </div>
          <button className="btn-outline plan-btn">Get Started</button>
        </div>
      ))}
    </div>
  );
};

export default MiningPlans;
