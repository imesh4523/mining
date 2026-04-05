import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Profile.css';

const Profile = () => {
  const { balance, activePlans } = useUser();

  return (
    <div className="profile-page container">
      <div className="profile-header">
        <h2 className="section-title">User Dashboard</h2>
        <p className="subtitle">Manage your funds and active mining operations.</p>
      </div>

      <div className="dashboard-grid">
        <div className="wallet-card glass-card">
          <h3>Main Wallet</h3>
          <div className="balance-display">
            <span className="currency">$</span>
            <span className="amount">{balance.toFixed(2)}</span>
            <span className="currency-label">USD</span>
          </div>
          <div className="wallet-actions">
            <button className="btn-primary">Deposit Funds</button>
            <button className="btn-outline">Withdraw</button>
          </div>
        </div>

        <div className="plans-summary-card glass-card">
          <h3>Active Hashrate Status</h3>
          <div className="hashrate-display">
            <span className="icon">⚡</span>
            {activePlans.length > 0 ? (
              <span className="amount text-green">{activePlans.length} Rigs Active</span>
            ) : (
               <span className="amount">0 GH/s</span>
            )}
          </div>
          <p className="status-text">{activePlans.length > 0 ? 'Mining operations are nominal.' : 'No active contracts online.'}</p>
        </div>
      </div>

      <div className="active-plans-section">
        <h3>Your Mining Contracts</h3>
        {activePlans.length === 0 ? (
          <div className="empty-state glass-card">
            <p>You haven't purchased any mining hardware yet.</p>
            <Link to="/#pricing" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Browse Market</Link>
          </div>
        ) : (
          <div className="active-plans-grid">
            {activePlans.map((plan, index) => (
              <div key={index} className="active-plan-card glass-card">
                 <div className="plan-header">
                    <h4>{plan.gpu || plan.name}</h4>
                    <span className="status-badge pulse-green">
                      <span className="status-dot"></span> Active
                    </span>
                 </div>
                 <div className="plan-details">
                    <div className="detail">
                       <span className="label">Hashrate</span>
                       <span className="value">⚡ {plan.hashrate}</span>
                    </div>
                    <div className="detail">
                       <span className="label">Est. Daily Income</span>
                       <span className="value text-green">{plan.dailyEarning ? plan.dailyEarning.split('=')[1].trim() : plan.dailyProfit}</span>
                    </div>
                    <div className="detail">
                       <span className="label">Started On</span>
                       <span className="value text-light">{new Date(plan.activeSince).toLocaleDateString()}</span>
                    </div>
                 </div>
                 <Link to="/console" className="btn-outline view-console-btn" style={{ width: '100%', textAlign: 'center', display: 'block', boxSizing: 'border-box', marginTop: '20px' }}>
                   View Live Console
                 </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
