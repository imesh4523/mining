import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Profile.css';

const Profile = () => {
  const { balance, activePlans, setBalance } = useUser();

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState(null); // {type: 'success'|'error', msg: ''}
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const deviceId = localStorage.getItem('crystal_device_id');

  useEffect(() => {
    if (!deviceId) return;
    fetch(`/api/withdrawal/history/${deviceId}`)
      .then(res => res.json())
      .then(data => { setWithdrawHistory(Array.isArray(data) ? data : []); setHistoryLoading(false); })
      .catch(() => setHistoryLoading(false));
  }, [withdrawStatus]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawStatus(null);
    const amount = parseFloat(withdrawAmount);
    if (!withdrawAddress.trim()) return setWithdrawStatus({ type: 'error', msg: 'Please enter a valid wallet address.' });
    if (isNaN(amount) || amount < 10) return setWithdrawStatus({ type: 'error', msg: 'Minimum withdrawal is $10.' });
    if (amount > balance) return setWithdrawStatus({ type: 'error', msg: 'Insufficient balance.' });

    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, amount, currency: withdrawCurrency, walletAddress: withdrawAddress })
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawStatus({ type: 'success', msg: `✅ Withdrawal of $${amount.toFixed(2)} submitted! Your request will be processed within 24 hours.` });
        if (data.newBalance !== undefined && setBalance) setBalance(data.newBalance);
        setWithdrawAmount('');
        setWithdrawAddress('');
      } else {
        setWithdrawStatus({ type: 'error', msg: `❌ ${data.error}` });
      }
    } catch {
      setWithdrawStatus({ type: 'error', msg: '❌ Server connection failed. Ensure backend is running.' });
    }
    setWithdrawLoading(false);
  };

  const QUICK_AMOUNTS = [25, 50, 100, 250, 500];
  const COINS = [
    { symbol: 'USDT', label: 'Tether (TRC20)', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg' },
    { symbol: 'TRX', label: 'Tron', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/trx.svg' },
    { symbol: 'BTC', label: 'Bitcoin', icon: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg' },
  ];

  const STATUS_STYLES = {
    pending:  { color: '#f0a500', bg: 'rgba(240,165,0,0.1)', border: 'rgba(240,165,0,0.3)' },
    approved: { color: '#37d67a', bg: 'rgba(55,214,122,0.1)', border: 'rgba(55,214,122,0.3)' },
    rejected: { color: '#ff3366', bg: 'rgba(255,51,102,0.1)', border: 'rgba(255,51,102,0.3)' },
  };

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

      {/* ===== WITHDRAWAL SECTION ===== */}
      <div className="withdrawal-section">
        <h3>Withdraw Funds</h3>
        <div className="withdrawal-grid">
          <div className="withdraw-form-card glass-card">
            <form onSubmit={handleWithdraw}>
              {/* Coin selector */}
              <div className="withdraw-label">Select Coin</div>
              <div className="coin-selector-row">
                {COINS.map(c => (
                  <div
                    key={c.symbol}
                    className={`coin-chip ${withdrawCurrency === c.symbol ? 'selected' : ''}`}
                    onClick={() => setWithdrawCurrency(c.symbol)}
                  >
                    <img src={c.icon} alt={c.symbol} className="coin-chip-icon" />
                    <span>{c.symbol}</span>
                  </div>
                ))}
              </div>

              {/* Amount */}
              <div className="withdraw-label" style={{ marginTop: '20px' }}>Amount (USD)</div>
              <div className="amount-input-row">
                <span className="amount-prefix">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="10"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="auth-input amount-input"
                  required
                />
              </div>
              <div className="quick-amounts">
                {QUICK_AMOUNTS.map(a => (
                  <button key={a} type="button" className="quick-btn" onClick={() => setWithdrawAmount(a)}>${a}</button>
                ))}
                <button type="button" className="quick-btn" onClick={() => setWithdrawAmount(balance.toFixed(2))}>MAX</button>
              </div>

              {/* Wallet address */}
              <div className="withdraw-label" style={{ marginTop: '20px' }}>{withdrawCurrency} Wallet Address</div>
              <input
                type="text"
                placeholder={`Enter your ${withdrawCurrency} wallet address`}
                value={withdrawAddress}
                onChange={e => setWithdrawAddress(e.target.value)}
                className="auth-input"
                required
              />

              {withdrawStatus && (
                <div className={`withdraw-status-msg ${withdrawStatus.type}`}>
                  {withdrawStatus.msg}
                </div>
              )}

              <button type="submit" className="btn-buy" disabled={withdrawLoading} style={{ marginTop: '20px' }}>
                {withdrawLoading ? 'Submitting...' : `Withdraw $${parseFloat(withdrawAmount || 0).toFixed(2)} in ${withdrawCurrency}`}
              </button>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                🛡️ Minimum withdrawal: $10 · Processed within 24h
              </p>
            </form>
          </div>

          {/* History */}
          <div className="withdraw-history-card glass-card">
            <h4>Withdrawal History</h4>
            {historyLoading ? (
              <p style={{ color: '#666', fontSize: '14px' }}>Loading history...</p>
            ) : withdrawHistory.length === 0 ? (
              <div className="empty-history">
                <span style={{ fontSize: '32px' }}>📭</span>
                <p>No withdrawals yet.</p>
              </div>
            ) : (
              <div className="history-list">
                {withdrawHistory.map(w => {
                  const s = STATUS_STYLES[w.status] || STATUS_STYLES.pending;
                  return (
                    <div key={w.id} className="history-item">
                      <div className="history-item-left">
                        <span className="history-currency">{w.currency}</span>
                        <span className="history-address">{w.wallet_address.slice(0,12)}...{w.wallet_address.slice(-6)}</span>
                        <span className="history-date">{new Date(w.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="history-item-right">
                        <span className="history-amount">-${parseFloat(w.amount).toFixed(2)}</span>
                        <span className="history-status" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                          {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
                     const res = await fetch('/api/user/password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deviceId, currentPassword: currentPass, newPassword: newPass })
                     });
                     const data = await res.json();
                     if (res.ok) { alert(`✅ ${data.message}`); e.target.reset(); }
                     else alert(`❌ ${data.error}`);
                   } catch { alert('Server Error: Backend connection failed.'); }
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


