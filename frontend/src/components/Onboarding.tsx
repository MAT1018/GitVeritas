import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

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
      onOnboard();
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      if (error?.code === 'ERR_NETWORK') {
        alert(`Onboarding failed: cannot reach backend at ${API_BASE}. Start backend server and try again.`);
      } else {
        const message = error?.response?.data?.error || error?.message || 'Please try again.';
        alert(`Onboarding failed: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-rise mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="section-title">Contributor Onboarding</h2>
        <p className="section-subtitle">Generate your DID and receive a verifiable credential in one secure flow.</p>
      </div>

      <div className="glass-panel p-6 sm:p-7">
        <div className="space-y-4">
          <div>
            <label className="label-text">GitHub Username</label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Enter your GitHub username"
              className="input-premium"
            />
          </div>

          <button
            onClick={handleOnboard}
            disabled={loading || !githubUsername.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Onboarding...' : 'Login with GitHub (Mock)'}
          </button>
        </div>

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-emerald-200">Onboarding Complete</h3>

            <div>
              <h4 className="label-text">Your DID</h4>
              <code className="code-shell break-all">{result.did}</code>
            </div>

            <div>
              <h4 className="label-text">GPG Public Key Fingerprint</h4>
              <code className="code-shell">{result.gpgFingerprint}</code>
            </div>

            <div>
              <h4 className="label-text">Verifiable Credential (JWT)</h4>
              <details className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <summary className="cursor-pointer text-cyan-200">Show Raw JWT</summary>
                <code className="code-shell mt-3 break-all">{result.vc}</code>
              </details>
            </div>

            <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-4">
              <p className="text-sm text-emerald-100">Identity verified and stored in the contributor registry.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding;
