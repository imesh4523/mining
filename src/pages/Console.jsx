import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import './Console.css';

const Console = () => {
  const { activePlans, addEarnings, balance } = useUser();
  const [logs, setLogs] = useState([]);
  const [btcAllocation, setBtcAllocation] = useState(70);
  const [sessionHash, setSessionHash] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const logEndRef = useRef(null);

  // Initialize Session Hash properly
  useEffect(() => {
    let total = 0;
    activePlans.forEach(plan => {
      // Handle instances where hashrate is a range "1.0 - 5.0 GH/s" vs "150 MH/s"
      let val = 15; // default fallback
      if (plan.hashrate) {
         if (plan.hashrate.includes('-')) {
             val = parseFloat(plan.hashrate.split('-')[1].replace(/[^0-9.]/g, ''));
         } else {
             val = parseFloat(plan.hashrate.replace(/[^0-9.]/g, ''));
         }
      }
      
      // If it's GH/s we multiply by 1000 to display standard unit as MH/s
      if (plan.hashrate && plan.hashrate.includes('GH/s')) {
         val *= 1000; 
      }
      total += val;
    });
    setSessionHash(total > 0 ? total : 450);
  }, [activePlans]);

  // Handle Deployment Phase
  useEffect(() => {
    if (activePlans.length === 0) return;
    
    // Sort plans by newest
    const newestPlan = [...activePlans].sort((a, b) => b.activeSince - a.activeSince)[0];
    const timeSincePurchase = Date.now() - newestPlan.activeSince;
    // 3 minutes = 180,000 ms
    const deployDuration = 180000;
    
    if (timeSincePurchase < deployDuration) {
       setIsDeploying(true);
       setTimeLeft(Math.floor((deployDuration - timeSincePurchase) / 1000));
       
       const countdown = setInterval(() => {
          const newTimeSince = Date.now() - newestPlan.activeSince;
          const remaining = Math.floor((deployDuration - newTimeSince) / 1000);
          if (remaining <= 0) {
            setIsDeploying(false);
            clearInterval(countdown);
            // push success log
            const timestamp = new Date().toLocaleTimeString();
            setLogs(prev => [...prev.slice(-40), `[${timestamp}] DEPLOYMENT COMPLETE. Starting mining sequences...`]);
          } else {
            setTimeLeft(remaining);
          }
       }, 1000);
       return () => clearInterval(countdown);
    } else {
       setIsDeploying(false);
    }
  }, [activePlans]);

  // Formatting helper
  const formatHashrate = (hashInMH) => {
    if (hashInMH >= 1000000) {
      return (hashInMH / 1000000).toFixed(2) + ' TH/s';
    } else if (hashInMH >= 1000) {
      return (hashInMH / 1000).toFixed(2) + ' GH/s';
    }
    return hashInMH.toFixed(2) + ' MH/s';
  };

  // Earning Simulator
  useEffect(() => {
    if (activePlans.length === 0 || isDeploying) return;
    const interval = setInterval(() => {
       addEarnings(0.005 + (sessionHash * 0.00002));
    }, 2000);
    return () => clearInterval(interval);
  }, [activePlans, sessionHash, isDeploying, addEarnings]);

  // Log Simulator
  useEffect(() => {
    if (activePlans.length === 0) return;

    if (isDeploying) {
       const deployLogs = [
         "Allocating bare-metal server resources...",
         "Downloading node blockchain shards...",
         "Configuring GPU core voltages...",
         "Running thermal diagnostics...",
         "Establishing secure SSH tunnel...",
         "Pending blockchain synchronization...",
         `Verifying contract signatures [${timeLeft}s remaining]...`
       ];
       
       const generateDeployLog = () => {
         const randomMsg = deployLogs[Math.floor(Math.random() * deployLogs.length)];
         const timestamp = new Date().toLocaleTimeString();
         setLogs(prev => [...prev.slice(-40), `[${timestamp}] [DEPLOY] ${randomMsg}`]);
       };
       
       generateDeployLog(); // initial log
       const logInterval = setInterval(generateDeployLog, 4000);
       return () => clearInterval(logInterval);
    } else {
       const baseLogs = [
         "Stratum detecting new block...",
         "Accepted share [14ms]",
         "Target verified.",
         "Connection stable. Ping 24ms.",
         "Syncing node latency...",
         "New network difficulty broadcast received."
       ];

       const generateMiningLog = () => {
         const fluctuation = (Math.random() * (sessionHash * 0.03)).toFixed(2);
         const isPositive = Math.random() > 0.5;
         const currentHash = isPositive ? (sessionHash + parseFloat(fluctuation)) : (sessionHash - parseFloat(fluctuation));
         
         const dynamicHashtag = `Running SHA-256 algorithm at ${formatHashrate(currentHash)}...`;
         const allLogs = [...baseLogs, dynamicHashtag, dynamicHashtag, dynamicHashtag];
         const randomMsg = allLogs[Math.floor(Math.random() * allLogs.length)];
         const timestamp = new Date().toLocaleTimeString();
         setLogs(prev => [...prev.slice(-40), `[${timestamp}] ${randomMsg}`]);
       };

       const logInterval = setInterval(generateMiningLog, 1200);
       return () => clearInterval(logInterval);
    }
  }, [activePlans, sessionHash, isDeploying, timeLeft]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
    }
  }, [logs]);

  if (activePlans.length === 0) {
    return (
      <div className="container console-offline" style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--primary)', fontFamily: 'Montserrat, sans-serif' }}>CONSOLE OFFLINE</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>You have no active hardware deployments. Purchase a cloud contract to access the terminal.</p>
        <Link to="/#pricing" className="btn-primary" style={{ textDecoration: 'none' }}>Go to Market</Link>
      </div>
    );
  }

  return (
    <div className="console-page container">
      <div className="console-header">
        <h2 className="section-title">Live Mining Console</h2>
        <div className={`live-status ${isDeploying ? 'deploying' : ''}`}>
          <span className="status-dot"></span>
          <span>{isDeploying ? 'INSTALLING HARDWARE' : 'Rig Connection: ONLINE'}</span>
        </div>
      </div>

      <div className="console-grid">
        <div className="terminal-container glass-card">
          <div className="terminal-topbar">
            <div className="window-controls">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="terminal-title">crystal-mine-node.exe</div>
          </div>
          <div className="terminal-body" id="terminalScroll" ref={logEndRef}>
            {isDeploying && (
               <div className="deploying-banner">
                  <h3>SYSTEM DEPLOYMENT IN PROGRESS</h3>
                  <p>Estimated Time Remaining: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</p>
                  <div className="loading-bar"><div className="loading-fill" style={{ width: `${100 - (timeLeft / 180) * 100}%` }}></div></div>
               </div>
            )}
            {logs.map((log, i) => {
              let colorClass = "";
              if (log.includes("Accepted")) colorClass = "log-green";
              if (log.includes("Stratum")) colorClass = "log-blue";
              if (log.includes("[DEPLOY]") || log.includes("INIT")) colorClass = "log-yellow";
              if (log.includes("COMPLETE")) colorClass = "log-green-bold";
              return (
                <div key={i} className={`log-line ${colorClass}`}>{log}</div>
              );
            })}
          </div>
        </div>

        <div className="console-sidebar">
          <div className="stats-box glass-card">
            <h3>Live Session Stats</h3>
            <div className="stat-row">
              <span className="label">Total Generated</span>
              <span className="value text-primary">${balance.toFixed(4)}</span>
            </div>
            <div className="stat-row">
              <span className="label">Active Hashrate</span>
              <span className="value">⚡ {isDeploying ? '0.00 MH/s' : formatHashrate(sessionHash)}</span>
            </div>
            <div className="stat-row">
              <span className="label">Connected Rigs</span>
              <span className="value">{activePlans.length}</span>
            </div>
            <div className="stat-row">
              <span className="label">Status</span>
              <span className={`value ${isDeploying ? 'text-yellow' : 'text-green'}`}>{isDeploying ? 'Deploying' : 'Mining Active'}</span>
            </div>
          </div>

          <div className="allocation-box glass-card">
            <h3>Multi-Coin Hash Allocation</h3>
            <p className="allocation-desc">Smartly divide your contracted hashrate across different networks. Automatically updates worker configurations.</p>
            
            <div className="allocation-sliders">
              <div className="coin-slider btc-slider">
                <div className="slider-header">
                  <span className="coin-name">
                    <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" width="16" />
                    Bitcoin (SHA-256)
                  </span>
                  <span className="coin-percent">{btcAllocation}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={btcAllocation} 
                  onChange={(e) => setBtcAllocation(Number(e.target.value))}
                  className="range-slider"
                  disabled={isDeploying}
                />
              </div>

              <div className="coin-slider eth-slider">
                <div className="slider-header">
                  <span className="coin-name">
                    <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg" alt="ETH" width="16" />
                    Ethereum Classic (Etchash)
                  </span>
                  <span className="coin-percent">{100 - btcAllocation}%</span>
                </div>
                <div className="progress-bar-placeholder">
                   <div className="progress-fill" style={{ width: `${100 - btcAllocation}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Console;
