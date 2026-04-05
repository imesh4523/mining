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

      <div className="settings-section">
        <h3>Account & Security Settings</h3>
        <div className="settings-grid">
            <div className="security-card glass-card">
               <h4>Change Password</h4>
               <p className="setting-desc">Keep your crystal mining account secure.</p>
               <form className="password-form" onSubmit={async (e) => { 
                   e.preventDefault(); 
                   const currentPass = e.target[0].value;
                   const newPass = e.target[1].value;
                   
                   try {
                     const deviceId = localStorage.getItem('crystal_device_id');
                     const res = await fetch('http://localhost:5000/api/user/password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deviceId, currentPassword: currentPass, newPassword: newPass })
                     });
                     
                     const data = await res.json();
                     if (res.ok) {
                        alert(`MongoDB Success: ${data.message}`);
                        e.target.reset();
                     } else {
                        alert(`Database Error: ${data.error}`);
                     }
                   } catch (err) {
                      alert('Server Error: Database connection refused. Ensure backend is running.');
                   }
               }}>
                  <input type="password" placeholder="Current Password (Default: 123456)" required className="auth-input" />
                  <input type="password" placeholder="New Password" required className="auth-input" />
                  <button type="submit" className="btn-outline">Save New Password</button>
               </form>
            </div>
            
            <div className="security-card glass-card">
               <h4>Two-Factor Authentication (2FA)</h4>
               <p className="setting-desc">Add an extra layer of structural security to your withdrawals via Google Authenticator.</p>
               <div className="two-fa-status">
                 <span className="status-badge disabled">Disabled</span>
               </div>
               <button className="btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Enable 2FA Security</button>
            </div>
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
