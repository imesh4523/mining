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
          CLOUD MINING <br />
          <span className="highlight">MADE SIMPLE.</span>
        </h1>
        <p className="hero-description">
          Start mining cryptocurrencies effortlessly using our 
          state-of-the-art technology from home.
        </p>
        <div className="hero-actions">
          <button className="btn-primary">Get Started</button>
        </div>
      </motion.div>
      <motion.div 
        className="hero-image-container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <img src={miningRig} alt="Mining Hardware" className="hero-image" />
        <div className="image-glow"></div>
      </motion.div>
    </section>
  );
};

export default Hero;
