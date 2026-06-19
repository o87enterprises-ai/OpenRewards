import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RewardAdSlot from '../components/RewardAdSlot';

const Home = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const simulateSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 8000);
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold">OpenRewards Demo</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/rewards" className="text-emerald-400 hover:text-emerald-300">Rewards</Link>
          {isAuthenticated ? (
            <button onClick={logout} className="text-white/60 hover:text-white">
              Log out ({user.email})
            </button>
          ) : (
            <>
              <Link to="/login" className="text-white/60 hover:text-white">Log in</Link>
              <Link to="/register" className="text-white/60 hover:text-white">Register</Link>
            </>
          )}
        </div>
      </div>

      <p className="text-white/60 mb-6">
        This stands in for a real app's "results are loading" wait state — the exact moment a
        reward-eligible ad would be shown. Click below to simulate it, opt into Rewards from the{' '}
        <Link to="/rewards" className="text-blue-400 hover:text-blue-300">Rewards page</Link>, then
        watch the ad for a few seconds to see an honest reward land.
      </p>

      <button
        onClick={simulateSearch}
        disabled={loading}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold hover:opacity-90 transition-all disabled:opacity-50 mb-6"
      >
        {loading ? 'Searching...' : 'Simulate a search'}
      </button>

      {loading && <RewardAdSlot zone="demo-search-loading" />}
    </div>
  );
};

export default Home;
