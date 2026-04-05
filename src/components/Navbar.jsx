import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar container">
      <div className="logo-section">
        <div className="logo-icon"></div>
        <span className="logo-text">CRYSTAL MINE</span>
      </div>
      <ul className="nav-links">
        <li><a href="#">Dashboard</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">Hardware</a></li>
        <li><a href="#">About Us</a></li>
      </ul>
      <div className="nav-actions">
        <button className="btn-primary">Start Mining</button>
      </div>
    </nav>
  );
};

export default Navbar;
