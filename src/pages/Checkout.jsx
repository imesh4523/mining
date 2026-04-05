import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Checkout.css';

const CRYPTO_WALLETS = {
  'USDT': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'TRX': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { balance, purchasePlan, addPlan } = useUser();
  const plan = location.state?.plan;
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrice, setCustomPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [paymentStage, setPaymentStage] = useState('checkout'); // 'checkout' | 'crypto-gateway'
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');

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
  
  let initialHashrate = plan.hashrate;
  if (!initialHashrate && plan.gpu) {
     const match = plan.gpu.match(/\((.*?)\)/);
     if (match) initialHashrate = match[1];
  }

  let displayHashrate = initialHashrate;
  if (isRange && initialHashrate?.includes('-')) {
    const hashParts = initialHashrate.split('-');
    const minHash = parseFloat(hashParts[0].replace(/[^0-9.]/g, ''));
    const maxHash = parseFloat(hashParts[1].replace(/[^0-9.]/g, ''));
    const ratio = (customPrice - minPrice) / (maxPrice - minPrice) || 0;
    const calcHash = (minHash + (maxHash - minHash) * ratio).toFixed(1);
    const unit = initialHashrate.includes('GH') ? 'GH/s' : 'MH/s';
    displayHashrate = `${calcHash} ${unit}`;
  } else if (isRange && initialHashrate?.includes('+')) {
    const minHash = parseFloat(initialHashrate.replace(/[^0-9.]/g, ''));
    const calcHash = (minHash * (customPrice / minPrice)).toFixed(1);
    const unit = initialHashrate.includes('GH') ? 'GH/s' : 'MH/s';
    displayHashrate = `${calcHash} ${unit}`;
  }

  const handlePurchase = () => {
    if (paymentMethod === 'nowpayments') {
      setIsProcessing(true);
      setTimeout(() => {
        setPaymentStage('crypto-gateway');
        setIsProcessing(false);
      }, 1000);
      return;
    }

    if (balance < customPrice) {
      alert("Insufficient Balance. Please deposit funds into your Main Wallet.");
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      if (purchasePlan(customPrice)) {
        addPlan({ ...plan, purchasePrice: customPrice, hashrate: displayHashrate });
        navigate('/console');
      }
      setIsProcessing(false);
    }, 1500);
  };

  const handleCryptoPaymentSuccess = () => {
      // Simulating the user actually sending the crypto and our backend detecting it
      setIsProcessing(true);
      setTimeout(() => {
         // Add plan without deducting 'balance' since they paid via external crypto
         addPlan({ ...plan, purchasePrice: customPrice, hashrate: displayHashrate });
         navigate('/console');
      }, 2000);
  }

  if (paymentStage === 'crypto-gateway') {
    return (
      <div className="checkout-page container">
        <div className="checkout-header text-center">
          <h2 className="section-title">Crypto Payment Gateway</h2>
          <p className="subtitle">Send exactly the requested amount to the address below.</p>
        </div>
        
        <div className="crypto-gateway-card glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
           <div className="crypto-selector" style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
              {['USDT', 'TRX', 'BTC'].map(coin => (
                <button 
                  key={coin}
                  className={`btn-outline ${selectedCrypto === coin ? 'active-coin' : ''}`}
                  onClick={() => setSelectedCrypto(coin)}
                  style={{ 
                    background: selectedCrypto === coin ? 'rgba(255,214,10,0.1)' : 'transparent',
                    borderColor: selectedCrypto === coin ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    color: selectedCrypto === coin ? 'var(--primary)' : '#fff'
                  }}
                >
                  {coin === 'USDT' ? 'USDT (Polygon)' : coin}
                </button>
              ))}
           </div>
           
           <div className="payment-details" style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', marginBottom: '5px' }}>Amount to send</p>
              <h3 style={{ fontSize: '32px', color: '#fff', marginBottom: '20px' }}>
                {selectedCrypto === 'BTC' ? (customPrice / 65000).toFixed(6) : (selectedCrypto === 'TRX' ? (customPrice / 0.12).toFixed(2) : customPrice.toFixed(2))} <span style={{ fontSize: '16px', color: 'var(--primary)' }}>{selectedCrypto}</span>
              </h3>
              
              <div className="qr-container" style={{ background: '#fff', padding: '15px', borderRadius: '12px', display: 'inline-block', marginBottom: '25px' }}>
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${CRYPTO_WALLETS[selectedCrypto]}`} alt="QR Code" style={{ width: '200px', height: '200px' }} />
              </div>

              <div className="address-box" style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
                 <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>{selectedCrypto} Deposit Address</p>
                 <p style={{ fontFamily: 'monospace', color: '#fff', fontSize: '15px', letterSpacing: '1px', wordBreak: 'break-all' }}>{CRYPTO_WALLETS[selectedCrypto]}</p>
              </div>

              <div className="payment-status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                 <span className="status-dot" style={{ background: 'var(--accent-green)', width: '10px', height: '10px', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-green)', animation: 'blink 1s infinite' }}></span>
                 Awaiting network confirmation...
              </div>

              {/* Fake button for UX testing since there's no real backend webhook listening */}
              <button className="btn-primary" onClick={handleCryptoPaymentSuccess} style={{ width: '100%', marginTop: '30px' }} disabled={isProcessing}>
                 {isProcessing ? 'Verifying Block...' : 'Simulate Payment Success'}
              </button>
              <button className="btn-outline" onClick={() => setPaymentStage('checkout')} style={{ width: '100%', marginTop: '10px', border: 'none' }}>
                 Cancel & Go Back
              </button>
           </div>
        </div>
      </div>
    );
  }

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
          
          <div 
            className={`payment-method-card ${paymentMethod === 'wallet' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('wallet')}
            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
          >
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

          <div 
            className={`payment-method-card ${paymentMethod === 'nowpayments' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('nowpayments')}
            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
          >
             <div className="method-info">
              <span className="method-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://nowpayments.io/images/logo/logo-nowpayments-white.svg" alt="NOWPayments" style={{ width: '40px', height: 'auto', objectFit: 'contain' }} />
              </span>
              <div>
                <h4>Crypto Payment Gateway</h4>
                <p>Pay securely with USDT Polygon, TRX, or BTC</p>
              </div>
            </div>
          </div>

          {paymentMethod === 'wallet' && balance < customPrice && (
             <div className="insufficient-warning">
               <p>⚠️ Insufficient funds in Main Wallet. You are short ${(customPrice - balance).toFixed(2)}.</p>
               <Link to="/profile" className="btn-outline" style={{ display: 'inline-block', marginTop: '10px', fontSize: '11px', padding: '8px 16px' }}>Go to Deposit</Link>
             </div>
          )}

          <button 
            className="btn-primary btn-checkout" 
            onClick={handlePurchase}
            disabled={isProcessing || (paymentMethod === 'wallet' && balance < customPrice)}
          >
            {isProcessing ? 'Processing...' : (paymentMethod === 'nowpayments' ? `Pay $${customPrice.toFixed(2)} via Crypto` : `Pay $${customPrice.toFixed(2)} & Deploy`)}
          </button>
          
          <p className="secure-badge">
            <span className="icon">🛡️</span> {paymentMethod === 'nowpayments' ? 'Secured by Crypto Gateway Protocol' : 'SSL Encrypted Secure Server Connection'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
