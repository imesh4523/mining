import React, { useState, useEffect } from 'react';
import './StatsTable.css';

const getIconUrl = (symbol) => `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol.toLowerCase()}.svg`;

// Fixed display data per coin — hashrate & 24h profit are "platform stats" (same for all users)
const COIN_META = {
  BTC:  { name: 'Bitcoin',  hashrate: '150 TH/s',  profit24h: '+$14.20', cgId: 'bitcoin' },
  ETH:  { name: 'Ethereum', hashrate: '820 MH/s',  profit24h: '+$9.15',  cgId: 'ethereum' },
  USDT: { name: 'Tether',   hashrate: 'Network',   profit24h: '+$0.02',  cgId: 'tether' },
  TRX:  { name: 'TRON',     hashrate: '14 GH/s',   profit24h: '+$0.80',  cgId: 'tron' },
  LTC:  { name: 'Litecoin', hashrate: '22.1 GH/s', profit24h: '+$3.80',  cgId: 'litecoin' },
};

const SYMBOLS = ['BTC', 'ETH', 'USDT', 'TRX', 'LTC'];
const CG_IDS  = SYMBOLS.map(s => COIN_META[s].cgId).join(',');

const StatsTable = () => {
  const [prices, setPrices] = useState({});

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${CG_IDS}&vs_currencies=usd`
      );
      const data = await res.json();
      const mapped = {};
      SYMBOLS.forEach(sym => {
        const cgId = COIN_META[sym].cgId;
        if (data[cgId]) mapped[sym] = data[cgId].usd;
      });
      setPrices(mapped);
    } catch {
      // Keep previous prices on error
    }
  };

  useEffect(() => {
    fetchPrices();
    // Refresh every 60 seconds
    const iv = setInterval(fetchPrices, 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const formatPrice = (sym) => {
    const p = prices[sym];
    if (!p) return '—';
    if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (p >= 1)    return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <div className="stats-container glass-card">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Price</th>
            <th>Hashrate</th>
            <th>24H Profit</th>
          </tr>
        </thead>
        <tbody>
          {SYMBOLS.map(sym => {
            const meta = COIN_META[sym];
            return (
              <tr key={sym}>
                <td>
                  <div className="asset-cell">
                    <div className="asset-icon-wrapper">
                      <img src={getIconUrl(sym)} alt={sym} width="28" height="28" />
                    </div>
                    <div className="asset-info">
                      <span className="asset-name">{meta.name}</span>
                      <span style={{ fontSize: '10px', color: '#555', display: 'block' }}>{sym}</span>
                    </div>
                  </div>
                </td>
                <td className="price-cell">{formatPrice(sym)}</td>
                <td className="hashrate-cell">{meta.hashrate}</td>
                <td>
                  <div className="profit-cell">
                    <div className="sparkline">
                      <svg width="60" height="20" viewBox="0 0 60 20">
                        <path d="M0 15 L10 12 L20 16 L30 10 L40 14 L50 6 L60 8"
                          fill="none" stroke="var(--accent-green)" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="profit-text">{meta.profit24h}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
