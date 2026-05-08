import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

interface Contributor {
  did: string;
  githubUsername: string;
  vcStatus: string;
  vc: string;
  issuedAt: string;
}

interface RegistryProps {
  contributors: Contributor[];
}

function Registry({ contributors }: RegistryProps) {
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);
  const [details, setDetails] = useState<any>(null);

  const handleViewDetails = async (contributor: Contributor) => {
    setSelectedContributor(contributor);
    try {
      const response = await axios.get(`${API_BASE}/registry/contributors/${contributor.did}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch details:', error);
    }
  };

  return (
    <div className="animated-rise mx-auto max-w-6xl space-y-5">
      <div>
        <h2 className="section-title">Contributor Registry</h2>
        <p className="section-subtitle">Inspect trust chains and technical proofs for each onboarded identity.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white">Contributors</h3>
          <div className="mt-4 space-y-2">
            {contributors.length === 0 ? (
              <p className="text-sm text-slate-300">No contributors yet. Start by onboarding.</p>
            ) : (
              contributors.map((contributor) => (
                <button
                  key={contributor.did}
                  onClick={() => handleViewDetails(contributor)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    selectedContributor?.did === contributor.did
                      ? 'border-cyan-300/60 bg-cyan-300/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <p className="font-semibold text-white">{contributor.githubUsername}</p>
                  <p className="mt-1 truncate text-xs text-slate-300">{contributor.did}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">{contributor.vcStatus}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white">Trust Chain</h3>
          {details ? (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="label-text">Issuer DID</h4>
                <code className="code-shell break-all">{details.did}</code>
              </div>

              <p className="text-center text-cyan-200">↓</p>

              <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-3">
                <h4 className="label-text">Verifiable Credential</h4>
                <p className="text-sm text-slate-100"><strong>Subject:</strong> {details.decodedVC.sub}</p>
                <p className="mt-1 text-sm text-slate-100"><strong>GitHub:</strong> {details.decodedVC.vc.credentialSubject.githubUsername}</p>
                <p className="mt-1 text-sm text-slate-100"><strong>GPG:</strong> {details.decodedVC.vc.credentialSubject.gpgPublicKeyFingerprint}</p>
              </div>

              <p className="text-center text-cyan-200">↓</p>

              <div>
                <h4 className="label-text">Contributor DID</h4>
                <code className="code-shell break-all">{details.did}</code>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-300">Select a contributor to view the trust chain.</p>
          )}
        </div>
      </div>

      {details && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white">Technical Details</h3>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="label-text">DID Document</h4>
              <pre className="code-shell max-h-64 overflow-auto">{JSON.stringify(details.didDocument, null, 2)}</pre>
            </div>
            <div>
              <h4 className="label-text">Decoded VC Payload</h4>
              <pre className="code-shell max-h-64 overflow-auto">{JSON.stringify(details.decodedVC, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registry;
