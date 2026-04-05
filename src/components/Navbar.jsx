import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Navbar.css';

const Navbar = () => {
  const { balance } = useUser();

  return (
    <nav className="navbar container">
      <div className="logo-section">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg className="logo-crystal" width="32" height="32" viewBox="0 0 24 24" fill="var(--primary)">
            <path d="M12 2L4.5 9L12 22L19.5 9L12 2Z" />
            <path d="M12 2L8 9L12 15L16 9L12 2Z" opacity="0.5" fill="white" />
          </svg>
          <span className="logo-text">CRYSTAL MINE</span>
        </Link>
      </div>
      <ul className="nav-links">
        <li><a href="/#pricing">Cloud Plans</a></li>
        <li><a href="/#gpu-pricing">GPU Plans</a></li>
        <li><a href="/#hardware">Hardware</a></li>
        <li><a href="/#about">About Us</a></li>
      </ul>
      <div className="nav-actions">
        <div className="nav-balance">
           <span className="balance-label">Balance: </span>
           <span className="balance-amount">${balance.toFixed(2)}</span>
        </div>
        <Link to="/profile" className="profile-icon-link" aria-label="Profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>
        <a href="/#pricing" className="btn-primary" style={{ marginLeft: '15px' }}>Start Mining</a>
      </div>
    </nav>
  );
};

export default Navbar;
