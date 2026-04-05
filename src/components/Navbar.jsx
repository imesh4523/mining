import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar container">
      <div className="logo-section">
        <svg className="logo-crystal" width="32" height="32" viewBox="0 0 24 24" fill="var(--primary)">
          <path d="M12 2L4.5 9L12 22L19.5 9L12 2Z" />
          <path d="M12 2L8 9L12 15L16 9L12 2Z" opacity="0.5" fill="white" />
        </svg>
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
