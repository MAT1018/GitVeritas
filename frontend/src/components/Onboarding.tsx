import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

interface OnboardingProps {
  onOnboard: () => void;
}

function Onboarding({ onOnboard }: OnboardingProps) {
  const [githubUsername, setGithubUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleOnboard = async () => {
    if (!githubUsername.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/contributors/onboard`, {
        githubUsername: githubUsername.trim()
      });
      setResult(response.data);
      onOnboard(); // Refresh registry
    } catch (error) {
      console.error('Onboarding failed:', error);
      alert('Onboarding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Contributor Onboarding</h2>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Username
            </label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Enter your GitHub username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleOnboard}
            disabled={loading || !githubUsername.trim()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Onboarding...' : 'Login with GitHub (Mock)'}
          </button>
        </div>

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Onboarding Complete!</h3>

            <div>
              <h4 className="font-medium">Your DID:</h4>
              <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                {result.did}
              </code>
            </div>

            <div>
              <h4 className="font-medium">GPG Public Key Fingerprint:</h4>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                {result.gpgFingerprint}
              </code>
            </div>

            <div>
              <h4 className="font-medium">Verifiable Credential (JWT):</h4>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-indigo-600">Show Raw JWT</summary>
                <code className="block bg-gray-100 p-2 rounded text-xs break-all mt-2">
                  {result.vc}
                </code>
              </details>
            </div>

            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800">
                ✅ Your identity has been verified and stored in the registry!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding;