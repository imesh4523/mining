import React from 'react';
import { motion } from 'framer-motion';
import miningRig from '../assets/mining_rig.png';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero container">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="hero-title">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
          >
            {"CLOUD MINING ".split("").map((char, index) => (
              <motion.span key={index} variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}>
                {char}
              </motion.span>
            ))}
            <br />
            <span className="highlight">
              {"MADE SIMPLE.".split("").map((char, index) => (
                <motion.span key={index} variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}>
                  {char}
                </motion.span>
              ))}
            </span>
          </motion.div>
        </h1>
        <div className="bonus-badge">
          <span className="bonus-icon">🎉</span>
          <span className="bonus-text">CLAIM $200 WELCOME BONUS</span>
        </div>
        <motion.p 
          className="hero-description"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.015, delayChildren: 1.5 } } }}
        >
          {"Start mining cryptocurrencies effortlessly using our state-of-the-art technology from home. Sign up today and instantly receive your welcome bonus to kickstart your earnings!".split("").map((char, index) => (
            <motion.span key={index} variants={{ hidden: { opacity: 0, y: 3 }, visible: { opacity: 1, y: 0 } }}>
              {char}
            </motion.span>
          ))}
        </motion.p>
        <div className="hero-actions">
          <button className="btn-primary">Get Started Now</button>
        </div>
      </motion.div>
      <motion.div 
        className="hero-animation-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <div className="css-rig">
          <div className="rig-glow-bg"></div>
          
          <div className="rig-platform">
            <div className="platform-grid"></div>
          </div>

          <div className="rig-tower">
            {[1, 2, 3, 4].map((item, index) => (
              <motion.div 
                className="gpu-blade" 
                key={index}
                animate={{ 
                  y: [0, -4, 0], 
                  boxShadow: ["0 0 10px rgba(255,214,10,0.1)", "0 0 20px rgba(255,214,10,0.3)", "0 0 10px rgba(255,214,10,0.1)"] 
                }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.4 }}
              >
                <div className="blade-lights">
                  <div className="light red blink-fast"></div>
                  <div className="light blue pulse-sync"></div>
                </div>
                <div className="cooling-spinner"></div>
                
                <div className={`crystal-mount pos-${index}`}>
                  <svg viewBox="0 0 100 150" className="mini-crystal">
                    <defs>
                      <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="40%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="#8a7300" />
                      </linearGradient>
                    </defs>
                    <polygon points="50,0 100,40 100,110 50,150 0,110 0,40" fill={`url(#grad-${index})`} opacity="0.9"/>
                    <polygon points="50,0 100,40 50,75" fill="rgba(255,255,255,0.7)"/>
                    <polygon points="50,0 0,40 50,75" fill="rgba(255,255,255,0.3)"/>
                    <polygon points="100,40 100,110 50,150 50,75" fill="rgba(0,0,0,0.2)"/>
                  </svg>
                </div>
              </motion.div>
            ))}

            <div className="rig-status-screen">
              <div className="screen-header">SYS_CORE // MINING_ACTIVE</div>
              <div className="screen-data">
                <span className="hash-label">HASHRATE</span>
                <span className="hash-value">1,900 GH/s</span>
              </div>
              <div className="spectrum-analyzer">
                {[...Array(12)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="bar"
                    animate={{ height: ['20%', '100%', '30%'] }}
                    transition={{ duration: 0.4 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
                  ></motion.div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="data-stream">
            {[...Array(10)].map((_, i) => (
              <div className={`data-particle dp-${i}`} key={i}></div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
