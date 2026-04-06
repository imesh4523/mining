import React, { useState, useEffect } from 'react';

const ADMIN_SECRET = 'crystal_admin_2026';
const API = '';

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [inputSecret, setInputSecret] = useState('');
  const [tab, setTab] = useState('users');

  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [settings, setSettings] = useState([]);

  const [editBalance, setEditBalance] = useState({});
  const [newSetting, setNewSetting] = useState({ key: '', value: '' });
  const [settingMsg, setSettingMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const login = () => {
    if (inputSecret === ADMIN_SECRET) setAuthed(true);
    else alert('Wrong secret key');
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API}/api/admin/users?secret=${ADMIN_SECRET}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
  };

  const loadPayments = async () => {
    try {
      const res = await fetch(`${API}/api/admin/payments?secret=${ADMIN_SECRET}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setPayments(list);
    } catch { setPayments([]); }
  };

  const loadWithdrawals = async () => {
    try {
      const res = await fetch(`${API}/api/admin/withdrawals?secret=${ADMIN_SECRET}`);
      const data = await res.json();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch { setWithdrawals([]); }
  };

  const loadPurchases = async () => {
    try {
      const res = await fetch(`${API}/api/admin/purchases?secret=${ADMIN_SECRET}`);
      const data = await res.json();
      setPurchases(Array.isArray(data) ? data : []);
    } catch { setPurchases([]); }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings?secret=${ADMIN_SECRET}`);
      const data = await res.json();
      setSettings(Array.isArray(data) ? data : []);
    } catch { setSettings([]); }
  };

  useEffect(() => {
    if (authed) {
      loadUsers();
      loadPayments();
      loadWithdrawals();
      loadPurchases();
      loadSettings();
    }
  }, [authed]);

  const updateBalance = async (userId, bal) => {
    try {
      await fetch(`${API}/api/admin/user/${userId}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: ADMIN_SECRET, balance: parseFloat(bal) })
      });
      loadUsers();
      alert('Balance updated!');
    } catch { alert('Failed to update balance'); }
  };

  const updateWithdrawal = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/admin/withdrawal/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: ADMIN_SECRET, status })
      });
      if (res.ok) { loadWithdrawals(); loadUsers(); }
      else alert('Failed to update withdrawal');
    } catch { alert('Server error'); }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const saveSetting = async () => {
    if (!newSetting.key || !newSetting.value) { alert('Both fields required'); return; }
    try {
      await fetch(`${API}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: ADMIN_SECRET, key: newSetting.key, value: newSetting.value })
      });
      setSettingMsg('Saved!');
      setNewSetting({ key: '', value: '' });
      loadSettings();
      setTimeout(() => setSettingMsg(''), 3000);
    } catch { alert('Failed to save setting'); }
  };

  const statusColor = (s) => {
    if (!s) return '#888';
    if (s === 'finished' || s === 'confirmed' || s === 'approved') return '#37d67a';
    if (s === 'waiting' || s === 'pending') return '#ffd60a';
    if (s === 'rejected') return '#ff3366';
    return '#888';
  };

  const TABS = [
    { id: 'users', label: '👥 Users' },
    { id: 'withdrawals', label: '💸 Withdrawals' },
    { id: 'purchases', label: '🛒 Purchases' },
    { id: 'payments', label: '💳 Payments' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  // ---- LOGIN ----
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', paddingTop: '80px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '50px 40px', textAlign: 'center', width: '100%', maxWidth: '380px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
          <h2 style={{ color: '#fff', marginBottom: '8px', fontFamily: 'Montserrat, sans-serif' }}>Admin Access</h2>
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>Crystal Mine Control Panel</p>
          <input
            type="password"
            placeholder="Admin Secret Key"
            value={inputSecret}
            onChange={e => setInputSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }}
          />
          <button onClick={login} style={{ width: '100%', padding: '14px', background: '#ffd60a', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
            Login
          </button>
        </div>
      </div>
    );
  }

  // ---- DASHBOARD ----
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '100px 20px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ color: '#ffd60a', fontFamily: 'Montserrat, sans-serif', margin: 0, fontSize: '28px' }}>⚙ Admin Dashboard</h1>
            <p style={{ color: '#555', margin: '6px 0 0', fontSize: '13px' }}>Crystal Mine Control Panel</p>
          </div>
          <span style={{ background: 'rgba(55,214,122,0.1)', color: '#37d67a', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>● LIVE</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: '700',
              background: tab === t.id ? '#ffd60a' : 'rgba(255,255,255,0.05)',
              color: tab === t.id ? '#000' : '#888',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ======= USERS TAB ======= */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', margin: 0 }}>All Users ({users.length})</h3>
              <button onClick={loadUsers} style={refreshBtn}>↻ Refresh</button>
            </div>
            {users.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No users found</p>}
            {users.map(user => {
              let plans = [];
              try { plans = JSON.parse(user.active_plans || '[]'); } catch {}
              return (
                <div key={user.id} style={card}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>#{user.id} — {user.device_id}</div>
                    <div style={{ color: '#37d67a', fontWeight: '700', fontSize: '20px' }}>${parseFloat(user.balance || 0).toFixed(2)}</div>
                    <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>{plans.length} Active Plan(s)</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="number"
                      placeholder="New balance"
                      value={editBalance[user.id] || ''}
                      onChange={e => setEditBalance(prev => ({ ...prev, [user.id]: e.target.value }))}
                      style={inputStyle}
                    />
                    <button onClick={() => updateBalance(user.id, editBalance[user.id])} style={actionBtn('#ffd60a', '#000')}>
                      Set Balance
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======= WITHDRAWALS TAB ======= */}
        {tab === 'withdrawals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Withdrawal Requests ({withdrawals.length})</h3>
              <button onClick={loadWithdrawals} style={refreshBtn}>↻ Refresh</button>
            </div>
            {withdrawals.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No withdrawal requests</p>}
            {withdrawals.map(w => (
              <div key={w.id} style={{ ...card, flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>#{w.id} — {w.device_id}</div>
                    <div style={{ color: '#ffd60a', fontWeight: '800', fontSize: '20px', margin: '4px 0' }}>${parseFloat(w.amount).toFixed(2)} <span style={{ color: '#888', fontSize: '13px', fontWeight: '400' }}>{w.currency}</span></div>
                    <div style={{ color: '#555', fontSize: '11px' }}>{new Date(w.created_at).toLocaleString()}</div>
                  </div>
                  <span style={{ color: statusColor(w.status), background: `${statusColor(w.status)}22`, border: `1px solid ${statusColor(w.status)}55`, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                    {w.status?.toUpperCase()}
                  </span>
                </div>

                {/* Wallet Address Row */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ color: '#555', fontSize: '10px', marginBottom: '4px' }}>WALLET ADDRESS ({w.currency})</div>
                    <div style={{ color: '#ddd', fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{w.wallet_address}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(w.wallet_address, w.id)}
                    style={{ padding: '8px 14px', background: copiedId === w.id ? 'rgba(55,214,122,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copiedId === w.id ? '#37d67a' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: copiedId === w.id ? '#37d67a' : '#aaa', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                  >
                    {copiedId === w.id ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>

                {/* Approve / Reject */}
                {w.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => updateWithdrawal(w.id, 'approved')} style={{ ...actionBtn('#37d67a', '#000'), flex: 1 }}>
                      ✅ Approve
                    </button>
                    <button onClick={() => updateWithdrawal(w.id, 'rejected')} style={{ ...actionBtn('#ff3366', '#fff'), flex: 1 }}>
                      ❌ Reject (Refund)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ======= PURCHASES TAB ======= */}
        {tab === 'purchases' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Purchase History ({purchases.length})</h3>
              <button onClick={loadPurchases} style={refreshBtn}>↻ Refresh</button>
            </div>
            {purchases.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No purchases found</p>}
            {purchases.map((p, i) => (
              <div key={p.payment_id || i} style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={cellLabel}>PAYMENT ID</div>
                  <div style={cellValue}>{p.payment_id}</div>
                  <div style={{ color: '#555', fontSize: '11px', marginTop: '4px' }}>{p.order_id}</div>
                </div>
                <div>
                  <div style={cellLabel}>AMOUNT</div>
                  <div style={{ ...cellValue, color: '#ffd60a', fontSize: '18px' }}>${p.price_amount} <span style={{ color: '#888', fontSize: '11px' }}>USD</span></div>
                  <div style={{ color: '#888', fontSize: '11px' }}>{p.pay_amount} {(p.pay_currency || '').toUpperCase()}</div>
                </div>
                <div>
                  <div style={cellLabel}>STATUS</div>
                  <span style={{ color: statusColor(p.payment_status), fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>● {p.payment_status}</span>
                </div>
                <div>
                  <div style={cellLabel}>DATE</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>{p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======= PAYMENTS TAB ======= */}
        {tab === 'payments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', margin: 0 }}>NOWPayments Record ({payments.length})</h3>
              <button onClick={loadPayments} style={refreshBtn}>↻ Refresh</button>
            </div>
            {payments.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No payments found</p>}
            {payments.map((p, i) => (
              <div key={p.payment_id || i} style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={cellLabel}>PAYMENT ID</div>
                  <div style={cellValue}>{p.payment_id}</div>
                </div>
                <div>
                  <div style={cellLabel}>AMOUNT</div>
                  <div style={{ ...cellValue, color: '#ffd60a' }}>${p.price_amount}</div>
                  <div style={{ color: '#888', fontSize: '11px' }}>{p.pay_amount} {(p.pay_currency || '').toUpperCase()}</div>
                </div>
                <div>
                  <div style={cellLabel}>STATUS</div>
                  <span style={{ color: statusColor(p.payment_status), fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>● {p.payment_status}</span>
                </div>
                <div>
                  <div style={cellLabel}>DATE</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>{p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======= SETTINGS TAB ======= */}
        {tab === 'settings' && (
          <div>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>System Settings</h3>
            <div style={{ background: 'rgba(255,214,10,0.05)', border: '1px solid rgba(255,214,10,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <h4 style={{ color: '#ffd60a', margin: '0 0 8px' }}>📱 Telegram IPN Setup</h4>
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                Set <code style={{ color: '#ffd60a' }}>telegram_bot_token</code> and <code style={{ color: '#ffd60a' }}>telegram_chat_id</code> below to receive instant payment alerts.<br />
                NOWPayments Webhook URL: <code style={{ color: '#37d67a' }}>https://YOUR-SERVER/api/payment/webhook</code>
              </p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              {settings.map(s => (
                <div key={s.key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <code style={{ color: '#ffd60a', fontSize: '13px' }}>{s.key}</code>
                  <span style={{ color: s.value ? '#888' : '#444', fontSize: '12px', fontFamily: 'monospace' }}>{s.value ? s.value.substring(0, 30) + (s.value.length > 30 ? '...' : '') : 'Not set'}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
              <h4 style={{ color: '#fff', marginBottom: '16px', marginTop: 0 }}>Update / Add Setting</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '14px' }}>
                <input placeholder="Key" value={newSetting.key} onChange={e => setNewSetting(p => ({ ...p, key: e.target.value }))} style={inputStyle} />
                <input placeholder="Value" value={newSetting.value} onChange={e => setNewSetting(p => ({ ...p, value: e.target.value }))} style={inputStyle} />
              </div>
              <button onClick={saveSetting} style={actionBtn('#ffd60a', '#000')}>Save Setting</button>
              {settingMsg && <span style={{ marginLeft: '16px', color: '#37d67a', fontSize: '13px' }}>✅ {settingMsg}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Shared styles ----
const card = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
  padding: '20px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
  marginBottom: '12px',
};

const refreshBtn = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#888',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '12px',
};

const inputStyle = {
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  width: '140px',
};

const actionBtn = (bg, color) => ({
  padding: '9px 18px',
  background: bg,
  border: 'none',
  borderRadius: '8px',
  fontWeight: '700',
  cursor: 'pointer',
  fontSize: '12px',
  color,
});

const cellLabel = { color: '#555', fontSize: '11px', marginBottom: '4px' };
const cellValue = { color: '#fff', fontWeight: '700', fontSize: '14px' };

export default Admin;
