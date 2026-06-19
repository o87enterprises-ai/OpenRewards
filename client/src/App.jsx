import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RewardsProvider } from './context/RewardsContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RewardsDashboard from './pages/RewardsDashboard';

const App = () => (
  <AuthProvider>
    <RewardsProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rewards" element={<RewardsDashboard />} />
      </Routes>
    </RewardsProvider>
  </AuthProvider>
);

export default App;
