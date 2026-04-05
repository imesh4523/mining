import React from 'react';
import { motion } from 'framer-motion';
import './AboutUs.css';

const AboutUs = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="about-container glass-card"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="about-header text-center">
        <h3 className="about-vision">"Redefining Cloud Mining with Absolute Transparency."</h3>
        <p className="about-subtitle">Who We Are</p>
      </div>

      <motion.div className="about-content" variants={itemVariants}>
        <p>
          Welcome to <span className="highlight">CRYSTAL MINE</span>, a professional cryptocurrency mining enterprise built on the foundation of transparency and cutting-edge technology. We are an infrastructure platform bridging the gap between everyday users and high-performance Blockchain processing. Our mission is to make cryptocurrency mining accessible, secure, and profitable for everyone, without the complexities of purchasing, maintaining, or cooling expensive hardware.
        </p>

        <h4 className="about-subheading">The CRYSTAL MINE Difference: Why Choose Us?</h4>
        <p>
          We understand that the cloud mining space can sometimes be difficult to navigate, with many platforms making unrealistic promises. We do things differently. Our business model is backed by real, verifiable hardware located in our advanced data centers.
        </p>

        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Locked.png" alt="Lock" width="48" height="48" />
            </div>
            <div className="feature-text">
              <h5>Verifiable Hardware Infrastructure</h5>
              <p>You aren't investing in virtual numbers. We operate real fleets of high-end Antminer ASIC machines and the latest NVIDIA RTX 40-Series GPU rigs. Your contracts represent actual computing power.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Bar%20Chart.png" alt="Chart" width="48" height="48" />
            </div>
            <div className="feature-text">
              <h5>Real-Time Transparency</h5>
              <p>We believe you should see exactly what your investment is doing. Our intuitive dashboard provides real-time statistics on your assigned hashrate, rig temperature, and daily coin generation.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gear.png" alt="Gear" width="48" height="48" />
            </div>
            <div className="feature-text">
              <h5>Smart Mining Algorithms</h5>
              <p>We don't just mine one coin. Our intelligent systems automatically switch our computational power to the most profitable cryptocurrency network at any given moment, ensuring our users receive the highest possible daily returns.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" alt="Shield" width="48" height="48" />
            </div>
            <div className="feature-text">
              <h5>Institutional-Grade Security</h5>
              <p>The safety of your funds and personal data is our highest priority. We utilize cold wallet storage for the majority of generated assets, alongside advanced DDoS protection and strict SSL encryption protocols.</p>
            </div>
          </div>
        </div>

        <div className="about-commitment">
          <h4 className="about-subheading">Our Commitment</h4>
          <p>
            We operate with a strict "No Hidden Fees" policy. What you see is exactly what you get. Our dedicated 24/7 support team is always available to assist you with any questions. Join <span className="highlight">CRYSTAL MINE</span> today, and start building your digital wealth with a partner you can trust.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutUs;
