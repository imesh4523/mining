import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsTable from './components/StatsTable';
import MiningPlans from './components/MiningPlans';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <section className="stats-section container">
          <h2 className="section-title">Live Mining Statistics</h2>
          <StatsTable />
        </section>
        <section className="plans-section container">
          <h2 className="section-title">Mining Plans</h2>
          <MiningPlans />
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
