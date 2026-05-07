import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function Verification() {
  const [githubUsername, setGithubUsername] = useState('');
  const [gpgSignature, setGpgSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!githubUsername.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/verification/verify-pr`, {
        githubUsername: githubUsername.trim(),
        gpgSignature: gpgSignature.trim() || `${githubUsername}-signature-${Date.now()}` // Mock signature
      });
      setResult(response.data);
    } catch (error) {
      console.error('Verification failed:', error);
      setResult({ verified: false, status: 'Verification Error', explanation: 'Failed to verify PR' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Pull Request Verification Simulator</h2>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PR Author GitHub Username
            </label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Enter PR author's GitHub username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commit GPG Signature (Mock)
            </label>
            <input
              type="text"
              value={gpgSignature}
              onChange={(e) => setGpgSignature(e.target.value)}
              placeholder="Mock GPG signature - leave empty for auto-generate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !githubUsername.trim()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Open PR (Simulate)'}
          </button>
        </div>

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Verification Result</h3>

            <div className={`p-4 rounded-md ${result.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <span className={`text-2xl mr-3 ${result.verified ? 'text-green-600' : 'text-red-600'}`}>
                  {result.verified ? '✅' : '❌'}
                </span>
                <div>
                  <p className={`font-medium ${result.verified ? 'text-green-800' : 'text-red-800'}`}>
                    {result.status}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {result.explanation}
                  </p>
                </div>
              </div>
            </div>

            {result.verified && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm">
                  <strong>GitHub Status Check:</strong> This would appear as a green checkmark on the PR,
                  allowing the contribution to be merged with confidence.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Verification;