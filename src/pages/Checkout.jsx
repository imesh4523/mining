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
  const [cryptoInvoiceData, setCryptoInvoiceData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(4 * 60 * 60);

  useEffect(() => {
    let timer;
    if (paymentStage === 'crypto-invoice' && timeLeft > 0 && cryptoInvoiceData) {
       timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [paymentStage, timeLeft, cryptoInvoiceData]);

  // 🔄 Poll payment status every 30s
  useEffect(() => {
    let pollInterval;
    if (paymentStage === 'crypto-invoice' && cryptoInvoiceData?.payment_id) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment/status/${cryptoInvoiceData.payment_id}`);
          const data = await res.json();
          if (data.payment_status === 'finished' || data.payment_status === 'confirmed') {
            clearInterval(pollInterval);
            addPlan({ ...plan, purchasePrice: customPrice, hashrate: displayHashrate });
            navigate('/console');
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 30000); // Check every 30 seconds
    }
    return () => clearInterval(pollInterval);
  }, [paymentStage, cryptoInvoiceData]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

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
        setPaymentStage('crypto-selection');
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
      setIsProcessing(true);
      setTimeout(() => {
         addPlan({ ...plan, purchasePrice: customPrice, hashrate: displayHashrate });
         navigate('/console');
      }, 2000);
  }

  const handleCopy = (text) => {
      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(() => alert('Address copied to clipboard!'));
      } else {
          // Fallback for non-HTTPS dev environments
          const textArea = document.createElement('textarea');
          textArea.value = text;
          // Move outside of screen to make it invisible
          textArea.style.position = 'absolute';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          try {
              document.execCommand('copy');
              alert('Address copied to clipboard (Fallback)!');
          } catch (error) {
              console.error('Fallback copy failed', error);
              alert('Failed to copy. Please select and copy manually.');
          }
          textArea.remove();
      }
  };

  const handleCoinSelection = async (coin) => {
    setSelectedCrypto(coin);
    setPaymentStage('crypto-invoice');
    setTimeLeft(4 * 60 * 60);
    
    // Optimistic fast render to instantly display QR and bypass API delay
    const fallbackAmount = coin === 'BTC' ? (customPrice / 65000).toFixed(6) : (coin === 'TRX' ? (customPrice / 0.12).toFixed(2) : customPrice.toFixed(2));
    setCryptoInvoiceData({
       pay_address: CRYPTO_WALLETS[coin],
       pay_amount: fallbackAmount,
       pay_currency: coin === 'USDT' ? 'USDTMATIC' : coin
    });

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_amount: customPrice,
          pay_currency: coin,
          device_id: localStorage.getItem('crystal_device_id')
        })
      });
      const data = await response.json();
      if (data.pay_address) {
         setCryptoInvoiceData(data); // Instantly overwrite with exact real API data silently
      } else {
         alert("NOWPayments API Error: " + (data.details?.message || data.error || 'Transaction rejected by Gateway'));
         setPaymentStage('checkout'); // Send them back to checkout
      }
    } catch (err) {
      console.error('Invoice creation error:', err);
    }
  };

  if (paymentStage === 'crypto-selection') {
    return (
      <div className="checkout-page container">
        <div className="checkout-header text-center">
          <h2 className="section-title">Select Payment Currency</h2>
          <p className="subtitle">Choose the cryptocurrency you wish to use for this payment.</p>
        </div>
        <div className="crypto-selection-container glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
           <h3 style={{color: '#fff', marginBottom: '30px', textAlign: 'center'}}>Hardware Cost: ${customPrice.toFixed(2)}</h3>
           <div style={{ display: 'grid', gap: '15px' }}>
              {['USDT', 'TRX', 'BTC'].map(coin => (
                 <div 
                   key={coin} 
                   className="coin-option-card"
                   onClick={() => handleCoinSelection(coin)}
                   style={{
                     display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', 
                     background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
                     transition: 'all 0.3s ease'
                   }}
                   onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(255,214,10,0.05)'; }}
                   onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                 >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                       {coin === 'USDT' && <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" alt="USDT" style={{width: 32}} />}
                       {coin === 'TRX' && <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/trx.svg" alt="TRX" style={{width: 32}} />}
                       {coin === 'BTC' && <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" style={{width: 32}} />}
                       <div>
                          <span style={{color: '#fff', fontWeight: 'bold', fontSize: '18px', display: 'block'}}>{coin === 'USDT' ? 'Tether' : (coin === 'TRX' ? 'Tron' : 'Bitcoin')}</span>
                          <span style={{color: '#888', fontSize: '13px'}}>{coin === 'USDT' ? 'Polygon Network' : (coin === 'TRX' ? 'TRC20 Network' : 'Bitcoin Network')}</span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           <button className="btn-outline" onClick={() => setPaymentStage('checkout')} style={{ width: '100%', marginTop: '30px' }}>Cancel Payment</button>
        </div>
      </div>
    );
  }

  if (paymentStage === 'crypto-invoice') {
    if (!cryptoInvoiceData) {
       return (
          <div className="checkout-page container text-center" style={{ paddingTop: '100px', minHeight: '60vh' }}>
             <h2 style={{color: '#fff'}}>Securely Generating Invoice...</h2>
             <p style={{color: '#888'}}>Connecting to blockchain gateway via NOWPayments API...</p>
             <div className="spinner" style={{ margin: '30px auto', border: '3px solid rgba(255,214,10,0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
          </div>
       );
    }

    return (
      <div className="checkout-page container">
        <div className="checkout-header text-center" style={{ marginBottom: '20px' }}>
          <h2 className="section-title" style={{ fontSize: '24px' }}>Awaiting Payment</h2>
          <p className="subtitle" style={{ fontSize: '14px' }}>Scan the QR code or copy the exact address below.</p>
        </div>
        
        <div className="crypto-invoice-card glass-card" style={{ maxWidth: '420px', margin: '0 auto', padding: '0', overflow: 'hidden' }}>
           <div style={{ background: 'rgba(255,214,10,0.08)', padding: '20px 15px', textAlign: 'center', borderBottom: '1px solid rgba(255,214,10,0.2)' }}>
              <p style={{ color: '#aaa', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Send Exactly</p>
              <h3 style={{ fontSize: '28px', color: '#fff', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Montserrat, sans-serif' }}>
                 {cryptoInvoiceData.pay_amount}
                <span style={{ fontSize: '14px', color: 'var(--primary)' }}>{cryptoInvoiceData.pay_currency.replace(/matic|trc20/gi, '').toUpperCase()}</span>
              </h3>
           </div>
           
           <div style={{ padding: '25px 20px', textAlign: 'center' }}>
              <div className="qr-container" style={{ background: '#fff', padding: '10px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px' }}>
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${cryptoInvoiceData.pay_address}`} alt="QR Code" style={{ width: '150px', height: '150px' }} />
              </div>

              <div className="address-box" style={{ textAlign: 'left', marginBottom: '20px' }}>
                 <p style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>Deposit Address</p>
                 <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 14px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'monospace', color: '#fff', fontSize: '12px', wordBreak: 'break-all', marginRight: '10px' }}>{cryptoInvoiceData.pay_address}</span>
                    <button style={{ background: 'rgba(255,214,10,0.1)', border: '1px solid rgba(255,214,10,0.3)', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', flexShrink: 0 }} onClick={() => handleCopy(cryptoInvoiceData.pay_address)}>COPY</button>
                 </div>
              </div>

              <div className="timer-box" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'blink 1.5s infinite' }}></div>
                    <span style={{ fontSize: '13px', color: '#bbb' }}>Awaiting Deposit...</span>
                 </div>
                 <span style={{ fontFamily: 'monospace', color: '#fff', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>{formatTime(timeLeft)}</span>
              </div>
              

              
              <br/>
              <button style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', marginTop: '5px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setPaymentStage('crypto-selection')}>
                 Change Payment Coin
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
              <span className="method-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '50%' }}>
                 <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" alt="USDT" style={{width: 16}} />
                 <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/trx.svg" alt="TRX" style={{width: 16}} />
                 <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" style={{width: 16}} />
              </span>
              <div>
                <h4>Direct Crypto Deposit</h4>
                <p>Pay anonymously using USDT, TRX, or BTC</p>
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
