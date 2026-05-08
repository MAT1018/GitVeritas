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
        gpgSignature: gpgSignature.trim() || `${githubUsername}-signature-${Date.now()}`
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
    <div className="animated-rise mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="section-title">Pull Request Verification</h2>
        <p className="section-subtitle">Simulate the proof chain validation before allowing code merge.</p>
      </div>

      <div className="glass-panel p-6 sm:p-7">
        <div className="space-y-4">
          <div>
            <label className="label-text">PR Author GitHub Username</label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Enter PR author's GitHub username"
              className="input-premium"
            />
          </div>

          <div>
            <label className="label-text">Commit GPG Signature (Mock)</label>
            <input
              type="text"
              value={gpgSignature}
              onChange={(e) => setGpgSignature(e.target.value)}
              placeholder="Leave empty for auto-generate"
              className="input-premium"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !githubUsername.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Verifying...' : 'Open PR (Simulate)'}
          </button>
        </div>

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Verification Result</h3>

            <div className={`rounded-xl border p-4 ${result.verified ? 'border-emerald-300/30 bg-emerald-400/10' : 'border-rose-300/30 bg-rose-400/10'}`}>
              <p className={`text-base font-semibold ${result.verified ? 'text-emerald-100' : 'text-rose-100'}`}>
                {result.verified ? 'Verified' : 'Rejected'}: {result.status}
              </p>
              <p className="mt-2 text-sm text-slate-200">{result.explanation}</p>
            </div>

            {result.verified && (
              <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-4">
                <p className="text-sm text-cyan-100">
                  GitHub status check would appear as a green checkmark, allowing merge with confidence.
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
