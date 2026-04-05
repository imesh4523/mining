import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { balance, purchasePlan, addPlan } = useUser();
  const plan = location.state?.plan;
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrice, setCustomPrice] = useState(0);

  useEffect(() => {
    if (plan?.price) {
      if (plan.price.includes('-')) {
        const parts = plan.price.split('-');
        setCustomPrice(parseFloat(parts[0].replace(/[^0-9.]/g, '')));
      } else if (plan.price.includes('+')) {
        setCustomPrice(parseFloat(plan.price.replace(/[^0-9.]/g, '')));
      } else {
        setCustomPrice(parseFloat(plan.price.replace(/[^0-9.]/g, '')) || 99);
      }
    }
  }, [plan]);

  if (!plan) {
    return (
      <div className="container" style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>No Cloud Plan Selected</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Please return to the market and select a hardware package to proceed.</p>
        <button className="btn-primary" onClick={() => window.location.href = '/#pricing'}>Browse Plans</button>
      </div>
    );
  }

  let minPrice = 0;
  let maxPrice = 0;
  let isRange = false;

  if (plan.price.includes('-')) {
    isRange = true;
    const parts = plan.price.split('-');
    minPrice = parseFloat(parts[0].replace(/[^0-9.]/g, ''));
    maxPrice = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
  } else if (plan.price.includes('+')) {
    isRange = true;
    minPrice = parseFloat(plan.price.replace(/[^0-9.]/g, ''));
    maxPrice = minPrice * 10;
  } else {
    minPrice = parseFloat(plan.price.replace(/[^0-9.]/g, '')) || 99;
    maxPrice = minPrice;
  }
  
  // Calculate relative hashrate purely for display
  // E.g if range is 50-100, and user picks 75, we parse the basic hashrate string and visually scale it.
  let displayHashrate = plan.hashrate;
  if (isRange && plan.hashrate.includes('-')) {
    const hashParts = plan.hashrate.split('-');
    const minHash = parseFloat(hashParts[0].replace(/[^0-9.]/g, ''));
    const maxHash = parseFloat(hashParts[1].replace(/[^0-9.]/g, ''));
    const ratio = (customPrice - minPrice) / (maxPrice - minPrice) || 0;
    const calcHash = (minHash + (maxHash - minHash) * ratio).toFixed(1);
    const unit = plan.hashrate.includes('GH') ? 'GH/s' : 'MH/s';
    displayHashrate = `${calcHash} ${unit}`;
  } else if (isRange && plan.hashrate.includes('+')) {
    const minHash = parseFloat(plan.hashrate.replace(/[^0-9.]/g, ''));
    const calcHash = (minHash * (customPrice / minPrice)).toFixed(1);
    const unit = plan.hashrate.includes('GH') ? 'GH/s' : 'MH/s';
    displayHashrate = `${calcHash} ${unit}`;
  }

  const handlePurchase = () => {
    if (balance < customPrice) {
      alert("Insufficient Balance. Please deposit funds into your Main Wallet.");
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      if (purchasePlan(customPrice)) {
        // We override the plan hashrate string so Console correctly pulls the scaled hashrate
        addPlan({ ...plan, purchasePrice: customPrice, hashrate: displayHashrate });
        navigate('/console');
      }
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="checkout-page container">
      <div className="checkout-header text-center">
        <h2 className="section-title">Secure Checkout</h2>
        <p className="subtitle">Review your mining hardware contract before deployment.</p>
      </div>

      <div className="checkout-grid">
        <div className="order-summary glass-card">
          <h3>Contract Details</h3>
          
          <div className="summary-item">
            <span className="label">Package</span>
            <span className="value text-white">{plan.name || plan.gpu}</span>
          </div>
          
          <div className="summary-item">
            <span className="label">Allocated Hashrate</span>
            <span className="value text-green">⚡ {displayHashrate}</span>
          </div>
          
          <div className="summary-item">
            <span className="label">Estimated Daily ROI</span>
            <span className="value">{plan.dailyProfit || plan.roi}</span>
          </div>

          <div className="summary-item">
            <span className="label">Total Generated Return</span>
            <span className="value">{plan.roi || "Variable"}</span>
          </div>

          {isRange && (
             <div className="summary-item custom-price-selector" style={{ flexDirection: 'column', alignItems: 'stretch', background: 'rgba(255,214,10,0.05)', padding: '20px', borderRadius: '12px', marginTop: '15px' }}>
                <span className="label" style={{ marginBottom: '15px', color: '#fff', fontWeight: 'bold' }}>Investment Amount</span>
                <input 
                  type="range" 
                  min={minPrice} 
                  max={maxPrice} 
                  step="1"
                  value={customPrice} 
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  style={{ width: '100%', marginBottom: '15px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                   <span style={{ fontSize: '13px', color: '#888' }}>Min ${minPrice}</span>
                   <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '22px' }}>${customPrice}</span>
                   <span style={{ fontSize: '13px', color: '#888' }}>Max ${maxPrice}</span>
                </div>
             </div>
          )}

          <div className="divider"></div>

          <div className="summary-item total-row">
            <span className="label">Total Hardware Cost</span>
            <span className="value text-primary">${customPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-section glass-card">
          <h3>Payment Method</h3>
          
          <div className="payment-method-card active">
            <div className="method-info">
              <span className="method-icon">💼</span>
              <div>
                <h4>Main Wallet Balance</h4>
                <p>Instant deduction and deployment</p>
              </div>
            </div>
            <div className="method-balance text-right">
              <span className="amount">${balance.toFixed(2)}</span>
              <span className="currency">USD</span>
            </div>
          </div>

          <div className="payment-method-card disabled">
             <div className="method-info">
              <span className="method-icon">💳</span>
              <div>
                <h4>External Crypto Wallet</h4>
                <p>Connect MetaMask or TrustWallet (Coming Soon)</p>
              </div>
            </div>
          </div>

          {balance < customPrice && (
             <div className="insufficient-warning">
               <p>⚠️ Insufficient funds in Main Wallet. You are short ${(customPrice - balance).toFixed(2)}.</p>
               <Link to="/profile" className="btn-outline" style={{ display: 'inline-block', marginTop: '10px', fontSize: '11px', padding: '8px 16px' }}>Go to Deposit</Link>
             </div>
          )}

          <button 
            className="btn-primary btn-checkout" 
            onClick={handlePurchase}
            disabled={isProcessing || balance < customPrice}
          >
            {isProcessing ? 'Deploying Hardware...' : `Pay $${customPrice.toFixed(2)} & Deploy`}
          </button>
          
          <p className="secure-badge">
            <span className="icon">🛡️</span> SSL Encrypted Secure Server Connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
