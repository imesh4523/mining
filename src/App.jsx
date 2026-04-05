import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsTable from './components/StatsTable';
import MiningPlans from './components/MiningPlans';
import GpuPlans from './components/GpuPlans';
import AboutUs from './components/AboutUs';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <section id="hardware" className="stats-section container">
          <h2 className="section-title">Live Mining Statistics</h2>
          <StatsTable />
        </section>
        <section id="pricing" className="plans-section container">
          <h2 className="section-title">Cloud Packages</h2>
          <MiningPlans />
        </section>
        <section id="gpu-pricing" className="plans-section container" style={{ marginTop: '60px' }}>
          <h2 className="section-title">Dedicated GPU Mining</h2>
          <GpuPlans />
        </section>
        <section id="about" className="about-section container" style={{ marginTop: '80px', marginBottom: '80px'}}>
          <h2 className="section-title">About Us</h2>
          <AboutUs />
        </section>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 CRYSTAL MINE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
