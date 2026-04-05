import React from 'react';
import './GpuPlans.css';

const gpuData = [
  { price: '$5', gpu: 'GTX 1660 Ti', hashrate: '15 MH/s', roi: '3.0%', dailyEarning: '$0.15 + $0.20 = $0.35', twentyDay: '$7.00', monthTotal: '$10.50' },
  { price: '$15', gpu: 'RTX 3060', hashrate: '40 MH/s', roi: '4.0%', dailyEarning: '$0.60 + $0.20 = $0.80', twentyDay: '$16.00', monthTotal: '$24.00' },
  { price: '$45', gpu: 'RTX 3070', hashrate: '70 MH/s', roi: '4.6%', dailyEarning: '$2.07 + $0.20 = $2.27', twentyDay: '$45.40', monthTotal: '$68.10' },
  { price: '$99', gpu: 'RTX 3080', hashrate: '150 MH/s', roi: '4.9%', dailyEarning: '$4.85 + $0.20 = $5.05', twentyDay: '$101.00', monthTotal: '$151.50' },
  { price: '$250', gpu: 'RTX 4070', hashrate: '400 MH/s', roi: '5.0%', dailyEarning: '$12.50 + $0.20 = $12.70', twentyDay: '$254.00', monthTotal: '$381.00' },
  { price: '$499', gpu: 'RTX 4080', hashrate: '800 MH/s', roi: '5.0%', dailyEarning: '$24.95 + $0.20 = $25.15', twentyDay: '$503.00', monthTotal: '$754.50' },
  { price: '$999', gpu: 'RTX 4090', hashrate: '1.6 GH/s', roi: '5.1%', dailyEarning: '$50.94 + $0.20 = $51.14', twentyDay: '$1022.80', monthTotal: '$1534.20' },
  { price: '$1999', gpu: '2x RTX 4090', hashrate: '3.2 GH/s', roi: '5.2%', dailyEarning: '$103.94 + $0.20 = $104.14', twentyDay: '$2082.80', monthTotal: '$3124.20' }
];

const GpuPlans = () => {
  return (
    <div className="gpu-plans-list">
      {gpuData.map((plan, index) => (
        <div key={index} className="gpu-horizontal-card glass-card">
          
          <div className="gpu-card-section price-section">
            <h4>{plan.price}</h4>
            <span className="gpu-name">{plan.gpu}</span>
          </div>

          <div className="gpu-card-section divider hashrate-section">
            <span className="label">Hashrate</span>
            <span className="value">⚡ {plan.hashrate}</span>
          </div>

          <div className="gpu-card-section divider roi-section">
            <span className="label">Daily ROI</span>
            <span className="value highlight">{plan.roi}</span>
          </div>

          <div className="gpu-card-section divider earning-section">
            <span className="label">Daily Earning (w/ Bonus)</span>
            <span className="value">{plan.dailyEarning.split('=')[1].trim()}</span>
            <span className="sub-value">({plan.dailyEarning.split('=')[0].trim()})</span>
          </div>

          <div className="gpu-card-section divider total-section">
            <span className="label">20-Day Total</span>
            <span className="value">{plan.twentyDay}</span>
            <span className="badge">FULLY COVERED</span>
          </div>

          <div className="gpu-card-section divider monthly-section">
            <span className="label monthly-label">1 Month Total</span>
            <span className="value massive-value">{plan.monthTotal}</span>
          </div>

          <div className="gpu-card-section action-section">
            <button className="btn-buy-elegant">Select Plan</button>
          </div>

        </div>
      ))}
    </div>
  );
};

export default GpuPlans;
