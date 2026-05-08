import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

function Verification() {
  const [githubUsername, setGithubUsername] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [gpgSignature, setGpgSignature] = useState('');
  const [presentation, setPresentation] = useState('');
  const [presentationMessage, setPresentationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGeneratePresentation = async () => {
    if (!githubUsername.trim()) return;

    setLoading(true);
    setPresentationMessage('');
    try {
      const response = await axios.post(`${API_BASE}/presentations/create`, {
        githubUsername: githubUsername.trim()
      });
      setPresentation(JSON.stringify(response.data.presentation, null, 2));
      setPresentationMessage('Presentation generated successfully.');
    } catch (error) {
      console.error('Presentation generation failed:', error);
      setPresentationMessage('Failed to generate presentation.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!githubUsername.trim()) return;

    setLoading(true);
    try {
      let presentationPayload;
      if (presentation.trim()) {
        try {
          presentationPayload = JSON.parse(presentation);
        } catch {
          alert('Presentation JSON is not valid.');
          setLoading(false);
          return;
        }
      }

      const response = await axios.post(`${API_BASE}/verification/verify-pr`, {
        githubUsername: githubUsername.trim(),
        prUrl: prUrl.trim() || undefined,
        gpgSignature: gpgSignature.trim() || undefined,
        presentation: presentationPayload
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
        <p className="section-subtitle">Simulate proof chain validation and verify contributor identity for a PR.</p>
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
            <label className="label-text">Pull Request URL</label>
            <input
              type="text"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="https://github.com/org/repo/pull/123"
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

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleGeneratePresentation}
              disabled={loading || !githubUsername.trim()}
              className="btn-secondary w-full"
            >
              Generate Presentation
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || !githubUsername.trim()}
              className="btn-primary w-full"
            >
              {loading ? 'Verifying...' : 'Open PR (Simulate)'}
            </button>
          </div>

          {presentationMessage && (
            <p className="text-sm text-slate-300">{presentationMessage}</p>
          )}

          {presentation && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="label-text">Generated Presentation</h4>
              <textarea
                className="input-premium h-40 w-full resize-none"
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
              />
            </div>
          )}
        </div>

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Verification Result</h3>

            <div className={`rounded-xl border p-4 ${result.verified ? 'border-emerald-300/30 bg-emerald-400/10' : 'border-rose-300/30 bg-rose-400/10'}`}>
              <p className={`text-base font-semibold ${result.verified ? 'text-emerald-100' : 'text-rose-100'}`}>
                {result.verified ? 'Verified' : 'Rejected'}: {result.status}
              </p>
              <p className="mt-2 text-sm text-slate-200">{result.explanation}</p>
              {result.generatedSignature && (
                <p className="mt-2 text-sm text-cyan-100">Auto-generated mock signature: {result.generatedSignature}</p>
              )}
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
