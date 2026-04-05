import React from 'react';
import './StatsTable.css';

const getIconUrl = (symbol) => `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol.toLowerCase()}.svg`;

const CryptoIcons = {
  BTC: () => <img src={getIconUrl('btc')} alt="BTC" width="32" height="32" />,
  ETH: () => <img src={getIconUrl('eth')} alt="ETH" width="32" height="32" />,
  LTC: () => <img src={getIconUrl('ltc')} alt="LTC" width="32" height="32" />,
  USDT: () => <img src={getIconUrl('usdt')} alt="USDT" width="32" height="32" />,
  TRX: () => <img src={getIconUrl('trx')} alt="TRX" width="32" height="32" />
};

const statsData = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', price: '$69,870', hashrate: '150 TH/s', profit: '+$14.20', trend: 'up' },
  { id: 2, name: 'Ethereum', symbol: 'ETH', price: '$3,450', hashrate: '820 MH/s', profit: '+$9.15', trend: 'up' },
  { id: 3, name: 'Tether', symbol: 'USDT', price: '$1.00', hashrate: 'Network', profit: '+$0.02', trend: 'static' },
  { id: 4, name: 'TRON', symbol: 'TRX', price: '$0.12', hashrate: '14 GH/s', profit: '+$0.80', trend: 'up' },
  { id: 5, name: 'Litecoin', symbol: 'LTC', price: '$85.30', hashrate: '22.1 GH/s', profit: '+$3.80', trend: 'up' },
];

const StatsTable = () => {
  return (
    <div className="stats-container glass-card">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Price</th>
            <th>Hashrate</th>
            <th>24h Profit</th>
          </tr>
        </thead>
        <tbody>
          {statsData.map((asset) => (
            <tr key={asset.id}>
              <td>
                <div className="asset-cell">
                  <div className={`asset-icon-wrapper ${asset.symbol.toLowerCase()}`}>
                    {CryptoIcons[asset.symbol] ? CryptoIcons[asset.symbol]() : <span className="asset-symbol-icon">{asset.symbol[0]}</span>}
                  </div>
                  <div className="asset-info">
                    <span className="asset-name">{asset.name}</span>
                    <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>{asset.symbol}</span>
                  </div>
                </div>
              </td>
              <td className="price-cell">{asset.price}</td>
              <td className="hashrate-cell">{asset.hashrate}</td>
              <td>
                <div className="profit-cell">
                  <div className="sparkline">
                    <svg width="60" height="20" viewBox="0 0 60 20">
                      <path 
                        d="M0 15 L10 12 L20 16 L30 10 L40 14 L50 6 L60 8" 
                        fill="none" 
                        stroke="var(--accent-green)" 
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <span className="profit-text">{asset.profit}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
