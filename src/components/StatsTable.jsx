import React from 'react';
import './StatsTable.css';

const statsData = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', price: '$69,870', hashrate: '150 TH/s', profit: '+$14.20', trend: 'up' },
  { id: 2, name: 'Ethereum', symbol: 'ETH', price: '$3,450', hashrate: '820 MH/s', profit: '+$9.15', trend: 'up' },
  { id: 3, name: 'Litecoin', symbol: 'LTC', price: '$85.30', hashrate: '22.1 GH/s', profit: '+$3.80', trend: 'up' },
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
                  <div className={`asset-icon ${asset.symbol.toLowerCase()}`}></div>
                  <div className="asset-info">
                    <span className="asset-name">{asset.name} - {asset.symbol}</span>
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
