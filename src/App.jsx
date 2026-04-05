import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Console from './pages/Console';
import Admin from './pages/Admin';
import { UserProvider } from './context/UserContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/console" element={<Console />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <footer className="footer">
            <div className="container">
              <p>&copy; 2026 CRYSTAL MINE. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
