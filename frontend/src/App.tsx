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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">GitVeritas</h1>
            <p className="text-sm text-gray-600">DID/VC Contributor Verification Prototype</p>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'onboarding' && <Onboarding onOnboard={fetchContributors} />}
          {activeTab === 'registry' && <Registry contributors={contributors} />}
          {activeTab === 'verification' && <Verification />}
          {activeTab === 'explainer' && <Explainer />}
        </div>
      </main>
    </div>
  );
}

export default App;