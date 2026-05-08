import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Registry from './components/Registry';
import Verification from './components/Verification';
import Explainer from './components/Explainer';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('onboarding');
  const [contributors, setContributors] = useState([]);

  const fetchContributors = async () => {
    try {
      const response = await axios.get(`${API_BASE}/registry/contributors`);
      setContributors(response.data);
    } catch (error) {
      console.error('Failed to fetch contributors:', error);
    }
  };

  useEffect(() => {
    fetchContributors();
  }, []);

  const tabs = [
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'registry', label: 'Registry' },
    { id: 'verification', label: 'PR Verification' },
    { id: 'explainer', label: 'How It Works' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-10 pt-8 sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-10 top-12 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute right-10 top-8 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
      </div>

      <header className="glass-panel animated-rise mx-auto max-w-7xl p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Identity Assurance Layer</p>
            <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">GitVeritas</h1>
          </div>
          <p className="max-w-md text-sm text-slate-300">
            DID/VC Contributor Verification Prototype
          </p>
        </div>
      </header>

      <nav className="glass-panel animated-rise mx-auto mt-6 max-w-7xl p-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-[0_10px_30px_rgba(255,255,255,0.25)]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto mt-8 max-w-7xl">
        {activeTab === 'onboarding' && <Onboarding onOnboard={fetchContributors} />}
        {activeTab === 'registry' && <Registry contributors={contributors} />}
        {activeTab === 'verification' && <Verification />}
        {activeTab === 'explainer' && <Explainer />}
      </main>
    </div>
  );
}

export default App;
