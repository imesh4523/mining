import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Generate unique ID to mock a logged-in user session in MongoDB
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('crystal_device_id');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('crystal_device_id', id);
    }
    return id;
  });

  // Use localStorage for persistence across reloads
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('crystal_balance');
    return saved !== null ? parseFloat(saved) : 1500.00;
  });
  
  const [activePlans, setActivePlans] = useState(() => {
    const saved = localStorage.getItem('crystal_plans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('crystal_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('crystal_plans', JSON.stringify(activePlans));
  }, [activePlans]);

  // Sync state to MongoDB Server
  useEffect(() => {
    fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, balance, activePlans })
    }).catch(err => console.log('Database sync offline: Run node server.js'));
  }, [balance, activePlans, deviceId]);

  // Increment balance (triggered by Mining Console)
  const addEarnings = (amount) => {
    setBalance(prev => prev + amount);
  };

  // Deduct balance when purchasing
  const purchasePlan = (planCost) => {
    if (balance >= planCost) {
      setBalance(prev => prev - planCost);
      return true;
    }
    return false;
  };

  const addPlan = (plan) => {
    setActivePlans(prev => [...prev, { ...plan, activeSince: Date.now(), id: Date.now() }]);
  };

  return (
    <UserContext.Provider value={{ balance, setBalance, activePlans, addEarnings, purchasePlan, addPlan }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
